import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { supabase } from '../../config/supabaseClient';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

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

export default function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useAuth();

  // 📝 WRITE AUDIT LOG PIPELINE (Menulis jejak login sukses ke database)
  const writeAuditLog = async (userId, userEmail, actionType) => {
    try {
      await supabase.from('auth_activity_logs').insert([{
        user_id: userId,
        email: userEmail,
        action_type: actionType,
        user_agent: navigator.userAgent,
        ip_address: '127.0.0.1'
      }]);
    } catch (err) {
      console.error('⚠️ Gagal menyimpan log aktivitas login:', err.message);
    }
  };

  // 🔐 JALUR 1: LOGIN MANUAL (EMAIL & KATA SANDI)
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(email, password);
      
      // Ambil data user yang baru sukses masuk untuk ditulis audit log-nya
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await writeAuditLog(user.id, user.email, 'LOGIN_PASSWORD_SUCCESS');
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Email atau password salah!');
    } finally {
      setIsLoading(false);
    }
  };

  // 🌐 JALUR 2: LOGIN DIRECT GOOGLE OAUTH
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Otomatis balik ke halaman utama setelah sukses auth google
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Gagal terhubung ke Google OAuth.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', padding: '20px', boxSizing: 'border-box', width: '100vw' }}>
      
      {/* BRANDING HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <CuaninLogo />
        <h2 style={{ color: '#111827', margin: '0', fontSize: '26px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
        <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '6px', fontWeight: '500' }}>Business Intelligence POS</p>
      </div>

      {/* FORM CARD AREA */}
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: '36px', borderRadius: '20px', border: '1px solid #E5E7EB', width: '100%', maxWidth: '400px', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Selamat datang kembali di dashboard</h3>
          <p style={{ margin: '0', color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Masukkan detail kredensial akun Anda.</p>
        </div>

        {errorMsg && (
          <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '20px', fontWeight: '500', border: '1px solid #FCA5A5' }}>
            ❌ {errorMsg}
          </div>
        )}

        {/* INPUT: EMAIL */}
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

        {/* INPUT: PASSWORD */}
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

        {/* GREEN SUBMIT BUTTON */}
        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><span>Masuk ke Dashboard</span><ArrowRight size={16} /></>}
        </button>

        {/* SEPARATOR */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 20px 0', color: '#9CA3AF' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          <span style={{ padding: '0 10px', fontSize: '11px', fontWeight: 'bold' }}>ATAU</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
        </div>

        {/* GOOGLE SIGN IN BUTTON */}
        <button type="button" onClick={handleGoogleLogin} style={{ width: '100%', padding: '12px', backgroundColor: '#ffffff', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.133C18.41 1.252 15.545 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.77 0-.795-.085-1.4-.195-1.945H12.24z"/>
          </svg>
          <span>Lanjutkan dengan Google</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>
          Belum punya akun? <span onClick={() => onNavigate('register')} style={{ color: '#006847', cursor: 'pointer', fontWeight: 'bold' }}>Registrasi</span>
        </div>
      </form>

      {/* FOOTER */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px', fontSize: '11px', fontWeight: 'bold', color: '#6B7280', letterSpacing: '0.5px' }}>
        <span>PUSAT BANTUAN</span>
        <span>KEBIJAKAN PRIVASI</span>
        <span>SYARAT & KETENTUAN</span>
      </div>
    </div>
  );
}