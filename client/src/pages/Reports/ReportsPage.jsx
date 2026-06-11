import { useEffect, useState } from 'react';
import { getMetrics } from '../../services/reportService';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await getMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to load report metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h1 className="reports-title">Reports</h1>
        </div>
        <div className="loading-text">Loading report metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h1 className="reports-title">Reports</h1>
        </div>
        <div className="error-card">{error}</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Reports</h1>
        <p className="reports-subtitle">System insights and performance overview</p>
      </div>

      <div className="reports-grid">
        {/* Section 1: Tasks Closed Per Week */}
        <div className="reports-section">
          <h2 className="reports-section-title">Tasks Closed Per Week</h2>
          {metrics.tasksClosedPerWeek.length === 0 ? (
            <div className="reports-card">
              <span className="reports-card-label" style={{ textTransform: 'none' }}>
                No tasks closed yet.
              </span>
            </div>
          ) : (
            <div className="reports-card-list">
              {metrics.tasksClosedPerWeek.map((item) => (
                <div key={item.week} className="reports-card">
                  <span className="reports-card-value">{item.closed_count} Tasks Closed</span>
                  <span className="reports-card-label">Week {item.week}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Top Contributors */}
        <div className="reports-section">
          <h2 className="reports-section-title">Top Contributors</h2>
          {metrics.topContributors.length === 0 ? (
            <div className="reports-card">
              <span className="reports-card-label" style={{ textTransform: 'none' }}>
                No active contributors logged.
              </span>
            </div>
          ) : (
            <table className="reports-table">
              <thead>
                <tr>
                  <th className="reports-rank">Rank</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topContributors.map((item, index) => (
                  <tr key={item.actor_id}>
                    <td className="reports-rank">#{index + 1}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>{item.actions} actions</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Section 3: Overdue Rate */}
        <div className="reports-section">
          <h2 className="reports-section-title">Overdue Rate</h2>
          <div className="reports-card-list">
            <div className="reports-card">
              <span className="reports-card-value">{metrics.overdueRate.totalActive}</span>
              <span className="reports-card-label">Total Active Tasks</span>
            </div>
            <div className="reports-card">
              <span className="reports-card-value">{metrics.overdueRate.overdue}</span>
              <span className="reports-card-label">Overdue Tasks</span>
            </div>
            <div className="reports-card">
              <span className="reports-card-value">
                {(metrics.overdueRate.rate * 100).toFixed(1)}%
              </span>
              <span className="reports-card-label">Overdue Percentage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
