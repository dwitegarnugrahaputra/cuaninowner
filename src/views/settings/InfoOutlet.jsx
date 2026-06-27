import React, { useState, useEffect } from 'react';
import { 
  Store, Mail, User, Phone, Save, Loader2, FileText, 
  Percent, Clock, Receipt, Box, MapPin, ShieldCheck, Trash2
} from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function InfoOutlet() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaveLoading] = useState(false);
  const [currentUid, setCurrentUserId] = useState(null);

  // State Profil Terkalibrasi Standar Perizinan Lengkap
  const [outletProfile, setOutletProfile] = useState({
    outlet_name: '',
    branch_code: 'BR-001',
    company_email: '',
    owner_name: '',
    company_phone: '',
    complete_address: '',
    npwp_number: '',
    tax_percentage: 10.0,
    operational_hours: '09:00 - 22:00',
    timezone: 'WIB',
    receipt_footer: 'Terima Kasih Telah Berkunjung!',
    warehouse_id: ''
  });

  const [rolesList, setRolesList] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // Penampung data gudang dummy/real

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

      // 1. Tarik Data Profil Outlet Komprehensif
      const { data: outletData, error: outletError } = await supabase
        .from('outlet_config')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (outletError) throw outletError;
      if (outletData) {
        setOutletProfile({
          ...outletProfile,
          ...outletData
        });
      }

      // 2. Tarik Data Peran Karyawan Aktif
      const { data: rolesData, error: rolesError } = await supabase
        .from('company_roles')
        .select('*')
        .eq('user_id', uid)
        .order('role_name', { ascending: true });

      if (rolesError) throw rolesError;
      setRolesList(rolesData || []);

      // 3. Simulasi Data Gudang Terkait (Bisa lu hubungkan ke tabel gudang lu nanti kalau sudah ada)
      setWarehouses([
        { id: 'wh-001', name: 'Gudang Pusat Bahan Baku Tegal' },
        { id: 'wh-002', name: 'Gudang Cadangan Mentah Surabaya' }
      ]);

    } catch (err) {
      console.error('⚠️ Gagal menyinkronkan data parameter outlet:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDataPipeline();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUid) return;
    setIsSaveLoading(true);

    try {
      const payload = {
        user_id: currentUid,
        outlet_name: outletProfile.outlet_name,
        branch_code: outletProfile.branch_code,
        owner_name: outletProfile.owner_name,
        company_email: outletProfile.company_email,
        company_phone: outletProfile.company_phone,
        complete_address: outletProfile.complete_address,
        npwp_number: outletProfile.npwp_number,
        tax_percentage: Number(outletProfile.tax_percentage) || 0,
        operational_hours: outletProfile.operational_hours,
        timezone: outletProfile.timezone,
        receipt_footer: outletProfile.receipt_footer,
        warehouse_id: outletProfile.warehouse_id || null
      };

      const { error } = await supabase
        .from('outlet_config')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      
      // Kirim sinyal reaktif global biar nama di Sidebar Kiri langsung ganti otomatis
      window.dispatchEvent(new Event('cuanin_outlet_updated'));
      
      alert('Konfigurasi Legalitas & Operational Master Outlet Berhasil Disimpan!');
      await fetchUserDataPipeline();
    } catch (err) {
      alert('Gagal memperbarui profil: ' + err.message);
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleAddPresetRole = async (selectedRoleName) => {
    if (!currentUid) return;
    const isExist = rolesList.some(role => role.role_name.toLowerCase() === selectedRoleName.toLowerCase());
    if (isExist) return;

    try {
      const { error } = await supabase
        .from('company_roles')
        .insert([{ user_id: currentUid, role_name: selectedRoleName }]);

      if (error) throw error;
      fetchUserDataPipeline();
    } catch (err) {
      alert('Gagal menambahkan peran preset: ' + err.message);
    }
  };

  const handleDeleteRole = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus peran "${name}"?`)) return;
    try {
      const { error } = await supabase.from('company_roles').delete().eq('id', id);
      if (error) throw error;
      setRolesList(rolesList.filter(role => role.id !== id));
    } catch (err) {
      alert('Gagal menghapus peran: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#006847', fontSize: '14px', fontWeight: 'bold' }}>
        <Loader2 size={16} className="animate-spin" />
        <span>Menyusun Formulir Legalitas & Master Operasional...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Informasi Outlet & Legalitas Usaha</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Kelola seluruh parameter administrasi resmi korporasi cuanin.id.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* FORM REGISTRASI PARAMETER LENGKAP */}
        <form onSubmit={handleSaveProfile} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SEKTOR 1: IDENTITAS OUTLET */}
          <div>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
              <Store size={16} color="#006847" /> 1. Identitas Lokasi Outlet
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Nama Outlet Resmi</label>
                <input type="text" required placeholder="Contoh: Cabang Tegal" value={outletProfile.outlet_name} onChange={(e) => setOutletProfile({...outletProfile, outlet_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13.5px', outline: 'none', fontWeight: 'bold', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Kode Cabang</label>
                <input type="text" required placeholder="TEGAL-01" value={outletProfile.branch_code} onChange={(e) => setOutletProfile({...outletProfile, branch_code: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontWeight: '600', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* SEKTOR 2: KONTAK & LOKASI */}
          <div>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
              <MapPin size={16} color="#006847" /> 2. Kontak & Akses Lokasi
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Nomor Telepon Korporat</label>
                  <input type="text" required placeholder="085602370853" value={outletProfile.company_phone} onChange={(e) => setOutletProfile({...outletProfile, company_phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Email Layanan Pelanggan</label>
                  <input type="email" required placeholder="cs@cuanin.id" value={outletProfile.company_email} onChange={(e) => setOutletProfile({...outletProfile, company_email: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Alamat Lengkap Operasional</label>
                <textarea rows="2" placeholder="Jl. Raya Barat No. 45, Kota Tegal, Jawa Tengah" value={outletProfile.complete_address || ''} onChange={(e) => setOutletProfile({...outletProfile, complete_address: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'sans-serif', boxSizing: 'border-box', resize: 'none' }} />
              </div>
            </div>
          </div>

          {/* SEKTOR 3: DETAIL PAJAK & LEGALITAS */}
          <div>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
              <FileText size={16} color="#006847" /> 3. Detail Pajak & Regulasi Daerah
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Nomor Pokok Wajib Pajak (NPWP)</label>
                <input type="text" placeholder="01.234.567.8-901.000" value={outletProfile.npwp_number || ''} onChange={(e) => setOutletProfile({...outletProfile, npwp_number: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Pajak Daerah (PB1)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input type="number" step="0.1" value={outletProfile.tax_percentage} onChange={(e) => setOutletProfile({...outletProfile, tax_percentage: e.target.value})} style={{ width: '100%', padding: '10px 30px 10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', textAlign: 'right', fontWeight: 'bold' }} />
                  <span style={{ position: 'absolute', right: '12px', fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEKTOR 4: OPERASIONAL & STRUK */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
                <Clock size={15} color="#006847" /> 4. Sesi Operasional
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Jam (09:00 - 22:00)" value={outletProfile.operational_hours} onChange={(e) => setOutletProfile({...outletProfile, operational_hours: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                <select value={outletProfile.timezone} onChange={(e) => setOutletProfile({...outletProfile, timezone: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#FAFAFA' }}>
                  <option value="WIB">WIB (Asia/Jakarta)</option>
                  <option value="WITA">WITA (Asia/Makassar)</option>
                  <option value="WIT">WIT (Asia/Jayapura)</option>
                </select>
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
                <Receipt size={15} color="#006847" /> 5. Footer Struk Kasir
              </h3>
              <input type="text" placeholder="Pesan bawah nota belanja..." value={outletProfile.receipt_footer || ''} onChange={(e) => setOutletProfile({...outletProfile, receipt_footer: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* SEKTOR 5: DATA GUDANG TERKAIT */}
          <div>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>
              <Box size={16} color="#006847" /> 6. Alokasi Relasi Gudang Stok (Supply Chain)
            </h3>
            <select value={outletProfile.warehouse_id || ''} onChange={(e) => setOutletProfile({...outletProfile, warehouse_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#FAFAFA', fontWeight: '600', color: '#374151' }}>
              <option value="">-- Pilih Gudang Distribusi --</option>
              {warehouses.map(wh => <option key={role=>wh.id} value={wh.id}>{wh.name}</option>)}
            </select>
          </div>

          <button type="submit" disabled={isSaving} style={{ padding: '12px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'flex-end', marginTop: '12px', boxShadow: '0 2px 4px rgba(0,104,71,0.15)' }}>
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} <span>Simpan Konfigurasi Master</span>
          </button>
        </form>

        {/* AREA OTORITAS PERAN KARYAWAN (SIDEBAR KANAN) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>⚙️ Otoritas Peran Karyawan</h3>
              <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', display: 'block' }}>Aktifkan peran ekosistem mobile kasir cuanin.id.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#F9FAFB', padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
              <button type="button" disabled={rolesList.some(r => r.role_name.toLowerCase() === 'kasir')} onClick={() => handleAddPresetRole('kasir')} style={{ padding: '10px 14px', backgroundColor: rolesList.some(r => r.role_name.toLowerCase() === 'kasir') ? '#E5E7EB' : '#ffffff', color: rolesList.some(r => r.role_name.toLowerCase() === 'kasir') ? '#9CA3AF' : '#006847', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>+ Aktifkan Peran Kasir</span>
                {rolesList.some(r => r.role_name.toLowerCase() === 'kasir') && <span style={{ fontSize: '10px', color: '#10B981', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '4px' }}>Sudah Aktif</span>}
              </button>

              <button type="button" disabled={rolesList.some(r => r.role_name.toLowerCase() === 'admin stok')} onClick={() => handleAddPresetRole('admin stok')} style={{ padding: '10px 14px', backgroundColor: rolesList.some(r => r.role_name.toLowerCase() === 'admin stok') ? '#E5E7EB' : '#ffffff', color: rolesList.some(r => r.role_name.toLowerCase() === 'admin stok') ? '#9CA3AF' : '#4F46E5', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>+ Aktifkan Peran Admin Stok</span>
                {rolesList.some(r => r.role_name.toLowerCase() === 'admin stok') && <span style={{ fontSize: '10px', color: '#4F46E5', backgroundColor: '#E0E7FF', padding: '2px 8px', borderRadius: '4px' }}>Sudah Aktif</span>}
              </button>
            </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', backgroundColor: '#F9FAFB', padding: '10px 14px', fontWeight: 'bold', color: '#4B5563' }}>
                <span>PERAN OPERASIONAL AKTIF</span>
                <span style={{ textAlign: 'right' }}>AKSI</span>
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {rolesList.map((role) => (
                  <div key={role.id} style={{ display: 'grid', gridTemplateColumns: '1fr 50px', padding: '12px 14px', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' }}>{role.role_name}</span>
                    <button type="button" onClick={() => handleDeleteRole(role.id, role.role_name)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', justifySelf: 'end' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}