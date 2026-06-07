import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, TrendingUp, TrendingDown, AlertTriangle,
  ChevronDown, ChevronUp, Store, Sliders, ShieldCheck, LogOut,
  MessageSquare, User, Shield, Key, ArrowUpRight
} from 'lucide-react';

// Import komponen form internal yang sudah kita desentralisasikan
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';

// Logo cuanin.id versi mini murni CSS
function CuaninLogoMini() {
  return (
    <div style={{
      width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '6px', flexShrink: 0
    }}>
      <div style={{
        width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '5px',
        padding: '3px 0px 3px 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '3px 0 0 3px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxSizing: 'border-box'
        }}>
          <div style={{
            width: '12px', height: '12px', backgroundColor: '#ffffff', borderRadius: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginRight: '-1px'
          }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006847', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MainDashboard({ onNavigateView, forcedSubView }) {
  const { logout } = useAuth();
  const currentView = 'dashboard';
  
  // State kendali interaksi UI internal
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);

  {/* KONTROL LAYOUT WORKSPACE UTAMA: 'main-dashboard' VS 'info-outlet' VS 'konfigurasi-ai' */}
  const [activeSubView, setActiveSubView] = useState(forcedSubView || 'main-dashboard');

  // Sinkronisasi state jika ada kiriman props forcedSubView dari luar router global
  React.useEffect(() => {
    if (forcedSubView) {
      setActiveSubView(forcedSubView);
    }
  }, [forcedSubView]);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F3F4F6', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* ================= 1. SIDEBAR KIRI COLLAPSIBLE ================= */}
      <div style={{ 
        width: isMainSidebarOpen ? '260px' : '80px', 
        backgroundColor: '#1E3A8A', 
        color: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '24px 0', 
        flexShrink: 0,
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden'
      }}>
        
        {/* Header Branding Sidebar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isMainSidebarOpen ? 'space-between' : 'center', 
          padding: '0 20px', 
          marginBottom: '32px',
          height: '40px'
        }}>
          <div 
            onClick={() => !isMainSidebarOpen && setIsMainSidebarOpen(true)}
            style={{ cursor: !isMainSidebarOpen ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <CuaninLogoMini />
            {isMainSidebarOpen && (
              <div style={{ transition: 'opacity 0.2s', opacity: 1 }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
                <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
              </div>
            )}
          </div>

          {isMainSidebarOpen && (
            <div 
              onClick={() => { setIsMainSidebarOpen(false); setIsSettingsOpen(false); }}
              style={{ cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <Menu size={16} color="#93C5FD" />
            </div>
          )}
        </div>

        {/* Menu Utama List - HIGHLIGHT UTAMA TETAP MENGUNCI DI TAB DASHBOARD UTAMA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: isMainSidebarOpen ? '0 16px' : '0' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard', action: () => setActiveSubView('main-dashboard') },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales', action: () => onNavigateView('sales') },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock', action: () => onNavigateView('stock') },
            { name: 'Menu Management', icon: <Menu size={18} />, target: 'menu', action: () => onNavigateView('menu') },
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff', action: () => onNavigateView('staff') }
          ].map((menu, idx) => {
            const isActive = menu.target === 'dashboard';
            return (
              <div 
                key={idx} 
                onClick={menu.action} 
                title={!isMainSidebarOpen ? menu.name : ''}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: isMainSidebarOpen ? 'flex-start' : 'center',
                  gap: '12px', 
                  padding: '12px 16px', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  fontWeight: isActive ? 'bold' : '500',
                  backgroundColor: isActive ? '#006847' : 'transparent', 
                  color: isActive ? '#ffffff' : '#93C5FD',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {menu.icon} 
                {isMainSidebarOpen && <span style={{ fontSize: '14px' }}>{menu.name}</span>}
              </div>
            );
          })}
        </div>

        {/* FOOTER SIDEBAR AREA */}
        <div style={{ padding: isMainSidebarOpen ? '0 16px' : '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          
          {/* Tombol Utama Settings */}
          <div 
            onClick={() => isMainSidebarOpen ? setIsSettingsOpen(!isSettingsOpen) : setIsMainSidebarOpen(true)} 
            title={!isMainSidebarOpen ? 'Settings' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isMainSidebarOpen ? 'space-between' : 'center', 
              padding: '12px 16px', 
              color: isSettingsOpen || activeSubView !== 'main-dashboard' ? '#ffffff' : '#93C5FD', 
              backgroundColor: isSettingsOpen || activeSubView !== 'main-dashboard' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> 
              {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {isMainSidebarOpen && (isSettingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </div>

          {/* Container Sub-Menu Settings Pop-down */}
          {isMainSidebarOpen && isSettingsOpen && (
            <div style={{
              maxHeight: '150px',
              overflow: 'hidden',
              transition: 'all 0.4s ease-in-out',
              opacity: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingLeft: '14px',
              marginBottom: '4px'
            }}>
              {[
                { name: 'Info Outlet', icon: <Store size={14} />, target: 'info-outlet' },
                { name: 'Konfigurasi AI', icon: <Sliders size={14} />, target: 'konfigurasi-ai' },
                { name: 'Keamanan', icon: <ShieldCheck size={14} />, target: 'keamanan' }
              ].map((sub, i) => {
                const isSubActive = activeSubView === sub.target;

                {/* SINKRONISASI HANDLER KLIK: Mengatur render form internal dashboard tanpa mental alert browser */}
                const handleSubMenuClick = () => {
                  if (sub.target === 'info-outlet' || sub.target === 'konfigurasi-ai') {
                    setActiveSubView(sub.target);
                    setIsSettingsOpen(false);
                  } else {
                    alert(`Buka parameter ${sub.name}`);
                  }
                };

                return (
                  <div 
                    key={i}
                    onClick={handleSubMenuClick}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', 
                      borderRadius: '8px', 
                      color: isSubActive ? '#ffffff' : '#93C5FD', 
                      backgroundColor: isSubActive ? '#006847' : 'transparent',
                      fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {sub.icon} <span>{sub.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tombol Logout */}
          <div 
            onClick={logout}
            title={!isMainSidebarOpen ? 'Logout' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isMainSidebarOpen ? 'flex-start' : 'center',
              gap: '12px', 
              padding: '12px 16px', 
              color: '#FFCACA', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#F87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFCACA'; }}
          >
            <LogOut size={18} /> 
            {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: '500' }}>Logout</span>}
          </div>

          {/* Card Profile Merchant */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isMainSidebarOpen ? 'flex-start' : 'center',
            gap: '12px', 
            padding: '12px 16px', 
            backgroundColor: '#111827', 
            borderRadius: '12px', 
            marginTop: '4px'
          }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1E3A8A', fontSize: '12px', flexShrink: 0 }}>WJ</div>
            {isMainSidebarOpen && (
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p>
                <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>PREMIUM</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ================= 2. MAIN WORKSPACE KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOPBAR PROFILE AREA */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search analytics, financial reports, or menu items..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <MessageSquare size={16} /> Ask Brainy
            </button>
            <Bell size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            <HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />

            <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px', cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Alex Graham {isProfileOpen ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                </p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>ADMINISTRATOR</span>
              </div>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '50%', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* FLOATING DROPDOWN PROFIL */}
            <div style={{
              position: 'absolute', top: '55px', right: '0px', width: '220px', backgroundColor: '#ffffff',
              borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 100, display: isProfileOpen ? 'flex' : 'none', flexDirection: 'column', padding: '6px', boxSizing: 'border-box'
            }}>
              {[{ name: 'Edit Profile', icon: <User size={14} /> }, { name: 'Account Security', icon: <Shield size={14} /> }, { name: 'API Credentials', icon: <Key size={14} /> }].map((item, idx) => (
                <div key={idx} onClick={() => alert(item.name)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#006847'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                  {item.icon} <span style={{ fontWeight: '500' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONTAINER WORKSPACE UTAMA: SELEKTOR ROUTER DYNAMIC */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box' }}>
          
          {/* ================= KONDISI 1: FORM INTERNAL INFO OUTLET ================= */}
          {activeSubView === 'info-outlet' && (
            <InfoOutlet onSaveSuccess={() => { alert('Pengaturan Info Outlet Cabang Berhasil Diperbarui!'); setActiveSubView('main-dashboard'); }} />
          )}

          {/* ================= KONDISI 2: FORM INTERNAL KONFIGURASI AI ================= */}
          {activeSubView === 'konfigurasi-ai' && (
            <KonfigurasiAI onSaveSuccess={() => { alert('Parameter Brainy POS Berhasil Disimpan!'); setActiveSubView('main-dashboard'); }} />
          )}

          {/* ================= KONDISI 3: RENDERING UTUH WORKSPACE BI DASHBOARD UTAMA ================= */}
          {activeSubView === 'main-dashboard' && (
            <>
              {/* SMART CARDS ROW SUMMARY */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CuaninLogoMini /></div>
                    <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12}/> 12.5%</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>TOTAL PENJUALAN</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp 12.450.000</h2>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💵</div>
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingDown size={12}/> 4.2%</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>PROFIT BERSIH</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp 3.120.000</h2>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📝</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>JUMLAH TRANSAKSI</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>1.248</h2>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={20} /></div>
                    <div style={{ backgroundColor: '#DC2626', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>KRITIS</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>STOK KRITIS</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>12 Items</h2>
                </div>
              </div>

              {/* SALES VS EXPENSES GRAPH & BREAKDOWN PANEL */}
              <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div onClick={() => setIsBreakdownOpen(!isBreakdownOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Sales vs Expenses {isBreakdownOpen ? <ChevronUp size={18} color="#006847" /> : <ChevronDown size={18} color="#6B7280" />}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Visualisasi fluktuasi mingguan performa operasional</p>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#006847', borderRadius: '50%' }} /> Sales</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#4F46E5', borderRadius: '50%' }} /> Expenses</span>
                  </div>
                </div>
                <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
                  <svg viewBox="0 0 700 100" style={{ width: '100%', height: '100px', overflow: 'visible' }}>
                    <path d="M 0 50 Q 116 20 233 40 T 466 20 T 700 30" fill="none" stroke="#006847" strokeWidth="4" />
                    <path d="M 0 80 Q 116 60 233 75 T 466 55 T 700 65" fill="none" stroke="#4F46E5" strokeWidth="4" />
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <span key={day}>{day}</span>)}
                  </div>
                </div>

                {/* BREAKDOWN PANEL DETAIL MINGGUAN */}
                <div style={{
                  maxHeight: isBreakdownOpen ? '400px' : '0px',
                  overflow: 'hidden',
                  transition: 'all 0.4s ease-in-out',
                  opacity: isBreakdownOpen ? 1 : 0,
                  borderTop: isBreakdownOpen ? '1px dashed #E5E7EB' : 'none',
                  paddingTop: isBreakdownOpen ? '16px' : '0px',
                  boxSizing: 'border-box'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4B5563', display: 'block', marginBottom: '12px', textAlign: 'left' }}>📋 RINCIAN OPERASIONAL MINGGUAN</span>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ color: '#9CA3AF', fontWeight: 'bold', borderBottom: '1px solid #F3F4F6' }}>
                        <th style={{ padding: '10px 8px' }}>HARI</th>
                        <th style={{ padding: '10px 8px' }}>TOTAL SALES (RP)</th>
                        <th style={{ padding: '10px 8px' }}>TOTAL EXPENSES (RP)</th>
                        <th style={{ padding: '10px 8px' }}>STATUS MARGIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { day: 'Monday', sales: 'Rp 1.450.000', exp: 'Rp 450.000', stat: 'SURPLUS', color: '#E6F4EA', text: '#006847' },
                        { day: 'Tuesday', sales: 'Rp 1.200.000', exp: 'Rp 620.000', stat: 'SURPLUS', color: '#E6F4EA', text: '#006847' },
                        { day: 'Wednesday', sales: 'Rp 1.650.000', exp: 'Rp 510.000', stat: 'SURPLUS', color: '#E6F4EA', text: '#006847' },
                        { day: 'Thursday', sales: 'Rp 1.100.000', exp: 'Rp 950.000', stat: 'WARNING', color: '#FFF7ED', text: '#D97706' },
                        { day: 'Friday', sales: 'Rp 2.100.000', exp: 'Rp 420.000', stat: 'SURPLUS', color: '#E6F4EA', text: '#006847' },
                        { day: 'Saturday', sales: 'Rp 2.850.000', exp: 'Rp 700.000', stat: 'SURPLUS', color: '#E6F4EA', text: '#006847' },
                        { day: 'Sunday', sales: 'Rp 2.100.000', exp: 'Rp 700.000', stat: 'SURPLUS', color: '#E6F4EA', text: '#006847' },
                      ].map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                          <td style={{ padding: '12px 8px', fontWeight: '600' }}>{row.day}</td>
                          <td style={{ padding: '12px 8px', color: '#006847', fontWeight: 'bold' }}>{row.sales}</td>
                          <td style={{ padding: '12px 8px', color: '#4F46E5', fontWeight: '600' }}>{row.exp}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{ backgroundColor: row.color, color: row.text, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>{row.stat}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* TOP SELLING MENU */}
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>⭐ Top Selling Menu (Top 3)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {...[{ name: 'Kopi Susu Gula Aren', sold: '420 SOLD', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=150' }, { name: 'Cafe Latte', sold: '315 SOLD', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=150' }, { name: 'Avocado Toast', sold: '210 SOLD', img: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=150' }].map((menu, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #F3F4F6', padding: '12px', borderRadius: '14px', backgroundColor: '#F9FAFB' }}>
                      <img src={menu.img} alt={menu.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                      <div><p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{menu.name}</p><span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold' }}>{menu.sold}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINANCIAL DEEP-DIVE BANNER */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827', borderLeft: '4px solid #006847', paddingLeft: '10px' }}>Financial Deep-Dive</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', alignItems: 'start' }}>
                {/* Tabel Laba Rugi Audited */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>LABA RUGI (AUDITED)</span>
                    <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px' }}>JULY 2024</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#4B5563' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Gross Revenue</span><strong style={{ color: '#111827' }}>Rp 12.450.000</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>COGS (HPP)</span><strong style={{ color: '#DC2626' }}>- Rp 4.350.000</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Labor Costs</span><strong style={{ color: '#DC2626' }}>- Rp 2.500.000</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E5E7EB', paddingBottom: '12px' }}><span>Operating Expenses</span><strong style={{ color: '#DC2626' }}>- Rp 1.480.000</strong></div>
                    
                    <div style={{ backgroundColor: '#E6F4EA', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div><span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold', display: 'block' }}>NET PROFIT</span><span style={{ fontSize: '10px', color: '#059669' }}>Margin: 33.1%</span></div>
                      <strong style={{ fontSize: '18px', color: '#006847' }}>Rp 4.120.000</strong>
                    </div>

                    <div style={{ backgroundColor: '#006847', color: '#ffffff', padding: '14px', borderRadius: '12px', fontSize: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '16px' }}>💡</span>
                      <p style={{ margin: 0, lineHeight: '1.4' }}><strong>Brainy Insights:</strong> Increasing 'Cafe Latte' margin by 5% could boost monthly net profit by Rp 450.000.</p>
                    </div>
                  </div>
                </div>

                {/* Grafik Tren Harga Bahan Baku */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', height: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', display: 'block' }}>TREN HARGA BAHAN BAKU</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '300px', fontSize: '10px', fontWeight: 'bold', color: '#6B7280' }}>
                      {['● KOPI ARABICA', '● BERAS PREMIUM', '● GULA AREN', '● FRESH MILK', '● DAGING AYAM'].map((item, i) => <span key={i}>{item}</span>)}
                    </div>
                  </div>
                  
                  <div style={{ height: '160px', borderLeft: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', position: 'relative', marginBottom: '10px' }}>
                    <div style={{ position: 'absolute', bottom: '20px', left: '10%', right: '10%', height: '2px', backgroundColor: '#E5E7EB' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
                    <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', borderTop: '1px solid #F3F4F6', paddingTop: '14px', textAlign: 'center', fontSize: '11px' }}>
                    {[
                      { name: 'KOPI', price: 'Rp 185k' }, { name: 'BERAS', price: 'Rp 78k' }, 
                      { name: 'GULA', price: 'Rp 45k' }, { name: 'MILK', price: 'Rp 22.5k' }, { name: 'AYAM', price: 'Rp 42k' }
                    ].map((baku, i) => (
                      <div key={i}>
                        <span style={{ color: '#9CA3AF', fontWeight: 'bold', display: 'block', fontSize: '9px' }}>{baku.name}</span>
                        <strong style={{ color: '#111827', marginTop: '2px', display: 'block' }}>{baku.price}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* TRIPLE BOTTOM METRICS ROW CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>📊 AVERAGE TRANSACTION</span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Rp 48.500</h3>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>+4.2% <span style={{ color: '#9CA3AF', fontWeight: '500' }}>vs last month</span></span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>🧬 LOYALTY RATE</span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>64%</h3>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>+2.1% <span style={{ color: '#9CA3AF', fontWeight: '500' }}>from new members</span></span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>⏰ PEAK HOURS</span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>08:00 – 11:00</h3>
                  <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: '500' }}>Account for <strong>42%</strong> of daily sales</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}