import React, { useState, useEffect } from 'react';
import { 
  Plus, Layers, Edit2, Trash2, X, Info, FileSpreadsheet, Trash, Save, Loader2 
} from 'lucide-react';

// Koneksi murni client Supabase proyek cuanin.id
import { supabase } from '../../config/supabaseClient';

export default function MenuManagement() {
  // Modal & Tab Workspace Controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Coffee');

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

  useEffect(() => {
    fetchMenuCatalog();
    fetchStockIngredients(); 
  }, []);

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

    if (newMenuRecipe.length === 0) {
      alert('Mohon isi resep produk.');
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
      
      setNewMenu({ menu_name: '', price: '', image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200' });
      setNewMenuRecipe([]);
      setIsModalOpen(false);
      await fetchMenuCatalog();
      alert('Menu berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyisipkan menu baru: ' + err.message);
    }
  };

  // 📝 ⚡ DYNAMIC BINDING UPDATE PIPELINE
  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (!editingMenu?.id) {
      alert('ID menu tidak ditemukan, gagal melakukan update, Gar!');
      return;
    }
    if (!editingMenu.menu_name.trim() || !editingMenu.price || Number(editingMenu.price) <= 0) {
      alert('Form edit nama menu dan harga tidak boleh kosong, Gar!');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('menus')
        .update({
          menu_name: editingMenu.menu_name,
          category: editingMenu.category,
          price: Number(editingMenu.price),
          image_url: editingMenu.image_url,
          recipe: recipeRows 
        })
        .eq('id', editingMenu.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Tidak ada baris yang diperbarui.');
      }

      setEditingMenu(null); 
      await fetchMenuCatalog(); 
      alert('Data menu berhasil diperbarui!');
    } catch (err) {
      alert('Gagal memperbarui rekaman data menu: ' + err.message);
    }
  };

  // 🔄 UPDATE PIPELINE 2: Quick Toggle Tombol Ketersediaan Stok Menu
  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .update({ is_available: !currentStatus })
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        alert('Gagal mengubah status: tidak ada baris yang cocok di database.');
        return;
      }
      await fetchMenuCatalog();
    } catch (err) {
      console.error('⚠️ Gagal mengubah status availabilitas:', err.message);
    }
  };

  // ❌ ⚡ FIXED ABSOLUTE DELETE PIPELINE
  const handleDeleteMenu = async (id) => {
    if (!id) {
      alert('ID menu tidak valid, gagal menghapus, Gar!');
      return;
    }
    if (!window.confirm('Apakah lu beneran pengen ngehapus menu ini secara permanen dari database cloud Supabase, Gar?')) return;
    try {
      const { data, error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Tidak ada baris yang terhapus.');
      }

      await fetchMenuCatalog(); 
      alert('Produk resmi terhapus selamanya dari database cloud!');
    } catch (err) {
      alert('Supabase menolak aksi delete! Eror: ' + err.message);
    }
  };

  // ================= 🛠️ ARSITEKTUR FORMULA KONVERSI TAKARAN RESEP BARU =================
  const handleAddNewMenuRecipeRow = () => {
    if (stockIngredients.length === 0) {
      alert('Stok gudang kosong, Daftarkan bahan baku dulu di tab Stock.');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', width: '100%', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Menu Management</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Configure and monitor your restaurant menu catalog for Warung Kopi Jaya.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0, 104, 71, 0.1)' }}>
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {/* THREE HEAD METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Total Menu Items</span>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{menuSummary.totalItems}</h2>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Active Categories</span>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{menuSummary.totalCategories}</h2>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Out of Stock</span>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>{menuSummary.outOfStockCount}</h2>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Loader2 size={16} className="animate-spin" /> Memuat katalog menu cuanin.id...
        </div>
      ) : menus.length > 0 ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
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
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '64px 32px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '28px' }}>☕</div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4B5563', marginTop: '12px' }}>Katalog Menu Masih Kosong</h3>
        </div>
      )}

      {/* WINDOW POPUP OVERLAY ADD NEW ITEM */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Tambah Produk ke Menu</h2>
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
                      <input type="text" placeholder="Contoh: Americano Ice" value={newMenu.menu_name} onChange={(e) => setNewMenu({...newMenu, menu_name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Harga Jual (Rp)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '12px', fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Rp</span>
                          <input type="text" placeholder="0" value={newMenu.price} onChange={(e) => setNewMenu({...newMenu, price: e.target.value.replace(/[^0-9]/g, '')})} style={{ width: '100%', padding: '10px 14px 10px 34px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {['Coffee', 'Non-Coffee', 'Food', 'Pastry'].map((cat) => (
                            <span key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: selectedCategory === cat ? '#006847' : '#E5E7EB', color: selectedCategory === cat ? '#ffffff' : '#4B5563', transition: 'all 0.15s' }}>{cat}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={14}/> Pemetaan Resep produk</h4>
                    <span style={{ color: '#006847', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleAddNewMenuRecipeRow}><Plus size={14}/> Tambah Bahan</span>
                  </div>
                  
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', backgroundColor: '#F3F4F6', padding: '8px 12px', fontWeight: 'bold', color: '#4B5563' }}>
                      <span>Bahan Baku</span><span style={{ textAlign: 'center' }}>Takaran</span><span>Cost Modal</span><span></span>
                    </div>
                    {newMenuRecipe.length > 0 ? (
                      newMenuRecipe.map((row, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', padding: '12px', alignItems: 'center', borderBottom: '1px solid #F3F4F6', backgroundColor: '#ffffff' }}>
                          <select value={row.ingredientId} onChange={(e) => handleUpdateNewMenuRecipeRow(index, 'ingredientId', e.target.value)} style={{ border: '1px solid #D1D5DB', padding: '6px', borderRadius: '6px', backgroundColor: '#fff', fontSize: '12px', outline: 'none' }}>
                            <option value="">-- Pilih Stok Bahan --</option>
                            {stockIngredients.map((m) => <option key={m.id} value={m.id}>{m.material_name}</option>)}
                          </select>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                            <input type="text" value={row.qty} onChange={(e) => handleUpdateNewMenuRecipeRow(index, 'qty', e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '45px', border: '1px solid #D1D5DB', padding: '4px', borderRadius: '6px', fontSize: '12px', outline: 'none', textAlign: 'center' }} />
                            <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 'bold' }}>{row.unit}</span>
                          </div>
                          <span style={{ fontWeight: 'bold', color: '#111827' }}>Rp {(row.cost || 0).toLocaleString('id-ID')}</span>
                          <Trash size={14} color="#DC2626" style={{ cursor: 'pointer', justifySelf: 'center' }} onClick={() => handleRemoveNewMenuRecipeRow(index)} />
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', backgroundColor: '#ffffff' }}>Belum ada pemetaan resep. Klik '+ Tambah Bahan' di atas.</div>
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
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#34D399', display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={16}/> Instant Profit Analysis</span>
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
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Batal</button>
              <button type="button" onClick={handleCreateMenu} style={{ padding: '10px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Simpan Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= WINDOW POPUP OVERLAY EDIT ITEM ================= */}
      {editingMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Edit Detil Menu Produk & Resep</h2>
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
                    <input type="text" required value={editingMenu.price} onChange={(e) => setEditingMenu({...editingMenu, price: e.target.value.replace(/[^0-9]/g, '')})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori</label>
                    <select value={editingMenu.category} onChange={(e) => setEditingMenu({...editingMenu, category: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff', height: '38px', cursor: 'pointer' }} >
                      <option value="Coffee">Coffee</option>
                      <option value="Non-Coffee">Non-Coffee</option>
                      <option value="Food">Food</option>
                      <option value="Pastry">Pastry</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={14}/> Pemetaan Resep Bahan Buku</h4>
                    <span style={{ color: '#006847', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleAddRecipeRow}><Plus size={14}/> Tambah Bahan</span>
                  </div>
                  
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', fontSize: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', backgroundColor: '#F3F4F6', padding: '8px 12px', fontWeight: 'bold', color: '#4B5563' }}>
                      <span>Bahan Terikat</span><span style={{ textAlign: 'center' }}>Takaran</span><span>Cost Modal</span><span></span>
                    </div>
                    {recipeRows.map((row, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 40px', padding: '12px', alignItems: 'center', borderBottom: '1px solid #F3F4F6', backgroundColor: '#ffffff' }}>
                        <select value={row.ingredientId} onChange={(e) => handleUpdateRecipeRow(index, 'ingredientId', e.target.value)} style={{ border: '1px solid #D1D5DB', padding: '6px', borderRadius: '6px', backgroundColor: '#fff', fontSize: '12px', outline: 'none' }}>
                          <option value="">-- Pilih Stok Bahan --</option>
                          {stockIngredients.map((m) => <option key={m.id} value={m.id}>{m.material_name}</option>)}
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                          <input type="text" value={row.qty} onChange={(e) => handleUpdateRecipeRow(index, 'qty', e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '45px', border: '1px solid #D1D5DB', padding: '4px', borderRadius: '6px', fontSize: '12px', outline: 'none', textAlign: 'center' }} />
                          <span style={{ color: '#6B7280', fontSize: '11px', fontWeight: 'bold' }}>{row.unit}</span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#111827' }}>Rp {(row.cost || 0).toLocaleString('id-ID')}</span>
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
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#34D399', display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={16}/> Brainy Live Margin Simulator</span>
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
              <button type="button" onClick={handleUpdateMenu} style={{ padding: '10px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Perbarui Menu</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}