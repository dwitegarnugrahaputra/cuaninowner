import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Bell, HelpCircle, Search, MessageSquareCode } from 'lucide-react';

export default function TopBar({ onNavigateView, activeView }) {
  const [userProfile, setUserProfile] = useState({
    name: 'Administrator',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'
  });

  useEffect(() => {
    async function getActiveUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metadata = user.user_metadata;
        setUserProfile({
          name: metadata?.full_name || user.email.split('@')[0],
          email: user.email,
          avatar: metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'
        });
      }
    }
    getActiveUser();
  }, []);

  // Deteksi status keaktifan view internal utility
  const isBrainyActive = activeView === 'brainy';
  const isNotificationsActive = activeView === 'notifications';
  const isHelpActive = activeView === 'help-center';

  return (
    <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between', flexShrink: 0 }}>
      
      {/* KOTAK PENCARIAN UTAMA */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '300px' }}>
        <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
        <input 
          type="text" 
          placeholder="Cari data atau tanya AI..." 
          style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} 
        />
      </div>

      {/* UTILITY UTAMA & AKUN METADATA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* PINTASAN TOMBOL ASK BRAINY */}
        <button 
          type="button"
          onClick={() => onNavigateView && onNavigateView('brainy')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            backgroundColor: isBrainyActive ? '#047857' : '#006847', 
            color: '#ffffff', border: 'none', borderRadius: '24px',
            fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 104, 71, 0.15)',
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          <MessageSquareCode size={16} />
          <span>Ask Brainy</span>
        </button>

        {/* 🔥 FIXED: UTILITY NOTIFIKASI UTK PUSAT LOG KASIR/STOK */}
        <button
          type="button"
          onClick={() => onNavigateView && onNavigateView('notifications')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isNotificationsActive ? '#006847' : '#4B5563',
            backgroundColor: isNotificationsActive ? '#E6F4EA' : 'transparent',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* 🔥 FIXED: UTILITY HELP & DOKUMENTASI CENTER */}
        <button
          type="button"
          onClick={() => onNavigateView && onNavigateView('help-center')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isHelpActive ? '#006847' : '#4B5563',
            backgroundColor: isHelpActive ? '#E6F4EA' : 'transparent',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          title="Help Center"
        >
          <HelpCircle size={20} />
        </button>
        
        {/* DETAIL PROFILE REAKTIF SINKRON EMAIL GOOGLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{userProfile.name}</p>
            <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500', display: 'block' }}>{userProfile.email}</span>
          </div>
          <img 
            src={userProfile.avatar} 
            alt="User Avatar" 
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #006847' }} 
          />
        </div>
      </div>

    </div>
  );
}