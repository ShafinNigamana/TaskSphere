import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../utils/auditLogger.js';

export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body || {};

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify team membership
    const team = await Team.findById(task.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team associated with task not found' });
    }

    const isAuthorized = team.managerId?.toString() === req.user.id || 
                         team.members.some(m => m.toString() === req.user.id);
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Forbidden: You do not belong to this team' });
    }

    const comment = await Comment.create({
      taskId,
      authorId: req.user.id,
      content: content.trim(),
    });

    // Populate author before returning
    const populatedComment = await comment.populate('authorId', 'name email role');

    // Notify stakeholders (manager and assignee if they are not the author)
    const authorUser = await User.findById(req.user.id);
    const authorName = authorUser?.name || 'A team member';

    const recipients = new Set();
    if (team.managerId && team.managerId.toString() !== req.user.id) {
      recipients.add(team.managerId.toString());
    }
    if (task.assigneeId && task.assigneeId.toString() !== req.user.id) {
      recipients.add(task.assigneeId.toString());
    }

    for (const recipientId of recipients) {
      await Notification.create({
        recipientId,
        senderId: req.user.id,
        type: 'ADD_COMMENT',
        message: `${authorName} commented on task "${task.title}": "${content.trim().substring(0, 40)}${content.trim().length > 40 ? '...' : ''}"`,
        taskId: task._id,
      });
    }

    // Log audit event
    logAudit('ADD_COMMENT', req.user.id, task._id.toString(), task.teamId ? task.teamId.toString() : null, {
      commentId: comment._id.toString(),
      contentPreview: content.substring(0, 50),
    });

    return res.status(201).json(populatedComment);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

export const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify team membership
    const team = await Team.findById(task.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team associated with task not found' });
    }

    const isAuthorized = team.managerId?.toString() === req.user.id || 
                         team.members.some(m => m.toString() === req.user.id);
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Forbidden: You do not belong to this team' });
    }

    const comments = await Comment.find({ taskId })
      .populate('authorId', 'name email role')
      .sort({ createdAt: 1 });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};
