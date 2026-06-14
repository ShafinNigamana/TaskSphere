import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // Fail silently
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = async (n) => {
    try {
      if (!n.isRead) {
        await markAsRead(n._id);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
      }
      setIsOpen(false);
      
      // If notification has a task, we can redirect the user to that task's team details board
      if (n.taskId) {
        // We need to fetch the task detail to know its teamId, or if it is populated
        // Let's check if taskId is populated with team details or has teamId.
        // Even if not, we can just redirect if the URL pattern allows.
        // But since we are on the page, we can let user browse, or if we have task details:
        if (n.taskId.teamId) {
          navigate(`/teams/${n.taskId.teamId}`);
        } else if (n.taskId._id) {
          // If only task ID is available, navigating is fine. 
          // Let's redirect to dashboard or team list where they can find it.
        }
      }
    } catch {
      // Fail silently
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      // Fail silently
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bell-container" ref={dropdownRef}>
      <button
        type="button"
        className="bell-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        {/* Bell SVG */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="bell-dropdown">
          <div className="bell-dropdown-header">
            <span className="bell-dropdown-title">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="bell-clear-all"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="bell-dropdown-list">
            {notifications.length === 0 ? (
              <div className="bell-empty-state">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`bell-item ${!n.isRead ? 'bell-item--unread' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="bell-item-content">
                    <p className="bell-item-message">{n.message}</p>
                    <span className="bell-item-time">{formatTime(n.createdAt)}</span>
                  </div>
                  {!n.isRead && <span className="bell-item-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
