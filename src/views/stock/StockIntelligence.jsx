import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings,
  Search, Bell, HelpCircle, TrendingUp, AlertTriangle, ShoppingCart,
  FileText, Edit2, SlidersHorizontal, Download, MessageSquare, AlertCircle, 
  LogOut, ChevronDown, ChevronUp, Store, Sliders, ShieldCheck, 
  User, Key, Globe, Shield // 👈 SUNTIKAN KATA INI DI SINI, GAR!
} from 'lucide-react';

// Import komponen form internal settings yang sudah kita desentralisasikan
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';
import Keamanan from '../settings/Keamanan.jsx';

// 🛠️ FIX IMPOR AMAN: Menambahkan impor Bahasa dan EditProfile agar tidak memicu ReferenceError/Blank Page
import Bahasa from '../settings/Bahasa.jsx'; 
import EditProfile from '../dashboard/EditProfile.jsx'; 

// Logo cuanin.id versi mini murni CSS, presisi untuk Sidebar & Smart Cards
function CuaninLogoMini() {
  return (
    <div style={{ width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '6px', flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '5px', padding: '3px 0px 3px 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '3px 0 0 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ffffff', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginRight: '-1px' }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006847', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StockIntelligence({ onNavigateView }) {
  const { logout } = useAuth();
  const currentView = 'stock';

  // State kendali interaksi UI internal untuk collapse sidebar dan pop-down settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  
  {/* 🛠️ STATE BARU: Pengontrol visibilitas popup menu mengambang dropdown topbar */}
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  {/* 🛠️ SINKRONISASI WORKSPACE ROUTE POINTER UTUH */}
  const [activeSubView, setActiveSubView] = useState('stock-table');

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'space-between' : 'center', padding: '0 20px', marginBottom: '32px', height: '40px' }}>
          <div onClick={() => !isMainSidebarOpen && setIsMainSidebarOpen(true)} style={{ cursor: !isMainSidebarOpen ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CuaninLogoMini />
            {isMainSidebarOpen && (
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
                <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
              </div>
            )}
          </div>
          {isMainSidebarOpen && (
            <div onClick={() => { setIsMainSidebarOpen(false); setIsSettingsOpen(false); }} style={{ cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Menu size={16} color="#93C5FD" />
            </div>
          )}
        </div>

        {/* Menu Utama List - SIDEBAR TETAP LOCK HIGHLIGHT DI MENU STOCK */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: isMainSidebarOpen ? '0 16px' : '0' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard', action: () => onNavigateView('dashboard') },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales', action: () => onNavigateView('sales') },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock', action: () => setActiveSubView('stock-table') },
            { name: 'Menu Management', icon: <Menu size={18} />, target: 'menu', action: () => onNavigateView('menu') },
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff', action: () => onNavigateView('staff') }
          ].map((menu, idx) => {
            const isActive = currentView === menu.target && activeSubView === 'stock-table';

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
              color: isSettingsOpen || (activeSubView !== 'stock-table' && activeSubView !== 'edit-profile') ? '#ffffff' : '#93C5FD',
              backgroundColor: isSettingsOpen || (activeSubView !== 'stock-table' && activeSubView !== 'edit-profile') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {/* 🛠️ SUNTIKAN ANIMASI ROTASI CHEVRON: Muter halus 180 derajat berbasis state akordion */}
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

          {/* 🛠️ SUNTIKAN ANIMASI POPDOWN: Buka-tutup transisi ketinggian smooth material design */}
          {isMainSidebarOpen && (
            <div style={{
              maxHeight: isSettingsOpen ? '200px' : '0px',
              opacity: isSettingsOpen ? 1 : 0,
              paddingTop: isSettingsOpen ? '4px' : '0px',
              paddingBottom: isSettingsOpen ? '4px' : '0px',
              overflow: 'hidden',
              transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, padding 0.3s ease',
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
       
        {/* TOPBAR HEADER AREA */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search stock, supplies, or reports..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <MessageSquare size={16} /> Ask Brainy
             </button>
            <Bell size={20} color="#4B5563" style={{ cursor: 'pointer' }} /><HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            
            {/* 🛠️ INTEGRASI TARGET PROFILE: Trigger klik pembawa identitas OWNER */}
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

            {/* 🛠️ INTEGRASI DROPDOWN POPUP FLOATING UTUH */}
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

        {/* CONTAINER CONTENT VIEW DYNAMIC CHANGER */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 100px 32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
         
          {activeSubView === 'info-outlet' && <InfoOutlet onSaveSuccess={() => setActiveSubView('stock-table')} />}
          {activeSubView === 'konfigurasi-ai' && <KonfigurasiAI onSaveSuccess={() => setActiveSubView('stock-table')} />}
          {activeSubView === 'keamanan' && <Keamanan onSaveSuccess={() => setActiveSubView('stock-table')} />}
          {activeSubView === 'bahasa' && <Bahasa onSaveSuccess={() => setActiveSubView('stock-table')} />}
          {activeSubView === 'edit-profile' && <EditProfile onSaveSuccess={() => setActiveSubView('stock-table')} />}

          {activeSubView === 'stock-table' && (
            <>
              {/* HEADER PAGE TITLE */}
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Stock Intelligence Hub</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time inventory insights and automated OCR processing.</p>
              </div>

              {/* THREE METRICS SUMMARY CARDS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📦</div>
                    <span style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px' }}>+5.2%</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Total Inventory Value (Rp)</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp 45.500.000</h2>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={18} /></div>
                    <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '8px' }}>Action Needed</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Critical Items (Count)</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>12 Items</h2>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={18} color="#4B5563" /></div>
                    <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '8px' }}>-1.5%</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Monthly Supply Spend</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp 12.300.000</h2>
                </div>
              </div>

              {/* LOWER TWO COLS MIX LAYOUT */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Live Inventory</h3>
                    <div style={{ display: 'flex', gap: '12px', color: '#6B7280' }}>
                      <SlidersHorizontal size={18} style={{ cursor: 'pointer' }} />
                      <Download size={18} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', fontWeight: 'bold' }}>
                        <th style={{ padding: '12px 8px' }}>NAMA BAHAN</th>
                        <th style={{ padding: '12px 8px' }}>KATEGORI</th>
                        <th style={{ padding: '12px 8px' }}>SISA STOK</th>
                        <th style={{ padding: '12px 8px' }}>SATUAN</th>
                        <th style={{ padding: '12px 8px' }}>STATUS</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { nama: 'Houseblend Coffee Beans', kat: 'Coffee', stok: '15.5', unit: 'kg', stat: 'AMAN', color: '#E6F4EA', text: '#006847' },
                        { nama: 'Full Cream Milk (Dairy Fresh)', kat: 'Dairy', stok: '4.0', unit: 'Litre', stat: 'MENIPIS', color: '#FFF7ED', text: '#D97706', alert: true },
                        { nama: 'Palm Sugar Liquid', kat: 'Sweetener', stok: '0.5', unit: 'Litre', stat: 'HABIS', color: '#FEE2E2', text: '#DC2626', alert: true },
                        { nama: 'Oat Milk (Oatside)', kat: 'Dairy', stok: '12.0', unit: 'Litre', stat: 'AMAN', color: '#E6F4EA', text: '#006847' }
                      ].map((row, idx) => (
                        <tr style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }} key={idx}>
                          <td style={{ padding: '14px 8px', fontWeight: 'bold', maxWidth: '180px' }}>{row.nama}</td>
                          <td style={{ padding: '14px 8px', color: '#6B7280' }}>{row.kat}</td>
                          <td style={{ padding: '14px 8px', fontWeight: 'bold', color: row.alert ? '#DC2626' : '#111827' }}>{row.stok}</td>
                          <td style={{ padding: '14px 8px', color: '#6B7280' }}>{row.unit}</td>
                          <td style={{ padding: '14px 8px' }}>
                            <span style={{ backgroundColor: row.color, color: row.text, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>{row.stat}</span>
                          </td>
                          <td style={{ padding: '14px 8px', textAlign: 'right', color: '#9CA3AF' }}><Edit2 size={14} style={{ cursor: 'pointer' }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Recent Supply Log</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    {[
                      { vendor: 'Dairy Fresh Co.', desc: '24L Full Cream Milk', time: 'Just now • OCR Scan', isOcr: true },
                      { vendor: 'Bean Masters', desc: '10kg Houseblend', time: '2 hours ago • OCR Scan', isOcr: true },
                      { vendor: 'Gula Melaka Hub', desc: '5L Liquid Sugar', time: 'Yesterday • Manual Entry', isOcr: false }
                    ].map((log, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={16} color="#6B7280" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{log.vendor}</h4>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>{log.desc}</p>
                          <span style={{ fontSize: '10px', color: log.isOcr ? '#10B981' : '#9CA3AF', fontWeight: '500', display: 'block', marginTop: '2px' }}>{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button style={{ width: '100%', padding: '10px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>View All Logs</button>
                </div>
              </div>

              {/* FLOATING POP-UP: BRAINY PROACTIVE INSIGHT NOTE */}
              <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 64px)', maxWidth: '640px', backgroundColor: '#111827', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', boxSizing: 'border-box', zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold', letterSpacing: '0.5px', display: 'block' }}>BRAINY INSIGHT</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#E5E7EB' }}>Stock for Full Cream Milk is projected to run out in 3 days. Create restock draft?</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <button onClick={() => alert('Draf diabaikan')} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#E5E7EB', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Ignore</button>
                  <button onClick={() => alert('Draf restok otomatis terbuat!')} style={{ backgroundColor: '#10B981', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Confirm</button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}