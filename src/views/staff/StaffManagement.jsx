import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Users2, UserCheck, CalendarDays, Pencil, Trash2, Loader2, X, Save
} from 'lucide-react';

// Koneksi murni client Supabase proyek cuanin.id
import { supabase } from '../../config/supabaseClient';

export default function StaffManagement() {
  // Pengubah nama tab navigasi kapsul sesuai instruksi lu, Gar
  const [activeSubTab, setActiveSubTab] = useState('management');

  // Core Database States
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [staffSummary, setStockSummary] = useState({ totalStaff: 0, activeStaff: 0, leaveStaff: 0 });

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    role: 'Kasir',
    email: '',
    whatsapp_number: '',
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
  });

  // 📥 READ PIPELINE: Ambil Data Karyawan dari Supabase Cloud
  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        setStaffList(data);
        const activeCount = data.filter(s => s.status?.toLowerCase() === 'active').length;
        const leaveCount = data.filter(s => s.status?.toLowerCase() === 'on leave' || s.status?.toLowerCase() === 'leave' || s.status?.toLowerCase() === 'sick').length;
        
        setStockSummary({
          totalStaff: data.length,
          activeStaff: activeCount,
          leaveStaff: leaveCount
        });
      }
    } catch (err) {
      console.error('⚠️ Gagal menarik data staff:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // Buka modal untuk mode Tambah Data Baru
  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'Kasir',
      email: '',
      whatsapp_number: '',
      status: 'Active',
      image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
    });
    setIsModalOpen(true);
  };

  // Buka modal untuk mode Edit/Update Data Lama
  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || '',
      role: staff.role || 'Kasir',
      email: staff.email || '',
      whatsapp_number: staff.whatsapp_number || '',
      status: staff.status || 'Active',
      image_url: staff.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'
    });
    setIsModalOpen(true);
  };

  // 📤 SUBMIT ENGINE: Handle Create & Update Data ke Supabase
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.whatsapp_number.trim()) {
      alert('Nama lengkap dan nomor WhatsApp wajib diisi, Gar!');
      return;
    }

    setIsLoading(true);
    try {
      if (editingStaff) {
        // JALUR UPDATE DATA
        const { error } = await supabase
          .from('staff')
          .update({
            name: formData.name,
            role: formData.role,
            email: formData.email,
            whatsapp_number: formData.whatsapp_number,
            status: formData.status,
            image_url: formData.image_url
          })
          .eq('id', editingStaff.id);

        if (error) throw error;
        alert('Data pilar tim berhasil diperbarui!');
      } else {
        // JALUR CREATE DATA BARU
        const { error } = await supabase
          .from('staff')
          .insert([formData]);

        if (error) throw error;
        alert('Staff baru sukses didaftarkan!');
      }

      setIsModalOpen(false);
      await fetchStaffData(); // Sinkronisasi otomatis
    } catch (err) {
      alert('Aksi CRUD gagal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ❌ DELETE PIPELINE: Hapus Karyawan Permanen
  const handleDeleteStaff = async (id) => {
    if (!id) return;
    if (!window.confirm('Serius mau hapus karyawan ini secara permanen dari database, Gar?')) return;
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchStaffData();
      alert('Staff resmi dihapus!');
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', width: '100%', backgroundColor: '#F8F9FA' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>Staff Management</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Configure and monitor your restaurant team pillars.</p>
        </div>
        <button onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}>
          <UserPlus size={16} /> <span>Add New Staff</span>
        </button>
      </div>

      {/* METRICS ROW SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
          <div><span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>Total Staff</span><h2 style={{ margin: '14px 0 0 0', fontSize: '32px', fontWeight: '700', color: '#111827' }}>{staffSummary.totalStaff}</h2></div>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#E6F4EA', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006847' }}><Users2 size={16} /></div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
          <div><span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>Active Staff</span><h2 style={{ margin: '14px 0 0 0', fontSize: '32px', fontWeight: '700', color: '#111827' }}>{staffSummary.activeStaff}</h2></div>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#EEF2FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}><UserCheck size={16} /></div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
          <div><span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>On Leave / Sick</span><h2 style={{ margin: '14px 0 0 0', fontSize: '32px', fontWeight: '700', color: '#B91C1C' }}>{staffSummary.leaveStaff}</h2></div>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#FEE2E2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C' }}><CalendarDays size={16} /></div>
        </div>
      </div>

      {/* ================= REVISI CAPSULE SUB-TABS (NAMA BARU UPDATE SESUAI REQ LU) ================= */}
      <div style={{ display: 'inline-flex', backgroundColor: '#E5E7EB', padding: '4px', borderRadius: '10px', gap: '4px', alignSelf: 'flex-start' }}>
        <button onClick={() => setActiveSubTab('management')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'management' ? '#ffffff' : 'transparent', color: '#111827' }}>Staff Management</button>
        <button onClick={() => setActiveSubTab('shift')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'shift' ? '#ffffff' : 'transparent', color: '#4B5563' }}>Shift Management</button>
        <button onClick={() => setActiveSubTab('permit')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'permit' ? '#ffffff' : 'transparent', color: '#4B5563' }}>Permit Management</button>
      </div>

      {/* RENDER VIEW BERDASARKAN SUB-TAB AKTIF */}
      {activeSubTab === 'management' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ color: '#4B5563', fontWeight: '700', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <th style={{ padding: '16px 24px' }}>Name</th>
                <th style={{ padding: '16px 24px' }}>Role</th>
                <th style={{ padding: '16px 24px' }}>Email</th>
                <th style={{ padding: '14px 24px' }}>WhatsApp Number</th>
                <th style={{ padding: '14px 24px' }}>Status</th>
                <th style={{ padding: '14px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length > 0 ? (
                staffList.map((staff) => {
                  const isLeave = staff.status?.toLowerCase() === 'on leave' || staff.status?.toLowerCase() === 'leave' || staff.status?.toLowerCase() === 'sick';
                  return (
                    <tr key={staff.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img src={staff.image_url} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}} />
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{staff.name}</p>
                            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>ID: STF-{String(staff.id).substring(0, 5).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{ backgroundColor: '#E0E7FF', color: '#4F46E5', padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold' }}>{staff.role}</span>
                      </td>
                      <td style={{ padding: '14px 24px', color: '#4B5563' }}>{staff.email || '-'}</td>
                      <td style={{ padding: '14px 24px', color: '#111827', fontWeight: 'bold' }}>{staff.whatsapp_number}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isLeave ? '#D97706' : '#10B981' }}>
                          <div style={{ width: '6px', height: '6px', backgroundColor: isLeave ? '#F59E0B' : '#10B981', borderRadius: '50%' }} />
                          <span>{isLeave ? 'On Leave' : 'Active'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '14px', alignItems: 'center' }}>
                          <Pencil size={15} color="#10B981" style={{ cursor: 'pointer' }} onClick={() => openEditModal(staff)} />
                          <Trash2 size={15} color="#EF4444" style={{ cursor: 'pointer' }} onClick={() => handleDeleteStaff(staff.id)} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>Katalog data karyawan masih kosong, Gar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* WORKSPACE PLACEHOLDERS UNTUK TAB AUTOMATION DAN PERMIT LU */}
      {activeSubTab === 'shift' && (
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #E5E7EB', textAlign: 'center', color: '#6B7280' }}>
          <h3>📅 Shift Management (Roster Automation Workspace)</h3>
          <p style={{ fontSize: '13.5px' }}>Fitur pengadaan penjadwalan otomatis tim barista & kasir Warung Kopi Jaya siap dikonfigurasi.</p>
        </div>
      )}

      {activeSubTab === 'permit' && (
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #E5E7EB', textAlign: 'center', color: '#6B7280' }}>
          <h3>📋 Permit Management (Leave Control Workspace)</h3>
          <p style={{ fontSize: '13.5px' }}>Pusat kontrol perizinan cuti, sakit, dan lembur darurat staff kasir cuanin.id.</p>
        </div>
      )}

      {/* ================= FORM MODAL INTERAKTIF: TAMBAH & EDIT STAFF (CRUD ENGINE) ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmitForm} style={{ width: '460px', backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#111827' }}>{editingStaff ? 'Ubah Profil Staff' : 'Registrasi Karyawan Baru'}</h2>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Lengkap</label>
                <input type="text" required placeholder="Contoh: Jordan Smith" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Email</label>
                <input type="email" placeholder="jordan@cuanin.id" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Jabatan / Peran</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff', height: '38px', cursor: 'pointer' }}>
                    <option value="Manager">Manager</option>
                    <option value="Barista">Barista</option>
                    <option value="Admin Stok">Admin Stok</option>
                    <option value="Kasir">Kasir</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Status Aktif</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', backgroundColor: '#fff', height: '38px', cursor: 'pointer' }}>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Sick">Sick</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nomor WhatsApp Tim</label>
                <input type="text" required placeholder="Contoh: +62856..." value={formData.whatsapp_number} onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>URL Foto Profil Avatar</label>
                <input type="text" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', outline: 'none' }} />
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Batal</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Simpan Data</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}