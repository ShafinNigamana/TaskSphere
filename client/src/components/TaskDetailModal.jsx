import { useEffect, useState } from 'react';
import { getComments, createComment } from '../services/commentService';
import { updateTask, uploadAttachment, deleteTask } from '../services/taskService';

function TaskDetailModal({ task: initialTask, team, onClose, onUpdate }) {
  const [task, setTask] = useState(initialTask);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [editForm, setEditForm] = useState({
    title: initialTask.title || '',
    description: initialTask.description || '',
    assigneeId: initialTask.assigneeId?._id || initialTask.assigneeId || '',
    status: initialTask.status || 'todo',
    priority: initialTask.priority || 'medium',
    dueDate: initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : '',
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fileBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const data = await getComments(task._id);
        setComments(data);
      } catch {
        // Fail silently
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [task._id]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveError(null);
      
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        assigneeId: editForm.assigneeId || undefined,
        status: editForm.status,
        priority: editForm.priority,
        dueDate: editForm.dueDate || undefined,
      };

      const updated = await updateTask(task._id, payload);
      setTask(updated);
      onUpdate();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setSaving(true);
      await deleteTask(task._id);
      onUpdate();
      onClose();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to delete task.');
      setSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitError(null);
      const added = await createComment(task._id, newComment.trim());
      setComments((prev) => [...prev, added]);
      setNewComment('');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to add comment.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);
      const updatedTask = await uploadAttachment(task._id, file);
      setTask(updatedTask);
      onUpdate();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (author) => {
    if (author?.name) {
      return author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'UN';
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content modal-content--large">
        <div className="modal-header">
          <h2 className="modal-title">Task Details</h2>
          <button type="button" className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="task-detail-layout">
          {/* Left Column: Task Fields & Comments */}
          <div className="task-detail-left">
            <form onSubmit={handleSaveTask} className="auth-form" style={{ gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="editTitle">Title</label>
                <input
                  type="text"
                  id="editTitle"
                  name="title"
                  value={editForm.title}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="editDescription">Description</label>
                <textarea
                  id="editDescription"
                  name="description"
                  value={editForm.description}
                  onChange={handleFormChange}
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              {saveError && <div className="auth-error">{saveError}</div>}

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  Save Changes
                </button>
                <button type="button" className="btn-danger" onClick={handleDeleteTask} disabled={saving}>
                  Delete Task
                </button>
              </div>
            </form>

            <hr className="divider" />

            {/* Comments Stream */}
            <div className="comments-section">
              <h3 className="section-title" style={{ fontSize: 'var(--text-card-title)', marginBottom: 'var(--space-4)' }}>Discussion</h3>
              
              {loadingComments ? (
                <p className="loading-text">Loading discussion...</p>
              ) : comments.length === 0 ? (
                <p className="empty-text">No comments yet. Start the conversation!</p>
              ) : (
                <div className="comments-list">
                  {comments.map((c) => (
                    <div key={c._id} className="comment-item">
                      <div className="comment-avatar">{getInitials(c.authorId)}</div>
                      <div className="comment-bubble">
                        <div className="comment-meta">
                          <span className="comment-author">{c.authorId?.name || 'Unknown User'}</span>
                          <span className="comment-time">{formatTime(c.createdAt)}</span>
                        </div>
                        <p className="comment-text">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="comment-form" style={{ marginTop: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                    Post
                  </button>
                </div>
                {submitError && <div className="auth-error" style={{ marginTop: '8px' }}>{submitError}</div>}
              </form>
            </div>
          </div>

          {/* Right Column: Properties & Attachments */}
          <div className="task-detail-right">
            <div className="properties-panel">
              <h3 className="section-title" style={{ fontSize: 'var(--text-card-title)', marginBottom: 'var(--space-3)' }}>Properties</h3>
              
              <div className="property-item">
                <span className="property-label">Status</span>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="property-item">
                <span className="property-label">Priority</span>
                <select
                  name="priority"
                  value={editForm.priority}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="property-item">
                <span className="property-label">Assignee</span>
                <select
                  name="assigneeId"
                  value={editForm.assigneeId}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  <option value="">Unassigned</option>
                  {team?.managerId && (
                    <option key={team.managerId._id || team.managerId} value={team.managerId._id || team.managerId}>
                      {team.managerId.name ? `${team.managerId.name} (Manager)` : 'Manager'}
                    </option>
                  )}
                  {team?.members?.map((m) => (
                    (m._id !== (team.managerId?._id || team.managerId)) && (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    )
                  ))}
                </select>
              </div>

              <div className="property-item">
                <span className="property-label">Due Date</span>
                <input
                  type="date"
                  name="dueDate"
                  value={editForm.dueDate}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>
            </div>

            <hr className="divider" />

            <div className="attachments-section">
              <h3 className="section-title" style={{ fontSize: 'var(--text-card-title)', marginBottom: 'var(--space-3)' }}>Attachments</h3>
              
              {task.attachments && task.attachments.length > 0 ? (
                <div className="attachments-list">
                  {task.attachments.map((att) => (
                    <div key={att._id} className="attachment-card">
                      <div className="attachment-info">
                        <span className="attachment-name" title={att.filename}>{att.filename}</span>
                        <span className="attachment-date">{new Date(att.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <a
                        href={`${fileBaseUrl}${att.path}`}
                        download={att.filename}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-download"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">No attachments yet.</p>
              )}

              <div className="upload-btn-wrapper" style={{ marginTop: 'var(--space-3)' }}>
                <label className="btn-secondary" style={{ display: 'inline-block', textAlign: 'center', cursor: 'pointer', width: '100%' }}>
                  {uploading ? 'Uploading...' : 'Upload File'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                {uploadError && <div className="auth-error" style={{ marginTop: '8px' }}>{uploadError}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
