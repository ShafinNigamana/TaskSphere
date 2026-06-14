import { useEffect, useState } from 'react';
import authService from '../../services/authService';

function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load active sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this session? The device will be logged out immediately.')) {
      return;
    }

    try {
      setRevokingId(id);
      await authService.revokeSession(id);
      setSessions((prev) => prev.filter((session) => session._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  };

  const parseUserAgent = (ua) => {
    if (!ua || ua === 'unknown') return { browser: 'Unknown Browser', os: 'Unknown OS', isMobile: false };
    const uaLower = ua.toLowerCase();
    let browser = 'Other Browser';
    let os = 'Other OS';
    let isMobile = false;

    // Detect browser
    if (uaLower.includes('firefox')) browser = 'Firefox';
    else if (uaLower.includes('edg')) browser = 'Microsoft Edge';
    else if (uaLower.includes('chrome')) browser = 'Chrome';
    else if (uaLower.includes('safari')) browser = 'Safari';
    else if (uaLower.includes('opr') || uaLower.includes('opera')) browser = 'Opera';

    // Detect OS
    if (uaLower.includes('windows')) os = 'Windows';
    else if (uaLower.includes('macintosh') || uaLower.includes('mac os')) os = 'macOS';
    else if (uaLower.includes('iphone')) {
      os = 'iPhone';
      isMobile = true;
    } else if (uaLower.includes('ipad')) {
      os = 'iPad';
      isMobile = true;
    } else if (uaLower.includes('android')) {
      os = 'Android';
      isMobile = uaLower.includes('mobile');
    } else if (uaLower.includes('linux')) os = 'Linux';

    return { browser, os, isMobile };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <p className="loading-text">Loading active sessions...</p>
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

  const currentRefreshToken = localStorage.getItem('refreshToken');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Security & Sessions</h1>
        <p className="dashboard-subtitle">Manage devices that are currently logged in to your account</p>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Active Devices ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <div className="empty-card">
            <p>No active sessions found.</p>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map((session) => {
              const { browser, os, isMobile } = parseUserAgent(session.userAgent);
              const isCurrent = session.refreshToken === currentRefreshToken;

              return (
                <div key={session._id} className={`session-item ${isCurrent ? 'session-item--current' : ''}`}>
                  <div className="session-icon-container">
                    {isMobile ? (
                      <svg className="session-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                      </svg>
                    ) : (
                      <svg className="session-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    )}
                  </div>

                  <div className="session-details">
                    <div className="session-title-row">
                      <span className="session-device-name">
                        {browser} on {os}
                      </span>
                      {isCurrent && <span className="session-badge session-badge--current">Current Device</span>}
                    </div>
                    <div className="session-meta-row">
                      <span className="session-meta-item">IP Address: {session.ipAddress}</span>
                      <span className="session-meta-dot">•</span>
                      <span className="session-meta-item">Last active: {formatDate(session.createdAt)}</span>
                    </div>
                    {session.userAgent && (
                      <div className="session-raw-ua" title={session.userAgent}>
                        {session.userAgent}
                      </div>
                    )}
                  </div>

                  <div className="session-actions">
                    {isCurrent ? (
                      <span className="session-current-label">This Session</span>
                    ) : (
                      <button
                        onClick={() => handleRevoke(session._id)}
                        disabled={revokingId === session._id}
                        className="session-revoke-btn"
                      >
                        {revokingId === session._id ? 'Revoking...' : 'Revoke'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionsPage;
