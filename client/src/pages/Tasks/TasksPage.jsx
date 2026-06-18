import { useEffect, useState } from 'react';
import { getTasks } from '../../services/taskService';
import { Skeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTasks();
        setTasks(data);
      } catch {
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'var(--color-status-todo)',
      'in-progress': 'var(--color-status-inprogress)',
      'done': 'var(--color-status-done)',
    };
    return colors[status] || 'var(--color-text-muted)';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header" style={{ marginBottom: 'var(--space-10)' }}>
          <Skeleton width="120px" height="32px" style={{ marginBottom: '8px' }} />
          <Skeleton width="200px" height="18px" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ padding: '12px 16px', background: 'var(--color-surface)' }}>
              <Skeleton width="220px" height="16px" style={{ marginBottom: '8px' }} />
              <Skeleton width="80px" height="12px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-card">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tasks</h1>
        <p className="dashboard-subtitle">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} across all teams
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState 
          type="tasks" 
          title="No tasks yet" 
          description="Tasks will appear when you join a team." 
        />
      ) : (
        <div className="dashboard-section">
          <h2 className="section-title">All Tasks</h2>
          <div className="tasks-list">
            {tasks.map((task) => (
              <div key={task._id} className="task-item">
                <div className="task-main">
                  <p className="task-title">{task.title}</p>
                  <div className="task-meta">
                    <span
                      className="task-status"
                      style={{ color: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                    <span className="task-priority">{task.priority}</span>
                  </div>
                </div>
                <p className="task-date">{formatDate(task.dueDate)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;
