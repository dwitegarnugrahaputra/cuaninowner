import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, Calendar, Download, TrendingUp, TrendingDown,
  AlertTriangle, Shield, ArrowRight, MessageSquare, LogOut, ChevronDown, ChevronUp, Store, Sliders, ShieldCheck, User, Key, Globe
} from 'lucide-react';

// Impor koneksi client Supabase murni 
import { supabase } from '../../config/supabaseClient';

// Import komponen form internal settings yang sudah kita desentralisasikan
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';
import Keamanan from '../settings/Keamanan.jsx';
import Bahasa from '../settings/Bahasa.jsx';
import EditProfile from '../dashboard/EditProfile.jsx'; 

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
  
  {/* State pengontrol buka-tutup dropdown mengambang profil topbar */}
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  {/* WORKSPACE ENGINE POINTER: 'sales-table' VS 'info-outlet' VS 'konfigurasi-ai' VS 'keamanan' VS 'bahasa' VS 'edit-profile' */}
  const [activeSubView, setActiveSubView] = useState('sales-table');

  // ================= STATE INTEGRASI DATABASE SUPABASE =================
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    todayRevenue: 0,
    totalTransactions: 0,
    voidAlerts: 0
  });

  // Fetch data jualan dari Supabase secara reaktif
  useEffect(() => {
    async function fetchSalesData() {
      if (activeSubView !== 'sales-table') return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sales_transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setTransactions(data);
          
          // Kalkulasi matematika agregasi data untuk mengisi Smart Cards secara otomatis
          const revenue = data
            .filter(tx => tx.status === 'Completed' || tx.status === 'SUCCESS')
            .reduce((sum, tx) => sum + Number(tx.total_amount), 0);

          const voids = data.filter(tx => tx.status === 'VOID' || tx.status === 'Critical').length;

          setSummary({
            todayRevenue: revenue,
            totalTransactions: data.length,
            voidAlerts: voids
          });
        }
      } catch (err) {
        console.error('⚠️ Gagal memuat data live sales dari Supabase:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSalesData();
  }, [activeSubView]);

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
          justify: isMainSidebarOpen ? 'space-between' : 'center', 
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
            const isActive = currentView === menu.target && activeSubView === 'sales-table';

            return (
              <div 
                key={idx} 
                onClick={menu.action} 
                title={!isMainSidebarOpen ? menu.name : ''}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: isMainSidebarOpen ? 'flex-start' : 'center',
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
              justify: isMainSidebarOpen ? 'space-between' : 'center', 
              padding: '12px 16px', 
              color: isSettingsOpen || (activeSubView !== 'sales-table' && activeSubView !== 'edit-profile') ? '#ffffff' : '#93C5FD', 
              backgroundColor: isSettingsOpen || (activeSubView !== 'sales-table' && activeSubView !== 'edit-profile') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {isMainSidebarOpen && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <ChevronDown size={14} />
              </div>
            )}
          </div>

          {/* Sub-menu Akordion Pop-down Settings */}
          {isMainSidebarOpen && isSettingsOpen && (
            <div style={{
              maxHeight: '200px',
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
                { name: 'Keamanan', icon: <ShieldCheck size={14} />, target: 'keamanan' },
                { name: 'Bahasa', icon: <Globe size={14} />, target: 'bahasa' }
              ].map((sub, i) => {
                const isSubActive = activeSubView === sub.target;
                
                return (
                  <div 
                    key={i}
                    onClick={() => setActiveSubView(sub.target)}
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
              justify: isMainSidebarOpen ? 'flex-start' : 'center',
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
            justify: isMainSidebarOpen ? 'flex-start' : 'center',
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
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search analytics, financial reports, or menu items..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <MessageSquare size={16} /> Ask Brainy
            </button>
            
            <div onClick={() => alert('Notifikasi')} style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Bell size={20} color="#4B5563" />
            </div>
            <HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            
            {/* Profil Data Identitas OWNER */}
            <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px', cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Alex Graham {isProfileOpen ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                </p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>OWNER</span>
              </div>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '50%', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* FLOATING DROPDOWN PROFIL POPUP */}
            <div style={{
              position: 'absolute', top: '55px', right: '0px', width: '220px', backgroundColor: '#ffffff',
              borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 100, display: isProfileOpen ? 'flex' : 'none', flexDirection: 'column', padding: '6px', boxSizing: 'border-box'
            }}>
              <div onClick={() => { setActiveSubView('edit-profile'); setIsProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#006847'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                <User size={14} /> <span style={{ fontWeight: '500' }}>Edit Profile</span>
              </div>
              <div onClick={() => { setActiveSubView('keamanan'); setIsProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#006847'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                <Shield size={14} /> <span style={{ fontWeight: '500' }}>Account Security</span>
              </div>
              <div onClick={() => alert('API Credentials')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#006847'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                <Key size={14} /> <span style={{ fontWeight: '500' }}>API Credentials</span>
              </div>
            </div>

          </div>
        </div>

        {/* CONTEN CONTAINER VIEW (SCROLLABLE DYNAMIC CHANGER) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', position: 'relative' }}>
          
          {/* SINKRONISASI REAKTIF LOADING LAYOVER BOX */}
          {isLoading && activeSubView === 'sales-table' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(248, 249, 250, 0.7)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#006847' }}>
              🔄 Memuat Transaksi Penjualan dari Supabase...
            </div>
          )}

          {/* ================= KONDISI 1: TAMPILKAN FORM INFO OUTLET SECARA INTERNAL ================= */}
          {activeSubView === 'info-outlet' && (
            <InfoOutlet onSaveSuccess={() => { alert('Data Outlet Berhasil Diperbarui!'); setActiveSubView('sales-table'); }} />
          )}

          {/* ================= KONDISI 2: TAMPILKAN FORM KONFIGURASI AI SECARA INTERNAL ================= */}
          {activeSubView === 'konfigurasi-ai' && (
            <KonfigurasiAI onSaveSuccess={() => { alert('Parameter Brainy POS Berhasil Disimpan!'); setActiveSubView('sales-table'); }} />
          )}

          {/* ================= KONDISI 3: TAMPILKAN FORM KEAMANAN SYSTEM SECARA INTERNAL ================= */}
          {activeSubView === 'keamanan' && (
            <Keamanan onSaveSuccess={() => { alert('Kebijakan Aturan Keamanan Berhasil Diperbarui!'); setActiveSubView('sales-table'); }} />
          )}

          {/* ================= KONDISI 3.5: FORM INTERNAL BAHASA SYSTEM ================= */}
          {activeSubView === 'bahasa' && (
            <Bahasa onSaveSuccess={() => { alert('Pengaturan Bahasa Berhasil Diterapkan!'); setActiveSubView('sales-table'); }} />
          )}

          {/* ================= KONDISI 3.8: FORM INTERNAL EDIT PROFILE PENGGUNA ================= */}
          {activeSubView === 'edit-profile' && (
            <EditProfile onSaveSuccess={() => setActiveSubView('sales-table')} />
          )}

          {/* ================= KONDISI 4: DATA LIVE MONITORING PENJUALAN UTUH ================= */}
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
                    <Calendar size={16} /> <span>Live Feed Stream</span>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {/* THREE HEAD ROW SUMMARY CARDS (AGREGASI LIVE DATABASE) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💵</div>
                    <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12}/> Live</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Live Aggregate Revenue</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>
                    Rp {summary.todayRevenue.toLocaleString('id-ID')}
                  </h2>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '18px' }}>🧾</div>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Total Live Volume</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>
                    {summary.totalTransactions} TXs
                  </h2>
                  <span style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>⏰ Synchronized Stream</span>
                </div>

                <div style={{ backgroundColor: summary.voidAlerts > 0 ? '#991B1B' : '#0B1530', padding: '24px', borderRadius: '16px', color: '#ffffff', position: 'relative', transition: 'background-color 0.3s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={20} color="#fff" /></div>
                    <span style={{ backgroundColor: '#ffffff', color: summary.voidAlerts > 0 ? '#991B1B' : '#0B1530', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                      {summary.voidAlerts > 0 ? 'CRITICAL' : 'SECURE'}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#FFCACA', fontWeight: '500' }}>Void / Alert Records</span>
                  <h2 style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: 'bold' }}>{summary.voidAlerts} Alerts</h2>
                  <span style={{ fontSize: '11px', color: '#FCA5A5', display: 'block', marginTop: '6px' }}>
                    {summary.voidAlerts > 0 ? 'Action required for Cashier logs' : 'No pattern anomalies detected'}
                  </span>
                </div>
              </div>

              {/* LOWER SECTION LAYOUT MIX (LIVE TRANSACTION FEED FROM TABLE_TRANSACTIONS) */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Live Transaction Feed</h3>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }} /> DATABASE CONNECTED
                    </span>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', fontWeight: 'bold' }}>
                        <th style={{ padding: '12px 8px' }}>TIME / DATE</th>
                        <th style={{ padding: '12px 8px' }}>INVOICE ID</th>
                        <th style={{ padding: '12px 8px' }}>CUSTOMER NAME</th>
                        <th style={{ padding: '12px 8px' }}>TOTAL AMOUNT</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? (
                        transactions.map((tx) => {
                          const isVoid = tx.status === 'VOID' || tx.status === 'Critical';
                          const formattedTime = new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                          
                          return (
                            <tr key={tx.id} style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: isVoid ? '#FEF2F2' : 'transparent', color: isVoid ? '#991B1B' : '#111827' }}>
                              <td style={{ padding: '14px 8px', color: '#6B7280' }}>{formattedTime}</td>
                              <td style={{ padding: '14px 8px', fontWeight: '500' }}>{tx.invoice_number}</td>
                              <td style={{ padding: '14px 8px' }}>{tx.customer_name || 'General Customer'}</td>
                              <td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp {Number(tx.total_amount).toLocaleString('id-ID')}</td>
                              <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                                <span style={{ 
                                  backgroundColor: isVoid ? '#DC2626' : '#E6F4EA', 
                                  color: isVoid ? '#ffffff' : '#006847', 
                                  padding: '4px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', minWidth: '65px' 
                                }}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontWeight: '500' }}>
                            Belum ada riwayat transaksi penjualan di Supabase.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* CASHIER PERFORMANCE BOARD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Cashier Performance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[{ rank: 1, name: 'Andi S.', orders: '128 ORDERS', sales: 'Rp 5.2M', color: '#FBBF24', bg: '#FEF3C7' }, { rank: 2, name: 'Siti R.', orders: '94 ORDERS', sales: 'Rp 3.8M', color: '#9CA3AF', bg: '#F3F4F6' }].map((cashier, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '28px', height: '28px', backgroundColor: cashier.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: cashier.color }}>{cashier.rank}</div><div><p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{cashier.name}</p><span style={{ fontSize: '10px', color: '#9CA3AF' }}>{cashier.orders}</span></div></div>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: cashier.rank === 1 ? '#10B981' : '#111827' }}>{cashier.sales}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ⚡ LOGIKA CONDITIONAL RENDERING CONDITIONAL: HANYA MUNCUL JIKA ADA FRAUD/VOID NYATA DI DATABASE */}
              {summary.voidAlerts > 0 && (
                <div style={{ backgroundColor: '#0B1530', borderRadius: '20px', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', marginTop: '4px', animation: 'fadeIn 0.4s ease' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={12} /> FRAUD ANALYTICS ALERT
                    </div>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold' }}>Anomalous Pattern Detected!</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF', maxWidth: '520px' }}>
                      Brainy POS berhasil mengidentifikasi {summary.voidAlerts} aktivitas janggal pada riwayat penutupan kasir. Segera lakukan peninjauan log data.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'conic-gradient(#DC2626 0% 65%, #1E293B 65% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#0B1530', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#EF4444' }}>65%</div>
                      </div>
                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Risk Score</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 'bold' }}>● Status: High Danger</span>
                      <button style={{ backgroundColor: '#DC2626', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <span>Investigate Pattern</span> <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}