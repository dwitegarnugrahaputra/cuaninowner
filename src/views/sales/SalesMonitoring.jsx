import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, Calendar, Download, TrendingUp, TrendingDown,
  AlertTriangle, Shield, ArrowRight, MessageSquare, LogOut, ChevronDown, ChevronUp, Store, Sliders, ShieldCheck
} from 'lucide-react';

// Import komponen form internal settings yang sudah kita desentralisasikan
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';

// Logo cuanin.id versi mini murni CSS, presisi untuk Sidebar & Smart Cards
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

export default function SalesMonitoring({ onNavigateView }) {
  const { logout } = useAuth();
  const currentView = 'sales';

  // State kendali interaksi UI internal untuk collapse sidebar dan pop-down settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);

  {/* KUNCI SINKRONISASI WORKSPACE: 'sales-table' VS 'info-outlet' VS 'konfigurasi-ai' */}
  const [activeSubView, setActiveSubView] = useState('sales-table');

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
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
        
        {/* Header Branding Sidebar dengan Trigger Collapse */}
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
              <div>
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

        {/* Menu Utama List - Sidebar TETAP STAY HIGHLIGHTED DI SALES */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: isMainSidebarOpen ? '0 16px' : '0' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard', action: () => onNavigateView('dashboard') },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales', action: () => setActiveSubView('sales-table') }, 
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock', action: () => onNavigateView('stock') },
            { name: 'Menu Management', icon: <Menu size={18} />, target: 'menu', action: () => onNavigateView('menu') },
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff', action: () => onNavigateView('staff') }
          ].map((menu, idx) => {
            const isActive = currentView === menu.target;

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
                  transform: (isActive && isMainSidebarOpen) ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {menu.icon} {isMainSidebarOpen && <span style={{ fontSize: '14px' }}>{menu.name}</span>}
              </div>
            );
          })}
        </div>

        {/* Footer Sidebar Area dengan Akordion Settings, Logout, dan Info Toko */}
        <div style={{ padding: isMainSidebarOpen ? '0 16px' : '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          
          {/* Tombol Settings Utama */}
          <div 
            onClick={() => isMainSidebarOpen ? setIsSettingsOpen(!isSettingsOpen) : setIsMainSidebarOpen(true)} 
            title={!isMainSidebarOpen ? 'Settings' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isMainSidebarOpen ? 'space-between' : 'center', 
              padding: '12px 16px', 
              color: isSettingsOpen || activeSubView !== 'sales-table' ? '#ffffff' : '#93C5FD', 
              backgroundColor: isSettingsOpen || activeSubView !== 'sales-table' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {isMainSidebarOpen && (isSettingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </div>

          {/* Sub-menu Akordion Pop-down Settings */}
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
                
                {/* FIX HANDLER KLIK SINKRON: Mengaktifkan pemetaan halaman internal dashboard */}
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

          {/* Tombol Logout Mandiri */}
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
            <LogOut size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: '500' }}>Logout</span>}
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
        
        {/* TOPBAR HEADER AREA */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search analytics, financial reports, or menu items..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* FIX KAWIN PROPS: Menghubungkan Ask Brainy langsung ke modul chat AI secara presisi */}
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <MessageSquare size={16} /> Ask Brainy
            </button>
            
            <div onClick={() => alert('Notifikasi')} style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Bell size={20} color="#4B5563" />
            </div>
            <HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            
            {/* Profil Data Identitas Alex Graham */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>Alex Graham</p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>ADMINISTRATOR</span>
              </div>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '50%', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>

        {/* CONTEN CONTAINER VIEW (SCROLLABLE DYNAMIC CHANGER) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
          
          {/* ================= KONDISI 1: TAMPILKAN FORM INFO OUTLET SECARA INTERNAL ================= */}
          {activeSubView === 'info-outlet' && (
            <InfoOutlet onSaveSuccess={() => { alert('Data Outlet Berhasil Diperbarui!'); setActiveSubView('sales-table'); }} />
          )}

          {/* ================= KONDISI 2: TAMPILKAN FORM KONFIGURASI AI SECARA INTERNAL ================= */}
          {activeSubView === 'konfigurasi-ai' && (
            <KonfigurasiAI onSaveSuccess={() => { alert('Parameter Brainy POS Berhasil Disimpan!'); setActiveSubView('sales-table'); }} />
          )}

          {/* ================= KONDISI 3: DATA ASLI MONITORING PENJUALAN UTUH ================= */}
          {activeSubView === 'sales-table' && (
            <>
              {/* TITLE & FILTER BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Sales Monitoring</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time insights for Warung Kopi Jaya</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', color: '#4B5563', fontWeight: 'bold' }}>
                    <Calendar size={16} /> <span>Today, Oct 24</span>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {/* THREE HEAD ROW SUMMARY CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💵</div>
                    <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12}/> 12.5%</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Today's Revenue</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>Rp 14.250.000</h2>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '18px' }}>🧾</div>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Total Transactions</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>342 TXs</h2>
                  <span style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>⏰ Peak Hour: 12:00 - 13:00</span>
                </div>

                <div style={{ backgroundColor: '#991B1B', padding: '24px', borderRadius: '16px', color: '#ffffff', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={20} color="#fff" /></div>
                    <span style={{ backgroundColor: '#ffffff', color: '#991B1B', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', letterSpacing: '0.5px' }}>CRITICAL</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#FCA5A5', fontWeight: '500' }}>Void Alerts</span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: 'bold' }}>4 Alerts</h2>
                  <span style={{ fontSize: '11px', color: '#FCA5A5', display: 'block', marginTop: '6px' }}>Action required for Cashier #2</span>
                </div>
              </div>

              {/* LOWER SECTION LAYOUT MIX */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}><h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Live Transaction Feed</h3><span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}><div style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }} /> LIVE UPDATING</span></div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', fontWeight: 'bold' }}><th style={{ padding: '12px 8px' }}>TIME</th><th style={{ padding: '12px 8px' }}>TX ID</th><th style={{ padding: '12px 8px' }}>CASHIER</th><th style={{ padding: '12px 8px' }}>TOTAL (RP)</th><th style={{ padding: '12px 8px', textAlign: 'right' }}>STATUS</th></tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}><td style={{ padding: '14px 8px', color: '#6B7280' }}>14:45</td><td style={{ padding: '14px 8px', fontWeight: '500' }}>TX-90215</td><td style={{ padding: '14px 8px' }}>Andi S.</td><td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp 125.000</td><td style={{ padding: '14px 8px', textAlign: 'right' }}><span style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>SUCCESS</span></td></tr>
                      <tr style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: '#FEF2F2', color: '#991B1B' }}><td style={{ padding: '14px 8px', fontWeight: '500' }}>14:42</td><td style={{ padding: '14px 8px', fontWeight: 'bold', textDecoration: 'line-through' }}>TX-90212</td><td style={{ padding: '14px 8px', fontWeight: '500' }}>Dani P.</td><td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp 450.000</td><td style={{ padding: '14px 8px', textAlign: 'right' }}><span style={{ backgroundColor: '#DC2626', color: '#ffffff', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>VOID</span></td></tr>
                      <tr style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}><td style={{ padding: '14px 8px', color: '#6B7280' }}>14:38</td><td style={{ padding: '14px 8px', fontWeight: '500' }}>TX-90211</td><td style={{ padding: '14px 8px' }}>Siti R.</td><td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp 82.500</td><td style={{ padding: '14px 8px', textAlign: 'right' }}><span style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>SUCCESS</span></td></tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Cashier Performance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[{ rank: 1, name: 'Andi S.', orders: '128 ORDERS', sales: 'Rp 5.2M', color: '#FBBF24', bg: '#FEF3C7' }, { rank: 2, name: 'Siti R.', orders: '94 ORDERS', sales: 'Rp 3.8M', color: '#9CA3AF', bg: '#F3F4F6' }].map((cashier, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '28px', height: '28px', backgroundColor: cashier.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: cashier.color }}>{cashier.rank}</div><div><p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{cashier.name}</p><span style={{ fontSize: '10px', color: '#9CA3AF' }}>{cashier.orders}</span></div></div>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: cashier.rank === 1 ? '#10B981' : '#111827' }}>{cashier.sales}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* LOWER BANNER: AI FRAUD ANALYTICS ENGINE */}
              <div style={{ backgroundColor: '#0B1530', borderRadius: '20px', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><div style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={12} /> FRAUD ANALYTICS ENGINE</div><h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold' }}>Secure your business with AI</h2><p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF', maxWidth: '520px' }}>Brainy is actively monitoring your transaction patterns for anomalies, double voids, and cashier fraud tendencies in real-time.</p></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}><div style={{ textAlign: 'center' }}><div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'conic-gradient(#10B981 0% 14%, #1E293B 14% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}><div style={{ width: '50px', height: '50px', backgroundColor: '#0B1530', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>14%</div></div><span style={{ fontSize: '10px', color: '#9CA3AF' }}>Anomaly Score</span></div><div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>● Risk Detection: Active</span><button style={{ backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><span>Investigate Pattern</span> <ArrowRight size={14} /></button></div></div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}