import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { playerService, teamService } from '../../services';
import formStyles from '../../styles/FormStyles.module.css';
import './Players.css';

const PlayersList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // State
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    teamId: '',
    status: '',
    search: ''
  });
  
  // Fetch players and teams on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch teams the user is associated with
        const teamsResponse = await teamService.getAllTeams({ userId: user.id });
        
        if (teamsResponse.status === 'success') {
          setTeams(teamsResponse.data);
          
          if (teamsResponse.data.length > 0) {
            // Default to the first team
            const defaultTeamId = teamsResponse.data[0].id;
            setFilters(prev => ({ ...prev, teamId: defaultTeamId }));
            
            // Fetch players for the selected team
            const playersResponse = await playerService.getPlayersByTeam(defaultTeamId);
            
            if (playersResponse.status === 'success') {
              setPlayers(playersResponse.data);
            } else {
              setError(playersResponse.message || t('players.fetchError'));
            }
          } else {
            // No teams found
            setPlayers([]);
          }
        } else {
          setError(teamsResponse.message || t('teams.fetchError'));
        }
      } catch (err) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user.id, t]);
  
  // Handle filter changes
  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    
    // If team filter changes, fetch players for that team
    if (name === 'teamId' && value) {
      setLoading(true);
      try {
        const response = await playerService.getPlayersByTeam(value);
        
        if (response.status === 'success') {
          setPlayers(response.data);
        } else {
          setError(response.message || t('players.fetchError'));
        }
      } catch (err) {
        setError(err.message || t('common.unexpectedError'));
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Filter players based on search and status
  const filteredPlayers = players.filter(player => {
    // Filter by status
    if (filters.status && player.status !== filters.status) {
      return false;
    }
    
    // Filter by search term (name or jersey number)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
      const jerseyNumber = player.jerseyNumber ? String(player.jerseyNumber) : '';
      
      return fullName.includes(searchTerm) || jerseyNumber.includes(searchTerm);
    }
    
    return true;
  });
  
  // Handle search input
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      ...filters,
      status: '',
      search: ''
    });
  };
  
  // Handle player status change
  const handleStatusChange = async (playerId, newStatus) => {
    try {
      const response = await playerService.updatePlayerStatus(playerId, newStatus);
      
      if (response.status === 'success') {
        // Update player in the local state
        setPlayers(players.map(player => 
          player.id === playerId ? { ...player, status: newStatus } : player
        ));
      } else {
        setError(response.message || t('players.updateStatusError'));
      }
    } catch (err) {
      setError(err.message || t('common.unexpectedError'));
    }
  };
  
  return (
    <div className="players-container">
      <div className="players-header">
        <h1>{t('players.title')}</h1>
        
        {teams.length > 0 && (
          <Link 
            to={filters.teamId ? `/teams/${filters.teamId}/players/invite` : '/players/create'} 
            className="create-button"
          >
            {filters.teamId ? t('players.invitePlayer') : t('players.createPlayer')}
          </Link>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {teams.length === 0 && !loading ? (
        <div className="no-teams-message">
          <p>{t('players.noTeams')}</p>
          <Link to="/teams/create" className={`${formStyles.button} ${formStyles.primaryButton}`}>
            {t('teams.createTeam')}
          </Link>
        </div>
      ) : (
        <>
          <div className="filter-section">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="teamId">{t('players.team')}</label>
                <select 
                  id="teamId" 
                  name="teamId" 
                  value={filters.teamId}
                  onChange={handleFilterChange}
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="status">{t('players.status')}</label>
                <select 
                  id="status" 
                  name="status" 
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">{t('players.allStatuses')}</option>
                  <option value="active">{t('players.statuses.active')}</option>
                  <option value="inactive">{t('players.statuses.inactive')}</option>
                  <option value="pending">{t('players.statuses.pending')}</option>
                  <option value="suspended">{t('players.statuses.suspended')}</option>
                </select>
              </div>
              
              <div className="filter-group search-group">
                <input
                  type="text"
                  placeholder={t('players.searchPlaceholder')}
                  value={filters.search}
                  onChange={handleSearchChange}
                />
                {filters.search && (
                  <button className="clear-search" onClick={() => setFilters({ ...filters, search: '' })}>
                    &times;
                  </button>
                )}
              </div>
              
              {(filters.status || filters.search) && (
                <button className="clear-filters" onClick={clearFilters}>
                  {t('players.clearFilters')}
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="loading-spinner">{t('common.loading')}</div>
          ) : filteredPlayers.length === 0 ? (
            <div className="no-results-message">
              {filters.search || filters.status
                ? t('players.noPlayersFiltered')
                : t('players.noPlayers', { team: teams.find(t => t.id === filters.teamId)?.name || '' })}
            </div>
          ) : (
            <div className="players-list">
              <div className="players-grid">
                <div className="players-header-row">
                  <div className="cell">#</div>
                  <div className="cell">{t('players.name')}</div>
                  <div className="cell">{t('players.position')}</div>
                  <div className="cell">{t('players.status')}</div>
                  <div className="cell">{t('players.joinedDate')}</div>
                  <div className="cell actions-cell">{t('players.actions')}</div>
                </div>
                
                {filteredPlayers.map(player => (
                  <div key={player.id} className="players-row">
                    <div className="cell">{player.jerseyNumber || '-'}</div>
                    <div className="cell player-name">
                      <Link to={`/players/${player.id}`}>
                        {player.firstName} {player.lastName}
                      </Link>
                      {player.userId && <span className="registered-badge">{t('players.registered')}</span>}
                    </div>
                    <div className="cell">{player.position || '-'}</div>
                    <div className="cell">
                      <span className={`status-badge ${player.status}`}>
                        {t(`players.statuses.${player.status}`)}
                      </span>
                    </div>
                    <div className="cell">
                      {new Date(player.joinedDate).toLocaleDateString()}
                    </div>
                    <div className="cell actions-cell">
                      <div className="player-actions">
                        <Link to={`/players/${player.id}`} className="action-button view">
                          {t('common.view')}
                        </Link>
                        <Link to={`/players/${player.id}/edit`} className="action-button edit">
                          {t('common.edit')}
                        </Link>
                        {player.status === 'active' ? (
                          <button 
                            className="action-button deactivate"
                            onClick={() => handleStatusChange(player.id, 'inactive')}
                          >
                            {t('players.deactivate')}
                          </button>
                        ) : player.status === 'inactive' ? (
                          <button 
                            className="action-button activate"
                            onClick={() => handleStatusChange(player.id, 'active')}
                          >
                            {t('players.activate')}
                          </button>
                        ) : player.status === 'pending' ? (
                          <button 
                            className="action-button approve"
                            onClick={() => handleStatusChange(player.id, 'active')}
                          >
                            {t('players.approve')}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PlayersList; 