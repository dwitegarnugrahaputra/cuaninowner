import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu as MenuIcon, Users, Settings, 
  Search, Bell, HelpCircle, Plus, Layers, AlertTriangle, Grid, SlidersHorizontal,
  Edit2, Trash2, ChevronLeft, ChevronRight, MessageSquare, X, Info, FileSpreadsheet,
  ImageIcon, Trash, Save, TrendingUp, LogOut, ChevronDown, ChevronUp, Store, Sliders, ShieldCheck, User, Key, Globe, Shield
} from 'lucide-react';

// Impor koneksi client Supabase murni 
import { supabase } from '../../config/supabaseClient';

// Import komponen form internal settings yang sudah kita desentralisasikan
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';
import Keamanan from '../settings/Keamanan.jsx';
import Bahasa from '../settings/Bahasa.jsx'; 
import EditProfile from '../dashboard/EditProfile.jsx'; 

// Logo cuanin.id versi mini murni CSS, presisi untuk Sidebar & Smart Cards
function CuaninLogoMini() {
  return (
    <div style={{
      width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '6px', flexShrink: 0
    }}>
      <div style={{
        width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '5px',
        padding: '3px 0px 3px 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '3px 0 0 3px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxSizing: 'border-box'
        }}>
          <div style={{
            width: '12px', height: '12px', backgroundColor: '#ffffff', borderRadius: '3px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginRight: '-1px'
          }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006847', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuManagement({ onNavigateView }) {
  const { logout } = useAuth();
  const currentView = 'menu';
  
  // State Manajemen Kontrol Popup Modal Tambah Menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Coffee');

  // State kendali interaksi UI internal untuk collapse sidebar dan pop-down settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  
  {/* State pengontrol buka-tutup dropdown mengambang profil topbar */}
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  {/* KUNCI SINKRONISASI WORKSPACE LENGKAP: 'menu-table' VS 'info-outlet' VS 'konfigurasi-ai' VS 'keamanan' VS 'bahasa' VS 'edit-profile' */}
  const [activeSubView, setActiveSubView] = useState('menu-table');

  // ================= STATE INTEGRASI DATABASE MENU (CRUD AREA) =================
  const [menus, setMenus] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]); // Bahan baku gudang
  const [isLoading, setIsLoading] = useState(true);
  const [menuSummary, setMenuSummary] = useState({
    totalItems: 0,
    totalCategories: 0,
    outOfStockCount: 0
  });

  // State Kontrol Input Form Tambah Menu Baru (Create)
  const [newMenu, setNewMenu] = useState({
    menu_name: '',
    price: '',
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&auto=format&fit=crop'
  });

  // State resep dinamis untuk ADD NEW ITEM modal
  const [recipeRows, setRecipeRows] = useState([
    { inventory_id: '', usage_quantity: '' }
  ]);

  // State Kontrol Data Menu yang Sedang Diedit (Update)
  const [editingMenu, setEditingMenu] = useState(null);
  const [editRecipeRows, setEditRecipeRows] = useState([]); // Resep dinamis modal edit

  // 🚀 PIPELINE 1: FETCH DATA MENU & INVENTORY (READ) FROM SUPABASE
  const fetchMenuCatalog = async () => {
    if (activeSubView !== 'menu-table') return;
    setIsLoading(true);
    try {
      // Fetch Katalog Menu
      const { data: menuData, error: menuError } = await supabase
        .from('menus')
        .select('*')
        .order('category', { ascending: true })
        .order('menu_name', { ascending: true });

      if (menuError) throw menuError;

      // Fetch Bahan Baku untuk Dropdown Resep
      const { data: invData, error: invError } = await supabase
        .from('inventory')
        .select('id, name, unit, stock');

      if (invError) throw invError;

      // DATA DUMMY FALLBACK
      if (!invData || invData.length === 0) {
        const localDummyInventory = [
          { id: '1', name: 'Espresso Beans Houseblend', unit: 'gram', stock: 5000 },
          { id: '2', name: 'Fresh Milk Diamond', unit: 'ml', stock: 10000 },
          { id: '3', name: 'Liquid Aren Sugar', unit: 'ml', stock: 3000 },
          { id: '4', name: 'Caramel Syrup', unit: 'ml', stock: 2000 },
          { id: '5', name: 'Croissant Dough', unit: 'pcs', stock: 50 },
          { id: '6', name: 'Matcha Powder Premium', unit: 'gram', stock: 1500 }
        ];
        setInventoryItems(localDummyInventory);
      } else {
        setInventoryItems(invData);
      }

      if (menuData) {
        setMenus(menuData);

        const uniqueCategories = new Set(menuData.map(item => item.category)).size;
        
        // Kebal data NULL: Menganggap data kosong/NULL sebagai Available, hanya menghitung yang eksplisit false
        const outOfStockItems = menuData.filter(item => item.is_available === false).length;

        setMenuSummary({
          totalItems: menuData.length,
          totalCategories: uniqueCategories,
          outOfStockCount: outOfStockItems
        });
      }
    } catch (err) {
      console.error('⚠️ Gagal memuat katalog menu dari Supabase, mengaktifkan data dummy:', err.message);
      const localDummyInventory = [
        { id: '1', name: 'Espresso Beans Houseblend', unit: 'gram', stock: 5000 },
        { id: '2', name: 'Fresh Milk Diamond', unit: 'ml', stock: 10000 },
        { id: '3', name: 'Liquid Aren Sugar', unit: 'ml', stock: 3000 },
        { id: '4', name: 'Caramel Syrup', unit: 'ml', stock: 2000 },
        { id: '5', name: 'Croissant Dough', unit: 'pcs', stock: 50 },
        { id: '6', name: 'Matcha Powder Premium', unit: 'gram', stock: 1500 }
      ];
      setInventoryItems(localDummyInventory);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuCatalog();
  }, [activeSubView]);

  // --- LOGIC HANDLING RECIPIES ROW (ADD MODAL) ---
  const handleAddRecipeRow = () => {
    setRecipeRows([...recipeRows, { inventory_id: '', usage_quantity: '' }]);
  };

  const handleRemoveRecipeRow = (index) => {
    if (recipeRows.length === 1) {
      setRecipeRows([{ inventory_id: '', usage_quantity: '' }]);
    } else {
      setRecipeRows(recipeRows.filter((_, i) => i !== index));
    }
  };

  const handleRecipeRowChange = (index, field, value) => {
    const updated = [...recipeRows];
    updated[index][field] = value;
    setRecipeRows(updated);
  };

  // --- LOGIC HANDLING RECIPIES ROW (EDIT MODAL) ---
  const handleAddEditRecipeRow = () => {
    setEditRecipeRows([...editRecipeRows, { inventory_id: '', usage_quantity: '' }]);
  };

  const handleRemoveEditRecipeRow = (index) => {
    if (editRecipeRows.length === 1) {
      setEditRecipeRows([{ inventory_id: '', usage_quantity: '' }]);
    } else {
      setEditRecipeRows(editRecipeRows.filter((_, i) => i !== index));
    }
  };

  const handleEditRecipeRowChange = (index, field, value) => {
    const updated = [...editRecipeRows];
    updated[index][field] = value;
    setEditRecipeRows(updated);
  };

  // Safe Parsing saat mulai memicu Edit Modal
  const startEditing = (item) => {
    setEditingMenu({ ...item });
    
    if (item.recipe) {
      try {
        let parsed = typeof item.recipe === 'string' ? JSON.parse(item.recipe) : item.recipe;
        if (Array.isArray(parsed)) {
          setEditRecipeRows(parsed.map(r => ({
            inventory_id: r.inventory_id ? r.inventory_id.toString() : '',
            usage_quantity: r.usage_quantity || ''
          })));
        } else {
          setEditRecipeRows([{ inventory_id: '', usage_quantity: '' }]);
        }
      } catch (e) {
        console.error("Gagal parsing data resep, diset baris kosong:", e);
        setEditRecipeRows([{ inventory_id: '', usage_quantity: '' }]);
      }
    } else {
      setEditRecipeRows([{ inventory_id: '', usage_quantity: '' }]);
    }
  };

  // 🚀 PIPELINE 2: ACTION TAMBAH MENU BARU (CREATE) - FORCED DATA INJECTION
  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!newMenu.menu_name.trim() || !newMenu.price || Number(newMenu.price) <= 0) {
      alert('Nama menu dan harga jual wajib diisi secara valid, Gar!');
      return;
    }

    const validRecipes = recipeRows.filter(row => row.inventory_id && row.usage_quantity);

    try {
      // Dipaksa ngirim is_available: true murni biar ga null di DB lo
      const { error } = await supabase
        .from('menus')
        .insert([{
          menu_name: newMenu.menu_name,
          category: selectedCategory,
          price: parseFloat(newMenu.price),    
          image_url: newMenu.image_url,
          is_available: true,                  
          recipe: JSON.stringify(validRecipes) 
        }]);

      if (error) throw error;

      alert('Menu berhasil disimpan ke database cloud!');
      
      // Reset State form input
      setNewMenu({ menu_name: '', price: '', image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&auto=format&fit=crop' });
      setRecipeRows([{ inventory_id: '', usage_quantity: '' }]);
      setIsModalOpen(false);

      // Tarik ulang katalog data dari cloud Supabase
      await fetchMenuCatalog();
      
    } catch (err) {
      console.error('⚠️ Detil Error Project:', err);
      alert('Gagal menyimpan menu baru: ' + err.message);
    }
  };

  // 🚀 PIPELINE 3: ACTION SIMPAN EDIT MENU (UPDATE KESELURUHAN)
  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (!editingMenu.menu_name.trim() || !editingMenu.price || Number(editingMenu.price) <= 0) {
      alert('Nama menu dan harga tidak boleh kosong, Gar!');
      return;
    }

    const validRecipes = editRecipeRows.filter(row => row.inventory_id && row.usage_quantity);

    try {
      const { error } = await supabase
        .from('menus')
        .update({
          menu_name: editingMenu.menu_name,
          category: editingMenu.category,
          price: parseFloat(editingMenu.price),
          image_url: editingMenu.image_url,
          recipe: JSON.stringify(validRecipes)
        })
        .eq('id', editingMenu.id);

      if (error) throw error;

      setEditingMenu(null); 
      fetchMenuCatalog();   
    } catch (err) {
      alert('Gagal mengupdate data menu: ' + err.message);
    }
  };

  // 🚀 PIPELINE 4: TOGGLE AVAILABILITY STATUS (QUICK UPDATE)
  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('menus')
        .update({ is_available: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchMenuCatalog();
    } catch (err) {
      console.error('⚠️ Gagal memperbarui status ketersediaan menu:', err.message);
    }
  };

  // 🚀 PIPELINE 5: ACTION HAPUS MENU (DELETE)
  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Apakah lu yakin pengen menghapus menu ini secara permanen dari database, Gar?')) return;
    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMenuCatalog();
    } catch (err) {
      alert('Gagal menghapus data menu: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0, position: 'relative' }}>
      
      {/* ================= 1. SIDEBAR KIRI COLLAPSIBLE ================= */}
      <div style={{ 
        width: isMainSidebarOpen ? '260px' : '80px', 
        backgroundColor: '#1E3A8A', 
        color: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '24px 0', 
        flexShrink: 0,
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden'
      }}>
        
        {/* Header Branding Sidebar dengan Trigger Collapse */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justify: isMainSidebarOpen ? 'space-between' : 'center', 
          padding: '0 20px', 
          marginBottom: '32px',
          height: '40px'
        }}>
          <div 
            onClick={() => !isMainSidebarOpen && setIsMainSidebarOpen(true)}
            style={{ cursor: !isMainSidebarOpen ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <CuaninLogoMini />
            {isMainSidebarOpen && (
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
                <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
              </div>
            )}
          </div>

          {isMainSidebarOpen && (
            <div 
              onClick={() => { setIsMainSidebarOpen(false); setIsSettingsOpen(false); }}
              style={{ cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <MenuIcon size={16} color="#93C5FD" />
            </div>
          )}
        </div>

        {/* Menu Utama List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: isMainSidebarOpen ? '0 16px' : '0' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard', action: () => onNavigateView('dashboard') },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales', action: () => onNavigateView('sales') },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock', action: () => onNavigateView('stock') },
            { name: 'Menu Management', icon: <MenuIcon size={18} />, target: 'menu', action: () => setActiveSubView('menu-table') }, 
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff', action: () => onNavigateView('staff') }
          ].map((menu, idx) => {
            const isActive = currentView === menu.target && activeSubView === 'menu-table';

            return (
              <div 
                key={idx} 
                onClick={menu.action} 
                title={!isMainSidebarOpen ? menu.name : ''}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: isMainSidebarOpen ? 'flex-start' : 'center',
                  gap: '12px', 
                  padding: '12px 16px', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  fontWeight: isActive ? 'bold' : '500',
                  backgroundColor: isActive ? '#006847' : 'transparent', 
                  color: isActive ? '#ffffff' : '#93C5FD',
                  transition: 'all 0.3s ease-in-out',
                  transform: (isActive && isMainSidebarOpen) ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {menu.icon} {isMainSidebarOpen && <span style={{ fontSize: '14px' }}>{menu.name}</span>}
              </div>
            );
          })}
        </div>

        {/* Footer Sidebar Area */}
        <div style={{ padding: isMainSidebarOpen ? '0 16px' : '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div 
            onClick={() => isMainSidebarOpen ? setIsSettingsOpen(!isSettingsOpen) : setIsMainSidebarOpen(true)} 
            title={!isMainSidebarOpen ? 'Settings' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justify: isMainSidebarOpen ? 'space-between' : 'center', 
              padding: '12px 16px', 
              color: isSettingsOpen || (activeSubView !== 'menu-table' && activeSubView !== 'edit-profile') ? '#ffffff' : '#93C5FD', 
              backgroundColor: isSettingsOpen || (activeSubView !== 'menu-table' && activeSubView !== 'edit-profile') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {isMainSidebarOpen && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <ChevronDown size={14} />
              </div>
            )}
          </div>

          {isMainSidebarOpen && (
            <div style={{
              maxHeight: isSettingsOpen ? '200px' : '0px',
              opacity: isSettingsOpen ? 1 : 0,
              paddingTop: isSettingsOpen ? '4px' : '0px',
              paddingBottom: isSettingsOpen ? '4px' : '0px',
              overflow: 'hidden',
              transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, padding 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              paddingLeft: '14px',
              marginBottom: '4px'
            }}>
              {[
                { name: 'Info Outlet', icon: <Store size={14} />, target: 'info-outlet' }, 
                { name: 'Konfigurasi AI', icon: <Sliders size={14} />, target: 'konfigurasi-ai' }, 
                { name: 'Keamanan', icon: <ShieldCheck size={14} />, target: 'keamanan' },
                { name: 'Bahasa', icon: <Globe size={14} />, target: 'bahasa' }
              ].map((sub, i) => {
                const isSubActive = activeSubView === sub.target;
                return (
                  <div 
                    key={i}
                    onClick={() => setActiveSubView(sub.target)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', 
                      borderRadius: '8px', 
                      color: isSubActive ? '#ffffff' : '#93C5FD', 
                      backgroundColor: isSubActive ? '#006847' : 'transparent',
                      fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {sub.icon} <span>{sub.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div 
            onClick={logout}
            title={!isMainSidebarOpen ? 'Logout' : ''}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justify: isMainSidebarOpen ? 'flex-start' : 'center',
              gap: '12px', 
              padding: '12px 16px', 
              color: '#FFCACA', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#F87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FFCACA'; }}
          >
            <LogOut size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: '500' }}>Logout</span>}
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justify: isMainSidebarOpen ? 'flex-start' : 'center',
            gap: '12px', 
            padding: '12px 16px', 
            backgroundColor: '#111827', 
            borderRadius: '12px', 
            marginTop: '4px' 
          }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1E3A8A', fontSize: '12px', flexShrink: 0 }}>WJ</div>
            {isMainSidebarOpen && (
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p>
                <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>PREMIUM</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN WORKSPACE KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOPBAR HEADER AREA */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search menu items, orders..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <MessageSquare size={16} /> Ask Brainy
            </button>
            <Bell size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            <HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            
            <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px', cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Alex Graham {isProfileOpen ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                </p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>OWNER</span>
              </div>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>

            {/* FLOATING DROPDOWN PROFIL POPUP */}
            <div style={{
              position: 'absolute', top: '55px', right: '0px', width: '220px', backgroundColor: '#ffffff',
              borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              zIndex: 100, display: isProfileOpen ? 'flex' : 'none', flexDirection: 'column', padding: '6px', boxSizing: 'border-box'
            }}>
              <div onClick={() => { setActiveSubView('edit-profile'); setIsProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#006847'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                <User size={14} /> <span style={{ fontWeight: '500' }}>Edit Profile</span>
              </div>
              <div onClick={() => { setActiveSubView('keamanan'); setIsProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#006847'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                <Shield size={14} /> <span style={{ fontWeight: '500' }}>Account Security</span>
              </div>
              <div onClick={() => alert('API Credentials')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.color = '#006847'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#374151'; }}>
                <Key size={14} /> <span style={{ fontWeight: '500' }}>API Credentials</span>
              </div>
            </div>

          </div>
        </div>

        {/* CONTAINER CONTENT VIEW DYNAMIC CHANGER */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', position: 'relative' }}>
          
          {isLoading && activeSubView === 'menu-table' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(248, 249, 250, 0.7)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#006847' }}>
              🔄 Menghubungkan ke Menu Catalog Engine Supabase...
            </div>
          )}

          {activeSubView === 'info-outlet' && <InfoOutlet onSaveSuccess={() => setActiveSubView('menu-table')} />}
          {activeSubView === 'konfigurasi-ai' && <KonfigurasiAI onSaveSuccess={() => setActiveSubView('menu-table')} />}
          {activeSubView === 'keamanan' && <Keamanan onSaveSuccess={() => setActiveSubView('menu-table')} />}
          {activeSubView === 'bahasa' && <Bahasa onSaveSuccess={() => setActiveSubView('menu-table')} />}
          {activeSubView === 'edit-profile' && <EditProfile onSaveSuccess={() => setActiveSubView('menu-table')} />}

          {activeSubView === 'menu-table' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Menu Management</h1>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Configure and monitor your restaurant menu catalog.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,104,71,0.2)' }}>
                  <Plus size={16} /> Add New Item
                </button>
              </div>

              {/* THREE HEAD METRICS CARDS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#E6F4EA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📋</div>
                  <div><span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Total Menu Items</span><h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{menuSummary.totalItems}</h2></div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#EEF2FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎲</div>
                  <div><span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Active Categories</span><h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{menuSummary.totalCategories}</h2></div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#FEE2E2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={22} /></div>
                  <div><span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Out of Stock</span><h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: menuSummary.outOfStockCount > 0 ? '#DC2626' : '#111827' }}>{menuSummary.outOfStockCount}</h2></div>
                </div>
              </div>

              {/* TABLE AREA */}
              {menus.length > 0 ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Active Menu List</h3>
                    <div style={{ display: 'flex', gap: '10px', color: '#6B7280' }}>
                      <div style={{ padding: '6px', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><SlidersHorizontal size={16} /></div>
                      <div style={{ padding: '6px', border: '1px solid #E5E7EB', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', backgroundColor: '#F3F4F6' }}><Grid size={16} /></div>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>
                        <th style={{ padding: '14px 24px' }}>ITEM DETAILS</th>
                        <th style={{ padding: '14px 24px' }}>CATEGORY</th>
                        <th style={{ padding: '14px 24px' }}>PRICE</th>
                        <th style={{ padding: '14px 24px' }}>STATUS</th>
                        <th style={{ padding: '14px 24px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menus.map((item) => {
                        // FIX SINKRONISASI UI: Membaca aman jika data is_available bernilai null/kosong akibat bypass lama, fallback otomatis ke true!
                        const isAvailable = item.is_available !== false;
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827', backgroundColor: isAvailable ? 'transparent' : '#FAF8F8' }}>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src={item.image_url} alt={item.menu_name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                                <div>
                                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{item.menu_name}</p>
                                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>ID: {item.id.toString().substring(0, 8).toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                {item.category}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#006847' }}>
                              Rp {Number(item.price).toLocaleString('id-ID')}
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <span 
                                onClick={() => handleToggleAvailability(item.id, isAvailable)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: isAvailable ? '#059669' : '#DC2626', cursor: 'pointer', backgroundColor: isAvailable ? '#E6F4EA' : '#FEE2E2', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}
                              >
                                <div style={{ width: '6px', height: '6px', backgroundColor: isAvailable ? '#10B981' : '#DC2626', borderRadius: '50%' }} />
                                {isAvailable ? 'Available' : 'Out of Stock'}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                <Edit2 size={16} style={{ cursor: 'pointer', color: '#006847' }} onClick={() => startEditing(item)} />
                                <Trash2 size={16} style={{ cursor: 'pointer', color: '#DC2626' }} onClick={() => handleDeleteMenu(item.id)} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '64px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#006847' }}>☕</div>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Katalog Menu Masih Kosong, Gar</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', maxWidth: '400px', lineHeight: '1.5' }}>
                      Database berhasil dikosongkan. Sekarang giliran lu untuk menambahkan produk original Warung Kopi Jaya melalui form pengisian di atas.
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                    <Plus size={14} /> Tambah Produk Pertama
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* ================= WINDOW POPUP OVERLAY ADD NEW ITEM ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateMenu} style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#111827' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Tambah Menu Baru</h2>
              </div>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={14}/> Informasi Dasar</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Menu</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Iced Caramel Latte" 
                        value={newMenu.menu_name}
                        onChange={(e) => setNewMenu({...newMenu, menu_name: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Harga Jual (Rp)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Rp</span>
                          <input 
                            type="text" 
                            required
                            placeholder="0"
                            value={newMenu.price}
                            onChange={(e) => {
                              const cleanNum = e.target.value.replace(/[^0-9]/g, '');
                              setNewMenu({...newMenu, price: cleanNum});
                            }}
                            style={{ width: '100%', padding: '10px 14px 10px 34px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }} 
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {['Coffee', 'Non-Coffee', 'Food', 'Pastry'].map((cat) => (
                            <span 
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              style={{ 
                                padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                                backgroundColor: selectedCategory === cat ? '#006847' : '#E5E7EB',
                                color: selectedCategory === cat ? '#ffffff' : '#4B5563'
                              }}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SINKRONISASI PEMETAAN RESEP RAW MATERIAL DINAMIS (ADD NEW ITEM) */}
                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={14}/> Pemetaan Resep Dinamis</h4>
                    <span 
                      onClick={handleAddRecipeRow}
                      style={{ color: '#006847', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <Plus size={14}/> Tambah Bahan
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recipeRows.map((row, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 40px', gap: '12px', alignItems: 'center' }}>
                        <select
                          value={row.inventory_id}
                          onChange={(e) => handleRecipeRowChange(index, 'inventory_id', e.target.value)}
                          style={{ width: '100%', padding: '10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff' }}
                        >
                          <option value="">-- Pilih Bahan Gudang --</option>
                          {inventoryItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="number" step="any" placeholder="Qty"
                            value={row.usage_quantity}
                            onChange={(e) => handleRecipeRowChange(index, 'usage_quantity', e.target.value)}
                            style={{ width: '100%', padding: '10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                          />
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>
                            {inventoryItems.find(i => i.id.toString() === row.inventory_id.toString())?.unit || ''}
                          </span>
                        </div>
                        <button 
                          type="button" onClick={() => handleRemoveRecipeRow(index)}
                          style={{ padding: '8px', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', justifySelf: 'center' }}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>URL Foto Menu</label>
                  <input 
                    type="text" 
                    value={newMenu.image_url}
                    onChange={(e) => setNewMenu({...newMenu, image_url: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', outline: 'none', marginBottom: '10px' }} 
                  />
                  <div style={{ border: '1px dashed #D1D5DB', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '110px', backgroundColor: '#FAFAFA' }}>
                    <img src={newMenu.image_url} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200"; }} />
                  </div>
                </div>

                <div style={{ backgroundColor: '#06163A', borderRadius: '14px', padding: '20px', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#34D399' }}><Layers size={16}/> Instant Profit Analysis</div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>ESTIMATED COGS</span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>Rp 4.500</h3>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>PROJECTED MARGIN</span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#34D399' }}>
                      {Number(newMenu.price) > 0 ? `${Math.round(((Number(newMenu.price) - 4500) / Number(newMenu.price)) * 100)}%` : '0%'}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Simpan Menu</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= WINDOW POPUP OVERLAY EDIT MENU ITEM ================= */}
      {editingMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleUpdateMenu} style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#111827' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={12} /></div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Edit Detil Menu Produk & Resep</h2>
              </div>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setEditingMenu(null)} />
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={14}/> Informasi Utama</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Menu</label>
                      <input 
                        type="text" 
                        required
                        value={editingMenu.menu_name || ''}
                        onChange={(e) => setEditingMenu({...editingMenu, menu_name: e.target.value})}
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Harga Jual Baru (Rp)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Rp</span>
                          <input 
                            type="text" 
                            required
                            value={editingMenu.price || ''}
                            onChange={(e) => {
                              const cleanNumber = e.target.value.replace(/[^0-9]/g, '');
                              setEditingMenu({...editingMenu, price: cleanNumber});
                            }}
                            style={{ width: '100%', padding: '10px 14px 10px 34px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }} 
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori</label>
                        <select 
                          value={editingMenu.category || 'Coffee'}
                          onChange={(e) => setEditingMenu({...editingMenu, category: e.target.value})}
                          style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                        >
                          <option value="Coffee">Coffee</option>
                          <option value="Non-Coffee">Non-Coffee</option>
                          <option value="Food">Food</option>
                          <option value="Pastry">Pastry</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SINKRONISASI PEMETAAN RESEP RAW MATERIAL DINAMIS (EDIT ITEM MODAL) */}
                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={14}/> Pemetaan Resep Dinamis</h4>
                    <span 
                      onClick={handleAddEditRecipeRow}
                      style={{ color: '#006847', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <Plus size={14}/> Tambah Bahan
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {editRecipeRows.map((row, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 40px', gap: '12px', alignItems: 'center' }}>
                        <select
                          value={row.inventory_id}
                          onChange={(e) => handleEditRecipeRowChange(index, 'inventory_id', e.target.value)}
                          style={{ width: '100%', padding: '10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff' }}
                        >
                          <option value="">-- Pilih Bahan Gudang --</option>
                          {inventoryItems.map(item => (
                            <option key={item.id} value={item.id.toString()}>{item.name} ({item.unit})</option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="number" step="any" placeholder="Qty"
                            value={row.usage_quantity}
                            onChange={(e) => handleEditRecipeRowChange(index, 'usage_quantity', e.target.value)}
                            style={{ width: '100%', padding: '10px', fontSize: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
                          />
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>
                            {inventoryItems.find(i => i.id.toString() === row.inventory_id.toString())?.unit || ''}
                          </span>
                        </div>
                        <button 
                          type="button" onClick={() => handleRemoveEditRecipeRow(index)}
                          style={{ padding: '8px', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', justifySelf: 'center' }}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>URL Gambar Produk</label>
                  <input 
                    type="text" 
                    value={editingMenu.image_url || ''}
                    onChange={(e) => setEditingMenu({...editingMenu, image_url: e.target.value})}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' }} 
                  />
                  <div style={{ border: '1px dashed #D1D5DB', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '110px', backgroundColor: '#FAFAFA' }}>
                    <img src={editingMenu.image_url} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200"; }} />
                  </div>
                </div>

                <div style={{ backgroundColor: '#06163A', borderRadius: '14px', padding: '20px', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#34D399' }}><Layers size={16}/> Brainy Live Margin Simulator</div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>TOTAL COGS (MODAL BAHAN)</span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>
                      {editingMenu.category === 'Coffee' ? 'Rp 4.380' : 'Rp 4.500'}
                    </h3>
                  </div>
                  
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>SIMULATED MARGIN PROFIT</span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#34D399' }}>
                      {Number(editingMenu.price) > 0 
                        ? `${Math.round(((Number(editingMenu.price) - (editingMenu.category === 'Coffee' ? 4380 : 4500)) / Number(editingMenu.price) * 100))}%` 
                        : '0%'}
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px', fontSize: '12px' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ color: '#9CA3AF', display: 'block', fontSize: '10px' }}>NET PROFIT (RP)</span>
                      <strong style={{ display: 'block', marginTop: '2px', color: '#34D399' }}>
                        Rp {(Number(editingMenu.price || 0) - (editingMenu.category === 'Coffee' ? 4380 : 4500)).toLocaleString('id-ID')}
                      </strong>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ color: '#9CA3AF', display: 'block', fontSize: '10px' }}>PRICE STATUS</span>
                      <strong style={{ display: 'block', marginTop: '2px', color: '#FBBF24' }}>
                        {Number(editingMenu.price || 0) > 20000 ? 'High Tier' : 'Healthy Price'}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setEditingMenu(null)} style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Perbarui Menu</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}