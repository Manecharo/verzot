import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Layout components
import Layout from './components/Layout/Layout';
import Loading from './components/UI/Loading';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

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
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
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
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 