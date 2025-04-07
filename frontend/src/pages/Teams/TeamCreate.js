import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafeTranslation } from '../../utils/safeTranslation';
import { toSafeString } from '../../utils/translationHelper';
import { useAuth } from '../../context/AuthContext';
import { teamService } from '../../services';
import formStyles from '../../styles/FormStyles.module.css';

const TeamCreate = () => {
  const { t } = useSafeTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    colors: {
      primary: '#0066cc',
      secondary: '#ffffff'
    },
    homeLocation: '',
    foundedYear: new Date().getFullYear()
  });
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle nested objects (colors)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseInt(value, 10) : value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create team data object
      const teamData = {
        ...formData,
        teamLeaderId: user.id
      };
      
      // Call service to create team
      const response = await teamService.createTeam(teamData);
      
      if (response.status === 'success') {
        // Redirect to the team details page
        navigate(`/teams/${response.data.id}`);
      } else {
        setError(response.message || t('teams.createError'));
      }
    } catch (err) {
      setError(err.message || t('teams.createError'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={formStyles.formContainer}>
      <h1 className={formStyles.formTitle}>{t('teams.createTeam')}</h1>
      
      {error && <div className={formStyles.errorMessage}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className={formStyles.formSection}>
          <h2>{t('teams.basicInfo')}</h2>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="name">{t('teams.name')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder={t('teams.namePlaceholder')}
            />
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="description">{t('teams.description')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('teams.descriptionPlaceholder')}
              rows="4"
            />
          </div>
          
          <div className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="homeLocation">{t('teams.homeLocation')}</label>
              <input
                type="text"
                id="homeLocation"
                name="homeLocation"
                value={formData.homeLocation}
                onChange={handleInputChange}
                placeholder={t('teams.homeLocationPlaceholder')}
              />
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="foundedYear">{t('teams.foundedYear')}</label>
              <input
                type="number"
                id="foundedYear"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleInputChange}
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </div>
        
        <div className={formStyles.formSection}>
          <h2>{t('teams.appearance')}</h2>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="logoUrl">{t('teams.logoUrl')}</label>
            <input
              type="text"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleInputChange}
              placeholder={t('teams.logoUrlPlaceholder')}
            />
            <p className={formStyles.helpText}>{t('teams.logoHelp') || ''}</p>
          </div>
          
          <div className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor="colors.primary">{t('teams.primaryColor')}</label>
              <div className={formStyles.colorPickerContainer}>
                <input
                  type="color"
                  id="colors.primary"
                  name="colors.primary"
                  value={formData.colors.primary}
                  onChange={handleInputChange}
                  className={formStyles.colorPicker}
                />
                <input
                  type="text"
                  value={formData.colors.primary}
                  onChange={handleInputChange}
                  name="colors.primary"
                  className={formStyles.colorValue}
                />
              </div>
            </div>
            
            <div className={formStyles.formGroup}>
              <label htmlFor="colors.secondary">{t('teams.secondaryColor')}</label>
              <div className={formStyles.colorPickerContainer}>
                <input
                  type="color"
                  id="colors.secondary"
                  name="colors.secondary"
                  value={formData.colors.secondary}
                  onChange={handleInputChange}
                  className={formStyles.colorPicker}
                />
                <input
                  type="text"
                  value={formData.colors.secondary}
                  onChange={handleInputChange}
                  name="colors.secondary"
                  className={formStyles.colorValue}
                />
              </div>
            </div>
          </div>
          
          <div className={formStyles.previewContainer}>
            <div className={formStyles.previewHeader}>{toSafeString(t('teams.preview'), 'Preview')}</div>
            <div 
              className={formStyles.previewContent}
              style={{
                backgroundColor: formData.colors.primary,
                color: formData.colors.secondary
              }}
            >
              <div className={formStyles.previewName}>
                {formData.name || toSafeString(t('teams.teamName'), 'Team Name')}
              </div>
              {formData.logoUrl && (
                <div>
                  <img 
                    src={formData.logoUrl} 
                    alt={formData.name || 'Team logo'} 
                    style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={formStyles.formActions}>
          <button
            type="button"
            className={`${formStyles.button} ${formStyles.cancelButton}`}
            onClick={() => navigate('/teams')}
          >
            {t('common.cancel')}
          </button>
          
          <button
            type="submit"
            className={`${formStyles.button} ${formStyles.primaryButton}`}
            disabled={loading || !formData.name}
          >
            {loading ? t('common.creating') : t('teams.createTeam')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamCreate; 