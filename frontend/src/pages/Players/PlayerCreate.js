import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { playerService, teamService } from '../../services';
import formStyles from '../../styles/FormStyles.module.css';
import './Players.css';

const PlayerCreate = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { teamId } = useParams(); // If navigated from team context
  
  // State
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    teamId: teamId || '',
    firstName: '',
    lastName: '',
    email: '',
    jerseyNumber: '',
    position: '',
    status: 'active'
  });
  
  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        // Fetch teams the user is associated with (as owner or admin)
        const response = await teamService.getAllTeams({ userId: user.id, role: 'admin' });
        
        if (response.status === 'success') {
          setTeams(response.data);
          
          // If no teamId is provided in URL but we have teams, use the first one
          if (!teamId && response.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              teamId: response.data[0].id
            }));
          }
        } else {
          setError(response.message || t('teams.fetchError'));
        }
      } catch (err) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [user.id, teamId, t]);
  
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
    
    if (!formData.teamId) {
      errors.teamId = t('players.teamRequired');
    }
    
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
    
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await playerService.createPlayer(formData);
      
      if (response.status === 'success') {
        // Navigate to the player details page
        navigate(`/players/${response.data.id}`);
      } else {
        setError(response.message || t('players.createError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Position options
  const positions = [
    { value: 'GK', label: t('players.positions.GK') },
    { value: 'DEF', label: t('players.positions.DEF') },
    { value: 'MID', label: t('players.positions.MID') },
    { value: 'FWD', label: t('players.positions.FWD') }
  ];
  
  if (loading) {
    return <div className="loading-spinner">{t('common.loading')}</div>;
  }
  
  if (teams.length === 0 && !loading) {
    return (
      <div className={formStyles.formContainer}>
        <h1 className={formStyles.formTitle}>{t('players.createPlayer')}</h1>
        <div className="no-teams-message">
          <p>{t('players.noTeamsToAdd')}</p>
          <button 
            className={`${formStyles.button} ${formStyles.primaryButton}`}
            onClick={() => navigate('/teams/create')}
          >
            {t('teams.createTeam')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={formStyles.formContainer}>
      <h1 className={formStyles.formTitle}>{t('players.createPlayer')}</h1>
      
      {error && <div className={formStyles.errorMessage}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className={formStyles.formSection}>
          <h2>{t('players.teamInfo')}</h2>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="teamId">{t('players.selectTeam')} *</label>
            <select
              id="teamId"
              name="teamId"
              value={formData.teamId}
              onChange={handleInputChange}
              required
              disabled={!!teamId} // Disable if teamId is provided in URL
            >
              <option value="" disabled>
                {t('players.selectTeamPlaceholder')}
              </option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={formStyles.formSection}>
          <h2>{t('players.personalInfo')}</h2>
          
          <div className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="firstName">{t('players.firstName')} *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder={t('players.firstNamePlaceholder')}
              />
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="lastName">{t('players.lastName')} *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder={t('players.lastNamePlaceholder')}
              />
            </div>
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="email">{t('players.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('players.emailPlaceholder')}
            />
            <p className={formStyles.helpText}>
              {t('players.emailHelp')}
            </p>
          </div>
        </div>
        
        <div className={formStyles.formSection}>
          <h2>{t('players.playingInfo')}</h2>
          
          <div className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="jerseyNumber">{t('players.jerseyNumber')}</label>
              <input
                type="number"
                id="jerseyNumber"
                name="jerseyNumber"
                value={formData.jerseyNumber}
                onChange={handleInputChange}
                min="0"
                max="99"
                placeholder={t('players.jerseyNumberPlaceholder')}
              />
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="position">{t('players.position')}</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              >
                <option value="">{t('players.selectPositionPlaceholder')}</option>
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="status">{t('players.initialStatus')}</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">{t('players.statuses.active')}</option>
              <option value="inactive">{t('players.statuses.inactive')}</option>
              <option value="pending">{t('players.statuses.pending')}</option>
            </select>
          </div>
        </div>
        
        <div className={formStyles.formActions}>
          <button
            type="button"
            className={`${formStyles.button} ${formStyles.cancelButton}`}
            onClick={() => navigate(-1)}
          >
            {t('common.cancel')}
          </button>
          
          <button
            type="submit"
            className={`${formStyles.button} ${formStyles.primaryButton}`}
            disabled={submitting}
          >
            {submitting ? t('common.creating') : t('players.createPlayer')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerCreate; 