import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layout components
import Layout from './components/Layout/Layout';
import Loading from './components/UI/Loading';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';
// Notification Context
import { NotificationProvider } from './context/NotificationContext';
// Toast Context
import { ToastProvider } from './context/ToastContext';

// Page components (lazy loaded)
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const TournamentsList = React.lazy(() => import('./pages/Tournaments/TournamentsList'));
const TournamentDetails = React.lazy(() => import('./pages/Tournaments/TournamentDetails'));
const TournamentCreate = React.lazy(() => import('./pages/Tournaments/TournamentCreate'));
const TournamentStandings = React.lazy(() => import('./pages/Tournaments/TournamentStandings'));
const TournamentBrackets = React.lazy(() => import('./pages/Tournaments/TournamentBrackets'));
const TournamentPlayerStats = React.lazy(() => import('./pages/Tournaments/TournamentPlayerStats'));
const PlayerDetailStats = React.lazy(() => import('./pages/Tournaments/PlayerDetailStats'));
const MatchScheduler = React.lazy(() => import('./pages/Tournaments/MatchScheduler'));
const MatchResults = React.lazy(() => import('./pages/Tournaments/MatchResults'));
const TeamsList = React.lazy(() => import('./pages/Teams/TeamsList'));
const TeamDetails = React.lazy(() => import('./pages/Teams/TeamDetails'));
const TeamCreate = React.lazy(() => import('./pages/Teams/TeamCreate'));
const PlayersList = React.lazy(() => import('./pages/Players/PlayersList'));
const PlayerCreate = React.lazy(() => import('./pages/Players/PlayerCreate'));
const PlayerDetail = React.lazy(() => import('./pages/Players/PlayerDetail'));
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Notifications = React.lazy(() => import('./pages/Notifications/Notifications'));
const NotificationPreferences = React.lazy(() => import('./pages/Notifications/NotificationPreferences'));
// Add API Tester
const ApiTester = React.lazy(() => import('./pages/DevTools/ApiTester'));

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tournaments" 
            element={
              <ProtectedRoute>
                <TournamentsList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tournaments/create" 
            element={
              <ProtectedRoute>
                <TournamentCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tournaments/:id" 
            element={
              <ProtectedRoute>
                <TournamentDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tournaments/:id/standings" 
            element={
              <ProtectedRoute>
                <TournamentStandings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tournaments/:id/brackets" 
            element={
              <ProtectedRoute>
                <TournamentBrackets />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tournaments/:id/player-stats" 
            element={
              <ProtectedRoute>
                <TournamentPlayerStats />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tournaments/:tournamentId/players/:playerId/stats" 
            element={
              <ProtectedRoute>
                <PlayerDetailStats />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tournaments/:id/schedule" 
            element={
              <ProtectedRoute>
                <MatchScheduler />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/matches/:matchId" 
            element={
              <ProtectedRoute>
                <MatchResults />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <ProtectedRoute>
                <TeamsList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams/create" 
            element={
              <ProtectedRoute>
                <TeamCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teams/:id" 
            element={
              <ProtectedRoute>
                <TeamDetails />
              </ProtectedRoute>
            } 
          />
          {/* Player routes */}
          <Route 
            path="/players" 
            element={
              <ProtectedRoute>
                <PlayersList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/players/create" 
            element={
              <ProtectedRoute>
                <PlayerCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/players/create/:teamId" 
            element={
              <ProtectedRoute>
                <PlayerCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/players/:playerId" 
            element={
              <ProtectedRoute>
                <PlayerDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications/preferences" 
            element={
              <ProtectedRoute>
                <NotificationPreferences />
              </ProtectedRoute>
            } 
          />
          
          {/* API Testing Tool */}
          <Route 
            path="/dev/api-tester" 
            element={
              <ProtectedRoute>
                <ApiTester />
              </ProtectedRoute>
            } 
          />
          
          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App; 