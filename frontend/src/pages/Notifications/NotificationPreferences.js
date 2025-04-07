import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useToast } from '../../context/ToastContext';
import './Notifications.css';

const NotificationPreferences = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  
  // State
  const [preferences, setPreferences] = useState({
    // Notification types
    match_goal: { inApp: true, email: false },
    match_red_card: { inApp: true, email: false },
    match_result: { inApp: true, email: true },
    match_confirmation: { inApp: true, email: true },
    tournament_status: { inApp: true, email: true },
    team_invitation: { inApp: true, email: true },
    admin_announcement: { inApp: true, email: false },
    
    // Global settings
    receive_emails: true,
    email_digest: false,
    digest_frequency: 'daily'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch user notification preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      try {
        // This endpoint would need to be implemented on the backend
        const response = await notificationService.getNotificationPreferences();
        
        if (response.status === 'success') {
          setPreferences(response.data.preferences);
        } else {
          setError(response.message || t('notifications.fetchPreferencesError'));
        }
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        setError(err.message || t('notifications.fetchPreferencesError'));
      } finally {
        setLoading(false);
      }
    };
    
    // Comment this out until backend implementation is ready
    // fetchPreferences();
    
    // For now, just set loading to false after a delay to simulate loading
    setTimeout(() => setLoading(false), 500);
  }, [t]);
  
  // Handle preference change
  const handlePreferenceChange = (type, channel, value) => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: value
      }
    }));
  };
  
  // Handle global setting change
  const handleGlobalSettingChange = (setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // If emails are disabled, disable all email notifications
    if (setting === 'receive_emails' && value === false) {
      const updatedPreferences = { ...preferences, receive_emails: false };
      
      // Disable all email notifications
      Object.keys(updatedPreferences).forEach(key => {
        if (typeof updatedPreferences[key] === 'object' && updatedPreferences[key].email !== undefined) {
          updatedPreferences[key] = {
            ...updatedPreferences[key],
            email: false
          };
        }
      });
      
      setPreferences(updatedPreferences);
    }
  };
  
  // Handle digest frequency change
  const handleDigestFrequencyChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      digest_frequency: e.target.value
    }));
  };
  
  // Save preferences
  const handleSave = async () => {
    setSaving(true);
    try {
      // This endpoint would need to be implemented on the backend
      const response = await notificationService.updateNotificationPreferences(preferences);
      
      if (response.status === 'success') {
        toast.success(t('notifications.preferencesSaved'));
      } else {
        toast.error(response.message || t('notifications.savePreferencesError'));
      }
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      toast.error(err.message || t('notifications.savePreferencesError'));
    } finally {
      setSaving(false);
    }
  };
  
  // Navigate back to notifications
  const handleBackClick = () => {
    navigate('/notifications');
  };
  
  // Render notification type preference toggle
  const renderNotificationTypePreference = (type, label, description) => {
    const typePref = preferences[type];
    const emailsDisabled = !preferences.receive_emails;
    
    return (
      <div className="preference-item">
        <div className="preference-info">
          <h3>{label}</h3>
          <p>{description}</p>
        </div>
        
        <div className="preference-toggles">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={typePref.inApp}
              onChange={(e) => handlePreferenceChange(type, 'inApp', e.target.checked)}
            />
            <span className="toggle-text">{t('notifications.inApp')}</span>
          </label>
          
          <label className={`toggle-label ${emailsDisabled ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={typePref.email && preferences.receive_emails}
              onChange={(e) => handlePreferenceChange(type, 'email', e.target.checked)}
              disabled={emailsDisabled}
            />
            <span className="toggle-text">{t('notifications.email')}</span>
          </label>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorAlert message={error} />;
  }
  
  return (
    <div className="notification-preferences-container">
      <div className="back-navigation">
        <button className="back-button" onClick={handleBackClick}>
          &larr; {t('notifications.backToNotifications')}
        </button>
      </div>
      
      <h1>{t('notifications.preferencesTitle')}</h1>
      
      <div className="preferences-section">
        <h2>{t('notifications.globalSettings')}</h2>
        
        <div className="global-preferences">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={preferences.receive_emails}
              onChange={(e) => handleGlobalSettingChange('receive_emails', e.target.checked)}
            />
            <span className="toggle-text">{t('notifications.receiveEmails')}</span>
          </label>
          
          <label className={`toggle-label ${!preferences.receive_emails ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={preferences.email_digest && preferences.receive_emails}
              onChange={(e) => handleGlobalSettingChange('email_digest', e.target.checked)}
              disabled={!preferences.receive_emails}
            />
            <span className="toggle-text">{t('notifications.emailDigest')}</span>
          </label>
          
          {preferences.email_digest && preferences.receive_emails && (
            <div className="digest-frequency">
              <label htmlFor="digest-frequency">{t('notifications.digestFrequency')}</label>
              <select
                id="digest-frequency"
                value={preferences.digest_frequency}
                onChange={handleDigestFrequencyChange}
              >
                <option value="daily">{t('notifications.daily')}</option>
                <option value="weekly">{t('notifications.weekly')}</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      <div className="preferences-section">
        <h2>{t('notifications.notificationTypes')}</h2>
        
        {renderNotificationTypePreference(
          'match_goal',
          t('notifications.types.matchGoal'),
          t('notifications.descriptions.matchGoal')
        )}
        
        {renderNotificationTypePreference(
          'match_red_card',
          t('notifications.types.matchRedCard'),
          t('notifications.descriptions.matchRedCard')
        )}
        
        {renderNotificationTypePreference(
          'match_result',
          t('notifications.types.matchResult'),
          t('notifications.descriptions.matchResult')
        )}
        
        {renderNotificationTypePreference(
          'match_confirmation',
          t('notifications.types.matchConfirmation'),
          t('notifications.descriptions.matchConfirmation')
        )}
        
        {renderNotificationTypePreference(
          'tournament_status',
          t('notifications.types.tournamentStatus'),
          t('notifications.descriptions.tournamentStatus')
        )}
        
        {renderNotificationTypePreference(
          'team_invitation',
          t('notifications.types.teamInvitation'),
          t('notifications.descriptions.teamInvitation')
        )}
        
        {renderNotificationTypePreference(
          'admin_announcement',
          t('notifications.types.adminAnnouncement'),
          t('notifications.descriptions.adminAnnouncement')
        )}
      </div>
      
      <div className="preferences-actions">
        <button 
          className="save-button" 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
        
        <button 
          className="cancel-button" 
          onClick={handleBackClick}
          disabled={saving}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferences; 