import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSafeTranslation } from '../../utils/safeTranslation';
import { useAuth } from '../../context/AuthContext';
import { tournamentService, teamService } from '../../services';
import formStyles from '../../styles/FormStyles.module.css';
import './Tournaments.css';

const TournamentDetails = () => {
  const { t } = useSafeTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State
  const [tournament, setTournament] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [matches, setMatches] = useState([]);
  
  // Check if user is the tournament organizer
  const isOrganizer = tournament && user && tournament.organizerId === user.id;
  
  // Check if registration is open
  const isRegistrationOpen = tournament && tournament.status === 'registration-open';
  
  // Check if tournament is full
  const isTournamentFull = tournament && registeredTeams.length >= tournament.maxTeams;
  
  // Check if tournament has started (for showing standings)
  const hasStarted = tournament && ['in-progress', 'completed'].includes(tournament.status);
  
  // Format dates in a user-friendly way
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Fetch tournament data
  useEffect(() => {
    const fetchTournamentData = async () => {
      setLoading(true);
      try {
        const response = await tournamentService.getTournamentById(id);
        
        if (response.status === 'success') {
          setTournament(response.data);
          
          // Fetch teams registered for this tournament
          const teamsResponse = await tournamentService.getTournamentTeams(id);
          if (teamsResponse.status === 'success') {
            setRegisteredTeams(teamsResponse.data);
          }
        } else {
          setError(response.message || t('tournaments.fetchError'));
        }
      } catch (err) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournamentData();
  }, [id, t]);
  
  // Fetch user's teams
  useEffect(() => {
    const fetchUserTeams = async () => {
      if (!user) return;
      
      try {
        // Fetch teams where user is leader or admin
        const response = await teamService.getAllTeams({ userId: user.id, role: 'admin' });
        
        if (response.status === 'success') {
          // Filter out teams already registered
          const availableTeams = response.data.filter(team => 
            !registeredTeams.some(regTeam => regTeam.id === team.id)
          );
          setUserTeams(availableTeams);
          
          // Pre-select a team if there's only one
          if (availableTeams.length === 1) {
            setSelectedTeam(availableTeams[0].id);
          }
          
          // Check if user already has a team registered
          const hasRegisteredTeam = registeredTeams.some(team => 
            team.teamLeaderId === user.id || 
            (team.admins && team.admins.includes(user.id))
          );
          
          if (hasRegisteredTeam) {
            setRegistrationStatus('already-registered');
          }
        }
      } catch (err) {
        console.error('Error fetching user teams:', err);
      }
    };
    
    if (registeredTeams.length > 0 || !loading) {
      fetchUserTeams();
    }
  }, [user, registeredTeams, loading]);
  
  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      if (!tournament) return;
      
      try {
        const response = await tournamentService.getTournamentMatches(id);
        
        if (response.status === 'success') {
          setMatches(response.data);
        } else {
          setError(response.message || t('tournaments.fetchError'));
        }
      } catch (err) {
        setError(err.message || t('common.unexpectedError'));
      }
    };
    
    if (tournament) {
      fetchMatches();
    }
  }, [id, t, tournament]);
  
  // Handle team selection
  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
  };
  
  // Handle team registration
  const handleTeamRegistration = async (e) => {
    e.preventDefault();
    
    if (!selectedTeam) {
      setError(t('tournaments.selectTeamError'));
      return;
    }
    
    setTeamLoading(true);
    setError(null);
    
    try {
      const response = await tournamentService.registerTeam(id, selectedTeam);
      
      if (response.status === 'success') {
        // Add the newly registered team to the list
        const teamDetails = userTeams.find(team => team.id === selectedTeam);
        setRegisteredTeams([...registeredTeams, teamDetails]);
        
        // Update registration status
        setRegistrationStatus('registered');
        
        // Clear selected team
        setSelectedTeam('');
        
        // Remove registered team from available teams
        setUserTeams(userTeams.filter(team => team.id !== selectedTeam));
      } else {
        setError(response.message || t('tournaments.registrationError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setTeamLoading(false);
    }
  };
  
  // Handle registration status change (organizer only)
  const handleStatusChange = async (newStatus) => {
    if (!isOrganizer) return;
    
    setLoading(true);
    
    try {
      const response = await tournamentService.updateTournament(id, { 
        status: newStatus 
      });
      
      if (response.status === 'success') {
        setTournament({
          ...tournament,
          status: newStatus
        });
      } else {
        setError(response.message || t('tournaments.updateError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate to tournament standings
  const handleViewStandings = () => {
    navigate(`/tournaments/${id}/standings`);
  };
  
  if (loading && !tournament) {
    return <div className="loading-container">{t('common.loading')}</div>;
  }
  
  if (error && !tournament) {
    return (
      <div className="error-container">
        <h2>{t('common.error')}</h2>
        <p>{error}</p>
        <button 
          className={`${formStyles.button} ${formStyles.primaryButton}`}
          onClick={() => navigate('/tournaments')}
        >
          {t('tournaments.backToList')}
        </button>
      </div>
    );
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
  
  // Get status display
  const getStatusDisplay = () => {
    const statusKey = tournament.status || 'unknown';
    const statusTranslationKey = `tournaments.statuses.${statusKey}`;
    const statusText = t(statusTranslationKey, statusKey) || String(statusKey);
    
    const statusMap = {
      'draft': <span className="status-badge draft">{statusText}</span>,
      'published': <span className="status-badge published">{statusText}</span>,
      'registration-open': <span className="status-badge registration-open">{statusText}</span>,
      'registration-closed': <span className="status-badge registration-closed">{statusText}</span>,
      'in-progress': <span className="status-badge in-progress">{statusText}</span>,
      'completed': <span className="status-badge completed">{statusText}</span>,
      'cancelled': <span className="status-badge cancelled">{statusText}</span>,
    };
    
    return statusMap[statusKey] || <span className="status-badge">{String(statusKey)}</span>;
  };
  
  return (
    <div className="tournament-detail-container">
      {/* Header section with tournament info */}
      <div className="tournament-header">
        <div className="back-navigation">
          <button 
            className="back-button"
            onClick={() => navigate('/tournaments')}
          >
            ← {t('tournaments.backToList')}
          </button>
        </div>
        
        <div className="tournament-title-row">
          <h1>{tournament.name}</h1>
          {getStatusDisplay()}
        </div>
        
        <div className="tournament-actions">
          {hasStarted && (
            <>
              <button 
                className={`${formStyles.button} ${formStyles.primaryButton}`}
                onClick={handleViewStandings}
              >
                {t('tournaments.viewStandings')}
              </button>
              
              {(tournament.format === 'knockout' || tournament.format === 'hybrid') && (
                <button 
                  className={`${formStyles.button} ${formStyles.primaryButton}`}
                  onClick={() => navigate(`/tournaments/${id}/brackets`)}
                >
                  {t('tournaments.viewBrackets')}
                </button>
              )}
              
              <button 
                className={`${formStyles.button} ${formStyles.primaryButton}`}
                onClick={() => navigate(`/tournaments/${id}/player-stats`)}
              >
                {t('tournaments.viewPlayerStats')}
              </button>
            </>
          )}
          
          {isOrganizer && (
            <div className="organizer-actions">
              <button 
                className={`${formStyles.button} ${formStyles.secondaryButton}`}
                onClick={() => navigate(`/tournaments/${id}/edit`)}
              >
                {t('common.edit')}
              </button>
              
              {tournament.status === 'draft' && (
                <button 
                  className={`${formStyles.button} ${formStyles.primaryButton}`}
                  onClick={() => handleStatusChange('published')}
                >
                  {t('tournaments.publish')}
                </button>
              )}
              
              {tournament.status === 'published' && (
                <button 
                  className={`${formStyles.button} ${formStyles.primaryButton}`}
                  onClick={() => handleStatusChange('registration-open')}
                >
                  {t('tournaments.openRegistration')}
                </button>
              )}
              
              {tournament.status === 'registration-open' && (
                <button 
                  className={`${formStyles.button} ${formStyles.primaryButton}`}
                  onClick={() => handleStatusChange('registration-closed')}
                >
                  {t('tournaments.closeRegistration')}
                </button>
              )}
              
              {tournament.status === 'registration-closed' && (
                <button 
                  className={`${formStyles.button} ${formStyles.primaryButton}`}
                  onClick={() => handleStatusChange('in-progress')}
                >
                  {t('tournaments.startTournament')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Tournament details section */}
      <div className="tournament-details">
        <div className="detail-section">
          <h2>{t('tournaments.details')}</h2>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">{t('tournaments.format')}</span>
              <span className="detail-value">{tournament.format}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">{t('tournaments.dates')}</span>
              <span className="detail-value">
                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
              </span>
            </div>
            
            {tournament.location && (
              <div className="detail-item">
                <span className="detail-label">{t('tournaments.location')}</span>
                <span className="detail-value">{tournament.location}</span>
              </div>
            )}
            
            <div className="detail-item">
              <span className="detail-label">{t('tournaments.teams')}</span>
              <span className="detail-value">
                {registeredTeams.length}/{tournament.maxTeams} 
                {tournament.minTeams > 0 && ` (${t('tournaments.minimum')}: ${tournament.minTeams})`}
              </span>
            </div>
            
            {tournament.registrationDeadline && (
              <div className="detail-item">
                <span className="detail-label">{t('tournaments.registrationDeadline')}</span>
                <span className="detail-value">
                  {formatDate(tournament.registrationDeadline)}
                </span>
              </div>
            )}
          </div>
          
          {tournament.description && (
            <div className="tournament-description">
              <h3>{t('tournaments.description')}</h3>
              <p>{tournament.description}</p>
            </div>
          )}
        </div>
        
        {/* Registration section */}
        {isRegistrationOpen && !isOrganizer && (
          <div className="registration-section">
            <h2>{t('tournaments.registration')}</h2>
            
            {isTournamentFull ? (
              <div className="registration-message">
                <p>{t('tournaments.tournamentFull')}</p>
              </div>
            ) : registrationStatus === 'registered' || registrationStatus === 'already-registered' ? (
              <div className="registration-success">
                <p>{t('tournaments.alreadyRegistered')}</p>
              </div>
            ) : userTeams.length === 0 ? (
              <div className="registration-message">
                <p>{t('tournaments.noTeamsToRegister')}</p>
                <Link 
                  to="/teams/create" 
                  className={`${formStyles.button} ${formStyles.primaryButton}`}
                >
                  {t('teams.createTeam')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleTeamRegistration} className="registration-form">
                <div className={formStyles.formGroup}>
                  <label htmlFor="teamId">{t('tournaments.selectTeam')}</label>
                  <select
                    id="teamId"
                    value={selectedTeam}
                    onChange={handleTeamChange}
                    required
                  >
                    <option value="">{t('tournaments.selectTeamPlaceholder')}</option>
                    {userTeams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  className={`${formStyles.button} ${formStyles.primaryButton}`}
                  disabled={teamLoading || !selectedTeam}
                >
                  {teamLoading ? t('common.processing') : t('tournaments.registerTeam')}
                </button>
              </form>
            )}
          </div>
        )}
        
        {/* Registered teams section */}
        <div className="teams-section">
          <h2>{t('tournaments.registeredTeams')}</h2>
          
          {registeredTeams.length === 0 ? (
            <p className="no-teams-message">{t('tournaments.noTeamsRegistered')}</p>
          ) : (
            <div className="teams-grid">
              {registeredTeams.map(team => (
                <div key={team.id} className="team-card">
                  <div className="team-logo">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={`${team.name} logo`} />
                    ) : (
                      <div className="default-logo">{team.name.substring(0, 2).toUpperCase()}</div>
                    )}
                  </div>
                  <div className="team-info">
                    <h3 className="team-name">{team.name}</h3>
                    {team.stats && (
                      <div className="team-stats">
                        <span className="stat">
                          {t('tournaments.matchesPlayed')}: {team.stats.played || 0}
                        </span>
                        <span className="stat">
                          {t('tournaments.points')}: {team.stats.points || 0}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link 
                    to={`/teams/${team.id}`} 
                    className="view-team-link"
                  >
                    {t('tournaments.viewTeam')}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Matches section */}
        <div className="matches-section">
          <h2>{t('tournaments.matches')}</h2>
          
          {tournament.status === 'draft' || tournament.status === 'published' || tournament.status === 'registration-open' ? (
            <div className="matches-message">
              <p>{t('tournaments.matchesAvailableAfterStart')}</p>
              {isOrganizer && (
                <Link 
                  to={`/tournaments/${id}/schedule`} 
                  className={`${formStyles.button} ${formStyles.primaryButton}`}
                >
                  {t('scheduler.title')}
                </Link>
              )}
            </div>
          ) : (
            <div className="tournament-matches">
              {isOrganizer && (
                <div className="organizer-actions">
                  <Link 
                    to={`/tournaments/${id}/schedule`} 
                    className={`${formStyles.button} ${formStyles.primaryButton}`}
                  >
                    {t('scheduler.title')}
                  </Link>
                </div>
              )}
              
              {matches.length === 0 ? (
                <p className="no-matches-message">{t('tournaments.noMatchesScheduled')}</p>
              ) : (
                <div className="matches-list">
                  {matches.map(match => (
                    <div key={match.id} className={`match-item ${match.status}`}>
                      <div className="match-date">
                        <span className="date">
                          {new Date(match.scheduledDate).toLocaleDateString()}
                        </span>
                        <span className="time">
                          {new Date(match.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="match-teams">
                        <div className="team home-team">
                          <span className="team-name">{match.homeTeam?.name || t('tournaments.tbd')}</span>
                        </div>
                        
                        <div className="match-score">
                          {match.status === 'completed' ? (
                            <span className="score">
                              {match.homeScore} - {match.awayScore}
                            </span>
                          ) : (
                            <span className="vs">VS</span>
                          )}
                        </div>
                        
                        <div className="team away-team">
                          <span className="team-name">{match.awayTeam?.name || t('tournaments.tbd')}</span>
                        </div>
                      </div>
                      
                      <div className="match-info">
                        <span className="match-phase">
                          {t(`tournaments.phases.${match.phase || 'unknown'}`)}
                          {match.group && ` ${t('tournaments.group')} ${match.group}`}
                        </span>
                        <span className="match-status">
                          {t(`matches.statuses.${match.status}`)}
                        </span>
                      </div>
                      
                      <div className="match-actions">
                        <Link 
                          to={`/matches/${match.id}`} 
                          className="view-match-link"
                        >
                          {match.status === 'completed' 
                            ? t('tournaments.viewResult') 
                            : t('tournaments.viewDetails')}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails; 