import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, Plus, MoreVertical, Filter, ArrowUpDown,
  ChevronLeft, ChevronRight, MessageSquare, UserPlus, Users2, UserCheck, 
  CalendarDays, X, ImageIcon, Save, Lock, LogOut, ChevronDown, ChevronUp, Store, Sliders, ShieldCheck
} from 'lucide-react';

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

export default function StaffManagement({ onNavigateView }) {
  const { logout } = useAuth();
  const currentView = 'staff';

  // State kendali interaksi UI internal (Modal, Role, dan Collapsible Sidebar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Manager');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);

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
              <Menu size={16} color="#93C5FD" />
            </div>
          )}
        </div>

        {/* Menu Items List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: isMainSidebarOpen ? '0 16px' : '0' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard' },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales' },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock' },
            { name: 'Menu Management', icon: <Menu size={18} />, target: 'menu' },
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff' }
          ].map((menu, idx) => {
            const isActive = currentView === menu.target;

            return (
              <div 
                key={idx} 
                onClick={() => onNavigateView(menu.target)} 
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
              color: isSettingsOpen ? '#ffffff' : '#93C5FD', 
              backgroundColor: isSettingsOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {isMainSidebarOpen && (isSettingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </div>

          {/* Sub-menu Akordion Pop-down Settings */}
          {isMainSidebarOpen && (
            <div style={{
              maxHeight: isSettingsOpen ? '150px' : '0px',
              overflow: 'hidden',
              transition: 'all 0.4s ease-in-out',
              opacity: isSettingsOpen ? 1 : 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingLeft: '14px',
              marginBottom: isSettingsOpen ? '4px' : '0px'
            }}>
              {[
                { name: 'Info Outlet', icon: <Store size={14} />, action: () => alert('Buka Pengaturan Outlet Kopi Jaya') },
                { name: 'Konfigurasi AI', icon: <Sliders size={14} />, action: () => alert('Buka Parameter Brainy POS') },
                { name: 'Keamanan', icon: <ShieldCheck size={14} />, action: () => alert('Buka Enkripsi Akses Kasir') }
              ].map((sub, i) => (
                <div 
                  key={i}
                  onClick={sub.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', 
                    borderRadius: '8px', color: '#93C5FD', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#93C5FD'; }}
                >
                  {sub.icon} <span>{sub.name}</span>
                </div>
              ))}
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
            <input type="text" placeholder="Search team members by name or email..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Staff Management</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Manage access and information for your team members efficiently.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,104,71,0.2)' }}>
              <UserPlus size={16} /> Add New Staff
            </button>
          </div>

          {/* THREE METRICS CARDS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>Total Staff</span>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users2 size={16} /></div>
              </div>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>12</h2>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>+1 this month</span>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>Active Staff</span>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#EEF2FF', color: '#4F46E5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={16} /></div>
              </div>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>10<span style={{ color: '#9CA3AF', fontSize: '16px', fontWeight: '500' }}>/12</span></h2>
              <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginTop: '6px' }}>currently online</span>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>On Leave</span>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarDays size={16} /></div>
              </div>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>2</h2>
              <span style={{ fontSize: '11px', color: '#E53E3E', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>Today</span>
            </div>
          </div>

          {/* STAFF TABLE CATALOG */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '320px' }}>
                <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                <input type="text" placeholder="Search team members..." style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', outline: 'none', backgroundColor: '#F9FAFB' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}><Filter size={14}/> Filter</button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}><ArrowUpDown size={14}/> Sort</button>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>
                  <th style={{ padding: '14px 24px' }}>Name</th>
                  <th style={{ padding: '14px 24px' }}>Role</th>
                  <th style={{ padding: '14px 24px' }}>Email</th>
                  <th style={{ padding: '14px 24px' }}>Status</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Jordan Smith', join: 'Joined Oct 2023', role: 'MANAGER', roleBg: '#EEF2FF', roleColor: '#4F46E5', email: 'jordan.s@cuanin.id', status: 'Active', isLeave: false, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100' },
                  { name: 'Casey Wong', join: 'Joined Jan 2024', role: 'BARISTA', roleBg: '#F3F4F6', roleColor: '#4B5563', email: 'casey.w@cuanin.id', status: 'On Leave', isLeave: true, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100' }
                ].map((staff, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img src={staff.img} alt={staff.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div><p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{staff.name}</p><span style={{ fontSize: '11px', color: '#9CA3AF' }}>{staff.join}</span></div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px' }}><span style={{ backgroundColor: staff.roleBg, color: staff.roleColor, padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>{staff.role}</span></td>
                    <td style={{ padding: '14px 24px', color: '#4B5563' }}>{staff.email}</td>
                    <td style={{ padding: '14px 24px' }}><span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: staff.isLeave ? '#D97706' : '#059669' }}><div style={{ width: '6px', height: '6px', backgroundColor: staff.isLeave ? '#FBBF24' : '#10B981', borderRadius: '50%' }} />{staff.status}</span></td>
                    <td style={{ padding: '14px 24px', textAlign: 'right', color: '#9CA3AF' }}><MoreVertical size={16} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =======================================================================
          ========= MODAL OVERLAY: ACCOUNT PASSWORD CREATION SECTOR =========
          ======================================================================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          
          <div style={{ width: '480px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Header Modal */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Tambah Staf Baru</h2>
              <X size={18} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            {/* Form Body Fields Container */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}>
              
              {/* Lingkaran Upload Foto */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '0 auto 6px auto' }}>
                <div style={{ width: '80px', height: '80px', border: '1px dashed #D1D5DB', borderRadius: '50%', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '4px' }}>
                  <ImageIcon size={18} color="#9CA3AF" />
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#6B7280' }}>UPLOAD</span>
                </div>
                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Format: JPG, PNG (Max 2MB)</span>
              </div>

              {/* Input Nama Lengkap */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Lengkap</label>
                <input type="text" placeholder="Masukkan nama lengkap staf" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Selektor Tombol Peran (Role) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>Peran (Role)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Manager', 'Barista', 'Kasir'].map((role) => (
                    <span
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      style={{
                        padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: selectedRole === role ? '#006847' : '#E5E7EB',
                        color: selectedRole === role ? '#ffffff' : '#4B5563'
                      }}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Input Baris Grid: Email & Telepon */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Alamat Email</label>
                  <input type="email" placeholder="contoh@cuanin.id" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Nomor Telepon</label>
                  <input type="text" placeholder="0812xxxx" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* INTEGRATED PASSWORD FOR ACCOUNT CREATION */}
              <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Buat Password Akun</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                  <input 
                    type="password" 
                    placeholder="Masukkan password untuk kredensial login staf" 
                    style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FCFDFD' }} 
                  />
                </div>
                <span style={{ fontSize: '10.5px', color: '#6B7280', marginTop: '4px', display: 'block' }}>*Password ini bakal digunain kru terkait pas pertama kali masuk aplikasi.</span>
              </div>

            </div>

            {/* Footer Modal Action Buttons */}
            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button onClick={() => { alert('Data Staf & Akun Login Berhasil Dibuat!'); setIsModalOpen(false); }} style={{ padding: '10px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Simpan Data Staf</button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}