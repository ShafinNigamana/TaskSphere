import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeams } from '../../services/teamService';
import { getTasks } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

function DashboardPage() {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [teamsData, tasksData] = await Promise.all([
          getTeams(),
          getTasks(),
        ]);
        setTeams(teamsData);
        setTasks(tasksData);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-card">{error}</div>
      </div>
    );
  }

  // Sort tasks by createdAt descending and get the latest 5
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'var(--color-status-todo)',
      'in-progress': 'var(--color-status-inprogress)',
      'done': 'var(--color-status-done)',
    };
    return colors[status] || 'var(--color-text-muted)';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculations for additional summary cards
  const myTasksCount = tasks.filter(
    (t) => t.assigneeId === user?._id || t.assigneeId?._id === user?._id
  ).length;

  const overdueCount = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length;

  const greetingName = user?.name || 'User';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back, {greetingName}</p>
      </div>

      {/* Summary Section */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-content">
            <p className="summary-label">Total Teams</p>
            <p className="summary-value">{teams.length}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-content">
            <p className="summary-label">Total Tasks</p>
            <p className="summary-value">{tasks.length}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-content">
            <p className="summary-label">My Tasks</p>
            <p className="summary-value">{myTasksCount}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-content">
            <p className="summary-label">Overdue Tasks</p>
            <p className="summary-value">{overdueCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <EmptyState 
            type="dashboard" 
            title="No tasks yet" 
            description="Tasks from your teams will appear here." 
          />
        ) : (
          <div className="tasks-list">
            {recentTasks.map((task) => (
              <Link 
                key={task._id} 
                to={`/teams/${task.teamId}`} 
                className="task-item"
              >
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
                <p className="task-date">{formatDate(task.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
