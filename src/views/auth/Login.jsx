import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

function CuaninLogo() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
      <div style={{
        width: '64px', height: '64px', backgroundColor: '#006847', borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '12px'
      }}>
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '8px',
          padding: '6px 0px 6px 6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box',
          position: 'relative'
        }}>
          <div style={{
            width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '5px 0 0 5px',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxSizing: 'border-box'
          }}>
            <div style={{
              width: '22px', height: '22px', backgroundColor: '#ffffff', borderRadius: '5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginRight: '-1px'
            }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#006847', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FIX: Menangkap props onLoginSuccess dari parent App.jsx agar state routing bisa jalan
export default function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault(); // Mengunci form agar TIDAK REFRESH halaman hulu
    setErrorMsg('');
    try {
      await login(email, password);
      
      {/* SINKRONISASI CAKRAM KREDENSIAL: 
          Jika fungsi login sukses tanpa throw error, eksekusi callback di bawah ini 
          untuk membuka kunci otentikasi state di router pusat.
      */}
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Email atau password salah!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', padding: '20px', boxSizing: 'border-box', width: '100vw' }}>
      
      {/* BRANDING HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <CuaninLogo />
        <h2 style={{ color: '#111827', margin: '0', fontSize: '26px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
        <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '6px', fontWeight: '500' }}>Business Intelligence</p>
      </div>

      {/* FORM CARD MATCH WITH MOCKUP */}
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: '36px', borderRadius: '20px', border: '1px solid #E5E7EB', width: '100%', maxWidth: '400px', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Selamat datang kembali di dashboard Anda</h3>
          <p style={{ margin: '0', color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Silakan masukkan detail akun Anda untuk melanjutkan.</p>
        </div>

        {errorMsg && (
          <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '20px', fontWeight: '500', border: '1px solid #FCA5A5' }}>
            ❌ {errorMsg}
          </div>
        )}

        {/* INPUT FIELD: EMAIL */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>EMAIL PENGGUNA</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', color: '#111827', boxSizing: 'border-box', outline: 'none' }} 
              placeholder="nama@bisnis.id" 
            />
          </div>
        </div>

        {/* INPUT FIELD: PASSWORD */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151' }}>KATA SANDI</label>
            <a href="#lupa" style={{ fontSize: '11px', fontWeight: 'bold', color: '#006847', textDecoration: 'none' }}>Lupa Sandi?</a>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px 42px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', color: '#111827', boxSizing: 'border-box', outline: 'none' }} 
              placeholder="••••••••" 
            />
            <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </div>
          </div>
        </div>

        {/* CHECKBOX: REMEMBER ME */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <input type="checkbox" id="remember" style={{ marginRight: '8px', cursor: 'pointer', accentColor: '#006847' }} />
          <label htmlFor="remember" style={{ fontSize: '13px', color: '#4B5563', cursor: 'pointer', fontWeight: '500' }}>Ingat saya</label>
        </div>

        {/* BUTTON GREEN SUBMIT */}
        <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
          <span>Masuk ke Dashboard</span>
          <ArrowRight size={16} />
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>
            Belum punya akun? <span onClick={() => onNavigate('register')} style={{ color: '#006847', cursor: 'pointer', fontWeight: 'bold' }}>Registrasi</span>
        </div>
      </form>

      {/* FOOTER SYSTEM LINKS */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px', fontSize: '11px', fontWeight: 'bold', color: '#6B7280', letterSpacing: '0.5px' }}>
        <span>PUSAT BANTUAN</span>
        <span>KEBIJAKAN PRIVASI</span>
        <span>SYARAT & KETENTUAN</span>
      </div>
    </div>
  );
}