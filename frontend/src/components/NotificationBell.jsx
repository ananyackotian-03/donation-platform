import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationBell.css';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (token && user.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [token, user.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get('http://localhost:5000/api/requests/notifications', { headers });
      const notifications = response.data || [];

      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (request) => {
    setShowDropdown(false);
    navigate(`/donor-dashboard#donation-${request.donationId}`);
    setTimeout(() => {
      const donationElement = document.getElementById(`donation-${request.donationId}`);
      if (donationElement) {
        donationElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowDropdown(false);
    navigate('/login');
  };

  if (!token || !user.id) {
    return null;
  }

  return (
    <div className="notification-bell-container">
      <div className="notification-bell-wrapper">
        <button 
          className="notification-bell"
          onClick={() => setShowDropdown(!showDropdown)}
          title="Notifications"
        >
          <span className="bell-icon">🔔</span>
          {notifications.length > 0 && (
            <span className="notification-badge">{notifications.length}</span>
          )}
        </button>

        {showDropdown && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  className="refresh-btn"
                  onClick={fetchNotifications}
                  title="Refresh"
                >
                  🔄
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification, index) => (
                  <button
                    key={index}
                    className="notification-item"
                    onClick={() => handleNotificationClick(notification)}
                    type="button"
                  >
                    <div className="notification-content">
                      <p className="notification-message">
                        {notification.message || `Notification from ${notification.sender?.name || 'Someone'}`}
                      </p>
                      <small className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <span className="notification-arrow">→</span>
                  </button>
                ))}
              </div>
            )}

            <div className="notification-footer">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {showDropdown && (
        <button 
          className="notification-backdrop"
          onClick={() => setShowDropdown(false)}
          aria-label="Close notification menu"
          type="button"
        />
      )}
    </div>
  );
}
