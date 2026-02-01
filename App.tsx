
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Earn } from './pages/Earn';
import { Wallet } from './pages/Wallet';
import { Plans } from './pages/Plans';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { Referrals } from './pages/Referrals';
import { AuthProvider, useAuth } from './services/authContext';
import { Toaster } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// Protected Route Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-mono">Initializing Secure Environment...</div>;
  
  if (!user) return <Navigate to="/login" replace />;
  
  // If user tries to access admin route but isn't admin
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  // If admin tries to access user route (optional: strict separation)
  // For this requirement: "only admin panel be visible", we redirect admins hitting root to /admin
  
  return <>{children}</>;
};

const UserRoutes = () => {
  const { isAdmin } = useAuth();
  
  // If an admin tries to access user routes, send them to admin panel
  if (isAdmin) return <Navigate to="/admin" replace />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/earn" element={<Earn />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Route - Standalone Layout */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          } />

          {/* User Routes - Wrapped in User Layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <UserRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
