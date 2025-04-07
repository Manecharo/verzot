import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tournamentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import './Tournaments.css';

const TournamentStandings = () => {
  const { t } = useTranslation();
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch tournament data
  useEffect(() => {
    const fetchTournamentData = async () => {
      setLoading(true);
      try {
        const response = await tournamentService.getTournamentById(tournamentId);
        
        if (response.status === 'success') {
          setTournament(response.data);
          
          // For group tournaments, initialize groups
          if (response.data.format === 'group' && response.data.groups) {
            setGroups(response.data.groups);
            if (response.data.groups.length > 0) {
              setSelectedGroup(response.data.groups[0].id);
            }
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
  }, [tournamentId, t]);
  
  // Fetch standings data
  useEffect(() => {
    if (!tournament) return;
    
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const groupId = tournament.format === 'group' ? selectedGroup : null;
        const response = await tournamentService.getTournamentStandings(tournamentId, groupId);
        
        if (response.status === 'success') {
          setStandings(response.data);
        } else {
          setError(response.message || t('tournaments.standingsError'));
        }
      } catch (err) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchStandings();
  }, [tournament, tournamentId, selectedGroup, t]);
  
  // Handle group selection change
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };
  
  // Navigate back to tournament details
  const handleBackToDetails = () => {
    navigate(`/tournaments/${tournamentId}`);
  };
  
  if (loading && !tournament) {
    return (
      <div className="tournament-container">
        <div className="loading-container">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="tournament-container">
        <div className="error-container">
          <p>{error}</p>
          <button className="btn-primary" onClick={handleBackToDetails}>
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }
  
  if (!tournament) {
    return (
      <div className="tournament-container">
        <div className="error-container">
          <p>{t('tournaments.notFound')}</p>
          <button className="btn-primary" onClick={() => navigate('/tournaments')}>
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="tournament-container">
      <div className="tournament-header">
        <button className="btn-secondary" onClick={handleBackToDetails}>
          <i className="fas fa-arrow-left"></i> {t('common.back')}
        </button>
        <h1>{tournament.name}</h1>
        <p className="tournament-dates">
          {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
        </p>
      </div>
      
      <div className="tournament-content">
        <h2>{t('tournaments.standings')}</h2>
        
        {tournament.format === 'group' && groups.length > 0 && (
          <div className="group-selection">
            <label htmlFor="group-select">{t('tournaments.selectGroup')}:</label>
            <select 
              id="group-select"
              value={selectedGroup || ''}
              onChange={handleGroupChange}
              className="select-input"
            >
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name || `${t('tournaments.group')} ${group.id}`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {loading ? (
          <div className="loading-container">
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <>
            {tournament.format === 'knockout' ? (
              <KnockoutBracket standings={standings} />
            ) : (
              <StandingsTable 
                standings={standings} 
                format={tournament.format}
                selectedGroup={selectedGroup}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StandingsTable = ({ standings, format, selectedGroup }) => {
  const { t } = useTranslation();
  
  if (!standings || standings.length === 0) {
    return (
      <div className="no-data-container">
        <p>{t('tournaments.noStandingsData')}</p>
      </div>
    );
  }
  
  return (
    <div className="standings-table-container">
      <table className="standings-table">
        <thead>
          <tr>
            <th className="position-column">#</th>
            <th className="team-column">{t('tournaments.team')}</th>
            <th>{t('tournaments.played')}</th>
            <th>{t('tournaments.won')}</th>
            <th>{t('tournaments.drawn')}</th>
            <th>{t('tournaments.lost')}</th>
            <th>{t('tournaments.goalsFor')}</th>
            <th>{t('tournaments.goalsAgainst')}</th>
            <th>{t('tournaments.goalDifference')}</th>
            <th>{t('tournaments.points')}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr key={team.teamId} className={index < 2 ? 'qualification-position' : ''}>
              <td className="position-column">{index + 1}</td>
              <td className="team-column">
                <span className="team-name">{team.teamName || t('tournaments.tbd')}</span>
              </td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.goalsFor}</td>
              <td>{team.goalsAgainst}</td>
              <td>{team.goalDifference}</td>
              <td className="points-column">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {format === 'league' || format === 'group' ? (
        <div className="standings-legend">
          <div className="legend-item qualification-position">
            <span className="legend-color"></span>
            <span>{t('tournaments.qualificationPositions')}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const KnockoutBracket = ({ standings }) => {
  const { t } = useTranslation();
  
  if (!standings || !standings.rounds || standings.rounds.length === 0) {
    return (
      <div className="no-data-container">
        <p>{t('tournaments.noBracketData')}</p>
      </div>
    );
  }
  
  return (
    <div className="knockout-bracket-container">
      {standings.rounds.map((round, roundIndex) => (
        <div key={`round-${roundIndex}`} className="bracket-round">
          <h3 className="round-title">{round.name}</h3>
          <div className="bracket-matches">
            {round.matches.map((match, matchIndex) => (
              <div key={`match-${roundIndex}-${matchIndex}`} className="bracket-match">
                <div className={`bracket-team ${match.homeScore > match.awayScore ? 'winner' : ''}`}>
                  <span className="team-name">{match.homeTeam?.name || t('tournaments.tbd')}</span>
                  <span className="team-score">{match.status === 'completed' ? match.homeScore : '-'}</span>
                </div>
                <div className={`bracket-team ${match.homeScore < match.awayScore ? 'winner' : ''}`}>
                  <span className="team-name">{match.awayTeam?.name || t('tournaments.tbd')}</span>
                  <span className="team-score">{match.status === 'completed' ? match.awayScore : '-'}</span>
                </div>
                {match.hasPenalties && (
                  <div className="penalties-result">
                    {t('tournaments.penalties')}: {match.homePenaltyScore} - {match.awayPenaltyScore}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentStandings; 