import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSafeTranslation } from '../../utils/safeTranslation';
import { toSafeString } from '../../utils/translationHelper';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services';
import formStyles from '../../styles/FormStyles.module.css';

const TournamentCreate = () => {
  const { t } = useSafeTranslation();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form step state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    format: '11-a-side',
    maxTeams: 8,
    minTeams: 2,
    registrationDeadline: '',
    rosterLockDate: '',
    isPublic: true,
    logoUrl: '',
    rules: {
      matchDuration: 90,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      substitutesAllowed: true,
      useExtraTime: false,
      usePenaltyShootout: true
    },
    tiebreakerRules: {
      criteria: ['points', 'headToHead', 'goalDifference', 'goalsFor']
    },
    tournamentStructure: {
      format: 'group-knockout',
      groupCount: 2,
      teamsPerGroup: 4,
      advancingTeamsCount: 2
    }
  });
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  // Handle array changes (for tiebreaker criteria)
  const handleCriteriaChange = (criteriaIndex, value) => {
    const newCriteria = [...formData.tiebreakerRules.criteria];
    newCriteria[criteriaIndex] = value;
    
    setFormData({
      ...formData,
      tiebreakerRules: {
        ...formData.tiebreakerRules,
        criteria: newCriteria
      }
    });
  };
  
  // Move to next step
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  // Move to previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Ensure dates are in ISO format
      const tournamentData = {
        ...formData,
        organizerId: user.id
      };
      
      // Call service to create tournament
      const response = await tournamentService.createTournament(tournamentData);
      
      if (response.status === 'success') {
        // Redirect to the tournament details page
        navigate(`/tournaments/${response.data.id}`);
      } else {
        setError(response.message || t('tournaments.createError', 'Error creating tournament'));
      }
    } catch (err) {
      setError(err.message || t('tournaments.createError', 'Error creating tournament'));
    } finally {
      setLoading(false);
    }
  };
  
  // Validate current step
  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return !!(formData.name && formData.startDate && formData.endDate);
      case 2:
        return !!(formData.format && formData.maxTeams >= formData.minTeams);
      case 3:
        return true; // Optional fields in step 3
      default:
        return false;
    }
  };
  
  // Ensure that the tournament formats are always strings
  const getFormatOption = (key) => {
    return toSafeString(t(`tournaments.formats.${key}`), key);
  };
  
  // Ensure that tournament criteria are always strings
  const getCriterionOption = (key) => {
    return toSafeString(t(`tournaments.criteria.${key}`), key);
  };
  
  // Render step 1: Basic Info
  const renderStep1 = () => (
    <div className={formStyles.formSection}>
      <h2>{t('tournaments.basicInfo')}</h2>
      
      <div className={formStyles.formGroup}>
        <label htmlFor="name">{t('tournaments.name')} *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder={t('tournaments.namePlaceholder')}
        />
      </div>
      
      <div className={formStyles.formGroup}>
        <label htmlFor="description">{t('tournaments.description')}</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder={t('tournaments.descriptionPlaceholder')}
          rows="4"
        />
      </div>
      
      <div className={formStyles.formRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="startDate">{t('tournaments.startDate')} *</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={formStyles.formGroup}>
          <label htmlFor="endDate">{t('tournaments.endDate')} *</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className={formStyles.formGroup}>
        <label htmlFor="location">{t('tournaments.location')}</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder={t('tournaments.locationPlaceholder')}
        />
      </div>
      
      <div className={formStyles.formGroup}>
        <label htmlFor="isPublic">{t('tournaments.visibility')}</label>
        <div className={formStyles.checkboxGroup}>
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleInputChange}
          />
          <label htmlFor="isPublic" className={formStyles.checkboxLabel}>
            {t('tournaments.makePublic')}
          </label>
        </div>
      </div>
    </div>
  );
  
  // Render step 2: Format & Teams
  const renderStep2 = () => (
    <div className={formStyles.formSection}>
      <h2>{t('tournaments.formatAndTeams')}</h2>
      
      <div className={formStyles.formGroup}>
        <label htmlFor="format">{t('tournaments.format')} *</label>
        <select
          id="format"
          name="format"
          value={formData.format}
          onChange={handleInputChange}
          required
        >
          <option value="11-a-side">{getFormatOption('11')}</option>
          <option value="8-a-side">{getFormatOption('8')}</option>
          <option value="7-a-side">{getFormatOption('7')}</option>
          <option value="5-a-side">{getFormatOption('5')}</option>
          <option value="penalty-shootout">{getFormatOption('penalty')}</option>
        </select>
      </div>
      
      <div className={formStyles.formRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="minTeams">{t('tournaments.minTeams')} *</label>
          <input
            type="number"
            id="minTeams"
            name="minTeams"
            value={formData.minTeams}
            onChange={handleInputChange}
            required
            min="2"
          />
        </div>
        
        <div className={formStyles.formGroup}>
          <label htmlFor="maxTeams">{t('tournaments.maxTeams')} *</label>
          <input
            type="number"
            id="maxTeams"
            name="maxTeams"
            value={formData.maxTeams}
            onChange={handleInputChange}
            required
            min={formData.minTeams}
          />
        </div>
      </div>
      
      <div className={formStyles.formRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="registrationDeadline">{t('tournaments.registrationDeadline')}</label>
          <input
            type="date"
            id="registrationDeadline"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleInputChange}
          />
        </div>
        
        <div className={formStyles.formGroup}>
          <label htmlFor="rosterLockDate">{t('tournaments.rosterLockDate')}</label>
          <input
            type="date"
            id="rosterLockDate"
            name="rosterLockDate"
            value={formData.rosterLockDate}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className={formStyles.formGroup}>
        <label htmlFor="tournamentStructure.format">{t('tournaments.tournamentFormat')} *</label>
        <select
          id="tournamentStructure.format"
          name="tournamentStructure.format"
          value={formData.tournamentStructure.format}
          onChange={handleInputChange}
          required
        >
          <option value="group-knockout">{t('tournaments.tournamentFormats.groupKnockout')}</option>
          <option value="league">{t('tournaments.tournamentFormats.league')}</option>
          <option value="knockout">{t('tournaments.tournamentFormats.knockout')}</option>
          <option value="double-elimination">{t('tournaments.tournamentFormats.doubleElimination')}</option>
        </select>
      </div>
      
      {formData.tournamentStructure.format === 'group-knockout' && (
        <div className={formStyles.formRow}>
          <div className={formStyles.formGroup}>
            <label htmlFor="tournamentStructure.groupCount">{t('tournaments.groupCount')}</label>
            <input
              type="number"
              id="tournamentStructure.groupCount"
              name="tournamentStructure.groupCount"
              value={formData.tournamentStructure.groupCount}
              onChange={handleInputChange}
              min="2"
            />
          </div>
          
          <div className={formStyles.formGroup}>
            <label htmlFor="tournamentStructure.advancingTeamsCount">{t('tournaments.advancingTeams')}</label>
            <input
              type="number"
              id="tournamentStructure.advancingTeamsCount"
              name="tournamentStructure.advancingTeamsCount"
              value={formData.tournamentStructure.advancingTeamsCount}
              onChange={handleInputChange}
              min="1"
            />
          </div>
        </div>
      )}
    </div>
  );
  
  // Render step 3: Rules
  const renderStep3 = () => (
    <div className={formStyles.formSection}>
      <h2>{t('tournaments.rules')}</h2>
      
      <div className={formStyles.formGroup}>
        <label htmlFor="rules.matchDuration">{t('tournaments.matchDuration')} (minutes)</label>
        <input
          type="number"
          id="rules.matchDuration"
          name="rules.matchDuration"
          value={formData.rules.matchDuration}
          onChange={handleInputChange}
          min="10"
        />
      </div>
      
      <div className={formStyles.formRow}>
        <div className={formStyles.formGroup}>
          <label htmlFor="rules.pointsForWin">{t('tournaments.pointsForWin')}</label>
          <input
            type="number"
            id="rules.pointsForWin"
            name="rules.pointsForWin"
            value={formData.rules.pointsForWin}
            onChange={handleInputChange}
            min="0"
          />
        </div>
        
        <div className={formStyles.formGroup}>
          <label htmlFor="rules.pointsForDraw">{t('tournaments.pointsForDraw')}</label>
          <input
            type="number"
            id="rules.pointsForDraw"
            name="rules.pointsForDraw"
            value={formData.rules.pointsForDraw}
            onChange={handleInputChange}
            min="0"
          />
        </div>
        
        <div className={formStyles.formGroup}>
          <label htmlFor="rules.pointsForLoss">{t('tournaments.pointsForLoss')}</label>
          <input
            type="number"
            id="rules.pointsForLoss"
            name="rules.pointsForLoss"
            value={formData.rules.pointsForLoss}
            onChange={handleInputChange}
            min="0"
          />
        </div>
      </div>
      
      <div className={formStyles.formGroup}>
        <label>{t('tournaments.matchOptions')}</label>
        <div className={formStyles.checkboxGroup}>
          <input
            type="checkbox"
            id="rules.substitutesAllowed"
            name="rules.substitutesAllowed"
            checked={formData.rules.substitutesAllowed}
            onChange={handleInputChange}
          />
          <label htmlFor="rules.substitutesAllowed" className={formStyles.checkboxLabel}>
            {t('tournaments.substitutesAllowed')}
          </label>
        </div>
        
        <div className={formStyles.checkboxGroup}>
          <input
            type="checkbox"
            id="rules.useExtraTime"
            name="rules.useExtraTime"
            checked={formData.rules.useExtraTime}
            onChange={handleInputChange}
          />
          <label htmlFor="rules.useExtraTime" className={formStyles.checkboxLabel}>
            {t('tournaments.useExtraTime')}
          </label>
        </div>
        
        <div className={formStyles.checkboxGroup}>
          <input
            type="checkbox"
            id="rules.usePenaltyShootout"
            name="rules.usePenaltyShootout"
            checked={formData.rules.usePenaltyShootout}
            onChange={handleInputChange}
          />
          <label htmlFor="rules.usePenaltyShootout" className={formStyles.checkboxLabel}>
            {t('tournaments.usePenaltyShootout')}
          </label>
        </div>
      </div>
      
      <div className={formStyles.formGroup}>
        <label>{t('tournaments.tiebreakerCriteria')}</label>
        <p className={formStyles.helpText}>{t('tournaments.tiebreakerHelp')}</p>
        
        {formData.tiebreakerRules.criteria.map((criterion, index) => (
          <div key={index} className={formStyles.formRow}>
            <div className={formStyles.formGroup}>
              <label htmlFor={`criterion-${index}`}>{t('tournaments.criterion')} {index + 1}</label>
              <select
                id={`criterion-${index}`}
                value={criterion}
                onChange={(e) => handleCriteriaChange(index, e.target.value)}
              >
                <option value="points">{getCriterionOption('points')}</option>
                <option value="headToHead">{getCriterionOption('headToHead')}</option>
                <option value="goalDifference">{getCriterionOption('goalDifference')}</option>
                <option value="goalsFor">{getCriterionOption('goalsFor')}</option>
                <option value="fairPlay">{getCriterionOption('fairPlay')}</option>
                <option value="random">{getCriterionOption('random')}</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render form steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };
  
  return (
    <div className={formStyles.formContainer}>
      <h1 className={formStyles.formTitle}>{t('tournaments.createTournament')}</h1>
      
      {error && <div className={formStyles.errorMessage}>{error}</div>}
      
      <div className={formStyles.stepIndicator}>
        <div className={`${formStyles.step} ${currentStep >= 1 ? formStyles.active : ''}`}>
          {t('tournaments.basicInfo')}
        </div>
        <div className={`${formStyles.step} ${currentStep >= 2 ? formStyles.active : ''}`}>
          {t('tournaments.formatAndTeams')}
        </div>
        <div className={`${formStyles.step} ${currentStep >= 3 ? formStyles.active : ''}`}>
          {t('tournaments.rules')}
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {renderStepContent()}
        
        <div className={formStyles.formNavigation}>
          {currentStep > 1 && (
            <button
              type="button"
              className={`${formStyles.button} ${formStyles.secondaryButton}`}
              onClick={prevStep}
            >
              {t('common.back')}
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              className={`${formStyles.button} ${formStyles.primaryButton}`}
              onClick={nextStep}
              disabled={!validateStep()}
            >
              {t('common.next')}
            </button>
          ) : (
            <button
              type="submit"
              className={`${formStyles.button} ${formStyles.primaryButton}`}
              disabled={loading}
            >
              {loading ? t('common.creating') : t('tournaments.createTournament')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TournamentCreate;