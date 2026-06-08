import React, { useState } from 'react';
import { Shield, Key, Lock, Clock, Smartphone, Save, Eye, EyeOff } from 'lucide-react';

export default function Keamanan({ onSaveSuccess }) {
  // State interaksi form keamanan
  const [showPassword, setShowPassword] = useState(false);
  const [idleTimeout, setIdleTimeout] = useState('15');
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordChange = (e, field) => {
    setPasswordData({ ...passwordData, [field]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (passwordData.new && passwordData.new !== passwordData.confirm) {
      alert('Konfirmasi password baru tidak cocok, Gar!');
      return;
    }
    onSaveSuccess();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.2s ease-out', textAlign: 'left' }}>
      
      {/* Header Title */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Keamanan Sistem</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Proteksi kredensial login admin, batasi sesi otomatis kasir, dan pantau log audit perangkat aktif.</p>
      </div>

      {/* Grid Layout Pengaturan Keamanan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* BLOK KIRI: AUTHENTICATION & ACCESS CONTROL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Ganti Password Administrator */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Key size={20} color="#006847" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Kredensial Akun Utama</h3>
            </div>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Password Saat Ini</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={passwordData.current}
                    onChange={(e) => handlePasswordChange(e, 'current')}
                    placeholder="Masukkan password admin sekarang" 
                    style={{ width: '100%', padding: '10px 40px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                  <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Password Baru</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={passwordData.new}
                      onChange={(e) => handlePasswordChange(e, 'new')}
                      placeholder="Minimal 8 karakter" 
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Konfirmasi Password Baru</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={passwordData.confirm}
                      onChange={(e) => handlePasswordChange(e, 'confirm')}
                      placeholder="Ulangi password baru" 
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Card 2: Perangkat Aktif Terhubung (Audit Sesi) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Smartphone size={20} color="#1E3A8A" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Sesi Perangkat Terbuka</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { device: 'ASUS ExpertBook - Windows 11', role: 'Owner Panel (Lu)', loc: 'Tegal, ID', time: 'Aktif Sekarang', isCurrent: true },
                { device: 'Samsung Galaxy Tab A9 (Tablet)', role: 'Kasir Utama Gerai', loc: 'Surabaya, ID', time: 'Terhubung 10 mnt lalu', isCurrent: false }
              ].map((session, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontSize: '20px' }}>{session.isCurrent ? '💻' : '📱'}</div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#111827', display: 'block' }}>{session.device}</strong>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>{session.role} • {session.loc}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: session.isCurrent ? '#10B981' : '#6B7280', fontWeight: 'bold' }}>{session.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* BLOK KANAN: SESSION TIMEOUT & ACTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 3: Sesi Idle Timeout Kasir */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Clock size={20} color="#D97706" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Enkripsi Masa Sesi</h3>
            </div>
            
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Kunci Otomatis Sesi Kasir (Idle)</label>
              <select 
                value={idleTimeout} 
                onChange={(e) => setIdleTimeout(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                <option value="5">Setelah 5 Menit</option>
                <option value="15">Setelah 15 Menit</option>
                <option value="30">Setelah 30 Menit</option>
                <option value="never">Jangan Pernah Kunci</option>
              </select>
              <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', display: 'block', lineHeight: '1.4' }}>
                *Aplikasi tablet kasir otomatis terkunci jika tidak disentuh selama batas waktu di atas, demi mencegah staf lain menyalahgunakan slip transaksi.
              </span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleFormSubmit}
            style={{ width: '100%', padding: '14px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 104, 71, 0.2)' }}
          >
            <Save size={16} /> Simpan Aturan Keamanan
          </button>

        </div>

      </div>
    </div>
  );
}