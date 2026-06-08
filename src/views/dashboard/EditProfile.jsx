import React, { useState } from 'react';
import { User, Mail, Shield, Smartphone, Camera, Save, Lock, Eye, EyeOff } from 'lucide-react';

export default function EditProfile({ onSaveSuccess }) {
  // State interaksi visibilitas password inline
  const [showPassword, setShowPassword] = useState(false);

  // State data profil khusus untuk Role OWNER
  const [profileData, setProfileData] = useState({
    name: 'Alex Graham',
    email: 'alex.graham@cuanin.id',
    phone: '081234567890',
    role: 'OWNER', // 👈 Perubahan role mutlak menjadi OWNER
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e, field) => {
    setProfileData({ ...profileData, [field]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validasi logic password jika owner mencoba mengisi kolom password
    if (profileData.newPassword || profileData.confirmPassword || profileData.currentPassword) {
      if (!profileData.currentPassword) {
        alert('Masukkan password saat ini terlebih dahulu untuk memverifikasi perubahan, Gar!');
        return;
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        alert('Konfirmasi password baru lu gak cocok, Gar! Cek lagi.');
        return;
      }
      if (profileData.newPassword.length < 8) {
        alert('Password baru minimal harus 8 karakter demi keamanan toko lu!');
        return;
      }
    }

    alert('Data Profil dan Password Akun Owner Berhasil Diperbarui!');
    onSaveSuccess();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.2s ease-out', textAlign: 'left' }}>
      
      {/* Header Title */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Edit Profile</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Kelola informasi identitas kepemilikan merchant dan perbarui kredensial keamanan utama login lu.</p>
      </div>

      {/* Grid Form Terintegrasi */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* BLOK KIRI: AVATAR MANAGEMENT (ROLE: OWNER) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150" 
              alt="Avatar Owner" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #006847' }}
            />
            <div style={{ position: 'absolute', bottom: '4px', right: '4px', backgroundColor: '#006847', color: '#ffffff', padding: '6px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={14} />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{profileData.name}</h4>
            {/* FIX: Mengubah Label menjadi OWNER dengan warna hijau bisnis premium */}
            <span style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{profileData.role}</span>
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', textAlign: 'center', lineHeight: '1.4' }}>Maksimal ukuran file gambar 2MB dengan format standar .JPG atau .PNG</p>
        </div>

        {/* BLOK KANAN: FORM IDENTITAS DAN PASSWORD COMBINED */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* SECTION 1: INFORMASI IDENTITAS */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#006847', display: 'block', marginBottom: '14px', letterSpacing: '0.5px' }}>I. INFORMASI DASAR OWNER</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Lengkap</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <User size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={(e) => handleInputChange(e, 'name')}
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Peran Kerja (Role)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Shield size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type="text" 
                      value={profileData.role}
                      disabled
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', backgroundColor: '#F3F4F6', color: '#6B7280', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Alamat Email Akun</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => handleInputChange(e, 'email')}
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Nomor Telepon Seluler</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Smartphone size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type="text" 
                      value={profileData.phone}
                      onChange={(e) => handleInputChange(e, 'phone')}
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TUNAS FITUR BARU: SECTION 2 - GANTI PASSWORD KREDENSIAL */}
            <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#006847', display: 'block', marginBottom: '14px', letterSpacing: '0.5px' }}>II. PERBARUI KATA SANDI (OPSIONAL)</span>
              
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Password Saat Ini</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={profileData.currentPassword}
                    onChange={(e) => handleInputChange(e, 'currentPassword')}
                    placeholder="Masukkan password lu sekarang untuk otorisasi" 
                    style={{ width: '100%', padding: '10px 40px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                  <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Password Baru</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={profileData.newPassword}
                      onChange={(e) => handleInputChange(e, 'newPassword')}
                      placeholder="Min. 8 karakter baru" 
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
                      value={profileData.confirmPassword}
                      onChange={(e) => handleInputChange(e, 'confirmPassword')}
                      placeholder="Ulangi password baru" 
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginTop: '8px' }}>
              <button 
                type="submit"
                style={{ padding: '12px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 104, 71, 0.2)' }}
              >
                <Save size={16} /> Simpan Perubahan Profil
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}