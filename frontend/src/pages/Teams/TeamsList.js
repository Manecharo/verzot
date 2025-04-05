import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { teamService } from '../../services';
import './Teams.css';

const TeamsList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch teams from API
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If a search term is present, we pass it as a query param
        // Note that this depends on the backend API supporting search
        const filters = searchTerm ? { search: searchTerm } : {};
        const response = await teamService.getAllTeams(filters);
        
        if (response.status === 'success') {
          setTeams(response.data.teams);
        } else {
          setError('Failed to load teams');
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(err.message || 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    // Use a debounce for search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchTeams();
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  // Filtered teams are now handled by the API, but we'll keep this in case we need client-side filtering
  const filteredTeams = teams;
  
  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1>{t('teams')}</h1>
        <Link to="/teams/create">
          <Button variant="primary">{t('dashboard.create_team')}</Button>
        </Link>
      </div>
      
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder={t('teams_section.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="loading-state">
          <p>{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <Button onClick={() => setSearchTerm('')} variant="secondary">
            {t('teams_section.clear_search')}
          </Button>
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="teams-grid">
          {filteredTeams.map(team => (
            <Link to={`/teams/${team.id}`} key={team.id} className="team-card-link">
              <Card className="team-card">
                <div className="team-card-header">
                  <h2 className="team-name">{team.name}</h2>
                </div>
                <div className="team-info">
                  <div className="team-detail">
                    <span className="detail-label">{t('team.location')}</span>
                    <span className="detail-value">{team.location}</span>
                  </div>
                  <div className="team-detail">
                    <span className="detail-label">{t('team.captain')}</span>
                    <span className="detail-value">{team.captain?.name || 'Unknown'}</span>
                  </div>
                  <div className="team-stats">
                    <div className="team-stat">
                      <span className="stat-value">{team.memberCount || 0}</span>
                      <span className="stat-label">{t('common.members')}</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-value">{team.tournamentCount || 0}</span>
                      <span className="stat-label">{t('common.tournaments')}</span>
                    </div>
                  </div>
                </div>
                <div className="team-card-actions">
                  <Button variant="outline">{t('team.view_details')}</Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>
            {searchTerm 
              ? t('teams_section.no_teams_found_search') 
              : t('teams_section.no_teams_found')}
          </p>
          {searchTerm && (
            <Button onClick={() => setSearchTerm('')} variant="secondary">
              {t('teams_section.clear_search')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamsList; 