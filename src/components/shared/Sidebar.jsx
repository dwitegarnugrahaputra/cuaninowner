import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabaseClient'; // Amankan fallback clearing token
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu as MenuIcon, Users, 
  Settings, LogOut, ChevronDown, ChevronUp, Store, Bot, ShieldCheck, Languages 
} from 'lucide-react';

// 🟩 LOGO REFIX: Menyesuaikan standar branding cuanin.id dengan ukuran mini proporsional
function CuaninLogoSidebar() {
  return (
    <div style={{ width: '40px', height: '40px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '7px', flexShrink: 0 }}>
      <div style={{
        width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '5px',
        padding: '3px 0px 3px 3.5px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box',
        position: 'relative'
      }}>
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '3px 0 0 3px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxSizing: 'border-box'
        }}>
          <div style={{
            width: '14px', height: '14px', backgroundColor: '#ffffff', borderRadius: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginRight: '-1px'
          }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006847', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ onNavigateView, activeView }) {
  const { logout } = useAuth();
  
  // State untuk mengontrol buka-tutup dropdown menu Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Daftar menu utama atas (non-dropdown)
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'sales', label: 'Sales', icon: <ShoppingBag size={18} /> },
    { id: 'stock', label: 'Stock', icon: <Archive size={18} /> },
    { id: 'menu', label: 'Menu Management', icon: <MenuIcon size={18} /> },
    { id: 'staff', label: 'Staff Management', icon: <Users size={18} /> },
  ];

  // 🔥 FIXED ID: Daftar anak menu (subtabs) sudah diselaraskan dengan routing pintu masuk App.jsx!
  const settingsSubTabs = [
    { id: 'info-outlet', label: 'Info Outlet', icon: <Store size={14} /> },
    { id: 'konfigurasi-ai', label: 'Konfigurasi AI', icon: <Bot size={14} /> },
    { id: 'keamanan', label: 'Keamanan', icon: <ShieldCheck size={14} /> },
    { id: 'bahasa', label: 'Bahasa', icon: <Languages size={14} /> },
  ];

  // 🔥 ACTION HANDLING LOGOUT PIPELINE
  const handleClientLogout = async () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar dari sistem manajemen cuanin.id?');
    if (!confirmLogout) return;

    try {
      // 1. Eksekusi fungsi logout dari Context
      if (logout) {
        await logout();
      }
      
      // 2. Tambahkan pengaman (Safety Catch) murni dengan nembak langsung client auth Supabase
      await supabase.auth.signOut();
      
      // 3. Clear sisa token lokal storage jika masih tersangkut di cache browser
      localStorage.clear();
      sessionStorage.clear();
      
    } catch (err) {
      console.error('Gagal memproses pemutusan sesi keamanan:', err.message);
    }
  };

  // Cek apakah view aktif merupakan bagian dari subtabs settings
  const isSettingsActive = settingsSubTabs.some(sub => sub.id === activeView);

  return (
    <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0, height: '100vh', boxSizing: 'border-box' }}>
      
      {/* BRANDING HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px', marginBottom: '32px' }}>
        <CuaninLogoSidebar />
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
          <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
        </div>
      </div>

      {/* RENDER MENU UTAMA ATAS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px', overflowY: 'auto' }}>
        {mainMenuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <div 
              key={item.id} 
              onClick={() => {
                onNavigateView(item.id);
                setIsSettingsOpen(false); 
              }} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? '#ffffff' : '#93C5FD',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {item.icon} <span style={{ fontSize: '14px' }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* CONTROLLER AREA BAWAH */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        
        {/* 🛠️ INDUK MENU DROPDOWN: SETTINGS */}
        <div 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', 
            color: isSettingsActive ? '#ffffff' : '#93C5FD', 
            backgroundColor: isSettingsActive ? 'rgba(255,255,255,0.05)' : 'transparent',
            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={18} /> 
            <span style={{ fontSize: '14px', fontWeight: isSettingsActive ? 'bold' : 'normal' }}>Settings</span>
          </div>
          {isSettingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {/* 📉 SLIDER ELEMENT: SUBTABS SETTINGS */}
        {isSettingsOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px', marginTop: '2px', transition: 'all 0.3s' }}>
            {settingsSubTabs.map((subTab) => {
              const isSubActive = activeView === subTab.id;
              return (
                <div
                  key={subTab.id}
                  onClick={() => onNavigateView(subTab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: isSubActive ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    color: isSubActive ? '#10B981' : '#93C5FD',
                    fontWeight: isSubActive ? 'bold' : 'normal',
                    transition: 'all 0.15s'
                  }}
                >
                  {subTab.icon}
                  <span style={{ fontSize: '13px' }}>{subTab.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 🔥 FIXED TOMBOL LOGOUT: Mengikat fungsi eksekutor multi-layer clearing */}
        <div onClick={handleClientLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#FFCACA', borderRadius: '10px', cursor: 'pointer', marginTop: '4px', transition: 'all 0.15s' }}>
          <LogOut size={18} /> <span style={{ fontSize: '14px' }}>Logout</span>
        </div>

        {/* WIDGET IDENTITAS CAFE BISNIS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#111827', borderRadius: '12px', marginTop: '8px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1E3A8A', fontSize: '12px' }}>
            WJ
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p>
            <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>PREMIUM PLAN</span>
          </div>
        </div>

      </div>
    </div>
  );
}