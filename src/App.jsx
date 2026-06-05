import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import MainDashboard from './views/dashboard/MainDashboard.jsx';
import BrainyChat from './views/ai-chat/BrainyChat.jsx';
import SalesMonitoring from './views/sales/SalesMonitoring.jsx';
import StockIntelligence from './views/stock/StockIntelligence.jsx';
import MenuManagement from './views/menu/MenuManagement.jsx'; // Import view menu baru
import Login from './views/auth/Login.jsx';
import Register from './views/auth/Register.jsx';

function MainRouter() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('login'); 
  const [currentView, setCurrentView] = useState('dashboard'); 

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

  // Handle Multi-Slicing View Internal untuk Akun Owner Aktif
  if (user) {
    if (currentView === 'dashboard') {
      return <MainDashboard onNavigateView={setCurrentView} />;
    } else if (currentView === 'chat') {
      return <BrainyChat onNavigateView={setCurrentView} />;
    } else if (currentView === 'sales') {
      return <SalesMonitoring onNavigateView={setCurrentView} />;
    } else if (currentView === 'stock') {
      return <StockIntelligence onNavigateView={setCurrentView} />;
    } else if (currentView === 'menu') {
      return <MenuManagement onNavigateView={setCurrentView} />;
    }
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