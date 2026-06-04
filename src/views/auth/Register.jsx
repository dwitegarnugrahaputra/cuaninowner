import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Store } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

// Ukuran diperkecil dari 64px menjadi 48px agar lebih proporsional dan tidak terlalu besar
function CuaninLogoRegister() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
      <div style={{
        width: '48px', height: '48px', backgroundColor: '#006847', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '9px'
      }}>
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '6px',
          padding: '4.5px 0px 4.5px 4.5px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box',
          position: 'relative'
        }}>
          <div style={{
            width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '4px 0 0 4px',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxSizing: 'border-box'
          }}>
            <div style={{
              width: '16px', height: '16px', backgroundColor: '#ffffff', borderRadius: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginRight: '-1px'
            }}>
              <div style={{ width: '4px', height: '4px', backgroundColor: '#006847', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Register({ onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
            role: 'owner'
          }
        }
      });

      if (error) throw error;
      setInfoMsg('Registrasi Sukses! Silakan cek email Anda untuk konfirmasi akun.');
      setFullName(''); setBusinessName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mendaftarkan akun bisnis Anda.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', padding: '20px', boxSizing: 'border-box', width: '100vw' }}>
      
      {/* 1. LOGO DI LUAR TEXTFIELD/CARD SEKARANG SUDAH DIHAPUS TOTAL DI SINI */}

      {/* REGISTRATION CARD COMPONENT */}
      <form onSubmit={handleRegister} style={{ background: '#fff', padding: '36px', borderRadius: '20px', border: '1px solid #E5E7EB', width: '100%', maxWidth: '420px', boxSizing: 'border-box', boxShadow: '0 4px 24px rgba(0,0,0,0.01)' }}>
        
        {/* 2. LOGO DI DALAM CARD DENGAN UKURAN MINI PROPORSIONAL */}
        <CuaninLogoRegister />

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {/* 3. WARNA FONT SEKARANG SUDAH DIUBAH MENJADI HITAM PEKAT (#111827) */}
          <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>Daftar Akun Baru</h3>
          <p style={{ margin: '0', color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Lengkapi data bisnis Anda untuk memulai.</p>
        </div>

        {errorMsg && <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px', fontWeight: '500', border: '1px solid #FCA5A5' }}>❌ {errorMsg}</div>}
        {infoMsg && <div style={{ color: '#006847', backgroundColor: '#E6F4EA', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px', fontWeight: '500' }}>✨ {infoMsg}</div>}

        {/* INPUT 1: NAMA LENGKAP */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '6px' }}>Nama Lengkap</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} placeholder="Masukkan nama lengkap" />
          </div>
        </div>

        {/* INPUT 2: NAMA BISNIS */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '6px' }}>Nama Bisnis</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Store size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} placeholder="Masukkan nama bisnis Anda" />
          </div>
        </div>

        {/* INPUT 3: EMAIL PENGGUNA */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '6px' }}>Email Pengguna</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} placeholder="contoh@email.com" />
          </div>
        </div>

        {/* INPUT 4: KATA SANDI */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '6px' }}>Kata Sandi</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px 42px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} placeholder="Min. 8 karakter" />
            <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </div>
          </div>
        </div>

        {/* INPUT 5: KONFIRMASI KATA SANDI */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '6px' }}>Konfirmasi Kata Sandi</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '12px 42px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} placeholder="Ulangi kata sandi" />
            <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {showConfirmPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </div>
          </div>
        </div>

        {/* BUTTON GREEN SUBMIT */}
        <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
          <span>Daftar Sekarang</span>
          <ArrowRight size={16} />
        </button>

        {/* SWITCH ROUTE ACTION */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>
          Sudah punya akun? <span onClick={() => onNavigate('login')} style={{ color: '#006847', cursor: 'pointer', fontWeight: 'bold' }}>Masuk di sini</span>
        </div>
      </form>

      {/* FOOTER SYSTEM */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px', fontSize: '11px', fontWeight: 'bold', color: '#6B7280', letterSpacing: '0.5px' }}>
        <span>PUSAT BANTUAN</span>
        <span>KEBIJAKAN PRIVASI</span>
        <span>SYARAT & KETENTUAN</span>
      </div>
      <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>© 2024 cuanin.id. Solusi Business Intelligence POS Terpercaya.</p>
    </div>
  );
}