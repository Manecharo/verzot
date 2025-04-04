import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const mockData = {
    upcomingMatches: [
      { id: 1, tournament: 'Summer League 2023', team1: 'FC Barcelona', team2: 'Real Madrid', date: '2023-07-15', time: '18:00' },
      { id: 2, tournament: 'City Cup', team1: 'Manchester City', team2: 'Liverpool', date: '2023-07-18', time: '19:30' }
    ],
    myTournaments: [
      { id: 1, name: 'Summer League 2023', teams: 12, status: 'active' },
      { id: 2, name: 'City Cup', teams: 8, status: 'registration' }
    ],
    myTeams: [
      { id: 1, name: 'FC Barcelona', members: 15, tournaments: 2 },
      { id: 2, name: 'Real Madrid', members: 18, tournaments: 1 }
    ]
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('dashboard.welcome', { name: user?.name || t('dashboard.user') })}</h1>
        <p className="dashboard-subtitle">{t('dashboard.subtitle')}</p>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">{t('dashboard.quick_actions')}</h2>
        <div className="action-buttons">
          <Link to="/tournaments/create">
            <Button variant="primary">{t('dashboard.create_tournament')}</Button>
          </Link>
          <Link to="/teams/create">
            <Button variant="secondary">{t('dashboard.create_team')}</Button>
          </Link>
          <Link to="/tournaments">
            <Button variant="outline">{t('dashboard.browse_tournaments')}</Button>
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-column">
          <Card 
            title={t('dashboard.upcoming_matches')}
            footer={
              <Link to="/tournaments" className="card-link">
                {t('dashboard.see_all_matches')}
              </Link>
            }
          >
            {mockData.upcomingMatches.length > 0 ? (
              <div className="matches-list">
                {mockData.upcomingMatches.map(match => (
                  <div className="match-item" key={match.id}>
                    <div className="match-detail">
                      <span className="match-tournament">{match.tournament}</span>
                      <span className="match-datetime">{match.date} - {match.time}</span>
                    </div>
                    <div className="match-teams">
                      <span className="team">{match.team1}</span>
                      <span className="vs">vs</span>
                      <span className="team">{match.team2}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('dashboard.no_upcoming_matches')}</p>
              </div>
            )}
          </Card>
        </div>
        
        <div className="dashboard-column">
          <Card 
            title={t('dashboard.my_tournaments')}
            footer={
              <Link to="/tournaments" className="card-link">
                {t('dashboard.see_all_tournaments')}
              </Link>
            }
          >
            {mockData.myTournaments.length > 0 ? (
              <div className="tournaments-list">
                {mockData.myTournaments.map(tournament => (
                  <Link to={`/tournaments/${tournament.id}`} key={tournament.id} className="tournament-item">
                    <div className="tournament-name">{tournament.name}</div>
                    <div className="tournament-info">
                      <span className="tournament-teams">{tournament.teams} {t('common.teams')}</span>
                      <span className={`tournament-status status-${tournament.status}`}>
                        {t(`tournament.status.${tournament.status}`)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('dashboard.no_tournaments')}</p>
                <Link to="/tournaments/create">
                  <Button variant="primary" className="create-button">
                    {t('dashboard.create_first_tournament')}
                  </Button>
                </Link>
              </div>
            )}
          </Card>
  
          <Card 
            title={t('dashboard.my_teams')}
            footer={
              <Link to="/teams" className="card-link">
                {t('dashboard.see_all_teams')}
              </Link>
            }
          >
            {mockData.myTeams.length > 0 ? (
              <div className="teams-list">
                {mockData.myTeams.map(team => (
                  <Link to={`/teams/${team.id}`} key={team.id} className="team-item">
                    <div className="team-name">{team.name}</div>
                    <div className="team-info">
                      <span className="team-members">{team.members} {t('common.members')}</span>
                      <span className="team-tournaments">{team.tournaments} {t('common.tournaments')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('dashboard.no_teams')}</p>
                <Link to="/teams/create">
                  <Button variant="primary" className="create-button">
                    {t('dashboard.create_first_team')}
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 