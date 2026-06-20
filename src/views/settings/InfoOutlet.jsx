import React, { useState, useEffect } from 'react';
import { Store, Mail, User, Phone, Plus, Trash2, Save, Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function InfoOutlet() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaveLoading] = useState(false);
  const [currentUid, setCurrentUserId] = useState(null);

  // ⚡ FIXED: State awal dikosongkan (bukan hardcode "Warung Kopi Jaya" dkk).
  // Nilai asli akan diisi setelah fetchUserDataPipeline selesai, baik dari
  // outlet_config (kalau sudah pernah disimpan) atau dari data Google OAuth (kalau belum).
  const [outletProfile, setOutletProfile] = useState({
    outlet_name: '',
    company_email: '',
    owner_name: '',
    company_phone: ''
  });

  // State Manajemen Struktur Peran/Role
  const [rolesList, setRolesList] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');

  // 📥 READ PIPELINE: Ambil data spesifik berdasarkan User ID yang sedang login
  const fetchUserDataPipeline = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        console.warn('Sesi pengguna tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      const uid = session.user.id;
      setCurrentUserId(uid);

      // 1. Ambil data profil outlet berdasarkan user_id
      const { data: outletData, error: outletError } = await supabase
        .from('outlet_config')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (outletError) throw outletError;

      if (outletData) {
        // Row sudah pernah disimpan sebelumnya -> pakai data asli dari Supabase
        setOutletProfile(outletData);
      } else {
        // ⚡ FIXED: Row belum pernah dibuat. Fallback ke data akun Google OAuth asli
        // (bukan teks hardcode "Owner Cuanin" / "Warung Kopi Jaya"), supaya form
        // langsung terisi dengan identitas user yang sedang login sebagai starting point.
        const meta = session.user.user_metadata || {};
        const fallbackOwnerName = meta.full_name || meta.name || (session.user.email ? session.user.email.split('@')[0] : '');
        setOutletProfile({
          outlet_name: '',
          owner_name: fallbackOwnerName,
          company_email: session.user.email || '',
          company_phone: ''
        });
      }

      // 2. Ambil master data peran kerja karyawan berdasarkan user_id
      const { data: rolesData, error: rolesError } = await supabase
        .from('company_roles')
        .select('*')
        .eq('user_id', uid)
        .order('role_name', { ascending: true });

      if (rolesError) throw rolesError;

      // ⚡ FIXED: Kalau belum ada role tersimpan, list dibiarkan kosong (bukan
      // dummy d1-d4) supaya tidak terlihat seperti row asli yang bisa "dihapus"
      // padahal sebenarnya tidak pernah tersimpan di Supabase.
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

  // 📤 UPDATE PIPELINE: Simpan data terikat user_id menggunakan strategi Upsert
  // Catatan: outlet_config.user_id sudah punya UNIQUE constraint (outlet_config_user_id_key),
  // jadi onConflict: 'user_id' di bawah ini valid dan aman dipakai.
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

      // Gunakan upsert: jika user_id sudah ada maka update, jika belum ada maka insert baru
      const { error } = await supabase
        .from('outlet_config')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      alert('Informasi profil outlet Anda berhasil diperbarui di cloud database!');
      await fetchUserDataPipeline();
    } catch (err) {
      alert('Gagal memperbarui profil: ' + err.message);
    } finally {
      setIsSaveLoading(false);
    }
  };

  // ➕ CRUD ROLE - CREATE (Terikat user_id)
  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim() || !currentUid) return;

    try {
      const { error } = await supabase
        .from('company_roles')
        .insert([{ user_id: currentUid, role_name: newRoleName.trim() }]);

      if (error) throw error;
      setNewRoleName('');

      const { data } = await supabase
        .from('company_roles')
        .select('*')
        .eq('user_id', currentUid)
        .order('role_name', { ascending: true });

      if (data) setRolesList(data);
    } catch (err) {
      alert('Gagal menambahkan peran baru: ' + err.message);
    }
  };

  // ❌ CRUD ROLE - DELETE (Terikat user_id)
  // ⚡ FIXED: Tidak ada lagi pengecekan id dummy 'd1'/'d2' karena rolesList sekarang
  // selalu berisi baris asli dari Supabase (atau kosong) -- setiap delete di sini
  // memang menghapus baris nyata di database.
  const handleDeleteRole = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus peran "${name}"? Karyawan yang masih memakai peran ini di Staff Management perlu diperbarui rolenya secara manual.`)) return;
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

  if (isLoading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6B7280', fontSize: '14px' }}>
        <Loader2 size={16} className="animate-spin" />
        <span>Menyinkronkan data outlet pengguna...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>Informasi Outlet</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#6B7280' }}>Kelola legalitas identitas usaha, kontak korporat, serta struktur ekspansi peran operasional.</p>
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Store size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                <input type="text" required placeholder="Contoh: Warung Kopi Jaya" value={outletProfile.outlet_name} onChange={(e) => setOutletProfile({...outletProfile, outlet_name: e.target.value})} style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13.5px', outline: 'none', fontWeight: 'bold' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Nama Pemilik (Owner)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                <input type="text" required placeholder="Nama lengkap pemilik outlet" value={outletProfile.owner_name} onChange={(e) => setOutletProfile({...outletProfile, owner_name: e.target.value})} style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13.5px', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Email Perusahaan</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                  <input type="email" required placeholder="email@perusahaan.com" value={outletProfile.company_email} onChange={(e) => setOutletProfile({...outletProfile, company_email: e.target.value})} style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Nomor Telepon Korporat</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                  <input type="text" required placeholder="+62..." value={outletProfile.company_phone} onChange={(e) => setOutletProfile({...outletProfile, company_phone: e.target.value})} style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontWeight: '600' }} />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSaving} style={{ padding: '11px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', alignSelf: 'flex-end', marginTop: '8px' }}>
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} <span>Simpan Konfigurasi</span>
          </button>
        </form>

        {/* STRUKTUR ROLE EKSPANSI */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} color="#006847" /> Struktur Akses Ekspansi
            </h3>
            <span style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px', display: 'block' }}>Tambahkan atau kurangi peran kerja resmi untuk cabang bisnis Anda.</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="Nama peran (Contoh: Supervisor)" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} style={{ flex: 1, padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
            <button type="button" onClick={handleAddRole} style={{ padding: '9px 14px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16}/></button>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', backgroundColor: '#F9FAFB', padding: '10px 14px', fontWeight: 'bold', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>
              <span>NAMA JABATAN / ROLE</span>
              <span style={{ textAlign: 'right' }}>AKSI</span>
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: '#ffffff' }}>
              {rolesList.length > 0 ? (
                rolesList.map((role, idx) => (
                  <div key={role.id || idx} style={{ display: 'grid', gridTemplateColumns: '1fr 50px', padding: '12px 14px', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{role.role_name}</span>
                    <button type="button" onClick={() => handleDeleteRole(role.id, role.role_name)} style={{ background: 'none', border: 'none', padding: 0, color: '#EF4444', cursor: 'pointer', justifySelf: 'end', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px 14px', textAlign: 'center', color: '#9CA3AF', fontSize: '12.5px', fontStyle: 'italic' }}>
                  Belum ada peran kerja yang dibuat. Tambahkan peran pertama Anda di atas.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', padding: '10px 12px', borderRadius: '8px', fontSize: '11.5px', color: '#C2410C', lineHeight: '1.4' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>Perubahan pada daftar peran ini akan langsung terintegrasi secara dinamis ke dalam pilihan menu dropdown formulir di halaman <strong>Staff Management</strong>.</span>
          </div>
        </div>

      </div>
    </div>
  );
}