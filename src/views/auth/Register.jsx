import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Store, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

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
  const [otpToken, setOtpToken] = useState(''); 
  
  const [isVerificationStep, setIsVerificationStep] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 🔥 TAHAP 1: REQUEST REGISTER & KIRIM TOKEN OTP KELUAR
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
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
      
      setIsVerificationStep(true);
      setInfoMsg('Registrasi awal berhasil! Kunci OTP 6-digit dikirim ke email lu, Gar.');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mendaftarkan akun bisnis Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🛡️ TAHAP 2: VERIFIKASI TOKEN OTP EMAIL MASUK
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otpToken,
        type: 'signup'
      });

      if (error) throw error;

      if (data?.user) {
        await supabase.from('auth_activity_logs').insert([{
          user_id: data.user.id,
          email: data.user.email,
          action_type: 'REGISTER_VERIFY_SUCCESS',
          user_agent: navigator.userAgent,
          ip_address: '127.0.0.1'
        }]);
      }

      setInfoMsg('Akun bisnis cuanin.id lu udah aktif, Gar! Mengalihkan ke halaman login...');
      setTimeout(() => {
        onNavigate('login');
      }, 2500);

    } catch (err) {
      setErrorMsg(err.message || 'Kode verifikasi salah atau kedaluwarsa!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', padding: '20px', boxSizing: 'border-box', width: '100vw' }}>
      
      {/* CARD UTAMA */}
      <div style={{ background: '#fff', padding: '36px', borderRadius: '20px', border: '1px solid #E5E7EB', width: '100%', maxWidth: '420px', boxSizing: 'border-box', boxShadow: '0 4px 24px rgba(0,0,0,0.01)' }}>
        
        <CuaninLogoRegister />

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>
            {!isVerificationStep ? 'Daftar Akun Baru' : 'Verifikasi Akun Anda'}
          </h3>
          <p style={{ margin: '0', color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>
            {!isVerificationStep ? 'Lengkapi data bisnis Anda untuk memulai.' : `Masukkan kode verifikasi yang dikirim ke ${email}`}
          </p>
        </div>

        {errorMsg && <div style={{ color: '#DC2626', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px', fontWeight: '500', border: '1px solid #FCA5A5' }}>❌ {errorMsg}</div>}
        {infoMsg && <div style={{ color: '#006847', backgroundColor: '#E6F4EA', padding: '12px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px', fontWeight: '500', border: '1px solid #A7F3D0' }}>✨ {infoMsg}</div>}

        {/* ---------------- RENDER KONDISIONAL FORM SECARA TERPISAH DAN AMAN ---------------- */}
        {!isVerificationStep ? (
          /* FORM TAHAP 1: FORM INPUT REGISTRASI */
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '6px' }}>Nama Lengkap</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} placeholder="Masukkan nama lengkap" />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '6px' }}>Nama Bisnis</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Store size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} placeholder="Masukkan nama bisnis Anda" />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '6px' }}>Email Pengguna</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} placeholder="contoh@email.com" />
              </div>
            </div>

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

            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><span>Daftar Sekarang</span><ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          /* FORM TAHAP 2: FORM INPUT OTP VERIFIKASI */
          <form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#374151', marginBottom: '8px', textAlign: 'center' }}>KODE VERIFIKASI OTP</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShieldCheck size={20} color="#10B981" style={{ position: 'absolute', left: '16px' }} />
                <input 
                  type="text" 
                  value={otpToken} 
                  onChange={(e) => setOtpToken(e.target.value)} 
                  required 
                  maxLength={8}
                  placeholder="00000000" 
                  style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '2px solid #10B981', backgroundColor: '#F9FAFB', fontSize: '18px', fontWeight: 'bold', letterSpacing: '6px', color: '#111827', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }} 
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Verifikasi Kode Akun</span>}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span onClick={() => { setIsVerificationStep(false); setErrorMsg(''); setInfoMsg(''); }} style={{ fontSize: '12px', color: '#4B5563', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                Kembali ke pengisian data
              </span>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>
          Sudah punya akun? <span onClick={() => onNavigate('login')} style={{ color: '#006847', cursor: 'pointer', fontWeight: 'bold' }}>Masuk di sini</span>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px', fontSize: '11px', fontWeight: 'bold', color: '#6B7280', letterSpacing: '0.5px' }}>
        <span>PUSAT BANTUAN</span>
        <span>KEBIJAKAN PRIVASI</span>
        <span>SYARAT & KETENTUAN</span>
      </div>
      <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>© 2024 cuanin.id. Solusi Business Intelligence POS Terpercaya.</p>
    </div>
  );
}