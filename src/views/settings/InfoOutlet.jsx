import React, { useState } from 'react';
import { FileText, MapPin, Phone, Mail, Clock, Save, Plus, Trash2, Shield, X, CheckSquare, Square } from 'lucide-react';

export default function InfoOutlet({ onSaveSuccess }) {
  // State utama untuk mengelola daftar peran (role)
  const [roles, setRoles] = useState(['Manager', 'Barista', 'Kasir']);
  
  // State untuk kendali modal popup
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  
  // State mockup untuk permissions di dalam modal
  const [permissions, setPermissions] = useState({
    viewSales: true,
    manageStock: false,
    manageMenu: false,
  });

  // Fungsi menambahkan role baru dari modal
  const handleAddRoleSubmit = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    
    // Validasi duplikat nama peran
    if (roles.some(role => role.toLowerCase() === newRoleName.trim().toLowerCase())) {
      alert('Peran ini sudah terdaftar, Gar!');
      return;
    }

    setRoles([...roles, newRoleName.trim()]);
    
    // Reset state dan tutup modal
    setNewRoleName('');
    setPermissions({ viewSales: true, manageStock: false, manageMenu: false });
    setIsRoleModalOpen(false);
  };

  // Fungsi mengurangi atau menghapus role
  const handleDecreaseRole = (roleToDelete) => {
    if (roles.length <= 1) {
      alert('Minimal harus ada satu peran aktif tersisa untuk operasional gerai, Gar!');
      return;
    }
    
    if (window.confirm(`Yakin mau menghapus peran "${roleToDelete}" dari sistem outlet, Gar?`)) {
      setRoles(roles.filter(role => role !== roleToDelete));
    }
  };

  // Toggle state permission mockup
  const togglePermission = (key) => {
    setPermissions({ ...permissions, [key]: !permissions[key] });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.2s ease-out', textAlign: 'left', position: 'relative' }}>
      
      {/* Header Title Section */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Info Outlet</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Kelola profil hukum, alamat fisik, peran staf, dan parameter operasional gerai aktif lu.</p>
      </div>

      {/* Main Split Layout Grid Forms (Sesuai image_311c58.png) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* BLOK KIRI: PROFIL, LOKASI, DAN MANAJEMEN ROLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Identitas & Legalitas Gerai */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>
              Identitas & Legalitas Gerai
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Outlet / Cabang</label>
                <input type="text" defaultValue="Warung Kopi Jaya" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Nomor Induk Berusaha (NIB)</label>
                  <input type="text" defaultValue="1209849201948" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori Bisnis</label>
                  <select style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                    <option>Food & Beverages (Coffee Shop)</option>
                    <option>Retail / Kelontong</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Kontak & Lokasi Fisik */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>
              Lokasi & Kontak Cabang
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Nomor Telepon Outlet</label>
                  <input type="text" defaultValue="08123456789" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Email Resmi Cabang</label>
                  <input type="email" defaultValue="kopijaya.selatan@cuanin.id" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Alamat Fisik Lengkap</label>
                <textarea rows="3" defaultValue="Jl. Teuku Umar No.42, Kota Tegal, Jawa Tengah, 52123" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif', resize: 'none' }}></textarea>
              </div>
            </div>
          </div>

          {/* CARD 3: MANAJEMEN PERAN KERJA (Sesuai Letak Grid image_311c58.png) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#006847" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>
                  Manajemen Peran Kerja (Role)
                </h3>
              </div>
              {/* Tombol Pemicu Modal Popup Baru */}
              <button 
                type="button" 
                onClick={() => setIsRoleModalOpen(true)}
                style={{ padding: '8px 14px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Tambah Peran Baru
              </button>
            </div>

            {/* List Render Peran Aktif */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#9CA3AF', display: 'block', letterSpacing: '0.5px' }}>DAFTAR PERAN AKTIF SAAT INI</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {roles.map((role, idx) => (
                  <div 
                    key={idx} 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px' }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{role}</span>
                    <button 
                      type="button"
                      onClick={() => handleDecreaseRole(role)}
                      style={{ border: 'none', backgroundColor: 'transparent', color: '#9CA3AF', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* BLOK KANAN: PARAMETER OPERASIONAL & PAJAK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>
              Aturan Operasional & Pajak
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Jam Buka Toko</label>
                  <input type="time" defaultValue="08:00" style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Jam Tutup Toko</label>
                  <input type="time" defaultValue="23:00" style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              
              <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Pajak Restoran / PB1 (%)</label>
                  <input type="number" defaultValue="10" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Biaya Layanan (Rp)</label>
                  <input type="number" defaultValue="2000" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={onSaveSuccess}
            style={{ width: '100%', padding: '14px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 104, 71, 0.2)' }}
          >
            <Save size={16} /> Simpan Perubahan Outlet
          </button>
        </div>

      </div>

      {/* ================= WINDOW POPUP OVERLAY: TAMBAH ROLE BARU ================= */}
      {isRoleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ width: '440px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            
            {/* Header Modal */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
                <Shield size={16} color="#006847" />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Buat Peran Baru</h2>
              </div>
              <X size={18} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsRoleModalOpen(false)} />
            </div>

            {/* Body Form Modal */}
            <form onSubmit={handleAddRoleSubmit}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Input Nama Peran */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Peran (Role Name)</label>
                  <input 
                    type="text" 
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Contoh: Supervisor, Kitchen Staff..." 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>

                {/* Checklist Otoritas Mockup */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block' }}>Hak Akses Fitur (Permissions)</label>
                  
                  <div onClick={() => togglePermission('viewSales')} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151', cursor: 'pointer', padding: '6px 0' }}>
                    {permissions.viewSales ? <CheckSquare size={16} color="#006847" /> : <Square size={16} color="#9CA3AF" />}
                    <span>Dapat Melihat Analytics & Omzet Sales</span>
                  </div>

                  <div onClick={() => togglePermission('manageStock')} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151', cursor: 'pointer', padding: '6px 0' }}>
                    {permissions.manageStock ? <CheckSquare size={16} color="#006847" /> : <Square size={16} color="#9CA3AF" />}
                    <span>Dapat Mengelola & Mengedit Stok Bahan Baku</span>
                  </div>

                  <div onClick={() => togglePermission('manageMenu')} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151', cursor: 'pointer', padding: '6px 0' }}>
                    {permissions.manageMenu ? <CheckSquare size={16} color="#006847" /> : <Square size={16} color="#9CA3AF" />}
                    <span>Dapat Mengubah Harga & Katalog Menu</span>
                  </div>
                </div>

              </div>

              {/* Footer Modal Action Buttons */}
              <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsRoleModalOpen(false)} style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Buat Peran</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}