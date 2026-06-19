import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabaseClient'; // Pastikan path client lu bener
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Sidebar from './components/shared/Sidebar';
import TopBar from './components/shared/TopBar';

// Import views asli lu
import Dashboard from './views/dashboard/MainDashboard';
import Sales from './views/sales/SalesMonitoring';
import Stock from './views/stock/StockIntelligence';
import MenuManagement from './views/menu/MenuManagement';
import StaffManagement from './views/staff/StaffManagement';

export default function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('login'); // Kontrol sub-view internal

  // 👁️ RADAR DETEKTIF: Memantau status login secara reaktif (Email & Google OAuth tembus semua)
  useEffect(() => {
    // 1. Cek session awal pas web pertama kali dibuka / di-refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setCurrentView('dashboard'); // Auto set tab kalau udah login
      setIsLoading(false);
    });

    // 2. Dengarkan perubahan auth secara real-time (efek klik login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tampilkan layar loading pelindung sementara Supabase mengambil token session
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#006847', fontWeight: 'bold' }}>
        Memeriksa Kredensial Keamanan cuanin.id...
      </div>
    );
  }

  // 🚪 KONDISI A: JALUR AUTHENTICATION (BELUM LOGIN)
  if (!session) {
    if (currentView === 'register') {
      return <Register onNavigate={(target) => setCurrentView(target)} />;
    }
    return (
      <Login 
        onNavigate={(target) => setCurrentView(target)} 
        onLoginSuccess={() => {
          // Kosongkan aja gak apa-apa, karena useEffect di atas yang bakal otomatis ngebuka gerbang begitu deteksi session sukses!
        }} 
      />
    );
  }

  // 🖥️ KONDISI B: JALUR APPS UTAMA (SUDAH LOGIN - GOOGLE / MANUAL)
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>
      
      {/* 1. SHARED SIDEBAR KIRI */}
      <Sidebar onNavigateView={setCurrentView} activeView={currentView} />

      {/* CONTAINER UTAMA KANAN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* 2. SHARED TOPBAR ATAS */}
        <TopBar />

        {/* 3. RUANG KONTEN DINAMIS */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#FAFAFA' }}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'sales' && <Sales />}
          {currentView === 'stock' && <Stock />}
          {currentView === 'menu' && <MenuManagement />}
          {currentView === 'staff' && <StaffManagement />}
        </div>

      </div>
    </div>
  );
}