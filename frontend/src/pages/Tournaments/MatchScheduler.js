import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services';
import formStyles from '../../styles/FormStyles.module.css';
import './Tournaments.css';

const MatchScheduler = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: tournamentId } = useParams();
  
  // State
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [schedulingMethod, setSchedulingMethod] = useState('manual');
  const [format, setFormat] = useState('knockout');
  
  // Check if user is tournament organizer
  const userIsOrganizer = tournament && user && tournament.organizerId === user.id;
  
  // Get phases based on tournament format
  const getPhases = () => {
    if (format === 'league') {
      return ['league'];
    }
    
    if (format === 'group') {
      return ['group', 'knockout'];
    }
    
    return ['round64', 'round32', 'round16', 'quarterfinal', 'semifinal', 'final'];
  };
  
  // New match template
  const getNewMatchTemplate = () => ({
    tournamentId,
    homeTeamId: '',
    awayTeamId: '',
    scheduledDate: '',
    location: tournament?.location || '',
    field: '',
    phase: getPhases()[0],
    group: format === 'group' ? 'A' : null,
    round: 1,
    status: 'scheduled'
  });
  
  // Effect to load tournament data
  useEffect(() => {
    const fetchTournamentData = async () => {
      setLoading(true);
      try {
        // Get tournament details
        const tournamentResponse = await tournamentService.getTournamentById(tournamentId);
        
        if (tournamentResponse.status === 'success') {
          const tournamentData = tournamentResponse.data;
          setTournament(tournamentData);
          setFormat(tournamentData.format || 'knockout');
          
          // Get registered teams
          const teamsResponse = await tournamentService.getTournamentTeams(tournamentId);
          
          if (teamsResponse.status === 'success') {
            setTeams(teamsResponse.data);
          } else {
            setError(teamsResponse.message || t('tournaments.fetchTeamsError'));
          }
          
          // Get existing matches if any
          const matchesResponse = await tournamentService.getTournamentMatches(tournamentId);
          
          if (matchesResponse.status === 'success' && matchesResponse.data.length > 0) {
            setMatches(matchesResponse.data);
          } else {
            // Initialize with one empty match
            setMatches([getNewMatchTemplate()]);
          }
        } else {
          setError(tournamentResponse.message || t('tournaments.fetchError'));
        }
      } catch (err) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournamentData();
  }, [tournamentId, t]);
  
  // Handle input change
  const handleMatchChange = (index, field, value) => {
    const updatedMatches = [...matches];
    updatedMatches[index] = {
      ...updatedMatches[index],
      [field]: value
    };
    setMatches(updatedMatches);
  };
  
  // Validate match
  const validateMatch = (match) => {
    if (!match.homeTeamId || !match.awayTeamId) {
      return false;
    }
    
    if (match.homeTeamId === match.awayTeamId) {
      return false;
    }
    
    if (!match.scheduledDate) {
      return false;
    }
    
    if (!match.phase) {
      return false;
    }
    
    return true;
  };
  
  // Add a new match
  const handleAddMatch = () => {
    setMatches([...matches, getNewMatchTemplate()]);
  };
  
  // Remove a match
  const handleRemoveMatch = (index) => {
    const updatedMatches = [...matches];
    updatedMatches.splice(index, 1);
    setMatches(updatedMatches);
  };
  
  // Generate an automatic schedule
  const generateAutoSchedule = () => {
    if (teams.length < 2) {
      setError(t('scheduler.notEnoughTeams'));
      return;
    }
    
    let generatedMatches = [];
    
    if (format === 'league') {
      // Round-robin tournament (each team plays against all others)
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          generatedMatches.push({
            ...getNewMatchTemplate(),
            homeTeamId: teams[i].id,
            awayTeamId: teams[j].id,
            phase: 'league'
          });
        }
      }
    } else if (format === 'group') {
      // Group stage (assuming 4 teams per group for simplicity)
      const groupSize = 4;
      const numGroups = Math.ceil(teams.length / groupSize);
      
      // Distribute teams into groups
      const groupedTeams = {};
      for (let i = 0; i < teams.length; i++) {
        const groupLetter = String.fromCharCode(65 + Math.floor(i / groupSize)); // A, B, C, etc.
        if (!groupedTeams[groupLetter]) {
          groupedTeams[groupLetter] = [];
        }
        groupedTeams[groupLetter].push(teams[i]);
      }
      
      // Create matches within each group
      Object.keys(groupedTeams).forEach(group => {
        const groupTeams = groupedTeams[group];
        for (let i = 0; i < groupTeams.length; i++) {
          for (let j = i + 1; j < groupTeams.length; j++) {
            generatedMatches.push({
              ...getNewMatchTemplate(),
              homeTeamId: groupTeams[i].id,
              awayTeamId: groupTeams[j].id,
              phase: 'group',
              group
            });
          }
        }
      });
    } else {
      // Single or double elimination bracket
      // For simplicity, we'll just create the first round matches
      const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < shuffledTeams.length; i += 2) {
        if (i + 1 < shuffledTeams.length) {
          generatedMatches.push({
            ...getNewMatchTemplate(),
            homeTeamId: shuffledTeams[i].id,
            awayTeamId: shuffledTeams[i + 1].id,
            phase: shuffledTeams.length > 32 ? 'round64' : 
                   shuffledTeams.length > 16 ? 'round32' : 
                   shuffledTeams.length > 8 ? 'round16' : 
                   shuffledTeams.length > 4 ? 'quarterfinal' : 'semifinal'
          });
        }
      }
    }
    
    // Set default dates spaced 2 days apart
    const startDate = new Date();
    startDate.setHours(15, 0, 0, 0); // 3:00 PM
    
    generatedMatches = generatedMatches.map((match, index) => {
      const matchDate = new Date(startDate);
      matchDate.setDate(matchDate.getDate() + Math.floor(index / 3) * 2); // 3 matches per day, every 2 days
      
      // Adjust time for matches on same day
      matchDate.setHours(15 + (index % 3) * 2, 0, 0, 0); // 3:00 PM, 5:00 PM, 7:00 PM
      
      return {
        ...match,
        scheduledDate: matchDate.toISOString().slice(0, 16),
        location: tournament?.location || '',
      };
    });
    
    setMatches(generatedMatches);
    setSuccessMessage(t('scheduler.scheduleGenerated'));
  };
  
  // Save the schedule
  const handleSaveSchedule = async () => {
    // Validate all matches
    const invalidMatches = matches.filter(match => !validateMatch(match));
    
    if (invalidMatches.length > 0) {
      setError(t('scheduler.invalidMatches', { count: invalidMatches.length }));
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await tournamentService.scheduleMatches(tournamentId, matches);
      
      if (response.status === 'success') {
        setSuccessMessage(t('scheduler.scheduleSuccess'));
        // Navigate back to tournament details after a delay
        setTimeout(() => {
          navigate(`/tournaments/${tournamentId}`);
        }, 2000);
      } else {
        setError(response.message || t('scheduler.error'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get team name by ID
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : '';
  };
  
  if (loading) {
    return <div className="loading-container">{t('common.loading')}</div>;
  }
  
  if (!tournament) {
    return (
      <div className="not-found-container">
        <h2>{t('tournaments.notFound')}</h2>
        <button
          className={`${formStyles.button} ${formStyles.primaryButton}`}
          onClick={() => navigate('/tournaments')}
        >
          {t('tournaments.backToList')}
        </button>
      </div>
    );
  }
  
  if (!userIsOrganizer) {
    return (
      <div className="not-authorized-container">
        <h2>{t('common.notAuthorized')}</h2>
        <p>{t('scheduler.organiserOnly')}</p>
        <button
          className={`${formStyles.button} ${formStyles.primaryButton}`}
          onClick={() => navigate(`/tournaments/${tournamentId}`)}
        >
          {t('tournaments.backToDetails')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="scheduler-container">
      <div className="back-navigation">
        <button
          className="back-button"
          onClick={() => navigate(`/tournaments/${tournamentId}`)}
        >
          ← {t('tournaments.backToDetails')}
        </button>
      </div>
      
      <div className="scheduler-header">
        <h1>{t('scheduler.title')}</h1>
        <div className="tournament-name">{tournament.name}</div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="scheduling-options">
        <div className={formStyles.formGroup}>
          <label htmlFor="schedulingMethod">{t('scheduler.method')}</label>
          <select
            id="schedulingMethod"
            value={schedulingMethod}
            onChange={(e) => setSchedulingMethod(e.target.value)}
            className={formStyles.select}
          >
            <option value="manual">{t('scheduler.manual')}</option>
            <option value="automatic">{t('scheduler.automatic')}</option>
          </select>
        </div>
        
        {schedulingMethod === 'automatic' && (
          <div className="auto-options">
            <p className="help-text">{t('scheduler.autoHelp')}</p>
            <button
              type="button"
              className={`${formStyles.button} ${formStyles.primaryButton}`}
              onClick={generateAutoSchedule}
              disabled={teams.length < 2}
            >
              {t('scheduler.generate')}
            </button>
          </div>
        )}
      </div>
      
      <div className="matches-list">
        <h2>{t('scheduler.matches')}</h2>
        
        {teams.length < 2 ? (
          <div className="warning-message">
            {t('scheduler.needMoreTeams')}
          </div>
        ) : (
          <>
            {matches.map((match, index) => (
              <div key={index} className="match-card">
                <div className="match-number">#{index + 1}</div>
                
                <div className={formStyles.formRow}>
                  <div className={formStyles.formGroup}>
                    <label htmlFor={`homeTeam-${index}`}>{t('matches.homeTeam')}</label>
                    <select
                      id={`homeTeam-${index}`}
                      value={match.homeTeamId}
                      onChange={(e) => handleMatchChange(index, 'homeTeamId', e.target.value)}
                      className={formStyles.select}
                    >
                      <option value="">{t('scheduler.selectTeam')}</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="vs-label">VS</div>
                  
                  <div className={formStyles.formGroup}>
                    <label htmlFor={`awayTeam-${index}`}>{t('matches.awayTeam')}</label>
                    <select
                      id={`awayTeam-${index}`}
                      value={match.awayTeamId}
                      onChange={(e) => handleMatchChange(index, 'awayTeamId', e.target.value)}
                      className={formStyles.select}
                    >
                      <option value="">{t('scheduler.selectTeam')}</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className={formStyles.formRow}>
                  <div className={formStyles.formGroup}>
                    <label htmlFor={`scheduledDate-${index}`}>{t('matches.scheduledDate')}</label>
                    <input
                      type="datetime-local"
                      id={`scheduledDate-${index}`}
                      value={match.scheduledDate}
                      onChange={(e) => handleMatchChange(index, 'scheduledDate', e.target.value)}
                      className={formStyles.input}
                    />
                  </div>
                  
                  <div className={formStyles.formGroup}>
                    <label htmlFor={`location-${index}`}>{t('matches.location')}</label>
                    <input
                      type="text"
                      id={`location-${index}`}
                      value={match.location}
                      onChange={(e) => handleMatchChange(index, 'location', e.target.value)}
                      className={formStyles.input}
                    />
                  </div>
                  
                  <div className={formStyles.formGroup}>
                    <label htmlFor={`field-${index}`}>{t('matches.field')}</label>
                    <input
                      type="text"
                      id={`field-${index}`}
                      value={match.field}
                      onChange={(e) => handleMatchChange(index, 'field', e.target.value)}
                      className={formStyles.input}
                    />
                  </div>
                </div>
                
                <div className={formStyles.formRow}>
                  <div className={formStyles.formGroup}>
                    <label htmlFor={`phase-${index}`}>{t('matches.phase')}</label>
                    <select
                      id={`phase-${index}`}
                      value={match.phase}
                      onChange={(e) => handleMatchChange(index, 'phase', e.target.value)}
                      className={formStyles.select}
                    >
                      {getPhases().map(phase => (
                        <option key={phase} value={phase}>
                          {t(`tournaments.phases.${phase}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {format === 'group' && match.phase === 'group' && (
                    <div className={formStyles.formGroup}>
                      <label htmlFor={`group-${index}`}>{t('tournaments.group')}</label>
                      <select
                        id={`group-${index}`}
                        value={match.group || 'A'}
                        onChange={(e) => handleMatchChange(index, 'group', e.target.value)}
                        className={formStyles.select}
                      >
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className={formStyles.formGroup}>
                    <label htmlFor={`round-${index}`}>{t('common.round')}</label>
                    <input
                      type="number"
                      id={`round-${index}`}
                      value={match.round}
                      onChange={(e) => handleMatchChange(index, 'round', parseInt(e.target.value) || 1)}
                      min="1"
                      className={formStyles.input}
                    />
                  </div>
                </div>
                
                <div className="match-actions">
                  <button
                    type="button"
                    className="remove-match-btn"
                    onClick={() => handleRemoveMatch(index)}
                    title={t('scheduler.removeMatch')}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            
            <div className="add-match">
              <button
                type="button"
                className={`${formStyles.button} ${formStyles.secondaryButton}`}
                onClick={handleAddMatch}
              >
                + {t('scheduler.addMatch')}
              </button>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className={`${formStyles.button} ${formStyles.cancelButton}`}
                onClick={() => navigate(`/tournaments/${tournamentId}`)}
                disabled={submitting}
              >
                {t('common.cancel')}
              </button>
              
              <button
                type="button"
                className={`${formStyles.button} ${formStyles.primaryButton}`}
                onClick={handleSaveSchedule}
                disabled={submitting || matches.length === 0}
              >
                {submitting ? t('common.saving') : t('scheduler.saveSchedule')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchScheduler; 