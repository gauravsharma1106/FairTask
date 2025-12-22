import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Earn } from './pages/Earn';
import { Wallet } from './pages/Wallet';
import { Plans } from './pages/Plans';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './services/authContext';
import { Toaster } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// Protected Route Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Initializing Security...</div>;
  
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/earn" element={<ProtectedRoute><Earn /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
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
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            borderRadius: '4px',
            border: '1px solid #334155',
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;