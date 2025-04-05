import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { tournamentService } from '../../services';
import './Tournaments.css';

const TournamentsList = () => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState('all');
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tournaments from API
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        // If filter is not 'all', we pass it as a query param
        const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
        const response = await tournamentService.getAllTournaments(filters);
        
        if (response.status === 'success') {
          setTournaments(response.data.tournaments);
        } else {
          setError('Failed to load tournaments');
        }
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError(err.message || 'Failed to load tournaments');
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [filterStatus]);
  
  // Filter tournaments based on selected status
  const filteredTournaments = tournaments;
  
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
      
      {loading ? (
        <div className="loading-state">
          <p>{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <Button onClick={() => setFilterStatus('all')} variant="secondary">
            {t('tournament.show_all_tournaments')}
          </Button>
        </div>
      ) : filteredTournaments.length > 0 ? (
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
                    <span className="detail-value">{tournament.teamCount || 0} {t('common.teams')}</span>
                  </div>
                  <div className="tournament-detail">
                    <span className="detail-label">{t('tournament.organizer')}</span>
                    <span className="detail-value">{tournament.organizer?.name || 'Unknown'}</span>
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