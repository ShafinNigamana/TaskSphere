import { createMySQLPool } from '../config/mysql.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import mongoose from 'mongoose';

export const getReportMetrics = async (req, res) => {
  try {
    const pool = createMySQLPool();

    // 1. Metric 1: Tasks Closed Per Week (MySQL)
    const [closedRows] = await pool.query(`
      SELECT 
        YEARWEEK(created_at, 1) AS week,
        COUNT(*) AS closed_count
      FROM audit_log
      WHERE action = 'UPDATE_TASK'
        AND JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.updatedFields.status')) = 'done'
      GROUP BY YEARWEEK(created_at, 1)
      ORDER BY week DESC
    `);

    // 2. Metric 2: Top 5 Contributors (MySQL)
    const [contributorRows] = await pool.query(`
      SELECT actor_id, COUNT(*) AS actions
      FROM audit_log
      WHERE actor_id != 'SYSTEM'
      GROUP BY actor_id
      ORDER BY actions DESC
      LIMIT 5
    `);

    // Fetch user details for contributors from MongoDB
    const userIds = contributorRows
      .map((row) => row.actor_id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const users = await User.find({ _id: { $in: userIds } }).select('_id name');
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    const topContributors = contributorRows.map((row) => ({
      actor_id: row.actor_id,
      name: userMap.get(row.actor_id) || 'Unknown User',
      actions: row.actions,
    }));

    // 3. Metric 3: Overdue Rate (using MongoDB Task data)
    const totalActive = await Task.countDocuments({ status: { $ne: 'done' } });
    const overdue = await Task.countDocuments({
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    });

    const rate = totalActive > 0 ? Number((overdue / totalActive).toFixed(4)) : 0;

    // 4. Metric 4: Average Resolution Time (using MongoDB Task done dates)
    const doneTasks = await Task.find({ status: 'done' });
    let averageResolutionTime = 0; // in hours
    if (doneTasks.length > 0) {
      const totalDurationMs = doneTasks.reduce((sum, task) => {
        const duration = new Date(task.updatedAt) - new Date(task.createdAt);
        return sum + (duration > 0 ? duration : 0);
      }, 0);
      averageResolutionTime = Number(((totalDurationMs / doneTasks.length) / (1000 * 60 * 60)).toFixed(2));
    }

    // 5. Metric 5: Team Productivity
    const teams = await Team.find().select('_id name');
    const tasks = await Task.find().select('teamId status');
    const teamProductivity = teams.map((team) => {
      const teamTasks = tasks.filter((t) => t.teamId && t.teamId.toString() === team._id.toString());
      const completed = teamTasks.filter((t) => t.status === 'done').length;
      const active = teamTasks.filter((t) => t.status !== 'done').length;
      return {
        teamId: team._id,
        name: team.name,
        completed,
        active,
        total: teamTasks.length,
      };
    });

    return res.status(200).json({
      tasksClosedPerWeek: closedRows,
      topContributors,
      overdueRate: {
        totalActive,
        overdue,
        rate,
      },
      averageResolutionTime,
      teamProductivity,
    });
  } catch (error) {
    console.error('Error fetching report metrics:', error);
    return res.status(500).json({ message: 'Internal server error while compiling report metrics' });
  }
};

export const exportReportMetrics = async (req, res) => {
  try {
    const pool = createMySQLPool();

    // 1. Fetch Weekly Closed Tasks
    const [closedRows] = await pool.query(`
      SELECT 
        YEARWEEK(created_at, 1) AS week,
        COUNT(*) AS closed_count
      FROM audit_log
      WHERE action = 'UPDATE_TASK'
        AND JSON_UNQUOTE(JSON_EXTRACT(payload_json, '$.updatedFields.status')) = 'done'
      GROUP BY YEARWEEK(created_at, 1)
      ORDER BY week DESC
    `);

    // 2. Fetch Top Contributors
    const [contributorRows] = await pool.query(`
      SELECT actor_id, COUNT(*) AS actions
      FROM audit_log
      WHERE actor_id != 'SYSTEM'
      GROUP BY actor_id
      ORDER BY actions DESC
      LIMIT 5
    `);

    const userIds = contributorRows
      .map((row) => row.actor_id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const users = await User.find({ _id: { $in: userIds } }).select('_id name');
    const userMap = new Map(users.map((u) => [u._id.toString(), u.name]));

    // 3. Overdue Rate
    const totalActive = await Task.countDocuments({ status: { $ne: 'done' } });
    const overdue = await Task.countDocuments({
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    });
    const rate = totalActive > 0 ? Number((overdue / totalActive).toFixed(4)) : 0;

    // 4. Average Resolution Time
    const doneTasks = await Task.find({ status: 'done' });
    let averageResolutionTime = 0; // in hours
    if (doneTasks.length > 0) {
      const totalDurationMs = doneTasks.reduce((sum, task) => {
        const duration = new Date(task.updatedAt) - new Date(task.createdAt);
        return sum + (duration > 0 ? duration : 0);
      }, 0);
      averageResolutionTime = Number(((totalDurationMs / doneTasks.length) / (1000 * 60 * 60)).toFixed(2));
    }

    // 5. Team Productivity
    const teams = await Team.find().select('_id name');
    const tasks = await Task.find().select('teamId status');
    const teamProductivity = teams.map((team) => {
      const teamTasks = tasks.filter((t) => t.teamId && t.teamId.toString() === team._id.toString());
      const completed = teamTasks.filter((t) => t.status === 'done').length;
      const active = teamTasks.filter((t) => t.status !== 'done').length;
      return {
        teamId: team._id,
        name: team.name,
        completed,
        active,
        total: teamTasks.length,
      };
    });

    // Generate CSV content
    let csvContent = 'Section,Metric,Value\n';
    
    // Add Closed Tasks Section
    csvContent += 'Tasks Closed Per Week,, \n';
    closedRows.forEach(row => {
      csvContent += `Tasks Closed Per Week,Week ${row.week},${row.closed_count} tasks\n`;
    });
    csvContent += ',, \n'; // separator row

    // Add Top Contributors Section
    csvContent += 'Top Contributors,, \n';
    contributorRows.forEach((row, index) => {
      const name = userMap.get(row.actor_id) || 'Unknown User';
      csvContent += `Top Contributors,#${index + 1} ${name} (${row.actor_id}),${row.actions} actions\n`;
    });
    csvContent += ',, \n'; // separator row

    // Add Overdue Rate Section
    csvContent += 'Overdue Rate,, \n';
    csvContent += `Overdue Rate,Total Active Tasks,${totalActive}\n`;
    csvContent += `Overdue Rate,Overdue Tasks,${overdue}\n`;
    csvContent += `Overdue Rate,Overdue Percentage,${(rate * 100).toFixed(1)}%\n`;
    csvContent += ',, \n'; // separator row

    // Add Average Resolution Time Section
    csvContent += 'Average Resolution Time,, \n';
    csvContent += `Average Resolution Time,Average Resolution Time (Hours),${averageResolutionTime} hours\n`;
    csvContent += ',, \n'; // separator row

    // Add Team Productivity Section
    csvContent += 'Team Productivity,, \n';
    teamProductivity.forEach(tp => {
      csvContent += `Team Productivity,${tp.name} - Completed Tasks,${tp.completed}\n`;
      csvContent += `Team Productivity,${tp.name} - Active Tasks,${tp.active}\n`;
    });

    // Send CSV as a stream/attachment
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report-metrics.csv');
    return res.send(csvContent);
  } catch (error) {
    console.error('Error exporting report metrics:', error);
    return res.status(500).json({ message: 'Internal server error while exporting metrics' });
  }
};
