import React, { useState, useEffect } from 'react';
import { Store, Mail, User, Phone, Plus, Trash2, Save, Loader2, ShieldAlert, CheckCircle } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function InfoOutlet() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaveLoading] = useState(false);
  const [currentUid, setCurrentUserId] = useState(null);

  // State Informasi Profil Bisnis Utama
  const [outletProfile, setOutletProfile] = useState({
    outlet_name: 'Warung Kopi Jaya',
    company_email: 'dwitegar2121@gmail.com',
    owner_name: 'Dwi Tegar Nugraha Putra',
    company_phone: '+6285455421975'
  });

  // State Manajemen Struktur Peran/Role
  const [rolesList, setRolesList] = useState([]);

  // 📥 READ PIPELINE: Ambil data spesifik berdasarkan User ID yang sedang login
  const fetchUserDataPipeline = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        setIsLoading(false);
        return;
      }

      const uid = session.user.id;
      setCurrentUserId(uid);

      // 1. Ambil data profil outlet
      const { data: outletData, error: outletError } = await supabase
        .from('outlet_config')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (outletError) throw outletError;
      if (outletData) setOutletProfile(outletData);

      // 2. Ambil master data peran kerja karyawan
      const { data: rolesData, error: rolesError } = await supabase
        .from('company_roles')
        .select('*')
        .eq('user_id', uid)
        .order('role_name', { ascending: true });

      if (rolesError) throw rolesError;
      setRolesList(rolesData || []);

    } catch (err) {
      console.error('⚠️ Gagal menyinkronkan data info outlet:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataPipeline();
  }, []);

  // 📤 UPDATE PIPELINE: Simpan data profil outlet
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUid) return;
    setIsSaveLoading(true);

    try {
      const payload = {
        user_id: currentUid,
        outlet_name: outletProfile.outlet_name,
        owner_name: outletProfile.owner_name,
        company_email: outletProfile.company_email,
        company_phone: outletProfile.company_phone
      };

      const { error } = await supabase
        .from('outlet_config')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      alert('Informasi profil outlet Anda berhasil diperbarui!');
      await fetchUserDataPipeline();
    } catch (err) {
      alert('Gagal memperbarui profil: ' + err.message);
    } finally {
      setIsSaveLoading(false);
    }
  };

  // ➕ QUICK ADD ROLE: Menambahkan peran resmi yang sudah divalidasi sistem (Anti-Typo)
  const handleAddPresetRole = async (selectedRoleName) => {
    if (!currentUid) return;

    const isExist = rolesList.some(role => role.role_name.toLowerCase() === selectedRoleName.toLowerCase());
    if (isExist) return; // Mencegah klik ganda via bypass konsol

    try {
      const { error } = await supabase
        .from('company_roles')
        .insert([{ user_id: currentUid, role_name: selectedRoleName }]);

      if (error) throw error;
      
      // Refresh list data dari supabase
      const { data } = await supabase
        .from('company_roles')
        .select('*')
        .eq('user_id', currentUid)
        .order('role_name', { ascending: true });
        
      if (data) setRolesList(data);
    } catch (err) {
      alert('Gagal menambahkan peran preset: ' + err.message);
    }
  };

  // ❌ CRUD ROLE - DELETE (Otomatis mengaktifkan kembali tombol di UI secara reaktif)
  const handleDeleteRole = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus peran "${name}"? Ini akan berdampak pada hak akses staf terkait.`)) return;
    try {
      const { error } = await supabase
        .from('company_roles')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUid);

      if (error) throw error;
      setRolesList(rolesList.filter(role => role.id !== id));
    } catch (err) {
      alert('Gagal menghapus peran: ' + err.message);
    }
  };

  // 🔥 DETEKTOR BOOLEAN: Mengecek status eksistensi role secara reaktif untuk merubah state tombol
  const isKasirActive = rolesList.some(role => role.role_name.toLowerCase() === 'kasir');
  const isAdminStokActive = rolesList.some(role => role.role_name.toLowerCase() === 'admin stok');

  if (isLoading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}>
        <Loader2 size={16} className="animate-spin" />
        <span>Menyinkronkan data outlet...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>Informasi Outlet</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#6B7280' }}>Kelola legalitas identitas usaha, kontak korporat, serta manajemen peran operasional tim.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* FORM PROFIL UTAMA */}
        <form onSubmit={handleSaveProfile} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={16} color="#006847" /> Parameter Profil Legalitas
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Nama Outlet Resmi</label>
              <input type="text" required value={outletProfile.outlet_name} onChange={(e) => setOutletProfile({...outletProfile, outlet_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13.5px', outline: 'none', fontWeight: 'bold' }} />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Nama Pemilik (Owner)</label>
              <input type="text" required value={outletProfile.owner_name} onChange={(e) => setOutletProfile({...outletProfile, owner_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13.5px', outline: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Email Perusahaan</label>
                <input type="email" required value={outletProfile.company_email} onChange={(e) => setOutletProfile({...outletProfile, company_email: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Nomor Telepon Korporat</label>
                <input type="text" required value={outletProfile.company_phone} onChange={(e) => setOutletProfile({...outletProfile, company_phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontWeight: '600' }} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSaving} style={{ padding: '11px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', alignSelf: 'flex-end', marginTop: '8px' }}>
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} <span>Simpan Konfigurasi</span>
          </button>
        </form>

        {/* STRUKTUR ROLE EKSPANSI (ADAPTIVE PRESET CONTROL) */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>
              ⚙️ Otoritas Peran Karyawan
            </h3>
            <span style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
              Aktifkan atau matikan peran resmi yang didukung oleh sistem ekosistem mobile cuanin.id.
            </span>
          </div>

          {/* 🔥 DYNAMIC TOGGLE PRESET BUTTONS: Berubah status menjadi off/disabled saat peran sudah dikunci */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#F9FAFB', padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4B5563' }}>Pilih Peran yang Ingin Diaktifkan:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* TOMBOL PRESET: KASIR */}
              <button 
                type="button" 
                disabled={isKasirActive} 
                onClick={() => handleAddPresetRole('kasir')} 
                style={{ 
                  padding: '10px 14px', 
                  backgroundColor: isKasirActive ? '#E5E7EB' : '#ffffff', 
                  color: isKasirActive ? '#9CA3AF' : '#006847', 
                  border: isKasirActive ? '1px solid #D1D5DB' : '1px solid #006847', 
                  borderRadius: '8px', 
                  fontSize: '12.5px', 
                  fontWeight: 'bold', 
                  cursor: isKasirActive ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> <span>Peran Kasir</span>
                </div>
                {isKasirActive && <span style={{ fontSize: '10px', color: '#10B981', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '4px' }}>Sudah Aktif</span>}
              </button>

              {/* TOMBOL PRESET: ADMIN STOK */}
              <button 
                type="button" 
                disabled={isAdminStokActive} 
                onClick={() => handleAddPresetRole('admin stok')} 
                style={{ 
                  padding: '10px 14px', 
                  backgroundColor: isAdminStokActive ? '#E5E7EB' : '#ffffff', 
                  color: isAdminStokActive ? '#9CA3AF' : '#4F46E5', 
                  border: isAdminStokActive ? '1px solid #D1D5DB' : '1px solid #4F46E5', 
                  borderRadius: '8px', 
                  fontSize: '12.5px', 
                  fontWeight: 'bold', 
                  cursor: isAdminStokActive ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> <span>Peran Admin Stok</span>
                </div>
                {isAdminStokActive && <span style={{ fontSize: '10px', color: '#4F46E5', backgroundColor: '#E0E7FF', padding: '2px 8px', borderRadius: '4px' }}>Sudah Aktif</span>}
              </button>

            </div>
          </div>

          {/* TABLE MONITORING PERAN AKTIF */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', backgroundColor: '#F9FAFB', padding: '10px 14px', fontWeight: 'bold', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>
              <span>PERAN OPERASIONAL AKTIF</span>
              <span style={{ textAlign: 'right' }}>AKSI</span>
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
              {rolesList.length > 0 ? (
                rolesList.map((role) => (
                  <div key={role.id} style={{ display: 'grid', gridTemplateColumns: '1fr 50px', padding: '12px 14px', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' }}>{role.role_name}</span>
                    <button type="button" onClick={() => handleDeleteRole(role.id, role.role_name)} style={{ background: 'none', border: 'none', padding: 0, color: '#EF4444', cursor: 'pointer', justifySelf: 'end', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>Belum ada peran operasional yang diaktifkan, Gar.</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', color: '#C2410C', lineHeight: '1.4' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>Menghapus peran dari list akan memutuskan hak akses login aplikasi mobile staf yang memegang jabatan tersebut.</span>
          </div>
        </div>

      </div>
    </div>
  );
}