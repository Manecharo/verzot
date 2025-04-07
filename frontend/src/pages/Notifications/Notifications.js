import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationContext';
import './Notifications.css';

// Utility function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Utility to generate icon based on notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'match_goal':
      return '⚽';
    case 'match_red_card':
      return '🟥';
    case 'match_result':
      return '🏆';
    case 'match_confirmation':
      return '✓';
    case 'tournament_status':
      return '🏟️';
    case 'team_invitation':
      return '👥';
    case 'admin_announcement':
      return '📢';
    default:
      return '🔔';
  }
};

// Component for a single notification
const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleClick = () => {
    // Mark as read when clicked
    if (!notification.isRead) {
      onMarkRead([notification.id]);
    }
    
    // Navigate based on notification type
    if (notification.metadata) {
      if (notification.type === 'match_result' && notification.metadata.matchId) {
        navigate(`/matches/${notification.metadata.matchId}`);
      } else if (notification.type === 'tournament_status' && notification.metadata.tournamentId) {
        navigate(`/tournaments/${notification.metadata.tournamentId}`);
      } else if (notification.type === 'team_invitation' && notification.metadata.teamId) {
        navigate(`/teams/${notification.metadata.teamId}`);
      }
    }
  };
  
  return (
    <div 
      className={`notification-item ${notification.isRead ? 'read' : 'unread'} priority-${notification.priority}`}
      onClick={handleClick}
    >
      <div className="notification-icon">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="notification-content">
        <div className="notification-header">
          <h3>{notification.title}</h3>
          <span className="notification-date">{formatDate(notification.createdAt)}</span>
        </div>
        <p className="notification-message">{notification.message}</p>
        {notification.type === 'match_result' && notification.metadata && (
          <div className="notification-match-result">
            <span>{notification.metadata.homeTeamName}</span>
            <strong>{notification.metadata.homeScore} - {notification.metadata.awayScore}</strong>
            <span>{notification.metadata.awayTeamName}</span>
          </div>
        )}
      </div>
      <button 
        className="notification-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete([notification.id]);
        }}
        aria-label={t('Delete')}
      >
        &times;
      </button>
    </div>
  );
};

// NotificationFilters component
const NotificationFilters = ({ filters, setFilters, onMarkAllRead, onClearAll }) => {
  const { t } = useTranslation();
  
  return (
    <div className="notification-filters">
      <div className="filter-group">
        <label htmlFor="type-filter">{t('Type')}:</label>
        <select 
          id="type-filter"
          value={filters.type || ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value || null })}
        >
          <option value="">{t('All')}</option>
          <option value="match_goal">{t('Goals')}</option>
          <option value="match_red_card">{t('Red Cards')}</option>
          <option value="match_result">{t('Match Results')}</option>
          <option value="tournament_status">{t('Tournament Updates')}</option>
          <option value="team_invitation">{t('Team Invitations')}</option>
          <option value="admin_announcement">{t('Announcements')}</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label htmlFor="read-filter">{t('Status')}:</label>
        <select 
          id="read-filter"
          value={filters.isRead === undefined ? '' : filters.isRead.toString()}
          onChange={(e) => {
            const value = e.target.value;
            setFilters({
              ...filters,
              isRead: value === '' ? undefined : value === 'true'
            });
          }}
        >
          <option value="">{t('All')}</option>
          <option value="false">{t('Unread')}</option>
          <option value="true">{t('Read')}</option>
        </select>
      </div>
      
      <div className="filter-actions">
        <button onClick={onMarkAllRead} className="btn-secondary">
          {t('Mark All as Read')}
        </button>
        <button onClick={onClearAll} className="btn-danger">
          {t('Clear All')}
        </button>
      </div>
    </div>
  );
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation();
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        &laquo; {t('Previous')}
      </button>
      
      <span className="page-info">
        {t('Page')} {currentPage} {t('of')} {totalPages}
      </span>
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        {t('Next')} &raquo;
      </button>
    </div>
  );
};

// Main Notifications component
const Notifications = () => {
  const { t } = useTranslation();
  const { 
    notifications, 
    loading, 
    error,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotifications 
  } = useNotifications();
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    isRead: undefined,
    type: null
  });
  
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    total: 0
  });
  
  // Load notifications on mount and when filters change
  useEffect(() => {
    const loadNotifications = async () => {
      const result = await fetchNotifications(filters);
      if (result && result.pagination) {
        setPaginationInfo({
          totalPages: result.pagination.totalPages,
          total: result.pagination.total
        });
      }
    };
    
    loadNotifications();
  }, [fetchNotifications, filters]);
  
  const handleMarkAsRead = async (notificationIds) => {
    await markAsRead(notificationIds);
  };
  
  const handleMarkAllRead = async () => {
    await markAllAsRead(filters.type);
  };
  
  const handleDelete = async (notificationIds) => {
    await deleteNotifications(notificationIds);
  };
  
  const handleClearAll = async () => {
    if (window.confirm(t('Are you sure you want to delete all notifications?'))) {
      const notificationIds = notifications.map(n => n.id);
      await deleteNotifications(notificationIds);
    }
  };
  
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };
  
  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>{t('Notifications')}</h1>
        <span className="notification-count">
          {paginationInfo.total} {t('notifications')}
        </span>
      </div>
      
      <NotificationFilters 
        filters={filters}
        setFilters={setFilters}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
      />
      
      {loading ? (
        <div className="loading-notifications">{t('Loading notifications...')}</div>
      ) : error ? (
        <div className="notifications-error">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="no-notifications">{t('No notifications found')}</div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <NotificationItem 
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      
      <Pagination 
        currentPage={filters.page}
        totalPages={paginationInfo.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Notifications; 