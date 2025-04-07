import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import tournamentService from '../../services/tournamentService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorAlert from '../../components/UI/ErrorAlert';
import './Tournaments.css';

const TournamentPlayerStats = () => {
  const { t } = useTranslation();
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [tournament, setTournament] = useState(null);
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStat, setFilterStat] = useState('goals');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Fetch tournament and player stats on component mount
  useEffect(() => {
    const fetchTournamentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch tournament details
        const tournamentResponse = await tournamentService.getTournamentById(tournamentId);
        setTournament(tournamentResponse);
        
        // Fetch player statistics
        const statsResponse = await tournamentService.getTournamentPlayerStats(tournamentId);
        setPlayerStats(statsResponse.players || []);
      } catch (err) {
        console.error('Error fetching tournament data:', err);
        setError(err.message || t('tournaments.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournamentData();
  }, [tournamentId, t]);
  
  // Handle team filter change
  const handleTeamFilterChange = (e) => {
    setFilterTeam(e.target.value);
  };
  
  // Handle stat filter change
  const handleStatFilterChange = (e) => {
    setFilterStat(e.target.value);
  };
  
  // Handle sort direction change
  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
  };
  
  // Get stat value for a specific player and stat type
  const getStatValue = (player, statType) => {
    switch (statType) {
      case 'goals':
        return player.goals || 0;
      case 'assists':
        return player.assists || 0;
      case 'yellowCards':
        return player.yellowCards || 0;
      case 'redCards':
        return player.redCards || 0;
      case 'minutesPlayed':
        return player.minutesPlayed || 0;
      case 'appearances':
        return player.appearances || 0;
      default:
        return 0;
    }
  };
  
  // Filter and sort players
  const filteredAndSortedPlayers = React.useMemo(() => {
    let filtered = [...playerStats];
    
    // Apply team filter
    if (filterTeam) {
      filtered = filtered.filter(player => player.teamId === filterTeam);
    }
    
    // Sort by selected stat
    filtered.sort((a, b) => {
      const aValue = getStatValue(a, filterStat);
      const bValue = getStatValue(b, filterStat);
      
      if (sortDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });
    
    return filtered;
  }, [playerStats, filterTeam, filterStat, sortDirection]);
  
  // Get the title for the current stat display
  const getStatTitle = () => {
    switch (filterStat) {
      case 'goals':
        return t('playerStats.topScorers');
      case 'assists':
        return t('playerStats.topAssists');
      case 'yellowCards':
        return t('playerStats.mostYellowCards');
      case 'redCards':
        return t('playerStats.mostRedCards');
      case 'minutesPlayed':
        return t('playerStats.mostMinutesPlayed');
      case 'appearances':
        return t('playerStats.mostAppearances');
      default:
        return t('playerStats.statistics');
    }
  };
  
  // Get teams for the filter dropdown
  const getTeamsForFilter = () => {
    if (!tournament || !tournament.teams) return [];
    
    // Get unique teams from player stats
    const teamIds = new Set(playerStats.map(player => player.teamId));
    return tournament.teams.filter(team => teamIds.has(team.id));
  };
  
  // Navigate back to tournament
  const handleBackClick = () => {
    navigate(`/tournaments/${tournamentId}`);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorAlert message={error} />;
  }
  
  if (!tournament) {
    return <ErrorAlert message={t('tournaments.notFound')} />;
  }
  
  return (
    <div className="player-stats-container">
      <div className="back-navigation">
        <button className="back-button" onClick={handleBackClick}>
          &larr; {t('tournaments.backToTournament')}
        </button>
      </div>
      
      <div className="tournament-header">
        <h1>{tournament.name}</h1>
        <h2>{t('playerStats.title')}</h2>
      </div>
      
      <div className="stats-filters">
        <div className="filter-group">
          <label htmlFor="team-filter">{t('playerStats.filterByTeam')}</label>
          <select
            id="team-filter"
            value={filterTeam}
            onChange={handleTeamFilterChange}
            className="filter-select"
          >
            <option value="">{t('playerStats.allTeams')}</option>
            {getTeamsForFilter().map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="stat-filter">{t('playerStats.showStatistic')}</label>
          <select
            id="stat-filter"
            value={filterStat}
            onChange={handleStatFilterChange}
            className="filter-select"
          >
            <option value="goals">{t('playerStats.goals')}</option>
            <option value="assists">{t('playerStats.assists')}</option>
            <option value="yellowCards">{t('playerStats.yellowCards')}</option>
            <option value="redCards">{t('playerStats.redCards')}</option>
            <option value="minutesPlayed">{t('playerStats.minutesPlayed')}</option>
            <option value="appearances">{t('playerStats.appearances')}</option>
          </select>
        </div>
        
        <button 
          className="sort-button" 
          onClick={handleSortDirectionChange}
          aria-label={t('playerStats.changeSort')}
        >
          {sortDirection === 'desc' ? '↓' : '↑'}
        </button>
      </div>
      
      <div className="stats-table-container">
        <h3 className="stats-title">{getStatTitle()}</h3>
        
        {filteredAndSortedPlayers.length === 0 ? (
          <p className="no-data">{t('playerStats.noData')}</p>
        ) : (
          <table className="stats-table">
            <thead>
              <tr>
                <th className="rank-column">{t('playerStats.rank')}</th>
                <th className="player-column">{t('playerStats.player')}</th>
                <th className="team-column">{t('playerStats.team')}</th>
                <th className="stat-column">{t(`playerStats.${filterStat}`)}</th>
                <th className="matches-column">{t('playerStats.matches')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPlayers.map((player, index) => (
                <tr key={player.id}>
                  <td className="rank-column">{index + 1}</td>
                  <td className="player-column">
                    {player.firstName} {player.lastName}
                    {player.jerseyNumber && <span className="jersey-number">#{player.jerseyNumber}</span>}
                  </td>
                  <td className="team-column">{player.teamName}</td>
                  <td className="stat-column">{getStatValue(player, filterStat)}</td>
                  <td className="matches-column">{player.appearances || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="stats-legend">
        <h4>{t('playerStats.aboutStatistics')}</h4>
        <p>{t('playerStats.statisticsDescription')}</p>
        <ul className="stats-definitions">
          <li><strong>{t('playerStats.goals')}:</strong> {t('playerStats.goalsDescription')}</li>
          <li><strong>{t('playerStats.assists')}:</strong> {t('playerStats.assistsDescription')}</li>
          <li><strong>{t('playerStats.yellowCards')}:</strong> {t('playerStats.yellowCardsDescription')}</li>
          <li><strong>{t('playerStats.redCards')}:</strong> {t('playerStats.redCardsDescription')}</li>
          <li><strong>{t('playerStats.minutesPlayed')}:</strong> {t('playerStats.minutesPlayedDescription')}</li>
          <li><strong>{t('playerStats.appearances')}:</strong> {t('playerStats.appearancesDescription')}</li>
        </ul>
      </div>
    </div>
  );
};

export default TournamentPlayerStats; 