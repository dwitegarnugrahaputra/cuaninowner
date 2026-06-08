import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu as MenuIcon, Users, Settings, 
  Search, Bell, HelpCircle, Plus, Layers, AlertTriangle, Grid, SlidersHorizontal,
  Edit2, Trash2, ChevronLeft, ChevronRight, MessageSquare, X, Info, FileSpreadsheet,
  ImageIcon, Trash, Save, TrendingUp, LogOut, ChevronDown, ChevronUp, Store, Sliders, ShieldCheck
} from 'lucide-react';

// Import komponen form internal settings yang sudah kita desentralisasikan
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';
import Keamanan from '../settings/Keamanan.jsx';

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

export default function MenuManagement({ onNavigateView }) {
  const { logout } = useAuth();
  const currentView = 'menu';
  
  // State Manajemen Kontrol Popup Modal Tambah Menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Coffee');

  // State kendali interaksi UI internal untuk collapse sidebar dan pop-down settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);

  {/* KUNCI SINKRONISASI WORKSPACE: 'menu-table' VS 'info-outlet' VS 'konfigurasi-ai' VS 'keamanan' */}
  const [activeSubView, setActiveSubView] = useState('menu-table');

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0, position: 'relative' }}>
      
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
              <MenuIcon size={16} color="#93C5FD" />
            </div>
          )}
        </div>

        {/* Menu Utama List - Sidebar TETAP STAY HIGHLIGHTED DI MENU MANAGEMENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: isMainSidebarOpen ? '0 16px' : '0' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard', action: () => onNavigateView('dashboard') },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales', action: () => onNavigateView('sales') },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock', action: () => onNavigateView('stock') },
            { name: 'Menu Management', icon: <MenuIcon size={18} />, target: 'menu', action: () => setActiveSubView('menu-table') }, 
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
              color: isSettingsOpen || activeSubView !== 'menu-table' ? '#ffffff' : '#93C5FD', 
              backgroundColor: isSettingsOpen || activeSubView !== 'menu-table' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
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
                
                const handleSubMenuClick = () => {
                  if (sub.target === 'info-outlet' || sub.target === 'konfigurasi-ai' || sub.target === 'keamanan') {
                    setActiveSubView(sub.target);
                    // setIsSettingsOpen(false);
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
                <span style={{ fontSize: '10px', color: '#93C5FD', fontWeight: '500' }}>PREMIUM</span>
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
            <input type="text" placeholder="Search menu items, orders..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <MessageSquare size={16} /> Ask Brainy
            </button>
            <Bell size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            <HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>Alex Graham</p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>ADMINISTRATOR</span>
              </div>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* CONTAINER CONTENT VIEW */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
          
          {/* ================= KONDISI 1: TAMPILKAN FORM INFO OUTLET SECARA INTERNAL ================= */}
          {activeSubView === 'info-outlet' && (
            <InfoOutlet onSaveSuccess={() => { alert('Data Outlet Berhasil Diperbarui!'); setActiveSubView('menu-table'); }} />
          )}

          {/* ================= KONDISI 2: TAMPILKAN FORM KONFIGURASI AI SECARA INTERNAL ================= */}
          {activeSubView === 'konfigurasi-ai' && (
            <KonfigurasiAI onSaveSuccess={() => { alert('Parameter Brainy POS Berhasil Disimpan!'); setActiveSubView('menu-table'); }} />
          )}

          {/* ================= KONDISI 3: TAMPILKAN FORM KEAMANAN SYSTEM SECARA INTERNAL ================= */}
          {activeSubView === 'keamanan' && (
            <Keamanan onSaveSuccess={() => { alert('Kebijakan Aturan Keamanan Berhasil Diperbarui!'); setActiveSubView('menu-table'); }} />
          )}

          {/* ================= KONDISI 4: KONTEN ASLI KATALOG MENU UTUH ================= */}
          {activeSubView === 'menu-table' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Menu Management</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Configure and monitor your restaurant menu catalog.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,104,71,0.2)' }}>
                  <Plus size={16} /> Add New Item
                </button>
              </div>

              {/* THREE HEAD METRICS CARDS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#E6F4EA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📋</div>
                  <div><span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Total Items</span><h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>124</h2></div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#EEF2FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎲</div>
                  <div><span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Active Categories</span><h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>12</h2></div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#FEE2E2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={22} /></div>
                  <div><span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Out of Stock</span><h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>8</h2></div>
                </div>
              </div>

              {/* ACTIVE MENU CATALOG TABLE */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Active Menu</h3>
                  <div style={{ display: 'flex', gap: '10px', color: '#6B7280' }}>
                    <div style={{ padding: '6px', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><SlidersHorizontal size={16} /></div>
                    <div style={{ padding: '6px', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6' }}><Grid size={16} /></div>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>
                      <th style={{ padding: '14px 24px' }}>ITEM DETAILS</th>
                      <th style={{ padding: '14px 24px' }}>CATEGORY</th>
                      <th style={{ padding: '14px 24px' }}>PRICE</th>
                      <th style={{ padding: '14px 24px' }}>STATUS</th>
                      <th style={{ padding: '14px 24px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Nasi Goreng Special', sku: 'MC-001', cat: 'Main Course', price: 'Rp 35.000', stat: 'Available', available: true, img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=120' },
                      { name: 'Es Teh Manis Kristal', sku: 'BV-042', cat: 'Beverages', price: 'Rp 8.000', stat: 'Available', available: true, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=120' }
                    ].map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={item.img} alt={item.name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                            <div><p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{item.name}</p><span style={{ fontSize: '11px', color: '#9CA3AF' }}>SKU: {item.sku}</span></div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}><span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '6px 12px', borderRadius: '20px', fontSize: '11px' }}>{item.cat}</span></td>
                        <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{item.price}</td>
                        <td style={{ padding: '16px 24px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: '#059669' }}><div style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }} />{item.stat}</span></td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', color: '#9CA3AF' }}><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}><Edit2 size={16} style={{ cursor: 'pointer' }} /><Trash2 size={16} style={{ cursor: 'pointer' }} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ================= WINDOW POPUP OVERLAY ADD NEW ITEM ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#111827' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Tambah Menu Baru</h2>
              </div>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={14}/> Informasi Dasar</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Menu</label>
                      <input type="text" placeholder="Contoh: Iced Caramel Latte" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Harga Jual (Rp)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Rp</span>
                          <input type="number" defaultValue="0" style={{ width: '100%', padding: '10px 14px 10px 34px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {['Coffee', 'Non-Coffee', 'Food', 'Pastry'].map((cat) => (
                            <span 
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              style={{ 
                                padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                                backgroundColor: selectedCategory === cat ? '#006847' : '#E5E7EB',
                                color: selectedCategory === cat ? '#ffffff' : '#4B5563'
                              }}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={14}/> Pemetaan Resep</h4>
                    <span style={{ color: '#006847', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}><Plus size={14}/> Tambah Bahan</span>
                  </div>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', backgroundColor: '#F3F4F6', padding: '8px 12px', fontWeight: 'bold', color: '#4B5563' }}>
                      <span>Bahan Baku</span>
                      <span>Qty</span>
                      <span>Cost (Rp)</span>
                      <span></span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', padding: '12px', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
                      <select style={{ border: '1px solid #D1D5DB', padding: '6px', borderRadius: '6px', backgroundColor: '#FFF', fontSize: '12px', outline: 'none' }}><option>Espresso Blend 1kg</option></select>
                      <input type="text" defaultValue="30ml" style={{ width: '80%', border: '1px solid #D1D5DB', padding: '6px', borderRadius: '6px', fontSize: '12px', outline: 'none', textAlign: 'center' }} />
                      <span style={{ fontWeight: 'bold', color: '#111827', paddingLeft: '6px' }}>4.500</span>
                      <Trash size={14} color="#DC2626" style={{ cursor: 'pointer', justifySelf: 'center' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', padding: '12px', alignItems: 'center' }}>
                      <select style={{ border: '1px solid #D1D5DB', padding: '6px', borderRadius: '6px', backgroundColor: '#FFF', fontSize: '12px', outline: 'none' }}><option>Fresh Milk 1L</option></select>
                      <input type="text" defaultValue="150ml" style={{ width: '80%', border: '1px solid #D1D5DB', padding: '6px', borderRadius: '6px', fontSize: '12px', outline: 'none', textAlign: 'center' }} />
                      <span style={{ fontWeight: 'bold', color: '#111827', paddingLeft: '6px' }}>3.200</span>
                      <Trash size={14} color="#DC2626" style={{ cursor: 'pointer', justifySelf: 'center' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ border: '1px dashed #D1D5DB', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '170px', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}><ImageIcon size={18} color="#6B7280" /></div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>Unggah Foto (1:1)</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Maks. 2MB, JPG atau PNG</span>
                </div>

                <div style={{ backgroundColor: '#06163A', borderRadius: '14px', padding: '20px', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#34D399' }}><Layers size={16}/> Profit Analysis</div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>ESTIMATED COGS</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Rp 7.700</h3>
                      <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>High Cost</span>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>PROJECTED MARGIN</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#34D399' }}>68%</h2>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', fontSize: '12px' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ color: '#9CA3AF', display: 'block', fontSize: '10px' }}>TOTAL MODAL</span>
                      <strong style={{ display: 'block', marginTop: '2px' }}>Rp 7.700</strong>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ color: '#9CA3AF', display: 'block', fontSize: '10px' }}>MARGIN PROFIT</span>
                      <strong style={{ display: 'block', marginTop: '2px', color: '#34D399' }}>Rp 16.300</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button onClick={() => { alert('Data Mockup Menu Berhasil Disimpan!'); setIsModalOpen(false); }} style={{ padding: '10px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Simpan Menu</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}