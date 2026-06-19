import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, ShoppingBag, Archive, Menu as MenuIcon, Users, LogOut } from 'lucide-react';

function CuaninLogoMini() {
  return (
    <div style={{ width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '5px', paddingLeft: '3px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '3px 0 0 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ffffff', borderRadius: '3px', marginRight: '-1px' }} />
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ onNavigateView, activeView }) {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'sales', label: 'Sales', icon: <ShoppingBag size={18} /> },
    { id: 'stock', label: 'Stock', icon: <Archive size={18} /> },
    { id: 'menu', label: 'Menu Management', icon: <MenuIcon size={18} /> },
    { id: 'staff', label: 'Staff Management', icon: <Users size={18} /> },
  ];

  return (
    <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
      {/* LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px', marginBottom: '32px' }}>
        <CuaninLogoMini />
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>cuanin.id</h2>
          <span style={{ fontSize: '9px', color: '#93C5FD', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
        </div>
      </div>

      {/* MENU LIST */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px' }}>
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <div 
              key={item.id} 
              onClick={() => onNavigateView(item.id)} 
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

      {/* LOGOUT BUTTON */}
      <div style={{ padding: '0 16px' }}>
        <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#FFCACA', borderRadius: '10px', cursor: 'pointer' }}>
          <LogOut size={18} /> <span style={{ fontSize: '14px' }}>Logout</span>
        </div>
      </div>
    </div>
  );
}