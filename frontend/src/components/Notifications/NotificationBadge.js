import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationBadge.css';

const NotificationBadge = () => {
  const { unreadCount, fetchUnreadCount } = useNotifications();
  
  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up interval to periodically check for new notifications (every 30 seconds)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);
  
  return (
    <NavLink 
      to="/notifications" 
      className={({ isActive }) => 
        `notification-badge-link ${isActive ? 'active' : ''}`
      }
    >
      <div className="notification-icon-container">
        <i className="notification-icon">🔔</i>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </NavLink>
  );
};

export default NotificationBadge; 