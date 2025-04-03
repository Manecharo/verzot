import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layout components
import Layout from './components/Layout/Layout';
import Loading from './components/UI/Loading';

// Page components (lazy loaded)
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const TournamentsList = React.lazy(() => import('./pages/Tournaments/TournamentsList'));
const TournamentDetails = React.lazy(() => import('./pages/Tournaments/TournamentDetails'));
const TournamentCreate = React.lazy(() => import('./pages/Tournaments/TournamentCreate'));
const TeamsList = React.lazy(() => import('./pages/Teams/TeamsList'));
const TeamDetails = React.lazy(() => import('./pages/Teams/TeamDetails'));
const TeamCreate = React.lazy(() => import('./pages/Teams/TeamCreate'));
const Profile = React.lazy(() => import('./pages/Profile/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  const { t } = useTranslation();

  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournaments" element={<TournamentsList />} />
          <Route path="/tournaments/create" element={<TournamentCreate />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/teams" element={<TeamsList />} />
          <Route path="/teams/create" element={<TeamCreate />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App; 