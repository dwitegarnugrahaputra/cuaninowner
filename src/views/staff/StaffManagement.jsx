import React, { useState, useEffect } from 'react';
import { UserPlus, Users2, UserCheck, CalendarDays, Pencil, Trash2, Loader2, X, Save } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function StaffManagement() {
  const [activeSubTab, setActiveSubTab] = useState('management');
  const [staffList, setStaffList] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [currentUid, setCurrentUserId] = useState(null);
  const [staffSummary, setStockSummary] = useState({ totalStaff: 0, activeStaff: 0, leaveStaff: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role_id: '', 
    email: '',
    password: '', 
    whatsapp_number: '',
    status: 'Active',
    image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
  });

  const fetchStaffAndRolesData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;
      
      const uid = session.user.id;
      setCurrentUserId(uid);

      const { data: rolesData } = await supabase.from('company_roles').select('id, role_name').eq('user_id', uid).order('role_name', { ascending: true });
      setAvailableRoles(rolesData || []);

      const { data: staffData } = await supabase
        .from('staff')
        .select('id, user_id, name, email, password, whatsapp_number, status, image_url, role_id, company_roles:role_id(id, role_name)')
        .eq('user_id', uid)
        .order('name', { ascending: true });

      if (staffData) {
        setStaffList(staffData);
        setStockSummary({
          totalStaff: staffData.length,
          activeStaff: staffData.filter(s => s.status?.toLowerCase() === 'active').length,
          leaveStaff: staffData.filter(s => s.status?.toLowerCase() === 'on leave' || s.status?.toLowerCase() === 'sick').length
        });
      }
    } catch (err) {
      console.error(err.message);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchStaffAndRolesData(); }, []);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', role_id: availableRoles.length > 0 ? availableRoles[0].id : '', email: '', password: '', whatsapp_number: '', status: 'Active', image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' });
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({ name: staff.name || '', role_id: staff.role_id || '', email: staff.email || '', password: staff.password || '', whatsapp_number: staff.whatsapp_number || '', status: staff.status || 'Active', image_url: staff.image_url || '' });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        user_id: currentUid,
        name: formData.name,
        role_id: Number(formData.role_id),
        email: formData.email,
        password: formData.password, // Simpan teks sandi langsung ke tabel
        whatsapp_number: formData.whatsapp_number,
        status: formData.status,
        image_url: formData.image_url
      };

      if (editingStaff) {
        const { error } = await supabase.from('staff').update(payload).eq('id', editingStaff.id);
        if (error) throw error;
        alert('Data staff berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('staff').insert([payload]);
        if (error) throw error;
        alert('Mock akun staff berhasil didaftarkan!');
      }
      setIsModalOpen(false);
      await fetchStaffAndRolesData();
    } catch (err) { alert(err.message); } finally { setIsLoading(false); }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Hapus staff ini, Gar?')) return;
    await supabase.from('staff').delete().eq('id', id);
    await fetchStaffAndRolesData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', backgroundColor: '#F8F9FA' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>Staff Management</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Configure and monitor your restaurant team pillars.</p>
        </div>
        <button onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}><UserPlus size={16} /> <span>Add New Staff</span></button>
      </div>

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

      <div style={{ display: 'inline-flex', backgroundColor: '#E5E7EB', padding: '4px', borderRadius: '10px', gap: '4px', alignSelf: 'flex-start' }}>
        <button onClick={() => setActiveSubTab('management')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'management' ? '#ffffff' : 'transparent', color: '#111827' }}>Staff Management</button>
        <button onClick={() => setActiveSubTab('shift')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'shift' ? '#ffffff' : 'transparent', color: '#4B5563' }}>Shift Management</button>
        <button onClick={() => setActiveSubTab('permit')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'permit' ? '#ffffff' : 'transparent', color: '#4B5563' }}>Permit Management</button>
      </div>

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
              {staffList.map((staff) => (
                <tr key={staff.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img src={staff.image_url} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{staff.name}</p>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>ID: STF-{staff.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}><span style={{ backgroundColor: '#E0E7FF', color: '#4F46E5', padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold' }}>{staff.company_roles ? staff.company_roles.role_name : 'Belum Ditentukan'}</span></td>
                  <td style={{ padding: '14px 24px', color: '#4B5563' }}>{staff.email}</td>
                  <td style={{ padding: '14px 24px', color: '#111827', fontWeight: 'bold' }}>{staff.whatsapp_number}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: staff.status === 'Active' ? '#10B981' : '#D97706' }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: staff.status === 'Active' ? '#10B981' : '#F59E0B', borderRadius: '50%' }} />
                      <span>{staff.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '14px', alignItems: 'center' }}>
                      <Pencil size={15} color="#10B981" style={{ cursor: 'pointer' }} onClick={() => openEditModal(staff)} />
                      <Trash2 size={15} color="#EF4444" style={{ cursor: 'pointer' }} onClick={() => handleDeleteStaff(staff.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmitForm} style={{ width: '460px', backgroundColor: '#ffffff', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#111827' }}>{editingStaff ? 'Ubah Profil Staff' : 'Registrasi Karyawan Baru'}</h2>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Lengkap</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Email Login Akun Staff (Mock Email)</label>
                <input type="email" required placeholder="contoh: bakis@gmail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Password Akses Mobile</label>
                <input type="text" required placeholder="Masukkan password staff" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Jabatan / Peran</label>
                  <select value={formData.role_id} onChange={(e) => setFormData({...formData, role_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', height: '38px' }}>
                    {availableRoles.map((role) => <option key={role.id} value={role.id}>{role.role_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Status Aktif</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', height: '38px' }}>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nomor WhatsApp Tim</label>
                <input type="text" required value={formData.whatsapp_number} onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#ffffff', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Simpan Data</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}