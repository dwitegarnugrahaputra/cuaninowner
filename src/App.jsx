import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import MainDashboard from './views/dashboard/MainDashboard.jsx';
import BrainyChat from './views/ai-chat/BrainyChat.jsx'; // Import view chat baru
import Login from './views/auth/Login.jsx';
import Register from './views/auth/Register.jsx';

function MainRouter() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('login'); 
  const [currentView, setCurrentView] = useState('dashboard'); // State pengatur halaman dalam dashboard

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' }}>
        <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #E5E7EB', borderTop: '4px solid #006847', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <h4 style={{ color: '#374151', margin: '0' }}>Memvalidasi Kredensial Akses...</h4>
        </div>
      </div>
    );
  }

  // Jika sukses login, lakukan routing internal antara Dashboard atau BrainyChat
  if (user) {
    return currentView === 'dashboard' ? (
      <MainDashboard onNavigateView={setCurrentView} />
    ) : (
      <BrainyChat onNavigateView={setCurrentView} />
    );
  }

  return screen === 'login' ? (
    <Login onNavigate={setScreen} />
  ) : (
    <Register onNavigate={setScreen} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}