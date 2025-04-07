import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import tournamentService from '../../services/tournamentService';
import playerService from '../../services/playerService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';
import './Tournaments.css';

const PlayerDetailStats = () => {
  const { t } = useTranslation();
  const { tournamentId, playerId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [tournament, setTournament] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [matchEvents, setMatchEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch player data and stats on component mount
  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch tournament details
        const tournamentResponse = await tournamentService.getTournamentById(tournamentId);
        setTournament(tournamentResponse);
        
        // Fetch player details
        const playerResponse = await playerService.getPlayerById(playerId);
        if (playerResponse.status === 'success') {
          setPlayer(playerResponse.data);
        } else {
          throw new Error(playerResponse.message || t('players.fetchError'));
        }
        
        // Fetch player tournament statistics
        const statsResponse = await tournamentService.getPlayerTournamentStats(tournamentId, playerId);
        setPlayerStats(statsResponse);
        setMatchEvents(statsResponse.events || []);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setError(err.message || t('players.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [tournamentId, playerId, t]);
  
  // Navigate back to tournament stats
  const handleBackClick = () => {
    navigate(`/tournaments/${tournamentId}/player-stats`);
  };
  
  // Format minutes to display as MM:SS
  const formatMinutes = (minute, addedTime = 0) => {
    if (!minute) return '';
    return `${minute}'${addedTime > 0 ? '+' + addedTime : ''}`;
  };
  
  // Get half name
  const getHalfName = (half) => {
    switch (half) {
      case 1:
        return t('match.firstHalf');
      case 2:
        return t('match.secondHalf');
      case 3:
        return t('match.extraTimeFirstHalf');
      case 4:
        return t('match.extraTimeSecondHalf');
      default:
        return '';
    }
  };
  
  // Get event icon based on type
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'goal':
        return '⚽';
      case 'own-goal':
        return '🥅';
      case 'yellow-card':
        return '🟨';
      case 'red-card':
        return '🟥';
      case 'second-yellow':
        return '🟨🟥';
      case 'penalty-goal':
        return '⚽⚠️';
      case 'penalty-missed':
        return '❌⚠️';
      case 'substitution-in':
        return '🔄↑';
      case 'substitution-out':
        return '🔄↓';
      case 'injury':
        return '🩹';
      case 'assist':
        return '👟';
      default:
        return '📝';
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorAlert message={error} />;
  }
  
  if (!tournament || !player || !playerStats) {
    return <ErrorAlert message={t('players.notFound')} />;
  }
  
  return (
    <div className="player-detail-stats-container">
      <div className="back-navigation">
        <button className="back-button" onClick={handleBackClick}>
          &larr; {t('playerStats.backToStats')}
        </button>
      </div>
      
      <div className="player-header">
        <div className="player-info-main">
          {player.teamLogo ? (
            <img src={player.teamLogo} alt={player.teamName} className="team-logo" />
          ) : (
            <div className="team-logo-placeholder">{player.teamName?.charAt(0) || 'T'}</div>
          )}
          <div className="player-name-info">
            <h1>
              {player.firstName} {player.lastName}
              {player.jerseyNumber && <span className="jersey-number">#{player.jerseyNumber}</span>}
            </h1>
            <h2 className="team-name">{player.teamName}</h2>
          </div>
        </div>
        
        <div className="tournament-context">
          <h3>{tournament.name}</h3>
          <span className="tournament-dates">
            {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="stats-overview">
        <div className="stats-card">
          <div className="stat-value">{playerStats.goals || 0}</div>
          <div className="stat-label">{t('playerStats.goals')}</div>
        </div>
        
        <div className="stats-card">
          <div className="stat-value">{playerStats.assists || 0}</div>
          <div className="stat-label">{t('playerStats.assists')}</div>
        </div>
        
        <div className="stats-card">
          <div className="stat-value">{playerStats.yellowCards || 0}</div>
          <div className="stat-label">{t('playerStats.yellowCards')}</div>
        </div>
        
        <div className="stats-card">
          <div className="stat-value">{playerStats.redCards || 0}</div>
          <div className="stat-label">{t('playerStats.redCards')}</div>
        </div>
        
        <div className="stats-card">
          <div className="stat-value">{playerStats.minutesPlayed || 0}'</div>
          <div className="stat-label">{t('playerStats.minutesPlayed')}</div>
        </div>
        
        <div className="stats-card">
          <div className="stat-value">{playerStats.appearances || 0}</div>
          <div className="stat-label">{t('playerStats.appearances')}</div>
        </div>
      </div>
      
      <div className="event-history">
        <h3>{t('playerStats.eventHistory')}</h3>
        
        {matchEvents.length === 0 ? (
          <p className="no-data">{t('playerStats.noEvents')}</p>
        ) : (
          <div className="events-timeline">
            {matchEvents.map((event, index) => (
              <div key={event.id || index} className="event-item">
                <div className="event-match">
                  <div className="match-teams">
                    {event.homeTeamName} vs {event.awayTeamName}
                  </div>
                  <div className="match-date">
                    {new Date(event.matchDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="event-details">
                  <div className="event-time">
                    {formatMinutes(event.minute, event.addedTime)}
                    <span className="event-half">{getHalfName(event.half)}</span>
                  </div>
                  
                  <div className="event-type">
                    <span className="event-icon">{getEventIcon(event.eventType)}</span>
                    <span className="event-name">
                      {t(`eventTypes.${event.eventType.replace(/-/g, '')}`)}
                    </span>
                  </div>
                  
                  {event.description && (
                    <div className="event-description">{event.description}</div>
                  )}
                  
                  {event.secondaryPlayerName && (
                    <div className="event-secondary-player">
                      {event.eventType === 'assist' 
                        ? t('playerStats.goalScoredBy', { name: event.secondaryPlayerName })
                        : event.eventType.startsWith('substitution')
                          ? t('playerStats.substitutedWith', { name: event.secondaryPlayerName })
                          : t('playerStats.withPlayer', { name: event.secondaryPlayerName })
                      }
                    </div>
                  )}
                </div>
                
                {event.coordinates && (
                  <div className="event-position">
                    <div className="field-mini">
                      <div 
                        className="event-marker"
                        style={{
                          left: `${event.coordinates.x}%`,
                          top: `${event.coordinates.y}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="player-stats-charts">
        <h3>{t('playerStats.statisticalAnalysis')}</h3>
        
        <div className="stats-sections">
          <div className="stats-section">
            <h4>{t('playerStats.eventBreakdown')}</h4>
            <div className="event-breakdown">
              {/* In a real implementation, you would include charts and graphs here */}
              <p className="chart-placeholder">{t('playerStats.chartComingSoon')}</p>
            </div>
          </div>
          
          <div className="stats-section">
            <h4>{t('playerStats.heatmap')}</h4>
            <div className="field-heatmap">
              {/* In a real implementation, you would include a heatmap here */}
              <p className="chart-placeholder">{t('playerStats.heatmapComingSoon')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailStats; 