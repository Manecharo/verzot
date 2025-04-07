import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { playerService, teamService } from '../../services';
import formStyles from '../../styles/FormStyles.module.css';
import './Players.css';

const PlayerDetail = () => {
  const { t } = useTranslation();
  
  // Helper function to ensure string values from translations
  const tStr = (key, fallback = '') => {
    const translation = t(key);
    return typeof translation === 'string' ? translation : fallback || key;
  };
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playerId } = useParams();
  
  // States
  const [player, setPlayer] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [userIsTeamAdmin, setUserIsTeamAdmin] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jerseyNumber: '',
    position: '',
    status: 'active'
  });
  
  // Fetch player data
  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get player details
        const playerResponse = await playerService.getPlayerById(playerId);
        
        if (playerResponse.status === 'success') {
          setPlayer(playerResponse.data);
          
          // Initialize form data with player info
          setFormData({
            firstName: playerResponse.data.firstName,
            lastName: playerResponse.data.lastName,
            email: playerResponse.data.email || '',
            jerseyNumber: playerResponse.data.jerseyNumber || '',
            position: playerResponse.data.position || '',
            status: playerResponse.data.status
          });
          
          // Get team details
          const teamResponse = await teamService.getTeamById(playerResponse.data.teamId);
          
          if (teamResponse.status === 'success') {
            setTeam(teamResponse.data);
            
            // Check if user is team admin
            const isAdmin = teamResponse.data.teamLeaderId === user.id || 
                         (teamResponse.data.admins && teamResponse.data.admins.includes(user.id));
            setUserIsTeamAdmin(isAdmin);
          } else {
            setError(teamResponse.message || tStr('teams.fetchError', 'Error fetching team data'));
          }
        } else {
          setError(playerResponse.message || tStr('players.fetchError', 'Error fetching player data'));
        }
      } catch (err) {
        setError(err.message || tStr('common.unexpectedError', 'An unexpected error occurred'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [playerId, user.id, t]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value ? parseInt(value, 10) : '') : value
    });
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = t('players.firstNameRequired');
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = t('players.lastNameRequired');
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('players.invalidEmail');
    }
    
    if (formData.jerseyNumber && (formData.jerseyNumber < 0 || formData.jerseyNumber > 99)) {
      errors.jerseyNumber = t('players.invalidJerseyNumber');
    }
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      // Display validation errors
      setError(Object.values(errors)[0]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await playerService.updatePlayer(playerId, formData);
      
      if (response.status === 'success') {
        // Update local player state
        setPlayer({
          ...player,
          ...formData
        });
        
        // Exit edit mode
        setEditMode(false);
      } else {
        setError(response.message || t('players.updateError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    setError(null);
    setConfirmAction(null);
    
    try {
      const response = await playerService.updatePlayerStatus(playerId, newStatus);
      
      if (response.status === 'success') {
        // Update local player state
        setPlayer({
          ...player,
          status: newStatus
        });
        
        // Update form data
        setFormData({
          ...formData,
          status: newStatus
        });
      } else {
        setError(response.message || t('players.statusUpdateError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle player removal
  const handleRemovePlayer = async () => {
    setLoading(true);
    setError(null);
    setConfirmAction(null);
    
    try {
      const response = await playerService.deletePlayer(playerId);
      
      if (response.status === 'success') {
        // Redirect to team page or players list
        if (team) {
          navigate(`/teams/${team.id}`);
        } else {
          navigate('/players');
        }
      } else {
        setError(response.message || t('players.deleteError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Position options
  const positions = [
    { value: 'GK', label: t('players.positions.GK') },
    { value: 'DEF', label: t('players.positions.DEF') },
    { value: 'MID', label: t('players.positions.MID') },
    { value: 'FWD', label: t('players.positions.FWD') }
  ];
  
  // Status display helper
  const getStatusDisplay = (status) => {
    const statusStyles = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended',
      pending: 'status-pending'
    };
    
    return (
      <span className={`player-status ${statusStyles[status] || ''}`}>
        {tStr(`players.statuses.${status}`, status)}
      </span>
    );
  };
  
  // Loading state
  if (loading && !player) {
    return <div className="loading-spinner">{tStr('common.loading')}</div>;
  }
  
  // Error state
  if (error && !player) {
    return (
      <div className="error-container">
        <h2>{tStr('common.error')}</h2>
        <p>{error}</p>
        <button
          className={`${formStyles.button} ${formStyles.primaryButton}`}
          onClick={() => navigate(-1)}
        >
          {tStr('common.back')}
        </button>
      </div>
    );
  }
  
  // Player not found
  if (!player && !loading) {
    return (
      <div className="not-found-container">
        <h2>{tStr('players.notFound')}</h2>
        <button
          className={`${formStyles.button} ${formStyles.primaryButton}`}
          onClick={() => navigate('/players')}
        >
          {tStr('players.backToList')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="player-detail-container">
      {/* Header area */}
      <div className="player-detail-header">
        <div className="back-navigation">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← {tStr('common.back')}
          </button>
        </div>
        
        <h1>
          {editMode 
            ? tStr('players.editPlayer') 
            : `${player.firstName} ${player.lastName}`}
        </h1>
        
        {team && (
          <div className="player-team">
            <Link to={`/teams/${team.id}`}>
              {team.name}
            </Link>
          </div>
        )}
        
        {/* Admin actions */}
        {userIsTeamAdmin && !editMode && (
          <div className="admin-actions">
            <button
              className={`${formStyles.button} ${formStyles.secondaryButton}`}
              onClick={() => setEditMode(true)}
            >
              {tStr('common.edit')}
            </button>
            
            <div className="status-action-dropdown">
              <button className={`${formStyles.button} ${formStyles.dropdownButton}`}>
                {tStr('players.changeStatus')} ▾
              </button>
              <div className="dropdown-content">
                {['active', 'inactive', 'suspended', 'pending'].map(status => (
                  player.status !== status && (
                    <button 
                      key={status}
                      onClick={() => setConfirmAction({
                        type: 'status',
                        value: status
                      })}
                    >
                      {tStr(`players.statuses.${status}`)}
                    </button>
                  )
                ))}
                <button
                  className="danger"
                  onClick={() => setConfirmAction({
                    type: 'remove',
                    value: null
                  })}
                >
                  {tStr('players.remove')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && <div className={formStyles.errorMessage}>{error}</div>}
      
      {/* Confirmation modal */}
      {confirmAction && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>
              {confirmAction.type === 'remove' 
                ? tStr('players.confirmRemove')
                : tStr('players.confirmStatusChange', {
                    status: tStr(`players.statuses.${confirmAction.value}`)
                  })
              }
            </h3>
            <p>
              {confirmAction.type === 'remove'
                ? tStr('players.removeWarning')
                : tStr('players.statusChangeInfo')
              }
            </p>
            <div className="confirmation-actions">
              <button
                className={`${formStyles.button} ${formStyles.cancelButton}`}
                onClick={() => setConfirmAction(null)}
              >
                {tStr('common.cancel')}
              </button>
              <button
                className={`${formStyles.button} ${formStyles.dangerButton}`}
                onClick={() => 
                  confirmAction.type === 'remove'
                    ? handleRemovePlayer()
                    : handleStatusChange(confirmAction.value)
                }
              >
                {confirmAction.type === 'remove'
                  ? tStr('players.confirmRemoveButton')
                  : tStr('common.confirm')
                }
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Player details or edit form */}
      {editMode ? (
        <form onSubmit={handleSubmit} className="player-edit-form">
          <div className={formStyles.formSection}>
            <h2>{tStr('players.personalInfo')}</h2>
            
            <div className={formStyles.formRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="firstName">{tStr('players.firstName')} *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={formStyles.formGroup}>
                <label htmlFor="lastName">{tStr('players.lastName')} *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="email">{tStr('players.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className={formStyles.formSection}>
            <h2>{tStr('players.playingInfo')}</h2>
            
            <div className={formStyles.formRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="jerseyNumber">{tStr('players.jerseyNumber')}</label>
                <input
                  type="number"
                  id="jerseyNumber"
                  name="jerseyNumber"
                  value={formData.jerseyNumber}
                  onChange={handleInputChange}
                  min="0"
                  max="99"
                />
              </div>
              
              <div className={formStyles.formGroup}>
                <label htmlFor="position">{tStr('players.position')}</label>
                <select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                >
                  <option value="">{tStr('players.selectPositionPlaceholder')}</option>
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="status">{tStr('players.status')}</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">{tStr('players.statuses.active')}</option>
                <option value="inactive">{tStr('players.statuses.inactive')}</option>
                <option value="suspended">{tStr('players.statuses.suspended')}</option>
                <option value="pending">{tStr('players.statuses.pending')}</option>
              </select>
            </div>
          </div>
          
          <div className={formStyles.formActions}>
            <button
              type="button"
              className={`${formStyles.button} ${formStyles.cancelButton}`}
              onClick={() => setEditMode(false)}
              disabled={loading}
            >
              {tStr('common.cancel')}
            </button>
            
            <button
              type="submit"
              className={`${formStyles.button} ${formStyles.primaryButton}`}
              disabled={loading}
            >
              {loading ? tStr('common.saving') : tStr('common.save')}
            </button>
          </div>
        </form>
      ) : (
        <div className="player-info">
          {/* Basic info */}
          <div className="info-section">
            <h2>{tStr('players.personalInfo')}</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{tStr('players.fullName')}</span>
                <span className="info-value">
                  {player.firstName} {player.lastName}
                </span>
              </div>
              
              {player.email && (
                <div className="info-item">
                  <span className="info-label">{tStr('players.email')}</span>
                  <span className="info-value">{player.email}</span>
                </div>
              )}
              
              <div className="info-item">
                <span className="info-label">{tStr('players.status')}</span>
                <span className="info-value">
                  {getStatusDisplay(player.status)}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">{tStr('players.joinedOn')}</span>
                <span className="info-value">
                  {player.joinedDate 
                    ? new Date(player.joinedDate).toLocaleDateString() 
                    : tStr('common.notAvailable')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Playing info */}
          <div className="info-section">
            <h2>{tStr('players.playingInfo')}</h2>
            <div className="info-grid">
              {player.jerseyNumber && (
                <div className="info-item">
                  <span className="info-label">{tStr('players.jerseyNumber')}</span>
                  <span className="info-value jersey-number">{player.jerseyNumber}</span>
                </div>
              )}
              
              {player.position && (
                <div className="info-item">
                  <span className="info-label">{tStr('players.position')}</span>
                  <span className="info-value">
                    {tStr(`players.positions.${player.position}`, player.position)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Player stats */}
          <div className="info-section">
            <h2>{tStr('players.statistics')}</h2>
            <div className="stats-grid">
              {/* This section would display player statistics */}
              <p className="stats-placeholder">
                {tStr('players.statsComingSoon')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetail; 