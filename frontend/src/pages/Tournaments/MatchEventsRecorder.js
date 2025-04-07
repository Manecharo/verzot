import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import formStyles from '../../styles/FormStyles.module.css';
import './Tournaments.css';

/**
 * MatchEventsRecorder component for detailed match event recording
 * 
 * @param {Object} props - Component props
 * @param {Array} props.events - Current match events
 * @param {Function} props.onAddEvent - Function to add a new event
 * @param {Function} props.onRemoveEvent - Function to remove an event
 * @param {Object} props.homeTeam - Home team data
 * @param {Object} props.awayTeam - Away team data
 * @param {boolean} props.isReadOnly - Whether the interface is read-only
 * @param {Function} props.onUpdateEvent - Function to update an existing event
 */
const MatchEventsRecorder = ({ 
  events = [], 
  onAddEvent, 
  onRemoveEvent, 
  homeTeam, 
  awayTeam, 
  isReadOnly = false,
  onUpdateEvent
}) => {
  const { t } = useTranslation();
  
  // State for the new event form
  const [newEvent, setNewEvent] = useState({
    type: 'goal',
    minute: '',
    addedTime: '',
    half: 1,
    teamId: '',
    playerId: '',
    secondaryPlayerId: '',
    playerName: '',
    secondaryPlayerName: '',
    details: '',
    coordinates: null
  });
  
  // State for editing an existing event
  const [editingEventId, setEditingEventId] = useState(null);
  const [showField, setShowField] = useState(false);
  const [error, setError] = useState(null);
  
  // Available players
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  
  // Define event types with their icons and labels
  const eventTypes = [
    { id: 'goal', icon: '⚽', label: t('matches.events.goal') },
    { id: 'own-goal', icon: '🥅', label: t('matches.events.ownGoal') },
    { id: 'yellow-card', icon: '🟨', label: t('matches.events.yellowCard') },
    { id: 'red-card', icon: '🟥', label: t('matches.events.redCard') },
    { id: 'second-yellow', icon: '🟨🟥', label: t('matches.events.secondYellow') },
    { id: 'penalty-goal', icon: '⚽⚠️', label: t('matches.events.penaltyGoal') },
    { id: 'penalty-missed', icon: '❌⚠️', label: t('matches.events.penaltyMissed') },
    { id: 'penalty-saved', icon: '🧤⚠️', label: t('matches.events.penaltySaved') },
    { id: 'substitution-in', icon: '🔄↑', label: t('matches.events.substitutionIn') },
    { id: 'substitution-out', icon: '🔄↓', label: t('matches.events.substitutionOut') },
    { id: 'injury', icon: '🩹', label: t('matches.events.injury') },
    { id: 'assist', icon: '👟', label: t('matches.events.assist') }
  ];
  
  // Effect to update players when teams change
  useEffect(() => {
    if (homeTeam && homeTeam.players) {
      setHomePlayers(homeTeam.players);
    }
    
    if (awayTeam && awayTeam.players) {
      setAwayPlayers(awayTeam.players);
    }
  }, [homeTeam, awayTeam]);
  
  // Handle input changes for the new event form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setNewEvent({
      ...newEvent,
      [name]: value
    });
    
    // Clear error when input changes
    if (error) {
      setError(null);
    }
  };
  
  // Get player options based on selected team
  const getPlayerOptions = () => {
    if (!newEvent.teamId) return [];
    
    if (homeTeam && newEvent.teamId === homeTeam.id) {
      return homePlayers;
    } else if (awayTeam && newEvent.teamId === awayTeam.id) {
      return awayPlayers;
    }
    
    return [];
  };
  
  // Handle team change to reset player selection
  const handleTeamChange = (e) => {
    const { value } = e.target;
    
    setNewEvent({
      ...newEvent,
      teamId: value,
      playerId: '',
      secondaryPlayerId: '',
      playerName: '',
      secondaryPlayerName: ''
    });
  };
  
  // Get event type display with icon
  const getEventTypeDisplay = (eventType) => {
    const foundType = eventTypes.find(type => type.id === eventType);
    if (foundType) {
      return `${foundType.icon} ${foundType.label}`;
    }
    return eventType;
  };
  
  // Handle event type change to set appropriate defaults
  const handleEventTypeChange = (e) => {
    const { value } = e.target;
    
    const updatedEvent = {
      ...newEvent,
      type: value
    };
    
    // Set defaults based on event type
    if (value === 'substitution-in' || value === 'substitution-out') {
      // For substitutions, we need a secondary player
      updatedEvent.needsSecondaryPlayer = true;
    } else if (value === 'assist') {
      // For assists, the secondary player is the scorer
      updatedEvent.needsSecondaryPlayer = true;
    } else {
      updatedEvent.needsSecondaryPlayer = false;
      updatedEvent.secondaryPlayerId = '';
      updatedEvent.secondaryPlayerName = '';
    }
    
    setNewEvent(updatedEvent);
  };
  
  // Field click handler to set coordinates
  const handleFieldClick = (e) => {
    if (!showField) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
    
    setNewEvent({
      ...newEvent,
      coordinates: { x, y }
    });
  };
  
  // Reset form
  const resetForm = () => {
    setNewEvent({
      type: 'goal',
      minute: '',
      addedTime: '',
      half: 1,
      teamId: '',
      playerId: '',
      secondaryPlayerId: '',
      playerName: '',
      secondaryPlayerName: '',
      details: '',
      coordinates: null
    });
    setShowField(false);
    setError(null);
  };
  
  // Add event
  const handleAddEvent = () => {
    // Basic validation
    if (!newEvent.minute || !newEvent.teamId) {
      setError(t('matches.invalidEventData'));
      return;
    }
    
    // Create event object
    const event = {
      ...newEvent,
      id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    // Call parent handler
    onAddEvent(event);
    
    // Reset form
    resetForm();
  };
  
  // Calculate event time display
  const getEventTimeDisplay = (event) => {
    let display = `${event.minute}'`;
    
    if (event.addedTime > 0) {
      display += `+${event.addedTime}`;
    }
    
    return display;
  };
  
  // Get team name by ID
  const getTeamName = (teamId) => {
    if (homeTeam && homeTeam.id === teamId) return homeTeam.name;
    if (awayTeam && awayTeam.id === teamId) return awayTeam.name;
    return '';
  };
  
  // Get event class for styling
  const getEventClass = (teamId) => {
    if (homeTeam && homeTeam.id === teamId) return 'home-event';
    if (awayTeam && awayTeam.id === teamId) return 'away-event';
    return '';
  };
  
  return (
    <div className="match-events-recorder">
      <div className="events-timeline">
        <h3 className="events-timeline-title">{t('matches.matchEvents')}</h3>
        
        {events.length === 0 ? (
          <p className="no-events">{t('matches.noEvents')}</p>
        ) : (
          <div className="events-list">
            {events
              .sort((a, b) => {
                // Sort by half first, then by minute and added time
                if (a.half !== b.half) return a.half - b.half;
                if (a.minute !== b.minute) return a.minute - b.minute;
                return (a.addedTime || 0) - (b.addedTime || 0);
              })
              .map(event => (
                <div 
                  key={event.id} 
                  className={`event-item ${getEventClass(event.teamId)}`}
                >
                  <div className="event-time">
                    {getEventTimeDisplay(event)}
                  </div>
                  <div className="event-icon-container">
                    <span className="event-icon">
                      {eventTypes.find(type => type.id === event.type)?.icon || '📝'}
                    </span>
                  </div>
                  <div className="event-details">
                    <div className="event-header">
                      <span className="event-type">{getEventTypeDisplay(event.type)}</span>
                      <span className="event-team">{getTeamName(event.teamId)}</span>
                    </div>
                    
                    {(event.playerName || event.playerId) && (
                      <div className="event-player">
                        {event.playerName || `Player ID: ${event.playerId}`}
                      </div>
                    )}
                    
                    {(event.secondaryPlayerName || event.secondaryPlayerId) && (
                      <div className="event-secondary-player">
                        {event.type === 'assist' ? t('matches.events.assistedBy') : t('matches.events.with')}
                        {' '}{event.secondaryPlayerName || `Player ID: ${event.secondaryPlayerId}`}
                      </div>
                    )}
                    
                    {event.details && (
                      <div className="event-notes">{event.details}</div>
                    )}
                  </div>
                  
                  {!isReadOnly && (
                    <div className="event-actions">
                      <button
                        type="button"
                        className="event-action-button edit"
                        onClick={() => setEditingEventId(event.id)}
                        aria-label={t('common.edit')}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="event-action-button delete"
                        onClick={() => onRemoveEvent(event.id)}
                        aria-label={t('common.delete')}
                      >
                        ❌
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
      
      {!isReadOnly && (
        <div className="event-form-container">
          <h3 className="form-title">{t('matches.recordEvent')}</h3>
          {error && <div className="error-message">{error}</div>}
          
          <div className="event-form">
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="event-half">{t('matches.half')}</label>
                <select
                  id="event-half"
                  name="half"
                  value={newEvent.half}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value={1}>{t('matches.firstHalf')}</option>
                  <option value={2}>{t('matches.secondHalf')}</option>
                  <option value={3}>{t('matches.extraTimeFirst')}</option>
                  <option value={4}>{t('matches.extraTimeSecond')}</option>
                  <option value={5}>{t('matches.penalties')}</option>
                </select>
              </div>
              
              <div className="form-group quarter-width">
                <label htmlFor="event-minute">{t('matches.minute')}</label>
                <input
                  type="number"
                  id="event-minute"
                  name="minute"
                  value={newEvent.minute}
                  onChange={handleInputChange}
                  min="0"
                  max="120"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group quarter-width">
                <label htmlFor="event-added-time">{t('matches.addedTime')}</label>
                <input
                  type="number"
                  id="event-added-time"
                  name="addedTime"
                  value={newEvent.addedTime}
                  onChange={handleInputChange}
                  min="0"
                  max="15"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="event-type">{t('matches.eventType')}</label>
                <select
                  id="event-type"
                  name="type"
                  value={newEvent.type}
                  onChange={handleEventTypeChange}
                  className="form-select"
                >
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group half-width">
                <label htmlFor="event-team">{t('matches.team')}</label>
                <select
                  id="event-team"
                  name="teamId"
                  value={newEvent.teamId}
                  onChange={handleTeamChange}
                  className="form-select"
                  required
                >
                  <option value="">{t('matches.selectTeam')}</option>
                  {homeTeam && (
                    <option value={homeTeam.id}>{homeTeam.name} ({t('matches.homeTeam')})</option>
                  )}
                  {awayTeam && (
                    <option value={awayTeam.id}>{awayTeam.name} ({t('matches.awayTeam')})</option>
                  )}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="event-player">{t('matches.player')}</label>
                {getPlayerOptions().length > 0 ? (
                  <select
                    id="event-player"
                    name="playerId"
                    value={newEvent.playerId}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">{t('matches.selectPlayer')}</option>
                    {getPlayerOptions().map(player => (
                      <option key={player.id} value={player.id}>
                        {player.firstName} {player.lastName} #{player.jerseyNumber}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="event-player-name"
                    name="playerName"
                    value={newEvent.playerName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('matches.playerNamePlaceholder')}
                  />
                )}
              </div>
              
              {newEvent.needsSecondaryPlayer && (
                <div className="form-group half-width">
                  <label htmlFor="event-secondary-player">
                    {newEvent.type === 'assist' 
                      ? t('matches.scoredBy') 
                      : newEvent.type.startsWith('substitution') 
                        ? t('matches.replacedWith') 
                        : t('matches.secondaryPlayer')
                    }
                  </label>
                  {getPlayerOptions().length > 0 ? (
                    <select
                      id="event-secondary-player"
                      name="secondaryPlayerId"
                      value={newEvent.secondaryPlayerId}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">{t('matches.selectPlayer')}</option>
                      {getPlayerOptions()
                        .filter(player => player.id !== newEvent.playerId)
                        .map(player => (
                          <option key={player.id} value={player.id}>
                            {player.firstName} {player.lastName} #{player.jerseyNumber}
                          </option>
                        ))
                      }
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="event-secondary-player-name"
                      name="secondaryPlayerName"
                      value={newEvent.secondaryPlayerName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t('matches.playerNamePlaceholder')}
                    />
                  )}
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="event-details">{t('matches.details')}</label>
                <input
                  type="text"
                  id="event-details"
                  name="details"
                  value={newEvent.details}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={t('matches.eventDetailsPlaceholder')}
                />
              </div>
            </div>
            
            <div className="form-row field-toggle">
              <button
                type="button"
                className={`${formStyles.button} ${showField ? formStyles.primaryButton : formStyles.secondaryButton}`}
                onClick={() => setShowField(!showField)}
              >
                {showField 
                  ? t('matches.hideField') 
                  : t('matches.showField')
                }
              </button>
              
              {newEvent.coordinates && (
                <div className="coordinates-display">
                  X: {newEvent.coordinates.x}%, Y: {newEvent.coordinates.y}%
                </div>
              )}
            </div>
            
            {showField && (
              <div className="field-container">
                <div className="field-image" onClick={handleFieldClick}>
                  {/* Soccer field graphic */}
                  <div className="field-markup">
                    <div className="center-circle"></div>
                    <div className="center-line"></div>
                    <div className="penalty-area left"></div>
                    <div className="penalty-area right"></div>
                    <div className="goal-area left"></div>
                    <div className="goal-area right"></div>
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                  </div>
                  
                  {newEvent.coordinates && (
                    <div 
                      className="event-marker"
                      style={{
                        left: `${newEvent.coordinates.x}%`,
                        top: `${newEvent.coordinates.y}%`
                      }}
                    />
                  )}
                </div>
                <div className="field-instructions">
                  {t('matches.fieldInstructions')}
                </div>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className={`${formStyles.button} ${formStyles.secondaryButton}`}
                onClick={resetForm}
              >
                {t('common.reset')}
              </button>
              <button 
                type="button" 
                className={`${formStyles.button} ${formStyles.primaryButton}`}
                onClick={handleAddEvent}
              >
                {t('matches.addEvent')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchEventsRecorder; 