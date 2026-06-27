import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabaseClient'; 
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Sidebar from './components/shared/Sidebar';
import TopBar from './components/shared/TopBar';
import { LanguageProvider } from './context/LanguageContext';

// 📂 IMPORT VIEWS ASLI LU
import Dashboard from './views/dashboard/MainDashboard'; 
import Sales from './views/sales/SalesMonitoring';
import Stock from './views/stock/StockIntelligence';
import MenuManagement from './views/menu/MenuManagement';
import StaffManagement from './views/staff/StaffManagement';
import BrainyChat from './views/ai-chat/BrainyChat'; 
import InfoOutlet from './views/settings/InfoOutlet'; 
import KonfigurasiAI from './views/settings/KonfigurasiAI';
import Keamanan from './views/settings/Keamanan';
import Bahasa from './views/settings/Bahasa';

// Komponen utama yang sebelumnya bernama App — isinya tidak berubah sama sekali,
// hanya dipindah ke dalam fungsi terpisah agar bisa dibungkus <LanguageProvider> di bawah.
function AppContent() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ambil riwayat tab terakhir dari localStorage agar stay
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('cuanin_current_view');
    return savedView && savedView !== 'login' && savedView !== 'register' ? savedView : 'dashboard';
  });

  // Fungsi pembungkus navigasi dengan auto-save state
  const handleNavigateView = (targetView) => {
    setCurrentView(targetView);
    localStorage.setItem('cuanin_current_view', targetView);
  };

  useEffect(() => {
    // 1. Cek session awal pas web dibuka / di-refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        const savedView = localStorage.getItem('cuanin_current_view');
        if (!savedView || savedView === 'login' || savedView === 'register') {
          handleNavigateView('dashboard');
        }
      }
      setIsLoading(false);
    });

    // 2. Dengarkan perubahan auth secara real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        const savedView = localStorage.getItem('cuanin_current_view');
        if (!savedView || savedView === 'login') {
          handleNavigateView('dashboard');
        }
      } else {
        setCurrentView('login');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#006847', fontWeight: 'bold' }}>
        Memeriksa Kredensial Keamanan cuanin.id...
      </div>
    );
  }

  // JALUR AUTHENTICATION
  if (!session) {
    if (currentView === 'register') {
      return <Register onNavigate={(target) => setCurrentView(target)} />;
    }
    return <Login onNavigate={(target) => setCurrentView(target)} onLoginSuccess={() => {}} />;
  }

  // JALUR APPS UTAMA OWNER
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>
      
      {/* SIDEBAR KIRI */}
      <Sidebar onNavigateView={handleNavigateView} activeView={currentView} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOPBAR ATAS */}
        <TopBar onNavigateView={handleNavigateView} activeView={currentView} />

        {/* RUANG KONTEN DINAMIS */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#FAFAFA' }}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'sales' && <Sales />}
          {currentView === 'stock' && <Stock />}
          {currentView === 'menu' && <MenuManagement />}
          {currentView === 'staff' && <StaffManagement />}
          {currentView === 'brainy' && <BrainyChat />}

          {/* BLOCK ROUTING SETTINGS SUBTABS */}
          {(currentView === 'settings-info' || currentView === 'info-outlet') && <InfoOutlet />}
          {(currentView === 'settings-ai' || currentView === 'konfigurasi-ai') && <KonfigurasiAI onSaveSuccess={() => handleNavigateView('settings-ai')} />}
          {(currentView === 'settings-security' || currentView === 'keamanan') && <Keamanan onSaveSuccess={() => handleNavigateView('settings-security')} />}
          {(currentView === 'settings-lang' || currentView === 'bahasa') && <Bahasa onSaveSuccess={() => handleNavigateView('settings-lang')} />}

          {/* 🔥 NEW ROUTING: TOP BAR UTILITIES WORKSPACE (ANTI-BLANK PUTIH) */}
          {currentView === 'notifications' && (
            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>🔔 Pusat Notifikasi Sistem</h2>
              <p style={{ margin: '6px 0 20px 0', fontSize: '13.5px', color: '#6B7280' }}>Pantau seluruh log aktivitas kasir dan peringatan stok gudang lu di sini, Gar.</p>
              <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', color: '#9CA3AF', fontStyle: 'italic', fontSize: '13px', textAlign: 'center', border: '1px dashed #D1D5DB' }}>
                Belum ada notifikasi baru dari aktivitas gerbang mobile kasir.
              </div>
            </div>
          )}

          {currentView === 'help-center' && (
            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>❓ Cuanin Help & Dokumentasi Center</h2>
              <p style={{ margin: '6px 0 20px 0', fontSize: '13.5px', color: '#6B7280' }}>Butuh panduan operasional POS atau sinkronisasi Supabase? Cek panduan ringkas di bawah ini.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#374151' }}>
                <div style={{ padding: '14px', backgroundColor: '#E6F4EA', borderRadius: '8px', border: '1px solid #A3E635' }}>
                  <strong>💡 Tips Sinkronisasi Kasir Mobile:</strong> Daftarkan *Mock Email* staf terlebih dahulu di menu Staff Management, lalu gunakan kredensial tersebut langsung di aplikasi Flutter kasir tanpa perlu verifikasi kode OTP!
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Export default sekarang membungkus AppContent dengan LanguageProvider,
// supaya SEMUA komponen di bawahnya (Sidebar, TopBar, Dashboard, StaffManagement,
// Keamanan, Bahasa, dst) bisa memanggil useLanguage() untuk terjemahan.
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}