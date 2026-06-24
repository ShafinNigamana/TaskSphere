import { useEffect, useState } from 'react';
import { getMetrics, exportMetrics } from '../../services/reportService';
import { ReportsSkeleton } from '../../components/Skeleton';
import { 
  BarChart3, 
  FileSpreadsheet, 
  ShieldAlert, 
  Award, 
  PieChart as PieIcon, 
  TrendingUp, 
  Users, 
  UserCheck 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await getMetrics();
        setMetrics(data);
        setError(null);
      } catch {
        setError('Failed to load report metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportMetrics();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-metrics-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export report metrics.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <ReportsSkeleton />;
  }

  if (error) {
    return (
      <div className="premium-page-wrapper">
        <div className="premium-page-header">
          <div className="premium-page-header-text">
            <h1>Reports</h1>
          </div>
        </div>
        <div className="error-card">{error}</div>
      </div>
    );
  }

  // Format data for Recharts BarChart (chronological order)
  const chartData = [...(metrics?.tasksClosedPerWeek || [])]
    .reverse()
    .map((item) => ({
      name: `W${item.week.toString().slice(-2)}`,
      'Closed Tasks': item.closed_count,
    }));

  // Tasks Created vs Closed Trend Data (chronological order)
  const trendChartData = [...(metrics?.tasksClosedPerWeek || [])]
    .reverse()
    .map((item) => ({
      name: `Week ${item.week}`,
      'Created Tasks': item.created_count || 0,
      'Closed Tasks': item.closed_count || 0,
    }));

  // 1. Task Status Distribution Pie data
  const statusData = metrics?.statusDistribution || [];
  const totalStatusTasks = statusData.reduce((sum, item) => sum + item.count, 0);
  const statusLabels = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done'
  };
  const statusColors = {
    todo: '#9ca3af',
    'in-progress': '#f59e0b',
    done: '#10b981'
  };
  const formattedStatusData = statusData.map(item => ({
    name: statusLabels[item._id] || item._id,
    value: item.count,
    color: statusColors[item._id] || '#6b7280'
  }));

  // 2. Priority Breakdown Pie data
  const priorityData = metrics?.priorityBreakdown || [];
  const totalPriorityTasks = priorityData.reduce((sum, item) => sum + item.count, 0);
  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  };
  const priorityColors = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#ef4444'
  };
  const formattedPriorityData = priorityData.map(item => ({
    name: priorityLabels[item._id] || item._id,
    value: item.count,
    color: priorityColors[item._id] || '#6b7280'
  }));

  // 3. Team Workload Bar data
  const teamWorkloadData = metrics?.teamWorkload || [];

  // 4. Member Workload Bar data
  const memberWorkloadData = metrics?.memberWorkload || [];

  return (
    <div className="premium-page-wrapper">
      {/* Header */}
      <div className="premium-page-header">
        <div className="premium-page-header-text">
          <h1>Reports</h1>
          <p>System insights and performance overview</p>
        </div>
        <button 
          onClick={handleExport} 
          disabled={exporting}
          className="btn btn-secondary flex items-center gap-1.5"
          style={{ alignSelf: 'flex-start' }}
        >
          <FileSpreadsheet size={15} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="reports-layout-grid">
        {/* Section 1: Tasks Closed Per Week */}
        <div className="reports-panel-card">
          <h2 className="reports-panel-title">
            <BarChart3 size={18} style={{ color: 'var(--color-text-muted)' }} />
            Tasks Closed Per Week
          </h2>
          {metrics.tasksClosedPerWeek.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--text-secondary)' }}>
              No tasks closed yet.
            </div>
          ) : (
            <div style={{ height: '256px', marginTop: 'var(--space-2)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#a3a3a3" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: '#e5e5e5' }}
                  />
                  <YAxis 
                    stroke="#a3a3a3" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: '#e5e5e5' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#fafafa', opacity: 0.5 }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e5e5', 
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#171717'
                    }} 
                  />
                  <Bar dataKey="Closed Tasks" fill="#171717" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Section 2: Top Contributors */}
        <div className="reports-panel-card">
          <h2 className="reports-panel-title">
            <Award size={18} style={{ color: 'var(--color-text-muted)' }} />
            Top Contributors
          </h2>
          {metrics.topContributors.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--text-secondary)' }}>
              No active contributors logged.
            </div>
          ) : (
            <div className="reports-leaderboard">
              {metrics.topContributors.map((item, index) => {
                const rank = index + 1;
                let rankClass = 'rank--other';
                if (rank === 1) rankClass = 'rank--1';
                else if (rank === 2) rankClass = 'rank--2';
                else if (rank === 3) rankClass = 'rank--3';

                return (
                  <div key={item.actor_id} className="reports-leaderboard-row">
                    <div className="reports-leaderboard-left">
                      <span className={`reports-rank-badge ${rankClass}`}>
                        {rank}
                      </span>
                      <span className="reports-leaderboard-name">{item.name}</span>
                    </div>
                    <span className="reports-leaderboard-actions">{item.actions} actions</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* NEW Section 3: Task Status Distribution */}
        <div className="reports-panel-card">
          <h2 className="reports-panel-title">
            <PieIcon size={18} style={{ color: 'var(--color-text-muted)' }} />
            Task Status Distribution
          </h2>
          {formattedStatusData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--text-secondary)' }}>
              No task status data available.
            </div>
          ) : (
            <div className="reports-donut-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Pie
                    data={formattedStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {formattedStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="reports-donut-center-label">
                <span className="reports-donut-center-val">{totalStatusTasks}</span>
                <span className="reports-donut-center-lbl">Tasks</span>
              </div>
            </div>
          )}
          <div className="reports-legend">
            {formattedStatusData.map((item, idx) => (
              <div key={idx} className="reports-legend-item">
                <span className="reports-legend-color" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NEW Section 4: Priority Breakdown */}
        <div className="reports-panel-card">
          <h2 className="reports-panel-title">
            <PieIcon size={18} style={{ color: 'var(--color-text-muted)' }} />
            Priority Breakdown
          </h2>
          {formattedPriorityData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--text-secondary)' }}>
              No priority data available.
            </div>
          ) : (
            <div className="reports-donut-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Pie
                    data={formattedPriorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {formattedPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="reports-donut-center-label">
                <span className="reports-donut-center-val">{totalPriorityTasks}</span>
                <span className="reports-donut-center-lbl">Tasks</span>
              </div>
            </div>
          )}
          <div className="reports-legend">
            {formattedPriorityData.map((item, idx) => (
              <div key={idx} className="reports-legend-item">
                <span className="reports-legend-color" style={{ backgroundColor: item.color }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NEW Section 5: Tasks Created vs Closed Trend */}
        <div className="reports-panel-card reports-grid-col-span-2">
          <h2 className="reports-panel-title">
            <TrendingUp size={18} style={{ color: 'var(--color-text-muted)' }} />
            Tasks Created vs Closed Weekly Trend
          </h2>
          {trendChartData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--text-secondary)' }}>
              No historical data available.
            </div>
          ) : (
            <div style={{ height: '300px', marginTop: 'var(--space-2)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#a3a3a3" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: '#e5e5e5' }}
                  />
                  <YAxis 
                    stroke="#a3a3a3" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: '#e5e5e5' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e5e5', 
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#171717'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="Created Tasks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Closed Tasks" stroke="#10b981" fillOpacity={1} fill="url(#colorClosed)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* NEW Section 6: Team Workload (Stacked Horizontal Bar Chart) */}
        <div className="reports-panel-card">
          <h2 className="reports-panel-title">
            <Users size={18} style={{ color: 'var(--color-text-muted)' }} />
            Team Workload
          </h2>
          {teamWorkloadData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--text-secondary)' }}>
              No team workload data available.
            </div>
          ) : (
            <div style={{ height: '300px', marginTop: 'var(--space-2)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamWorkloadData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" stroke="#a3a3a3" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#a3a3a3" fontSize={11} tickLine={false} width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e5e5', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="todo" name="To Do" stackId="a" fill="#9ca3af" />
                  <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="done" name="Done" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* NEW Section 7: Member Workload (Active Tasks per Member) */}
        <div className="reports-panel-card">
          <h2 className="reports-panel-title">
            <UserCheck size={18} style={{ color: 'var(--color-text-muted)' }} />
            Member Workload (Top 8 Active)
          </h2>
          {memberWorkloadData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--text-secondary)' }}>
              No active workload per member.
            </div>
          ) : (
            <div style={{ height: '300px', marginTop: 'var(--space-2)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberWorkloadData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" stroke="#a3a3a3" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#a3a3a3" fontSize={11} tickLine={false} width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e5e5', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="activeCount" name="Active Tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Section 8: Overdue Rate & Task Health */}
        <div className="reports-panel-card reports-grid-col-span-2">
          <h2 className="reports-panel-title" style={{ marginBottom: 'var(--space-6)' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-text-muted)' }} />
            Overdue Rate & Task Health
          </h2>
          <div className="reports-stats-card-grid">
            <div className="reports-stat-box">
              <span className="reports-stat-box-value">{metrics.overdueRate.totalActive}</span>
              <span className="reports-stat-box-label">Total Active Tasks</span>
            </div>
            <div className="reports-stat-box">
              <span className="reports-stat-box-value value--danger">{metrics.overdueRate.overdue}</span>
              <span className="reports-stat-box-label">Overdue Tasks</span>
            </div>
            <div className="reports-stat-box">
              <span className="reports-stat-box-value">
                {(metrics.overdueRate.rate * 100).toFixed(1)}%
              </span>
              <span className="reports-stat-box-label">Overdue Percentage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
