import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, Plus, Filter, ArrowUpDown, Edit2,
  CalendarDays, X, ImageIcon, Save, Lock, LogOut, ChevronDown, ChevronUp, 
  Store, Sliders, ShieldCheck, User, Key, Globe, Shield, UserPlus, Users2, UserCheck, Trash2,
  MessageSquare, Calendar, Clock
} from 'lucide-react';

// Impor koneksi client Supabase murni 
import { supabase } from '../../config/supabaseClient';

// Import komponen form internal settings yang sudah kita desentralisasikan
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';
import Keamanan from '../settings/Keamanan.jsx';
import Bahasa from '../settings/Bahasa.jsx'; 
import EditProfile from '../dashboard/EditProfile.jsx'; 

function CuaninLogoMini() {
  return (
    <div style={{
      width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '6px', flexShrink: 0
    }}>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '5px', padding: '3px 0px 3px 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '3px 0 0 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ffffff', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginRight: '-1px' }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006847', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffManagement({ onNavigateView }) {
  const { logout } = useAuth();
  const currentView = 'staff';

  // State kendali interaksi UI internal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false); // ⚡ State modal tambah shift baru
  const [selectedRole, setSelectedRole] = useState('Manager');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState('staff-table');
  const [managementTab, setManagementTab] = useState('list'); // ⚡ Kendali Tab: 'list' atau 'shifts'

  // ================= STATE INTEGRASI DATABASE STAFF =================
  const [staffList, setStaffList] = useState([]);
  const [shiftsList, setShiftsList] = useState([]); // ⚡ State list data log roster shift
  const [isLoading, setIsLoading] = useState(true);
  const [staffSummary, setStaffSummary] = useState({ totalStaff: 0, activeStaff: 0, leaveStaff: 0 });

  // State Data Input Form Tambah Staf Baru (Create)
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    whatsapp_number: '',
    image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  });

  // ⚡ State Form Input Penugasan Jadwal Shift Baru
  const [newShift, setNewShift] = useState({
    staff_id: '',
    shift_name: 'Pagi',
    start_time: '07:00',
    end_time: '15:00',
    shift_date: new Date().toISOString().split('T')[0]
  });

  // Kontrol Data Staf yang Sedang Diedit (Update)
  const [editingStaff, setEditingStaff] = useState(null);

  // 🚀 PIPELINE 1: FETCH DATA TIM STAF & ROSTER SHIFT DARI SUPABASE
  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      // Ambil list kru karyawan
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (staffError) throw staffError;

      if (staffData) {
        setStaffList(staffData);
        const total = staffData.length;
        const active = staffData.filter(s => s.status === 'Active').length;
        const leave = staffData.filter(s => s.status === 'On Leave').length;
        setStaffSummary({ totalStaff: total, activeStaff: active, leaveStaff: leave });
      }

      // ⚡ FETCH LOG ROSTER SHIFT BERJALAN
      const { data: shiftData, error: shiftError } = await supabase
        .from('staff_shifts')
        .select('*, staff(name, role, image_url)')
        .order('shift_date', { ascending: false });

      if (shiftError) throw shiftError;
      if (shiftData) setShiftsList(shiftData);

    } catch (err) {
      console.error('⚠️ Gagal menyinkronkan pilar manajemen staf:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubView === 'staff-table') {
      fetchStaffData();
    }
  }, [activeSubView, managementTab]);

  // 🚀 PIPELINE 2: ACTION SIMPAN DATA STAF BARU (CREATE)
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.whatsapp_number.trim()) {
      alert('Nama, Email, dan Nomor WhatsApp pilar staf wajib diisi, Gar!');
      return;
    }

    try {
      const { error } = await supabase
        .from('staff')
        .insert([{
          name: newStaff.name,
          role: selectedRole, 
          email: newStaff.email,
          whatsapp_number: newStaff.whatsapp_number,
          status: 'Active',
          image_url: newStaff.image_url
        }]);

      if (error) throw error;

      setNewStaff({ name: '', email: '', whatsapp_number: '', image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' });
      setIsModalOpen(false);
      fetchStaffData();
      alert('Akun staf berhasil disimpan ke Supabase, Gar!');
    } catch (err) {
      alert('Gagal mendaftarkan staf baru: ' + err.message);
    }
  };

  // ⚡ 🚀 PIPELINE BARU: ACTION SIMPAN DATA ROSTER JADWAL SHIFT KRU (CREATE SHIFT)
  const handleCreateShift = async (e) => {
    e.preventDefault();
    if (!newShift.staff_id) {
      alert('Pilih personel staf yang mau dijadwalkan dulu, Gar!');
      return;
    }

    try {
      const { error } = await supabase
        .from('staff_shifts')
        .insert([newShift]);

      if (error) throw error;

      setIsShiftModalOpen(false);
      fetchStaffData();
      alert('Jadwal shift karyawan berhasil didaftarkan ke sistem, Gar!');
    } catch (err) {
      alert('Gagal memproses draf shift baru: ' + err.message);
    }
  };

  // 🚀 PIPELINE 3: ACTION SIMPAN PERUBAHAN DATA STAF (UPDATE)
  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!editingStaff.name.trim() || !editingStaff.email.trim() || !editingStaff.whatsapp_number.trim()) {
      alert('Nama, Email, dan Nomor WhatsApp staf tidak boleh kosong, Gar!');
      return;
    }

    try {
      const { error } = await supabase
        .from('staff')
        .update({
          name: editingStaff.name,
          role: editingStaff.role,
          email: editingStaff.email,
          whatsapp_number: editingStaff.whatsapp_number,
          status: editingStaff.status
        })
        .eq('id', editingStaff.id);

      if (error) throw error;

      setEditingStaff(null);
      fetchStaffData();
      alert('Data staf berhasil diperbarui, Gar!');
    } catch (err) {
      alert('Gagal mengupdate data staf: ' + err.message);
    }
  };

  // ⚡ 🚀 PIPELINE BARU: ACTION HAPUS JADWAL SHIFT ROSTER (DELETE SHIFT)
  const handleDeleteShift = async (id) => {
    if (!window.confirm('Hapus penugasan jadwal shift ini secara permanen, Gar?')) return;
    try {
      const { error } = await supabase
        .from('staff_shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchStaffData();
    } catch (err) {
      alert('Gagal membatalkan jadwal kerja shift: ' + err.message);
    }
  };

  // 🚀 PIPELINE 4: ACTION TOGGLE UPDATE STATUS KERJA (QUICK UPDATE)
  const handleToggleStaffStatus = async (id, currentStatus) => {
    let nextStatus = 'Active';
    if (currentStatus === 'Active') nextStatus = 'On Leave';
    else if (currentStatus === 'On Leave') nextStatus = 'Inactive';

    try {
      const { error } = await supabase
        .from('staff')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;
      fetchStaffData();
    } catch (err) {
      console.error('⚠️ Gagal merubah status kerja staf:', err.message);
    }
  };

  // 🚀 PIPELINE 5: ACTION HAPUS AKUN STAF (DELETE)
  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Apakah lu yakin pengen menghapus akun staf ini secara permanen dari database, Gar?')) return;
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchStaffData();
    } catch (err) {
      alert('Gagal menghapus data staf: ' + err.message);
    }
  };

  // Otomatis atur jam kerja pas dropdown template nama shift diganti
  const handleShiftNameChange = (name) => {
    let start = '07:00';
    let end = '15:00';
    if (name === 'Siang') { start = '15:00'; end = '23:00'; }
    else if (name === 'Malam') { start = '23:00'; end = '07:00'; }

    setNewShift({ ...newShift, shift_name: name, start_time: start, end_time: end });
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0, position: 'relative' }}>
      
      {/* ================= SIDEBAR AREA ================= */}
      <div style={{ width: isMainSidebarOpen ? '260px' : '80px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0, transition: 'width 0.3s ease-in-out', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'space-between' : 'center', padding: '0 20px', marginBottom: '32px', height: '40px' }}>
          <div onClick={() => !isMainSidebarOpen && setIsMainSidebarOpen(true)} style={{ cursor: !isMainSidebarOpen ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CuaninLogoMini />
            {isMainSidebarOpen && (
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
                <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
              </div>
            )}
          </div>
          {isMainSidebarOpen && (
            <div onClick={() => { setIsMainSidebarOpen(false); setIsSettingsOpen(false); }} style={{ cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Menu size={16} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: isMainSidebarOpen ? '0 16px' : '0' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard', action: () => onNavigateView('dashboard') },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales', action: () => onNavigateView('sales') },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock', action: () => onNavigateView('stock') },
            { name: 'Menu Management', icon: <Menu size={18} />, target: 'menu', action: () => onNavigateView('menu') },
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff', action: () => setActiveSubView('staff-table') } 
          ].map((menu, idx) => {
            const isActive = currentView === menu.target && activeSubView === 'staff-table';
            return (
              <div key={idx} onClick={menu.action} style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'flex-start' : 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: isActive ? 'bold' : '500', backgroundColor: isActive ? '#006847' : 'transparent', color: isActive ? '#ffffff' : '#93C5FD', transition: 'all 0.3s ease-in-out' }}>
                {menu.icon} {isMainSidebarOpen && <span style={{ fontSize: '14px' }}>{menu.name}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ padding: isMainSidebarOpen ? '0 16px' : '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div onClick={() => isMainSidebarOpen ? setIsSettingsOpen(!isSettingsOpen) : setIsMainSidebarOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'space-between' : 'center', padding: '12px 16px', color: isSettingsOpen || (activeSubView !== 'staff-table' && activeSubView !== 'edit-profile') ? '#ffffff' : '#93C5FD', backgroundColor: isSettingsOpen || (activeSubView !== 'staff-table' && activeSubView !== 'edit-profile') ? 'rgba(255, 255, 255, 0.08)' : 'transparent', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {isMainSidebarOpen && <div style={{ transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><ChevronDown size={14} /></div>}
          </div>

          {isMainSidebarOpen && (
            <div style={{ maxHeight: isSettingsOpen ? '200px' : '0px', opacity: isSettingsOpen ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.4s, opacity 0.3s', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '14px', marginBottom: '4px' }}>
              {[
                { name: 'Info Outlet', icon: <Store size={14} />, target: 'info-outlet' }, 
                { name: 'Konfigurasi AI', icon: <Sliders size={14} />, target: 'konfigurasi-ai' }, 
                { name: 'Keamanan', icon: <ShieldCheck size={14} />, target: 'keamanan' },
                { name: 'Bahasa', icon: <Globe size={14} />, target: 'bahasa' }
              ].map((sub, i) => (
                <div key={i} onClick={() => setActiveSubView(sub.target)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', color: activeSubView === sub.target ? '#ffffff' : '#93C5FD', backgroundColor: activeSubView === sub.target ? '#006847' : 'transparent', fontSize: '12px', cursor: 'pointer' }}>
                  {sub.icon} <span>{sub.name}</span>
                </div>
              ))}
            </div>
          )}

          <div onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'flex-start' : 'center', gap: '12px', padding: '12px 16px', color: '#FFCACA', borderRadius: '10px', cursor: 'pointer' }}>
            <LogOut size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px' }}>Logout</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'flex-start' : 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#111827', borderRadius: '12px', marginTop: '4px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1E3A8A', fontSize: '12px', flexShrink: 0 }}>WJ</div>
            {isMainSidebarOpen && <div style={{ flex: 1, textAlign: 'left' }}><p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p><span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>PREMIUM</span></div>}
          </div>
        </div>
      </div>

      {/* ================= MAIN WORKSPACE KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOPBAR AREA */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search team members by name or email..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <MessageSquare size={16} /> Ask Brainy
            </button>
            <Bell size={20} color="#4B5563" /><HelpCircle size={20} color="#4B5563" />
            
            <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px', cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Alex Graham {isProfileOpen ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                </p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>OWNER</span>
              </div>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>

            <div style={{ position: 'absolute', top: '55px', right: '0px', width: '220px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: isProfileOpen ? 'flex' : 'none', flexDirection: 'column', padding: '6px' }}>
              <div onClick={() => { setActiveSubView('edit-profile'); setIsProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }}><User size={14} /> <span>Edit Profile</span></div>
              <div onClick={() => { setActiveSubView('keamanan'); setIsProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }}><Shield size={14} /> <span>Account Security</span></div>
            </div>
          </div>
        </div>

        {/* CONTAINER CONTENT VIEW */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', position: 'relative' }}>
          
          {activeSubView === 'info-outlet' && <InfoOutlet onSaveSuccess={() => setActiveSubView('staff-table')} />}
          {activeSubView === 'konfigurasi-ai' && <KonfigurasiAI onSaveSuccess={() => setActiveSubView('staff-table')} />}
          {activeSubView === 'keamanan' && <Keamanan onSaveSuccess={() => setActiveSubView('staff-table')} />}
          {activeSubView === 'bahasa' && <Bahasa onSaveSuccess={() => setActiveSubView('staff-table')} />}
          {activeSubView === 'edit-profile' && <EditProfile onSaveSuccess={() => setActiveSubView('staff-table')} />}

          {activeSubView === 'staff-table' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Staff Management</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Configure and monitor your restaurant team pillars.</p>
                </div>
                
                {/* ⚡ CONDITIONAL ACTION BUTTON BASED ON ACTIVE SUB-TAB */}
                {managementTab === 'list' ? (
                  <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <UserPlus size={16} /> Add New Staff
                  </button>
                ) : (
                  <button onClick={() => setIsShiftModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#1E3A8A', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <Calendar size={16} /> Assign New Shift
                  </button>
                )}
              </div>

              {/* THREE METRICS CARDS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>Total Staff</span>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users2 size={16} /></div>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>{staffSummary.totalStaff}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>Active Staff</span>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#EEF2FF', color: '#4F46E5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={16} /></div>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>{staffSummary.activeStaff}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 'bold' }}>On Leave</span>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarDays size={16} /></div>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#DC2626' }}>{staffSummary.leaveStaff}</h2>
                </div>
              </div>

              {/* ⚡ SUB-TAB CONTROLLER BAR AREA */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#E5E7EB', padding: '4px', borderRadius: '10px', width: '320px' }}>
                <button onClick={() => setManagementTab('list')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: managementTab === 'list' ? '#ffffff' : 'transparent', color: managementTab === 'list' ? '#111827' : '#4B5563' }}>
                  Staff Catalog
                </button>
                <button onClick={() => setManagementTab('shifts')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: managementTab === 'shifts' ? '#ffffff' : 'transparent', color: managementTab === 'shifts' ? '#111827' : '#4B5563' }}>
                  Shift Roster
                </button>
              </div>

              {/* VIEW AREA 1: TABEL CATALOG STAFF */}
              {managementTab === 'list' && (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '320px' }}>
                      <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                      <input type="text" placeholder="Search team members..." style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', outline: 'none', backgroundColor: '#F9FAFB' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}><Filter size={14}/> Filter</button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', cursor: 'pointer' }}><ArrowUpDown size={14}/> Sort</button>
                    </div>
                  </div>

                  {staffList.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>
                          <th style={{ padding: '14px 24px' }}>Name</th>
                          <th style={{ padding: '14px 24px' }}>Role</th>
                          <th style={{ padding: '14px 24px' }}>Email</th>
                          <th style={{ padding: '14px 24px' }}>WhatsApp Number</th>
                          <th style={{ padding: '14px 24px' }}>Status</th>
                          <th style={{ padding: '14px 24px', textAlign: 'right', width: '100px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map((staff) => (
                          <tr key={staff.id} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827', backgroundColor: staff.status === 'Inactive' ? '#FAF8F8' : 'transparent' }}>
                            <td style={{ padding: '14px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <img src={staff.image_url} alt={staff.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}} />
                                <div>
                                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{staff.name}</p>
                                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>ID: {staff.id.substring(0,8).toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 24px' }}>
                              <span style={{ 
                                backgroundColor: staff.role === 'Manager' ? '#EEF2FF' : staff.role === 'Admin Stok' ? '#E6F4EA' : '#FFF7ED', 
                                color: staff.role === 'Manager' ? '#4F46E5' : staff.role === 'Admin Stok' ? '#006847' : '#C2410C', 
                                padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' 
                              }}>
                                {staff.role}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', color: '#4B5563' }}>{staff.email}</td>
                            <td style={{ padding: '14px 24px', fontWeight: 'bold', color: '#1E3A8A' }}>+{staff.whatsapp_number}</td>
                            <td style={{ padding: '14px 24px' }}>
                              <span 
                                onClick={() => handleToggleStaffStatus(staff.id, staff.status)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: staff.status === 'On Leave' ? '#D97706' : staff.status === 'Active' ? '#059669' : '#DC2626', cursor: 'pointer' }}
                              >
                                <div style={{ width: '6px', height: '6px', backgroundColor: staff.status === 'On Leave' ? '#FBBF24' : staff.status === 'Active' ? '#10B981' : '#DC2626', borderRadius: '50%' }} />
                                {staff.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', color: '#9CA3AF' }}>
                                <Edit2 size={16} style={{ cursor: 'pointer', color: '#006847' }} onClick={() => setEditingStaff(staff)} />
                                <Trash2 size={16} style={{ cursor: 'pointer', color: '#DC2626' }} onClick={() => handleDeleteStaff(staff.id)} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280', fontStyle: 'italic' }}>
                      Belum ada pilar staf yang terdaftar di database, Gar.
                    </div>
                  )}
                </div>
              )}

              {/* ⚡ VIEW AREA 2: TABEL MANAJEMEN ROSTER SHIFT KERJA STAFF */}
              {managementTab === 'shifts' && (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>
                        <th style={{ padding: '14px 24px' }}>Staff Personel</th>
                        <th style={{ padding: '14px 24px' }}>Tanggal Kerja</th>
                        <th style={{ padding: '14px 24px' }}>Nama Shift</th>
                        <th style={{ padding: '14px 24px' }}>Jam Operasional</th>
                        <th style={{ padding: '14px 24px', textAlign: 'right', width: '100px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftsList.length > 0 ? (
                        shiftsList.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                            <td style={{ padding: '14px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={log.staff?.image_url} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}} alt="avatar"/>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 'bold' }}>{log.staff?.name || 'Karyawan Terhapus'}</p>
                                  <span style={{ fontSize: '10px', color: '#6B7280' }}>{log.staff?.role}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 24px', fontWeight: '500', color: '#4B5563' }}>
                              {new Date(log.shift_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td style={{ padding: '14px 24px' }}>
                              <span style={{ 
                                backgroundColor: log.shift_name === 'Pagi' ? '#E6F4EA' : log.shift_name === 'Siang' ? '#FFF7ED' : '#F3F4F6', 
                                color: log.shift_name === 'Pagi' ? '#006847' : log.shift_name === 'Siang' ? '#D97706' : '#111827', 
                                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' 
                              }}>
                                Shift {log.shift_name}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', fontWeight: 'bold', color: '#1E3A8A' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} color="#9CA3AF"/> {log.start_time.substring(0,5)} – {log.end_time.substring(0,5)}
                              </div>
                            </td>
                            <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                              <button onClick={() => handleDeleteShift(log.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }} title="Batalkan Shift">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: '#6B7280', fontStyle: 'italic' }}>
                            Belum ada pembagian draf roster shift terdaftar minggu ini, Gar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* ================= WINDOW POPUP OVERLAY ADD NEW STAFF ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateStaff} style={{ width: '480px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Tambah Staf Baru</h2>
              <X size={18} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '0 auto 6px auto' }}>
                <div style={{ width: '80px', height: '80px', border: '1px dashed #D1D5DB', borderRadius: '50%', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <ImageIcon size={18} color="#9CA3AF" />
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#6B7280' }}>AVATAR</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  placeholder="Masukkan nama lengkap staf" 
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>Role</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Kasir', 'Admin Stok'].map((role) => (
                    <span
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: selectedRole === role ? '#006847' : '#E5E7EB',
                        color: selectedRole === role ? '#ffffff' : '#4B5563'
                      }}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Alamat Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="contoh@cuanin.id" 
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Nomor WhatsApp</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 628123456xxx" 
                    value={newStaff.whatsapp_number}
                    onChange={(e) => setNewStaff({...newStaff, whatsapp_number: e.target.value.replace(/[^0-9]/g, '')})}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Buat Password Akun</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                  <input 
                    type="password" 
                    placeholder="Masukkan password untuk kredensial login" 
                    style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FCFDFD' }} 
                  />
                </div>
                <span style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', display: 'block' }}>*Password ini bakal digunain kru terkait pas pertama kali masuk aplikasi.</span>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Simpan Data Staf</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= ⚡ MODAL BARU: WINDOW POPUP ASSIGN SHIFT ROSTER ================= */}
      {isShiftModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateShift} style={{ width: '440px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Atur Jadwal Shift Personel</h2>
              <X size={18} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsShiftModalOpen(false)} />
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Pilih Karyawan</label>
                <select required value={newShift.staff_id} onChange={(e) => setNewShift({...newShift, staff_id: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="">-- Pilih Anggota Kru Kopi --</option>
                  {staffList.filter(s => s.status !== 'Inactive').map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Template Shift</label>
                <select value={newShift.shift_name} onChange={(e) => handleShiftNameChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="Pagi">Pagi (07:00 - 15:00)</option>
                  <option value="Siang">Siang (15:00 - 23:00)</option>
                  <option value="Malam">Malam (23:00 - 07:00)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Jam Mulai</label>
                  <input type="time" required value={newShift.start_time} onChange={(e) => setNewShift({...newShift, start_time: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Jam Selesai</label>
                  <input type="time" required value={newShift.end_time} onChange={(e) => setNewShift({...newShift, end_time: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Tanggal Penugasan</label>
                <input type="date" required value={newShift.shift_date} onChange={(e) => setNewShift({...newShift, shift_date: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setIsShiftModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#1E3A8A', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Konfirmasi Shift</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= EDIT STAFF POPUP AREA ================= */}
      {editingStaff && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleUpdateStaff} style={{ width: '480px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Edit Informasi Staf</h2>
              <X size={18} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setEditingStaff(null)} />
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Lengkap</label>
                <input type="text" required value={editingStaff.name} onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '8px' }}>Role</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Kasir', 'Admin Stok'].map((role) => (
                    <span key={role} onClick={() => setEditingStaff({...editingStaff, role: role})} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: editingStaff.role === role ? '#006847' : '#E5E7EB', color: editingStaff.role === role ? '#ffffff' : '#4B5563' }}>{role}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Alamat Email</label>
                  <input type="email" required value={editingStaff.email} onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Nomor WhatsApp</label>
                  <input type="text" required value={editingStaff.whatsapp_number} onChange={(e) => setEditingStaff({...editingStaff, whatsapp_number: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Status Kerja</label>
                <select value={editingStaff.status} onChange={(e) => setEditingStaff({...editingStaff, status: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setEditingStaff(null)} style={{ padding: '10px 20px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Perbarui Data</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}