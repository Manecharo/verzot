import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import './Teams.css';

const TeamsList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - in real app, this would come from API
  const teams = [
    { 
      id: 1, 
      name: 'FC Barcelona', 
      location: 'Barcelona, Spain',
      members: 15, 
      tournaments: 2,
      captain: 'Juan Garcia'
    },
    { 
      id: 2, 
      name: 'Real Madrid', 
      location: 'Madrid, Spain',
      members: 18, 
      tournaments: 1,
      captain: 'Carlos Fernandez'
    },
    { 
      id: 3, 
      name: 'Manchester City', 
      location: 'Manchester, UK',
      members: 16, 
      tournaments: 3,
      captain: 'John Smith'
    },
    { 
      id: 4, 
      name: 'Liverpool', 
      location: 'Liverpool, UK',
      members: 14, 
      tournaments: 2,
      captain: 'Peter Johnson'
    },
    { 
      id: 5, 
      name: 'PSG', 
      location: 'Paris, France',
      members: 17, 
      tournaments: 1,
      captain: 'Michel Dubois'
    }
  ];
  
  // Filter teams based on search term
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
          placeholder={t('teams.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredTeams.length > 0 ? (
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
                    <span className="detail-value">{team.captain}</span>
                  </div>
                  <div className="team-stats">
                    <div className="team-stat">
                      <span className="stat-value">{team.members}</span>
                      <span className="stat-label">{t('common.members')}</span>
                    </div>
                    <div className="team-stat">
                      <span className="stat-value">{team.tournaments}</span>
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
              ? t('teams.no_teams_found_search') 
              : t('teams.no_teams_found')}
          </p>
          {searchTerm && (
            <Button onClick={() => setSearchTerm('')} variant="secondary">
              {t('teams.clear_search')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamsList; 