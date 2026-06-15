import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu as MenuIcon, Users, Settings, 
  Search, Bell, HelpCircle, Plus, Layers, Edit2, Trash2, X, Info, FileSpreadsheet,
  Trash, Save, LogOut, ChevronDown, ChevronUp, Store, Sliders, ShieldCheck, User, Key, Globe, Shield,
  MessageSquare // ⚡ FIXED: Sudah diimport lengkap agar halaman tidak blank putih!
} from 'lucide-react';

// Koneksi murni client Supabase proyek cuanin.id
import { supabase } from '../../config/supabaseClient';

// Import komponen internal settings desentralisasi
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';
import Keamanan from '../settings/Keamanan.jsx';
import Bahasa from '../settings/Bahasa.jsx'; 
import EditProfile from '../dashboard/EditProfile.jsx'; 

function CuaninLogoMini() {
  return (
    <div style={{ width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '6px', flexShrink: 0 }}>
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

export default function MenuManagement({ onNavigateView }) {
  const { logout } = useAuth();
  const currentView = 'menu';
  
  // Modal & Tab Workspace Controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Coffee');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState('menu-table');

  // Core Database States
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stockIngredients, setStockIngredients] = useState([]);
  const [menuSummary, setMenuSummary] = useState({ totalItems: 0, totalCategories: 0, outOfStockCount: 0 });

  // Form Management States (Create & Update)
  const [newMenu, setNewMenu] = useState({ menu_name: '', price: '', image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200' });
  const [newMenuRecipe, setNewMenuRecipe] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [recipeRows, setRecipeRows] = useState([]);

  // 📥 READ PIPELINE 1: Tarik Data Bahan Baku Aktif dari Gudang
  const fetchStockIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('id, material_name, unit, unit_price')
        .order('material_name', { ascending: true });
      if (error) throw error;
      if (data) setStockIngredients(data);
    } catch (err) {
      console.error('⚠️ Gagal memuat data inventori gudang:', err.message);
    }
  };

  // 📥 READ PIPELINE 2: Ambil Katalog Menu Terkini dari Supabase Cloud
  const fetchMenuCatalog = async () => {
    if (activeSubView !== 'menu-table') return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('category', { ascending: true })
        .order('menu_name', { ascending: true });

      if (error) throw error;

      if (data) {
        setMenus(data);
        const uniqueCategories = new Set(data.map(item => item.category)).size;
        const outOfStockItems = data.filter(item => item.is_available === false).length;
        setMenuSummary({ totalItems: data.length, totalCategories: uniqueCategories, outOfStockCount: outOfStockItems });
      }
    } catch (err) {
      console.error('⚠️ Gagal menarik data katalog menu:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Re-fetch Data Otomatis saat SubView Berubah
  useEffect(() => {
    fetchMenuCatalog();
    fetchStockIngredients(); 
  }, [activeSubView]);

  // Sync Data Resep saat Modal Edit Terbuka
  useEffect(() => {
    if (editingMenu) {
      if (editingMenu.recipe && Array.isArray(editingMenu.recipe)) {
        setRecipeRows(editingMenu.recipe);
      } else {
        setRecipeRows([]);
      }
    } else {
      setRecipeRows([]);
    }
  }, [editingMenu]);

  const newMenuTotalCogs = newMenuRecipe.reduce((sum, row) => sum + Number(row.cost || 0), 0);
  const currentTotalCogs = recipeRows.reduce((sum, row) => sum + Number(row.cost || 0), 0);

  // 📤 CREATE PIPELINE: Suntik Data Produk Baru ke Supabase (+ VALIDASI INTERCEPT RESEP KOSONG)
  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!newMenu.menu_name.trim() || !newMenu.price || Number(newMenu.price) <= 0) {
      alert('Isi data nama menu dan nominal harga secara valid, Gar!');
      return;
    }

    // ⚡ FORM VALIDATION CONSTRAINT: Intersepsi draf jika list resep masih kosong murni
    if (newMenuRecipe.length === 0) {
      alert('Waduh gak bisa disimpan, Gar! Masukkan minimal satu resep bahan baku dulu biar hitungan HPP (COGS) dan Profit Margin cafe lu akurat.');
      return;
    }

    try {
      const { error } = await supabase
        .from('menus')
        .insert([{
          menu_name: newMenu.menu_name,
          category: selectedCategory,
          price: Number(newMenu.price),
          image_url: newMenu.image_url,
          is_available: true,
          recipe: newMenuRecipe 
        }]);

      if (error) throw error;
      
      // Reset Form & Tutup Modal jika Sukses Meluncur ke Cloud
      setNewMenu({ menu_name: '', price: '', image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200' });
      setNewMenuRecipe([]);
      setIsModalOpen(false);
      await fetchMenuCatalog();
    } catch (err) {
      alert('Gagal menyisipkan menu baru ke database: ' + err.message);
    }
  };

  // 📝 UPDATE PIPELINE 1: Perbarui Seluruh Atribut & Draf Komposisi Resep
  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (!editingMenu.menu_name.trim() || !editingMenu.price || Number(editingMenu.price) <= 0) {
      alert('Form edit nama menu dan harga tidak boleh kosong, Gar!');
      return;
    }
    try {
      const { error } = await supabase
        .from('menus')
        .update({
          menu_name: editingMenu.menu_name,
          category: editingMenu.category,
          price: Number(editingMenu.price),
          image_url: editingMenu.image_url,
          recipe: recipeRows
        })
        .eq('id', editingMenu.id);

      if (error) throw error;
      setEditingMenu(null); 
      await fetchMenuCatalog();   
    } catch (err) {
      alert('Gagal memperbarui rekaman data menu: ' + err.message);
    }
  };

  // 🔄 UPDATE PIPELINE 2: Quick Toggle Tombol Ketersediaan Stok Menu
  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('menus')
        .update({ is_available: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      await fetchMenuCatalog();
    } catch (err) {
      console.error('⚠️ Gagal mengubah status availabilitas:', err.message);
    }
  };

  // ❌ DELETE PIPELINE: Hapus Data Absolut Menggunakan Pencocokan UUID Murni 36 Karakter
  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Apakah lu beneran pengen ngehapus menu ini secara permanen dari database cloud Supabase, Gar?')) return;
    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // SYNC HANDLE: Update UI lokal HANYA jika query database berhasil dieksekusi tanpa error
      setMenus(prev => {
        const filtered = prev.filter(item => item.id !== id);
        const uniqueCategories = new Set(filtered.map(item => item.category)).size;
        const outOfStockItems = filtered.filter(item => item.is_available === false).length;
        setMenuSummary({ totalItems: filtered.length, totalCategories: uniqueCategories, outOfStockCount: outOfStockItems });
        return filtered;
      });

      alert('Produk resmi terhapus selamanya dari database cloud!');
    } catch (err) {
      alert('Supabase menolak aksi delete! Eror: ' + err.message);
    }
  };

  // ================= 🛠️ ARSITEKTUR FORMULA KONVERSI TAKARAN RESEP BARU =================
  const handleAddNewMenuRecipeRow = () => {
    if (stockIngredients.length === 0) {
      alert('Stok gudang kosong, Gar! Daftarkan bahan baku dulu di tab Stock.');
      return;
    }
    const firstMat = stockIngredients[0];
    let displayUnit = firstMat.unit;
    let initialQty = 10;
    let unitCost = Number(firstMat.unit_price || 0);

    if (firstMat.unit?.toLowerCase() === 'litre' || firstMat.unit?.toLowerCase() === 'liter' || firstMat.unit?.toLowerCase() === 'kg') {
      displayUnit = firstMat.unit.toLowerCase() === 'kg' ? 'gram' : 'ml';
      initialQty = displayUnit === 'gram' ? 15 : 30;
      unitCost = Number(firstMat.unit_price || 0) / 1000;
    }

    setNewMenuRecipe([...newMenuRecipe, { ingredientId: firstMat.id, ingredientName: firstMat.material_name, qty: initialQty, unit: displayUnit, cost: Math.round(initialQty * unitCost) }]);
  };

  const handleUpdateNewMenuRecipeRow = (index, key, value) => {
    const updatedRows = [...newMenuRecipe];
    updatedRows[index][key] = value;

    if (key === 'ingredientId' || key === 'qty') {
      const targetId = key === 'ingredientId' ? value : updatedRows[index].ingredientId;
      const matchedMaterial = stockIngredients.find(m => m.id === targetId);
      if (matchedMaterial) {
        let displayUnit = matchedMaterial.unit;
        let unitCost = Number(matchedMaterial.unit_price || 0);

        if (matchedMaterial.unit?.toLowerCase() === 'litre' || matchedMaterial.unit?.toLowerCase() === 'liter' || matchedMaterial.unit?.toLowerCase() === 'kg') {
          displayUnit = matchedMaterial.unit.toLowerCase() === 'kg' ? 'gram' : 'ml';
          unitCost = Number(matchedMaterial.unit_price || 0) / 1000;
        }

        updatedRows[index].ingredientId = matchedMaterial.id;
        updatedRows[index].ingredientName = matchedMaterial.material_name;
        updatedRows[index].unit = displayUnit;
        const currentQty = key === 'qty' ? Number(value || 0) : Number(updatedRows[index].qty || 0);
        updatedRows[index].cost = Math.round(currentQty * unitCost);
      }
    }
    setNewMenuRecipe(updatedRows);
  };

  const handleRemoveNewMenuRecipeRow = (index) => {
    setNewMenuRecipe(newMenuRecipe.filter((_, i) => i !== index));
  };

  // ================= 🛠️ ARSITEKTUR FORMULA KONVERSI TAKARAN RESEP EDIT =================
  const handleAddRecipeRow = () => {
    if (stockIngredients.length === 0) return;
    const firstMat = stockIngredients[0];
    let displayUnit = firstMat.unit;
    let initialQty = 10;
    let unitCost = Number(firstMat.unit_price || 0);

    if (firstMat.unit?.toLowerCase() === 'litre' || firstMat.unit?.toLowerCase() === 'liter' || firstMat.unit?.toLowerCase() === 'kg') {
      displayUnit = firstMat.unit.toLowerCase() === 'kg' ? 'gram' : 'ml';
      initialQty = displayUnit === 'gram' ? 15 : 30;
      unitCost = Number(firstMat.unit_price || 0) / 1000;
    }
    setRecipeRows([...recipeRows, { ingredientId: firstMat.id, ingredientName: firstMat.material_name, qty: initialQty, unit: displayUnit, cost: Math.round(initialQty * unitCost) }]);
  };

  const handleUpdateRecipeRow = (index, key, value) => {
    const updatedRows = [...recipeRows];
    updatedRows[index][key] = value;

    if (key === 'ingredientId' || key === 'qty') {
      const targetId = key === 'ingredientId' ? value : updatedRows[index].ingredientId;
      const matchedMaterial = stockIngredients.find(m => m.id === targetId);
      if (matchedMaterial) {
        let displayUnit = matchedMaterial.unit;
        let unitCost = Number(matchedMaterial.unit_price || 0);

        if (matchedMaterial.unit?.toLowerCase() === 'litre' || matchedMaterial.unit?.toLowerCase() === 'liter' || matchedMaterial.unit?.toLowerCase() === 'kg') {
          displayUnit = matchedMaterial.unit.toLowerCase() === 'kg' ? 'gram' : 'ml';
          unitCost = Number(matchedMaterial.unit_price || 0) / 1000;
        }

        updatedRows[index].ingredientId = matchedMaterial.id;
        updatedRows[index].ingredientName = matchedMaterial.material_name;
        updatedRows[index].unit = displayUnit;
        const currentQty = key === 'qty' ? Number(value || 0) : Number(updatedRows[index].qty || 0);
        updatedRows[index].cost = Math.round(currentQty * unitCost);
      }
    }
    setRecipeRows(updatedRows);
  };

  const handleRemoveRecipeRow = (index) => {
    setRecipeRows(recipeRows.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0, position: 'relative' }}>
      
      {/* ================= SIDEBAR KIRI ================= */}
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
              <MenuIcon size={16} color="#93C5FD" />
            </div>
          )}
        </div>

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
              <div key={idx} onClick={menu.action} style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'flex-start' : 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: isActive ? 'bold' : '500', backgroundColor: isActive ? '#006847' : 'transparent', color: isActive ? '#ffffff' : '#93C5FD', transition: 'all 0.3s ease-in-out' }}>
                {menu.icon} {isMainSidebarOpen && <span style={{ fontSize: '14px' }}>{menu.name}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ padding: isMainSidebarOpen ? '0 16px' : '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div onClick={() => isMainSidebarOpen ? setIsSettingsOpen(!isSettingsOpen) : setIsMainSidebarOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'space-between' : 'center', padding: '12px 16px', color: isSettingsOpen || (activeSubView !== 'menu-table' && activeSubView !== 'edit-profile') ? '#ffffff' : '#93C5FD', backgroundColor: isSettingsOpen || (activeSubView !== 'menu-table' && activeSubView !== 'edit-profile') ? 'rgba(255, 255, 255, 0.08)' : 'transparent', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {isMainSidebarOpen && <div style={{ transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><ChevronDown size={14} /></div>}
          </div>

          {isMainSidebarOpen && isSettingsOpen && (
            <div style={{ maxHeight: '200px', opacity: 1, overflow: 'hidden', transition: 'all 0.4s', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '14px', marginBottom: '4px' }}>
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

          <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#FFCACA', borderRadius: '10px', cursor: 'pointer' }}>
            <LogOut size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px' }}>Logout</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#111827', borderRadius: '12px', marginTop: '4px' }}>
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
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>Alex Graham</p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>OWNER</span>
              </div>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* CONTAINER CONTENT VIEW */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
          
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
                <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <Plus size={16} /> Add New Item
                </button>
              </div>

              {/* THREE HEAD METRICS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Total Menu Items</span>
                  <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>{menuSummary.totalItems}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Active Categories</span>
                  <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>{menuSummary.totalCategories}</h2>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Out of Stock</span>
                  <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>{menuSummary.outOfStockCount}</h2>
                </div>
              </div>

              {menus.length > 0 ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
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
                      {menus.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <img src={item.image_url} alt={item.menu_name} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} />
                              <div>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{item.menu_name}</p>
                                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>ID: {String(item.id).substring(0, 8).toUpperCase()}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}><span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{item.category}</span></td>
                          <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#006847' }}>Rp {Number(item.price).toLocaleString('id-ID')}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <span onClick={() => handleToggleAvailability(item.id, item.is_available)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: item.is_available ? '#059669' : '#DC2626', cursor: 'pointer', backgroundColor: item.is_available ? '#E6F4EA' : '#FEE2E2', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>
                              <div style={{ width: '6px', height: '6px', backgroundColor: item.is_available ? '#10B981' : '#DC2626', borderRadius: '50%' }} />{item.is_available ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                              <Edit2 size={16} style={{ cursor: 'pointer', color: '#006847' }} onClick={() => setEditingMenu(item)} />
                              <Trash2 size={16} style={{ cursor: 'pointer', color: '#DC2626' }} onClick={() => handleDeleteMenu(item.id)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '64px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px' }}>☕</div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Katalog Menu Masih Kosong, Gar</h3>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* ================= WINDOW POPUP OVERLAY ADD NEW ITEM ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateMenu} style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Tambah Produk ke Menu</h2>
              </div>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 'bold', color: '#4B5563' }}><Info size={14}/> Informasi Dasar</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Menu</label>
                      <input type="text" required placeholder="Contoh: Americano Ice" value={newMenu.menu_name} onChange={(e) => setNewMenu({...newMenu, menu_name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Harga Jual (Rp)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Rp</span>
                          <input type="text" required placeholder="0" value={newMenu.price} onChange={(e) => setNewMenu({...newMenu, price: e.target.value.replace(/[^0-9]/g, '')})} style={{ width: '100%', padding: '10px 14px 10px 34px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {['Coffee', 'Non-Coffee', 'Food', 'Pastry'].map((cat) => (
                            <span key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: selectedCategory === cat ? '#006847' : '#E5E7EB', color: selectedCategory === cat ? '#ffffff' : '#4B5563' }}>{cat}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PEMETAAN RESEP UNTUK KATEGORI ADD NEW ITEM BARU */}
                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#4B5563' }}><FileSpreadsheet size={14}/> Pemetaan Resep Bahan Mentah</h4>
                    <span style={{ color: '#006847', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleAddNewMenuRecipeRow}><Plus size={14}/> Tambah Bahan</span>
                  </div>
                  
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', backgroundColor: '#F3F4F6', padding: '8px 12px', fontWeight: 'bold' }}>
                      <span>Bahan Baku</span><span>Takaran</span><span>Cost Modal</span><span></span>
                    </div>
                    {newMenuRecipe.length > 0 ? (
                      newMenuRecipe.map((row, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', padding: '12px', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
                          <select value={row.ingredientId} onChange={(e) => handleUpdateNewMenuRecipeRow(index, 'ingredientId', e.target.value)} style={{ border: '1px solid #D1D5DB', padding: '6px', borderRadius: '6px', backgroundColor: '#fff', fontSize: '12px', outline: 'none' }}>
                            <option value="">-- Pilih Stok Bahan --</option>
                            {stockIngredients.map((m) => <option key={m.id} value={m.id}>{m.material_name}</option>)}
                          </select>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            <input type="text" value={row.qty} onChange={(e) => handleUpdateNewMenuRecipeRow(index, 'qty', e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '45px', border: '1px solid #D1D5DB', padding: '4px', borderRadius: '6px', fontSize: '12px', outline: 'none', textAlign: 'center' }} />
                            <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 'bold' }}>{row.unit}</span>
                          </div>
                          <span style={{ fontWeight: 'bold' }}>Rp {(row.cost || 0).toLocaleString('id-ID')}</span>
                          <Trash size={14} color="#DC2626" style={{ cursor: 'pointer', justifySelf: 'center' }} onClick={() => handleRemoveNewMenuRecipeRow(index)} />
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>Belum ada pemetaan resep. Klik '+ Tambah Bahan' di atas, Gar.</div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>URL Foto Menu</label>
                  <input type="text" value={newMenu.image_url} onChange={(e) => setNewMenu({...newMenu, image_url: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' }} />
                  <div style={{ border: '1px dashed #D1D5DB', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '110px', backgroundColor: '#FAFAFA' }}>
                    <img src={newMenu.image_url} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                  </div>
                </div>
                <div style={{ backgroundColor: '#06163A', borderRadius: '14px', padding: '20px', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#34D399' }}><Layers size={16}/> Instant Profit Analysis</span>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>ESTIMATED COGS</span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>Rp {newMenuTotalCogs.toLocaleString('id-ID')}</h3>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>PROJECTED MARGIN</span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#34D399' }}>
                      {Number(newMenu.price) > 0 ? `${Math.round(((Number(newMenu.price) - newMenuTotalCogs) / Number(newMenu.price)) * 100)}%` : '0%'}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}><Save size={14}/> Simpan Menu</button>
            </div>
          </form>
        </div>
      )}

      {editingMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleUpdateMenu} style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Edit Detil Menu Produk & Resep</h2>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setEditingMenu(null)} />
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nama Menu</label>
                  <input type="text" required value={editingMenu.menu_name} onChange={(e) => setEditingMenu({...editingMenu, menu_name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Harga Jual Baru (Rp)</label>
                    <input type="text" required value={editingMenu.price} onChange={(e) => setEditingMenu({...editingMenu, price: e.target.value.replace(/[^0-9]/g, '')})} style={{ width: '100%', padding: '10px 14px 10px 34px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori</label>
                    <select value={editingMenu.category} onChange={(e) => setEditingMenu({...editingMenu, category: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }} >
                      <option value="Coffee">Coffee</option><option value="Non-Coffee">Non-Coffee</option><option value="Food">Food</option><option value="Pastry">Pastry</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#4B5563' }}><FileSpreadsheet size={14}/> Pemetaan Resep Bahan Buku</h4>
                    <span style={{ color: '#006847', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleAddRecipeRow}><Plus size={14}/> Tambah Bahan</span>
                  </div>
                  
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', backgroundColor: '#F3F4F6', padding: '8px 12px', fontWeight: 'bold', color: '#4B5563' }}>
                      <span>Bahan Terikat</span><span>Takaran</span><span>Cost Modal</span><span></span>
                    </div>
                    {recipeRows.map((row, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', padding: '12px', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
                        <select value={row.ingredientId} onChange={(e) => handleUpdateRecipeRow(index, 'ingredientId', e.target.value)} style={{ border: '1px solid #D1D5DB', padding: '6px', borderRadius: '6px', backgroundColor: '#fff', fontSize: '12px', outline: 'none' }}>
                          <option value="">-- Pilih Stok Bahan --</option>
                          {stockIngredients.map((m) => <option key={m.id} value={m.id}>{m.material_name}</option>)}
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                          <input type="text" value={row.qty} onChange={(e) => handleUpdateRecipeRow(index, 'qty', e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '45px', border: '1px solid #D1D5DB', padding: '4px', borderRadius: '6px', fontSize: '12px', outline: 'none', textAlign: 'center' }} />
                          <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 'bold' }}>{row.unit}</span>
                        </div>
                        <span style={{ fontWeight: 'bold' }}>Rp {(row.cost || 0).toLocaleString('id-ID')}</span>
                        <Trash size={14} color="#DC2626" style={{ cursor: 'pointer', justifySelf: 'center' }} onClick={() => handleRemoveRecipeRow(index)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>URL Gambar Produk</label>
                  <input type="text" value={editingMenu.image_url} onChange={(e) => setEditingMenu({...editingMenu, image_url: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' }} />
                  <div style={{ border: '1px dashed #D1D5DB', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '110px', backgroundColor: '#FAFAFA' }}>
                    <img src={editingMenu.image_url} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                  </div>
                </div>
                <div style={{ backgroundColor: '#06163A', borderRadius: '14px', padding: '20px', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#34D399' }}><Layers size={16}/> Brainy Live Margin Simulator</span>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>TOTAL COGS (MODAL BAHAN REAL)</span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>Rp {currentTotalCogs.toLocaleString('id-ID')}</h3>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', display: 'block' }}>SIMULATED MARGIN PROFIT</span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#34D399' }}>
                      {Number(editingMenu.price) > 0 ? `${Math.round(((Number(editingMenu.price) - currentTotalCogs) / Number(editingMenu.price) * 100))}%` : '0%'}
                    </h2>
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