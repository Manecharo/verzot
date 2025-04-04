import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import './Tournaments.css';

const TournamentsList = () => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Mock data - in real app, this would come from API
  const tournaments = [
    { 
      id: 1, 
      name: 'Summer League 2023', 
      location: 'Barcelona, Spain',
      format: '7-a-side',
      startDate: '2023-07-15',
      endDate: '2023-08-30',
      status: 'active',
      teams: 12,
      organizer: 'FC Barcelona Youth Academy'
    },
    { 
      id: 2, 
      name: 'City Cup', 
      location: 'Manchester, UK',
      format: '11-a-side',
      startDate: '2023-06-01',
      endDate: '2023-06-30', 
      status: 'completed',
      teams: 8,
      organizer: 'Manchester City Foundation'
    },
    { 
      id: 3, 
      name: 'Winter Tournament 2023', 
      location: 'Madrid, Spain',
      format: '5-a-side',
      startDate: '2023-12-01',
      endDate: '2024-01-15',
      status: 'upcoming',
      teams: 16,
      organizer: 'Madrid Football Federation'
    },
    { 
      id: 4, 
      name: 'Youth Championship', 
      location: 'Liverpool, UK',
      format: '11-a-side',
      startDate: '2023-07-10',
      endDate: '2023-08-20',
      status: 'registration',
      teams: 4,
      organizer: 'Liverpool Youth Association'
    }
  ];
  
  // Filter tournaments based on selected status
  const filteredTournaments = filterStatus === 'all' 
    ? tournaments 
    : tournaments.filter(tournament => tournament.status === filterStatus);
  
  return (
    <div className="tournaments-container">
      <div className="tournaments-header">
        <h1>{t('tournaments')}</h1>
        <Link to="/tournaments/create">
          <Button variant="primary">{t('dashboard.create_tournament')}</Button>
        </Link>
      </div>
      
      <div className="filter-bar">
        <button 
          className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`} 
          onClick={() => setFilterStatus('all')}
        >
          {t('tournament.filter.all')}
        </button>
        <button 
          className={`filter-button ${filterStatus === 'registration' ? 'active' : ''}`} 
          onClick={() => setFilterStatus('registration')}
        >
          {t('tournament.status.registration')}
        </button>
        <button 
          className={`filter-button ${filterStatus === 'upcoming' ? 'active' : ''}`} 
          onClick={() => setFilterStatus('upcoming')}
        >
          {t('tournament.status.upcoming')}
        </button>
        <button 
          className={`filter-button ${filterStatus === 'active' ? 'active' : ''}`} 
          onClick={() => setFilterStatus('active')}
        >
          {t('tournament.status.active')}
        </button>
        <button 
          className={`filter-button ${filterStatus === 'completed' ? 'active' : ''}`} 
          onClick={() => setFilterStatus('completed')}
        >
          {t('tournament.status.completed')}
        </button>
      </div>
      
      {filteredTournaments.length > 0 ? (
        <div className="tournaments-grid">
          {filteredTournaments.map(tournament => (
            <Link to={`/tournaments/${tournament.id}`} key={tournament.id} className="tournament-card-link">
              <Card className="tournament-card">
                <div className="tournament-card-header">
                  <h2 className="tournament-name">{tournament.name}</h2>
                  <span className={`tournament-status status-badge status-${tournament.status}`}>
                    {t(`tournament.status.${tournament.status}`)}
                  </span>
                </div>
                <div className="tournament-info">
                  <div className="tournament-detail">
                    <span className="detail-label">{t('tournament.location')}</span>
                    <span className="detail-value">{tournament.location}</span>
                  </div>
                  <div className="tournament-detail">
                    <span className="detail-label">{t('tournament.format')}</span>
                    <span className="detail-value">{tournament.format}</span>
                  </div>
                  <div className="tournament-detail">
                    <span className="detail-label">{t('tournament.dates')}</span>
                    <span className="detail-value">{tournament.startDate} - {tournament.endDate}</span>
                  </div>
                  <div className="tournament-detail">
                    <span className="detail-label">{t('tournament.teams')}</span>
                    <span className="detail-value">{tournament.teams} {t('common.teams')}</span>
                  </div>
                  <div className="tournament-detail">
                    <span className="detail-label">{t('tournament.organizer')}</span>
                    <span className="detail-value">{tournament.organizer}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{t('tournament.no_tournaments_found')}</p>
          {filterStatus !== 'all' && (
            <Button onClick={() => setFilterStatus('all')} variant="secondary">
              {t('tournament.show_all_tournaments')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentsList; 