import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services';
import './Tournaments.css';

const TournamentBrackets = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch tournament data
  useEffect(() => {
    const fetchTournamentData = async () => {
      setLoading(true);
      try {
        const tournamentResponse = await tournamentService.getTournamentById(id);
        if (tournamentResponse.status === 'success') {
          setTournament(tournamentResponse.data);
          
          // Fetch tournament matches
          const matchesResponse = await tournamentService.getTournamentMatches(id);
          if (matchesResponse.status === 'success') {
            setMatches(matchesResponse.data);
          } else {
            setError(matchesResponse.message || t('tournaments.fetchError'));
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
  }, [id, t]);
  
  // Determine if user is the tournament organizer
  const isOrganizer = useMemo(() => {
    return tournament && user && tournament.organizerId === user.id;
  }, [tournament, user]);
  
  // Format a match for display
  const formatMatch = (match) => {
    if (!match) return { 
      id: null, 
      homeTeam: t('tournaments.tbd'), 
      awayTeam: t('tournaments.tbd'),
      homeScore: '-',
      awayScore: '-',
      status: 'scheduled',
      winner: null
    };
    
    const homeTeamName = match.homeTeam?.name || t('tournaments.tbd');
    const awayTeamName = match.awayTeam?.name || t('tournaments.tbd');
    const homeScore = match.status === 'completed' ? match.homeScore : '-';
    const awayScore = match.status === 'completed' ? match.awayScore : '-';
    
    let winner = null;
    if (match.status === 'completed') {
      if (match.homeScore > match.awayScore) winner = 'home';
      else if (match.awayScore > match.homeScore) winner = 'away';
    }
    
    return {
      id: match.id,
      homeTeam: homeTeamName,
      awayTeam: awayTeamName,
      homeScore,
      awayScore,
      status: match.status,
      winner
    };
  };
  
  // Organize matches by knockout rounds
  const organizedMatches = useMemo(() => {
    if (!matches.length) return [];
    
    // Filter for knockout phase matches only
    const knockoutMatches = matches.filter(match => 
      match.phase && match.phase.includes('knockout')
    );
    
    // Determine number of rounds in the tournament
    const knockoutRounds = [...new Set(knockoutMatches.map(match => match.phase))].sort((a, b) => {
      // Sort by round number (extract from 'knockout-round-X')
      const roundA = parseInt(a.split('-').pop());
      const roundB = parseInt(b.split('-').pop());
      return roundA - roundB;
    });
    
    // Organize matches by round
    return knockoutRounds.map(round => {
      const roundNumber = parseInt(round.split('-').pop());
      const roundName = getRoundName(roundNumber, knockoutRounds.length);
      const roundMatches = knockoutMatches
        .filter(match => match.phase === round)
        .map(match => formatMatch(match));
      
      return {
        round,
        roundName,
        matches: roundMatches
      };
    });
  }, [matches, t]);
  
  // Get human-readable round name based on round number
  const getRoundName = (roundNumber, totalRounds) => {
    // Starting from the final and working backward
    const roundsFromFinal = totalRounds - roundNumber;
    
    switch (roundsFromFinal) {
      case 0: return t('tournaments.rounds.final');
      case 1: return t('tournaments.rounds.semifinal');
      case 2: return t('tournaments.rounds.quarterfinal');
      case 3: return t('tournaments.rounds.roundOf16');
      case 4: return t('tournaments.rounds.roundOf32');
      case 5: return t('tournaments.rounds.roundOf64');
      default: return `${t('tournaments.rounds.round')} ${roundNumber}`;
    }
  };
  
  // Handle match click
  const handleMatchClick = (matchId) => {
    if (matchId) {
      navigate(`/matches/${matchId}`);
    }
  };
  
  if (loading) {
    return <div className="loading-container">{t('common.loading')}</div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>{t('common.error')}</h2>
        <p>{error}</p>
        <button 
          className="primary-button"
          onClick={() => navigate(`/tournaments/${id}`)}
        >
          {t('tournaments.backToDetails')}
        </button>
      </div>
    );
  }
  
  if (!tournament) {
    return (
      <div className="not-found-container">
        <h2>{t('tournaments.notFound')}</h2>
        <button 
          className="primary-button"
          onClick={() => navigate('/tournaments')}
        >
          {t('tournaments.backToList')}
        </button>
      </div>
    );
  }
  
  // Display message if tournament doesn't have knockout phase
  if (tournament.format !== 'knockout' && tournament.format !== 'hybrid') {
    return (
      <div className="tournament-brackets-container">
        <div className="back-navigation">
          <button 
            className="back-button"
            onClick={() => navigate(`/tournaments/${id}`)}
          >
            ← {t('tournaments.backToDetails')}
          </button>
        </div>
        
        <h1>{tournament.name} - {t('tournaments.brackets')}</h1>
        
        <div className="no-brackets-message">
          <p>{t('tournaments.noBracketsForFormat')}</p>
          {tournament.format === 'group' && (
            <button 
              className="primary-button"
              onClick={() => navigate(`/tournaments/${id}/standings`)}
            >
              {t('tournaments.viewStandings')}
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="tournament-brackets-container">
      <div className="back-navigation">
        <button 
          className="back-button"
          onClick={() => navigate(`/tournaments/${id}`)}
        >
          ← {t('tournaments.backToDetails')}
        </button>
      </div>
      
      <h1>{tournament.name} - {t('tournaments.brackets')}</h1>
      
      {organizedMatches.length === 0 ? (
        <div className="no-brackets-message">
          <p>{t('tournaments.noBracketsYet')}</p>
          {isOrganizer && (
            <button 
              className="primary-button"
              onClick={() => navigate(`/tournaments/${id}/schedule`)}
            >
              {t('scheduler.title')}
            </button>
          )}
        </div>
      ) : (
        <div className="brackets-container">
          {organizedMatches.map(round => (
            <div key={round.round} className="bracket-round">
              <h3 className="round-title">{round.roundName}</h3>
              
              <div className="round-matches">
                {round.matches.map((match, index) => (
                  <div 
                    key={match.id || `empty-${index}`} 
                    className={`bracket-match ${match.status} ${match.id ? 'clickable' : ''}`}
                    onClick={() => match.id && handleMatchClick(match.id)}
                  >
                    <div className={`team home-team ${match.winner === 'home' ? 'winner' : ''}`}>
                      <span className="team-name">{match.homeTeam}</span>
                      <span className="team-score">{match.homeScore}</span>
                    </div>
                    <div className={`team away-team ${match.winner === 'away' ? 'winner' : ''}`}>
                      <span className="team-name">{match.awayTeam}</span>
                      <span className="team-score">{match.awayScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentBrackets; 