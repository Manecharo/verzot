import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import tournamentService from '../../services/tournamentService';
import formStyles from '../../styles/FormStyles.module.css';
import { FaTimesCircle, FaCheckCircle, FaExclamationCircle, FaLock, FaPlus, FaMinus } from 'react-icons/fa';
import MatchEventsRecorder from './MatchEventsRecorder';
import './Tournaments.css';

const MatchResults = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { matchId } = useParams();
  
  // State
  const [match, setMatch] = useState(null);
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isConfirmationMode, setIsConfirmationMode] = useState(false);
  const [showEventsRecorder, setShowEventsRecorder] = useState(false);
  
  // Score state
  const [scores, setScores] = useState({
    homeScore: 0,
    awayScore: 0,
    halfTimeHomeScore: 0,
    halfTimeAwayScore: 0,
    homePenaltyScore: null,
    awayPenaltyScore: null
  });
  
  // Event state
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    type: 'goal',
    minute: '',
    playerId: '',
    teamId: '',
    details: ''
  });
  
  // Penalties state
  const [hasPenalties, setHasPenalties] = useState(false);
  
  // Check if user can edit this match
  const userIsAdmin = match && user && 
    (match.tournament?.organizerId === user.id || 
     match.referee?.id === user.id);
  
  // Check if match is completed
  const isMatchCompleted = match && match.status === 'completed';
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Fetch match data
  useEffect(() => {
    const fetchMatchData = async () => {
      setLoading(true);
      try {
        const response = await tournamentService.getMatchById(matchId);
        
        if (response.status === 'success') {
          const matchData = response.data;
          setMatch(matchData);
          setHomeTeam(matchData.homeTeam);
          setAwayTeam(matchData.awayTeam);
          
          // Initialize score state
          setScores({
            homeScore: matchData.homeScore || 0,
            awayScore: matchData.awayScore || 0,
            halfTimeHomeScore: matchData.halfTimeHomeScore || 0,
            halfTimeAwayScore: matchData.halfTimeAwayScore || 0,
            homePenaltyScore: matchData.homePenaltyScore || null,
            awayPenaltyScore: matchData.awayPenaltyScore || null
          });
          
          // Set penalties flag
          setHasPenalties(matchData.hasPenalties || false);
          
          // Get match events if any
          if (matchData.events) {
            setEvents(matchData.events);
          }
        } else {
          setError(response.message || t('matches.fetchError'));
        }
      } catch (err) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchData();
  }, [matchId, t]);
  
  // Handle score input change
  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    
    // Ensure score is non-negative
    const score = Math.max(0, parseInt(value) || 0);
    
    setScores({
      ...scores,
      [name]: score
    });
  };
  
  // Handle penalties toggle
  const handlePenaltiesToggle = (e) => {
    const hasPenalties = e.target.checked;
    setHasPenalties(hasPenalties);
    
    // Reset penalty scores if penalties are disabled
    if (!hasPenalties) {
      setScores({
        ...scores,
        homePenaltyScore: null,
        awayPenaltyScore: null
      });
    } else {
      // Initialize penalty scores if not set
      setScores({
        ...scores,
        homePenaltyScore: scores.homePenaltyScore || 0,
        awayPenaltyScore: scores.awayPenaltyScore || 0
      });
    }
  };
  
  // Handle new event input change
  const handleEventChange = (e) => {
    const { name, value } = e.target;
    
    setNewEvent({
      ...newEvent,
      [name]: value
    });
  };
  
  // Modified handleAddEvent to use the MatchEventsRecorder
  const handleAddEvent = (newEvent) => {
    // If there's already a temporary event with this ID, replace it
    const existingIndex = events.findIndex(e => e.id === newEvent.id);
    
    if (existingIndex >= 0) {
      const updatedEvents = [...events];
      updatedEvents[existingIndex] = newEvent;
      setEvents(updatedEvents);
    } else {
      setEvents([...events, newEvent]);
    }
  };
  
  // Remove an event
  const handleRemoveEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };
  
  // Handle match status change
  const handleStatusChange = (status) => {
    // Validate current status transitions
    if (match.status === 'scheduled' && status !== 'in-progress' && status !== 'cancelled') {
      setError(t('matches.invalidStatusTransition'));
      return;
    }
    
    if (match.status === 'in-progress' && status !== 'completed' && status !== 'cancelled') {
      setError(t('matches.invalidStatusTransition'));
      return;
    }
    
    // Update match in local state
    setMatch({
      ...match,
      status
    });
  };
  
  // Save match results
  const handleSaveResults = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Update match data
      const matchData = {
        homeScore: scores.homeScore,
        awayScore: scores.awayScore,
        halfTimeHomeScore: scores.halfTimeHomeScore,
        halfTimeAwayScore: scores.halfTimeAwayScore,
        hasPenalties,
        homePenaltyScore: hasPenalties ? scores.homePenaltyScore : null,
        awayPenaltyScore: hasPenalties ? scores.awayPenaltyScore : null,
        status: match.status,
        events: events.filter(event => !event.id.toString().startsWith('temp-')) // Filter out temporary events
      };
      
      const response = await tournamentService.updateMatch(matchId, matchData);
      
      if (response.status === 'success') {
        // If there are new events, add them
        const newEvents = events.filter(event => event.id.toString().startsWith('temp-'));
        
        if (newEvents.length > 0) {
          // Remove temporary IDs
          const eventsToAdd = newEvents.map(({ id, ...rest }) => rest);
          
          const eventsResponse = await tournamentService.addMatchEvents(matchId, eventsToAdd);
          
          if (eventsResponse.status !== 'success') {
            setError(eventsResponse.message || t('matches.eventsSaveError'));
            return;
          }
        }
        
        setSuccessMessage(t('matches.saveSuccess'));
        
        // If we're switching to confirmation mode
        if (match.status === 'completed' && !isConfirmationMode) {
          setIsConfirmationMode(true);
        }
      } else {
        setError(response.message || t('matches.saveError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Confirm match result
  const handleConfirmResult = async (role) => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await tournamentService.confirmMatchResult(matchId, role);
      
      if (response.status === 'success') {
        // Update match in local state
        setMatch({
          ...match,
          homeConfirmed: role === 'home' ? true : match.homeConfirmed,
          awayConfirmed: role === 'away' ? true : match.awayConfirmed,
          refereeConfirmed: role === 'referee' ? true : match.refereeConfirmed
        });
        
        setSuccessMessage(t('matches.confirmSuccess'));
      } else {
        setError(response.message || t('matches.confirmError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get event type display
  const getEventTypeDisplay = (eventType) => {
    const eventTypes = {
      'goal': '⚽ ' + t('matches.events.goal'),
      'ownGoal': '🥅 ' + t('matches.events.ownGoal'),
      'yellowCard': '🟨 ' + t('matches.events.yellowCard'),
      'redCard': '🟥 ' + t('matches.events.redCard'),
      'substitution': '🔄 ' + t('matches.events.substitution'),
      'injury': '🩹 ' + t('matches.events.injury'),
      'penalty': '⚠️ ' + t('matches.events.penalty'),
      'assist': '👟 ' + t('matches.events.assist')
    };
    
    return eventTypes[eventType] || eventType;
  };
  
  // Get team name by ID
  const getTeamName = (teamId) => {
    if (homeTeam && homeTeam.id === teamId) return homeTeam.name;
    if (awayTeam && awayTeam.id === teamId) return awayTeam.name;
    return '';
  };
  
  // Replace or modify the existing events rendering section with:
  const renderEventsSection = () => {
    return (
      <div className="match-events-section">
        <div className="section-header">
          <h3>{t('match.events')}</h3>
          <div className="header-actions">
            {userIsAdmin && !isMatchCompleted && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowEventsRecorder(!showEventsRecorder)}
              >
                {showEventsRecorder ? t('common.hideEventRecorder') : t('common.showEventRecorder')}
              </button>
            )}
          </div>
        </div>
        
        {showEventsRecorder ? (
          <MatchEventsRecorder
            events={events}
            matchData={match}
            onAddEvent={handleAddEvent}
            onRemoveEvent={handleRemoveEvent}
            readOnly={!userIsAdmin}
          />
        ) : (
          <div className="events-simple-list">
            {events.length === 0 ? (
              <p className="no-data">{t('match.noEvents')}</p>
            ) : (
              events.map((event, index) => (
                <div key={event.id || index} className="event-item-simple">
                  <span className="event-time-simple">{`${event.minute}'${event.addedTime > 0 ? '+' + event.addedTime : ''}`}</span>
                  <span className="event-type-simple">{getEventTypeDisplay(event.type)}</span>
                  <span className="event-team-simple">
                    {event.teamId === match.homeTeamId 
                      ? match.homeTeam.name 
                      : match.awayTeam.name}
                  </span>
                  <span className="event-player-simple">
                    {event.playerId && event.player ? event.player.name : ''}
                    {event.secondaryPlayerId && event.secondaryPlayer && (
                      <> → {event.secondaryPlayer.name}</>
                    )}
                  </span>
                  {userIsAdmin && !isMatchCompleted && (
                    <button
                      className="btn-icon"
                      onClick={() => handleRemoveEvent(event.id)}
                    >
                      <FaTimesCircle />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return <div className="loading-container">{t('common.loading')}</div>;
  }
  
  if (!match) {
    return (
      <div className="not-found-container">
        <h2>{t('matches.notFound')}</h2>
        <button
          className={`${formStyles.button} ${formStyles.primaryButton}`}
          onClick={() => navigate(-1)}
        >
          {t('common.back')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="match-result-container">
      <div className="back-navigation">
        <button
          className="back-button"
          onClick={() => navigate(`/tournaments/${match.tournamentId}`)}
        >
          ← {t('matches.backToTournament')}
        </button>
      </div>
      
      <div className="match-header">
        <h1>{t('matches.matchDetails')}</h1>
        <div className="match-status">
          <span className={`status-badge ${match.status}`}>
            {t(`matches.statuses.${match.status}`)}
          </span>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      {/* Match info */}
      <div className="match-info">
        <div className="match-date">
          <span className="info-label">{t('matches.scheduledFor')}</span>
          <span className="info-value">{formatDate(match.scheduledDate)}</span>
        </div>
        
        {match.location && (
          <div className="match-location">
            <span className="info-label">{t('matches.location')}</span>
            <span className="info-value">{match.location}</span>
            {match.field && <span className="field-info">{t('matches.field')}: {match.field}</span>}
          </div>
        )}
        
        <div className="match-phase">
          <span className="info-label">{t('matches.phase')}</span>
          <span className="info-value">
            {t(`tournaments.phases.${match.phase || 'unknown'}`)}
            {match.group && ` ${t('tournaments.group')} ${match.group}`}
            {match.round && ` ${t('common.round')} ${match.round}`}
          </span>
        </div>
      </div>
      
      {/* Match teams and score */}
      <div className="match-score-display">
        <div className="team home-team">
          <div className="team-logo">
            {homeTeam?.logoUrl ? (
              <img src={homeTeam.logoUrl} alt={`${homeTeam.name} logo`} />
            ) : (
              <div className="default-logo">{homeTeam?.name.substring(0, 2).toUpperCase()}</div>
            )}
          </div>
          <h2 className="team-name">{homeTeam?.name}</h2>
        </div>
        
        <div className="score-container">
          {isMatchCompleted ? (
            <div className="final-score">
              <span className="home-score">{match.homeScore || 0}</span>
              <span className="score-separator">:</span>
              <span className="away-score">{match.awayScore || 0}</span>
              
              {match.hasPenalties && (
                <div className="penalty-score">
                  <span>({match.homePenaltyScore || 0} : {match.awayPenaltyScore || 0} {t('matches.penalties')})</span>
                </div>
              )}
            </div>
          ) : (
            <div className="vs-display">VS</div>
          )}
        </div>
        
        <div className="team away-team">
          <div className="team-logo">
            {awayTeam?.logoUrl ? (
              <img src={awayTeam.logoUrl} alt={`${awayTeam.name} logo`} />
            ) : (
              <div className="default-logo">{awayTeam?.name.substring(0, 2).toUpperCase()}</div>
            )}
          </div>
          <h2 className="team-name">{awayTeam?.name}</h2>
        </div>
      </div>
      
      {/* If match is completed and all parties confirmed, show final result */}
      {isMatchCompleted && match.homeConfirmed && match.awayConfirmed && match.refereeConfirmed && (
        <div className="confirmed-result">
          <div className="confirmed-badge">
            <span className="checkmark">✓</span>
            {t('matches.resultConfirmed')}
          </div>
          
          <div className="confirmation-info">
            <div className="confirmation-item">
              <span>{t('matches.confirmedByHomeTeam')}</span>
              <span className="confirmed-date">{new Date(match.homeConfirmedAt).toLocaleDateString()}</span>
            </div>
            <div className="confirmation-item">
              <span>{t('matches.confirmedByAwayTeam')}</span>
              <span className="confirmed-date">{new Date(match.awayConfirmedAt).toLocaleDateString()}</span>
            </div>
            {match.refereeConfirmed && (
              <div className="confirmation-item">
                <span>{t('matches.confirmedByReferee')}</span>
                <span className="confirmed-date">{new Date(match.refereeConfirmedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Score editing form (for admins only) */}
      {userIsAdmin && !isConfirmationMode && !isMatchCompleted && (
        <div className="score-edit-form">
          <h2>{t('matches.updateResult')}</h2>
          
          <div className="form-section">
            <h3>{t('matches.finalScore')}</h3>
            
            <div className={formStyles.formRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="homeScore">{homeTeam?.name}</label>
                <input
                  type="number"
                  id="homeScore"
                  name="homeScore"
                  value={scores.homeScore}
                  onChange={handleScoreChange}
                  min="0"
                />
              </div>
              
              <div className={formStyles.formGroup}>
                <label htmlFor="awayScore">{awayTeam?.name}</label>
                <input
                  type="number"
                  id="awayScore"
                  name="awayScore"
                  value={scores.awayScore}
                  onChange={handleScoreChange}
                  min="0"
                />
              </div>
            </div>
            
            <h3>{t('matches.halfTimeScore')}</h3>
            
            <div className={formStyles.formRow}>
              <div className={formStyles.formGroup}>
                <label htmlFor="halfTimeHomeScore">{homeTeam?.name}</label>
                <input
                  type="number"
                  id="halfTimeHomeScore"
                  name="halfTimeHomeScore"
                  value={scores.halfTimeHomeScore}
                  onChange={handleScoreChange}
                  min="0"
                />
              </div>
              
              <div className={formStyles.formGroup}>
                <label htmlFor="halfTimeAwayScore">{awayTeam?.name}</label>
                <input
                  type="number"
                  id="halfTimeAwayScore"
                  name="halfTimeAwayScore"
                  value={scores.halfTimeAwayScore}
                  onChange={handleScoreChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className={formStyles.checkboxGroup}>
              <input
                type="checkbox"
                id="hasPenalties"
                checked={hasPenalties}
                onChange={handlePenaltiesToggle}
              />
              <label htmlFor="hasPenalties">{t('matches.hasPenalties')}</label>
            </div>
            
            {hasPenalties && (
              <div className="penalty-section">
                <h3>{t('matches.penaltyShootout')}</h3>
                
                <div className={formStyles.formRow}>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="homePenaltyScore">{homeTeam?.name}</label>
                    <input
                      type="number"
                      id="homePenaltyScore"
                      name="homePenaltyScore"
                      value={scores.homePenaltyScore}
                      onChange={handleScoreChange}
                      min="0"
                    />
                  </div>
                  
                  <div className={formStyles.formGroup}>
                    <label htmlFor="awayPenaltyScore">{awayTeam?.name}</label>
                    <input
                      type="number"
                      id="awayPenaltyScore"
                      name="awayPenaltyScore"
                      value={scores.awayPenaltyScore}
                      onChange={handleScoreChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="status-section">
              <h3>{t('matches.matchStatus')}</h3>
              
              <div className="status-buttons">
                {match.status !== 'in-progress' && match.status !== 'completed' && (
                  <button
                    type="button"
                    className={`status-button start ${match.status === 'scheduled' ? 'primary' : ''}`}
                    onClick={() => handleStatusChange('in-progress')}
                  >
                    {t('matches.startMatch')}
                  </button>
                )}
                
                {match.status === 'in-progress' && (
                  <button
                    type="button"
                    className="status-button complete primary"
                    onClick={() => handleStatusChange('completed')}
                  >
                    {t('matches.completeMatch')}
                  </button>
                )}
                
                {match.status !== 'cancelled' && match.status !== 'completed' && (
                  <button
                    type="button"
                    className="status-button cancel"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    {t('matches.cancelMatch')}
                  </button>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className={`${formStyles.button} ${formStyles.primaryButton}`}
                onClick={handleSaveResults}
                disabled={submitting}
              >
                {submitting ? t('common.saving') : t('matches.saveResult')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation mode */}
      {isMatchCompleted && isConfirmationMode && (
        <div className="confirmation-section">
          <h2>{t('matches.confirmResult')}</h2>
          
          <p className="confirmation-message">{t('matches.confirmationInstructions')}</p>
          
          <div className="confirmation-buttons">
            {!match.homeConfirmed && user && homeTeam && homeTeam.teamLeaderId === user.id && (
              <button
                type="button"
                className={`${formStyles.button} ${formStyles.primaryButton}`}
                onClick={() => handleConfirmResult('home')}
                disabled={submitting}
              >
                {t('matches.confirmAsHomeTeam')}
              </button>
            )}
            
            {!match.awayConfirmed && user && awayTeam && awayTeam.teamLeaderId === user.id && (
              <button
                type="button"
                className={`${formStyles.button} ${formStyles.primaryButton}`}
                onClick={() => handleConfirmResult('away')}
                disabled={submitting}
              >
                {t('matches.confirmAsAwayTeam')}
              </button>
            )}
            
            {!match.refereeConfirmed && user && match.refereeId === user.id && (
              <button
                type="button"
                className={`${formStyles.button} ${formStyles.primaryButton}`}
                onClick={() => handleConfirmResult('referee')}
                disabled={submitting}
              >
                {t('matches.confirmAsReferee')}
              </button>
            )}
            
            {userIsAdmin && (
              <button
                type="button"
                className={`${formStyles.button} ${formStyles.secondaryButton}`}
                onClick={() => setIsConfirmationMode(false)}
                disabled={submitting}
              >
                {t('matches.editResult')}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Add the events section where appropriate in the UI */}
      {renderEventsSection()}
    </div>
  );
};

export default MatchResults; 