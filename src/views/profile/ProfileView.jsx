import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  MessageSquare, User, Mail, ShieldCheck, LogOut
} from 'lucide-react';

export default function ProfileView({ onNavigateView }) {
  const { logout } = useAuth();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* SIDEBAR UTAMA */}
      <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', marginBottom: '32px' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>cuanin.id</h2>
            <span style={{ fontSize: '9px', color: '#93C5FD', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard' },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales' },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock' },
            { name: 'Menu Management', icon: <Menu size={18} />, target: 'menu' },
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff' }
          ].map((menu, idx) => (
            <div key={idx} onClick={() => onNavigateView(menu.target)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s' }}>
              {menu.icon} <span style={{ fontSize: '14px' }}>{menu.name}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div onClick={() => onNavigateView('settings')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <Settings size={18} /> <span style={{ fontSize: '14px' }}>Settings</span>
          </div>
          <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#111827', borderRadius: '12px', marginTop: '12px', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1E3A8A', fontSize: '12px' }}>WJ</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p>
              <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>PREMIUM</span>
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACE KANAN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ fontWeight: 'bold', color: '#111827' }}>Personal Credentials</div>
          <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <MessageSquare size={16} /> Ask Brainy
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '40px', width: '400px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150" alt="avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #E6F4EA', marginBottom: '16px' }} />
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold' }}>Alex Graham</h2>
            <span style={{ backgroundColor: '#E6F4EA', color: '#006847', fontSize: '11px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px' }}>ADMINISTRATOR</span>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}><Mail size={16} color="#6B7280" /> <span>alex.graham@cuanin.id</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}><ShieldCheck size={16} color="#6B7280" /> <span>Full Access Enabled</span></div>
            </div>

            <button onClick={logout} style={{ width: '100%', marginTop: '32px', padding: '12px', backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LogOut size={16} /> Keluar dari Sistem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}