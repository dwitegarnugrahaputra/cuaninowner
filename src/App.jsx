import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import MainDashboard from './views/dashboard/MainDashboard.jsx';
import BrainyChat from './views/ai-chat/BrainyChat.jsx';
import SalesMonitoring from './views/sales/SalesMonitoring.jsx';
import StockIntelligence from './views/stock/StockIntelligence.jsx';
import MenuManagement from './views/menu/MenuManagement.jsx';
import StaffManagement from './views/staff/StaffManagement.jsx';
import Login from './views/auth/Login.jsx';
import Register from './views/auth/Register.jsx';

function MainRouter() {
  const { user, loading, loginUser } = useAuth(); // Asumsi ada loginUser / setAuth dari context lu
  
  {/* KUNCI UTAMA FORCE LOGIN PAGE: 
    Kita set initial state screen ke 'login' dan pastikan isAuthenticated diset false di awal 
    setiap kali npm run dev dijalankan (aplikasi cold start).
  */}
  const [screen, setScreen] = useState('login'); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); 

  // Efek pengaman: Pastikan setiap kali browser di-reload/cold start, state dikunci ke login
  useEffect(() => {
    setIsAuthenticated(false);
    setScreen('login');
  }, []);

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

  // Handler jembatan ketika owner sukses klik "Masuk" di halaman login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  // --- RENDERING ROUTER CONDITIONAL ---
  // Jika sudah sukses melewati form login, baru boleh masuk ke core views cuanin.id
  if (user && isAuthenticated) {
    if (currentView === 'dashboard') {
      return <MainDashboard onNavigateView={setCurrentView} forcedSubView="main-dashboard" />;
    } else if (currentView === 'info-outlet') {
      return <MainDashboard onNavigateView={setCurrentView} forcedSubView="info-outlet" />;
    } else if (currentView === 'sales') {
      return <SalesMonitoring onNavigateView={setCurrentView} />;
    } else if (currentView === 'stock') {
      return <StockIntelligence onNavigateView={setCurrentView} />;
    } else if (currentView === 'menu') {
      return <MenuManagement onNavigateView={setCurrentView} />;
    } else if (currentView === 'staff') {
      return <StaffManagement onNavigateView={setCurrentView} />;
    } else if (currentView === 'chat') {
      return <BrainyChat onNavigateView={setCurrentView} />;
    }
  }

  // Jika belum login/otentikasi false, paksa ngerender halaman Auth
  return screen === 'login' ? (
    <Login onNavigate={setScreen} onLoginSuccess={handleLoginSuccess} />
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