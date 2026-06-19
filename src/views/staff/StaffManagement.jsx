import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Users2, UserCheck, CalendarDays, Pencil, Trash2, Loader2 
} from 'lucide-react';

// Koneksi murni client Supabase proyek cuanin.id
import { supabase } from '../../config/supabaseClient';

export default function StaffManagement() {
  const [activeSubTab, setActiveSubTab] = useState('catalog');

  // Core Database States
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [staffSummary, setStockSummary] = useState({ totalStaff: 0, activeStaff: 0, leaveStaff: 0 });

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

  // ❌ DELETE PIPELINE MURNI IJO MERAH FIGMA
  const handleDeleteStaff = async (id) => {
    if (!id) return;
    if (!window.confirm('Hapus karyawan ini dari database, Gar?')) return;
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (error) throw error;
      await fetchStaffData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', width: '100%', backgroundColor: '#F8F9FA' }}>
      
      {/* ================= HEADER TITLE & ADD BUTTON ROW ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>Staff Management</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Configure and monitor your restaurant team pillars.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}>
          <UserPlus size={16} /> <span>Add New Staff</span>
        </button>
      </div>

      {/* ================= SMART CARDS ROW SUMMARY (MATCH FIGMA EXACTLY) ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        
        {/* CARD 1: TOTAL STAFF */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>Total Staff</span>
            <h2 style={{ margin: '14px 0 0 0', fontSize: '32px', fontWeight: '700', color: '#111827' }}>{staffSummary.totalStaff}</h2>
          </div>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#E6F4EA', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006847' }}>
            <Users2 size={16} />
          </div>
        </div>

        {/* CARD 2: ACTIVE STAFF */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>Active Staff</span>
            <h2 style={{ margin: '14px 0 0 0', fontSize: '32px', fontWeight: '700', color: '#111827' }}>{staffSummary.activeStaff}</h2>
          </div>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#EEF2FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
            <UserCheck size={16} />
          </div>
        </div>

        {/* CARD 3: ON LEAVE / SICK (TEXT COLOR RED MERAH TUA) */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>On Leave / Sick</span>
            <h2 style={{ margin: '14px 0 0 0', fontSize: '32px', fontWeight: '700', color: '#B91C1C' }}>{staffSummary.leaveStaff}</h2>
          </div>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#FEE2E2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B91C1C' }}>
            <CalendarDays size={16} />
          </div>
        </div>

      </div>

      {/* ================= 3 CAPSULE SUB-TABS NAVIGATION ================= */}
      <div style={{ display: 'inline-flex', backgroundColor: '#E5E7EB', padding: '4px', borderRadius: '10px', gap: '4px', alignSelf: 'flex-start', boxSizing: 'border-box' }}>
        <button onClick={() => setActiveSubTab('catalog')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'catalog' ? '#ffffff' : 'transparent', color: activeSubTab === 'catalog' ? '#111827' : '#4B5563', boxShadow: activeSubTab === 'catalog' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s' }}>Staff Catalog</button>
        <button onClick={() => setActiveSubTab('roster')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'roster' ? '#ffffff' : 'transparent', color: activeSubTab === 'roster' ? '#111827' : '#4B5563', transition: 'all 0.15s' }}>Roster Automation</button>
        <button onClick={() => setActiveSubTab('leave')} style={{ border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeSubTab === 'leave' ? '#ffffff' : 'transparent', color: activeSubTab === 'leave' ? '#111827' : '#4B5563', transition: 'all 0.15s' }}>Leave Control</button>
      </div>

      {/* ================= TABLE LIST (MATCH FIGMA image_2de6c8.png) ================= */}
      {isLoading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Loader2 size={16} className="animate-spin" /> <span>Loading cloud data...</span>
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ color: '#4B5563', fontWeight: '700', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB' }}>
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
                  const isLeave = staff.status?.toLowerCase() === 'on leave' || staff.status?.toLowerCase() === 'leave';
                  
                  // Role Badge dinamis figma
                  let roleBg = '#EEF2FF'; let roleColor = '#4F46E5'; 
                  if (staff.role?.toLowerCase() === 'admin stok' || staff.role?.toLowerCase() === 'stock') {
                    roleBg = '#E0E7FF'; roleColor = '#3B82F6';
                  } else if (staff.role?.toLowerCase() === 'kasir' || staff.role?.toLowerCase() === 'cashier') {
                    roleBg = '#E0E7FF'; roleColor = '#6366F1';
                  }

                  return (
                    <tr key={staff.id} style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: '#ffffff' }}>
                      
                      {/* NAME FIELD WITH SUB-ID */}
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img 
                            src={staff.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                            alt="avatar" 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{staff.name}</p>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'block', marginTop: '1px' }}>ID: {String(staff.id).substring(0, 8).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>

                      {/* ROLE CAPSULE */}
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{ backgroundColor: roleBg, color: roleColor, padding: '4px 10px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold', display: 'inline-block' }}>
                          {staff.role}
                        </span>
                      </td>

                      {/* EMAIL ADDRESS */}
                      <td style={{ padding: '14px 24px', color: '#4B5563', fontWeight: '500' }}>
                        {staff.email || `${staff.name?.toLowerCase()}@gmail.com`}
                      </td>

                      {/* WHATSAPP NUMBER (BOLD BLACK TEXT MATCH FIGMA) */}
                      <td style={{ padding: '14px 24px', color: '#111827', fontWeight: 'bold' }}>
                        {staff.whatsapp_number || staff.phone || '+6285645558823'}
                      </td>

                      {/* STATUS BULAT */}
                      <td style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isLeave ? '#D97706' : '#10B981' }}>
                          <div style={{ width: '6px', height: '6px', backgroundColor: isLeave ? '#F59E0B' : '#10B981', borderRadius: '50%' }} />
                          <span>{isLeave ? 'On Leave' : 'Active'}</span>
                        </div>
                      </td>

                      {/* ACTIONS EDIT PENSIL IJO + TRASH MERAH */}
                      <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '14px', alignItems: 'center' }}>
                          <Pencil size={15} color="#10B981" style={{ cursor: 'pointer' }} />
                          <Trash2 size={15} color="#EF4444" style={{ cursor: 'pointer' }} onClick={() => handleDeleteStaff(staff.id)} />
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>Katalog data karyawan masih kosong.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}