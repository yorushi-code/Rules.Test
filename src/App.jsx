import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login';
import PublicRules from './pages/PublicRules';
import AdminPanel from './pages/AdminPanel';
import ModeratorPanel from './pages/ModeratorPanel';
import './styles/App.css';

const AppContent = () => {
  const { user } = useAuth();
  const [page, setPage] = useState('rules');

  const handleLoginSuccess = (role) => {
    setPage(role === 'admin' ? 'admin' : 'moderator');
  };

  if (page === 'login') {
    return <LoginPage onSuccess={handleLoginSuccess} onBack={() => setPage('rules')} />;
  }

  if (page === 'admin' && user?.role === 'admin') {
    return <AdminPanel onNavigate={setPage} />;
  }

  if (page === 'moderator' && user?.role === 'moderator') {
    return <ModeratorPanel onNavigate={setPage} />;
  }

  return <PublicRules onNavigate={setPage} />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;