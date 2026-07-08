import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Layers, Edit2, Trash2, X, Info, FileSpreadsheet, Trash, Save, Loader2,
  Link, Upload, Camera, Image, AlertTriangle
} from 'lucide-react';

import { supabase } from '../../config/supabaseClient';

// ================= 🖼️ REUSABLE IMAGE PICKER PANEL =================
// Mendukung 3 mode: URL eksternal, Upload file (galeri/file explorer), Kamera
// currentImage  = nilai image_url saat ini (string URL atau base64)
// onImageChange = callback(newImageUrl) dipanggil setiap kali gambar berubah
function ImagePickerPanel({ currentImage, onImageChange }) {
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'upload' | 'camera'
  const [urlInput, setUrlInput] = useState(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Sync urlInput kalau currentImage berubah dari luar (misal saat modal edit dibuka)
  useEffect(() => {
    if (activeTab === 'url') setUrlInput(currentImage || '');
  }, [currentImage]);

  // Matikan kamera kalau pindah tab
  useEffect(() => {
    if (activeTab !== 'camera') stopCamera();
    else startCamera();
    return () => stopCamera();
  }, [activeTab]);

  // ---- Helpers ----
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFileChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('File harus berupa gambar (JPG, PNG, WEBP, dll).'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5 MB.'); return; }
    const base64 = await fileToBase64(file);
    onImageChange(base64);
  };

  // Drag & drop
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  // Kamera
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setCameraError('Akses kamera ditolak atau tidak tersedia di browser ini.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    onImageChange(base64);
    stopCamera();
    setActiveTab('url'); // Tampilkan hasil di preview
  };

  const tabStyle = (tab) => ({
    flex: 1, padding: '8px 0', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
    border: 'none', borderRadius: '6px', transition: 'all 0.15s',
    backgroundColor: activeTab === tab ? '#006847' : 'transparent',
    color: activeTab === tab ? '#ffffff' : '#6B7280',
  });

  return (
    <div>
      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '4px', marginBottom: '10px' }}>
        <button style={tabStyle('url')} onClick={() => setActiveTab('url')}><Link size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }}/>URL</button>
        <button style={tabStyle('upload')} onClick={() => setActiveTab('upload')}><Upload size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }}/>Upload</button>
        <button style={tabStyle('camera')} onClick={() => setActiveTab('camera')}><Camera size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }}/>Kamera</button>
      </div>

      {/* Tab: URL */}
      {activeTab === 'url' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); onImageChange(e.target.value); }}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ border: '1px dashed #D1D5DB', borderRadius: '10px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', overflow: 'hidden' }}>
            {currentImage
              ? <img src={currentImage} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.style.display='none'; }} />
              : <div style={{ textAlign: 'center', color: '#9CA3AF' }}><Image size={28} /><p style={{ margin: '4px 0 0', fontSize: '11px' }}>Preview gambar</p></div>
            }
          </div>
        </div>
      )}

      {/* Tab: Upload */}
      {activeTab === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#006847' : '#D1D5DB'}`,
              borderRadius: '10px', padding: '20px', textAlign: 'center',
              cursor: 'pointer', backgroundColor: isDragging ? '#E6F4EA' : '#FAFAFA',
              transition: 'all 0.15s'
            }}
          >
            <Upload size={24} color={isDragging ? '#006847' : '#9CA3AF'} style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: '12px', color: '#4B5563', fontWeight: '600' }}>Klik atau drag & drop gambar di sini</p>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9CA3AF' }}>JPG, PNG, WEBP — maks 5 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
          </div>
          {/* Preview hasil upload */}
          {currentImage && (
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', height: '80px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
              <img src={currentImage} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} />
            </div>
          )}
        </div>
      )}

      {/* Tab: Kamera */}
      {activeTab === 'camera' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          {cameraError
            ? <div style={{ padding: '20px', textAlign: 'center', color: '#DC2626', fontSize: '12px', border: '1px dashed #FCA5A5', borderRadius: '10px', width: '100%', boxSizing: 'border-box' }}>{cameraError}</div>
            : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#000', maxHeight: '160px', objectFit: 'cover' }}
                />
                <button
                  onClick={capturePhoto}
                  style={{ padding: '8px 24px', backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Camera size={14} /> Ambil Foto
                </button>
              </>
            )
          }
        </div>
      )}
    </div>
  );
}

export default function MenuManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Coffee');

  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stockIngredients, setStockIngredients] = useState([]);
  const [menuSummary, setMenuSummary] = useState({ totalItems: 0, totalCategories: 0, outOfStockCount: 0 });

  const [newMenu, setNewMenu] = useState({ menu_name: '', price: '', image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200' });
  const [newMenuRecipe, setNewMenuRecipe] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [recipeRows, setRecipeRows] = useState([]);

  // 🥄 [USAGE UNIT] Cache ingredient_usage_units per raw_material_id.
  // key = raw_material_id, value = array usage unit ({id, unit_name, grams_per_unit}).
  // undefined = belum pernah di-fetch, [] = sudah di-fetch tapi memang kosong (fallback ke base unit).
  const [usageUnitsByMaterial, setUsageUnitsByMaterial] = useState({});

  // 🔐 [BUGFIX MULTI-TENANT] ID owner yang sedang login. Semua query read/write
  // di bawah WAJIB di-scope pakai ini, supaya data antar akun tidak bocor.
  const [ownerId, setOwnerId] = useState(null);

  // 📥 READ PIPELINE 1: Tarik Data Bahan Baku Aktif dari Gudang
  const fetchStockIngredients = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        // ✅ [FR-K06 EXTENSION] current_stock ikut ditarik supaya bisa dipakai
        // menghitung status stok riil tiap menu (bandingkan resep vs stok).
        .select('id, material_name, unit, unit_price, current_stock')
        // 🔐 [BUGFIX MULTI-TENANT] Filter cuma bahan baku milik akun ini.
        .eq('user_id', uid)
        .order('material_name', { ascending: true });
      if (error) throw error;
      if (data) setStockIngredients(data);
    } catch (err) {
      console.error('⚠️ Gagal memuat data inventori gudang:', err.message);
    }
  };

  // 📥 READ PIPELINE 1.5: [USAGE UNIT] Tarik ingredient_usage_units milik satu bahan.
  // Di-cache di state supaya tiap select bahan di baris resep tidak fetch berulang.
  const fetchUsageUnitsForMaterial = async (materialId) => {
    if (!materialId) return [];
    // Sudah pernah di-fetch (termasuk hasil kosong) -> pakai cache, jangan fetch ulang.
    if (usageUnitsByMaterial[materialId] !== undefined) return usageUnitsByMaterial[materialId];
    try {
      const { data, error } = await supabase
        .from('ingredient_usage_units')
        .select('id, unit_name, grams_per_unit')
        .eq('raw_material_id', materialId)
        .order('unit_name', { ascending: true });
      if (error) throw error;
      const list = data || [];
      setUsageUnitsByMaterial((prev) => ({ ...prev, [materialId]: list }));
      return list;
    } catch (err) {
      console.error('⚠️ Gagal memuat usage unit bahan:', err.message);
      setUsageUnitsByMaterial((prev) => ({ ...prev, [materialId]: [] }));
      return [];
    }
  };

  // 🧮 [USAGE UNIT] Harga per base_unit (gram/ml/pcs) bahan, sudah dinormalisasi
  // dari kasus lama kg/litre (mengikuti logic normalisasi yang sudah ada sebelumnya).
  const computeUnitBaseCost = (material) => {
    if (!material) return 0;
    let cost = Number(material.unit_price || 0);
    const u = (material.unit || '').toLowerCase();
    if (u === 'litre' || u === 'liter' || u === 'kg') cost = cost / 1000;
    return cost;
  };

  // 🧮 [USAGE UNIT] Label base unit fallback (kg->gram, litre->ml, selain itu apa adanya).
  const computeFallbackUnit = (material) => {
    if (!material) return '';
    const u = (material.unit || '').toLowerCase();
    if (u === 'kg') return 'gram';
    if (u === 'litre' || u === 'liter') return 'ml';
    return material.unit;
  };

  // 📥 READ PIPELINE 2: Ambil Katalog Menu Terkini dari Supabase Cloud
  const fetchMenuCatalog = async (uid) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        // 🔐 [BUGFIX MULTI-TENANT] Sebelumnya tidak ada filter ini sama sekali —
        // akibatnya SEMUA menu dari SEMUA akun ikut tertarik. Ini root cause
        // kenapa menu akun A muncul juga di akun B.
        .eq('user_id', uid)
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
    // 🔐 [BUGFIX MULTI-TENANT] Ambil user yang login DULU, baru fetch data —
    // supaya semua query selanjutnya bisa di-scope ke user_id yang benar.
    const initForOwner = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('⚠️ Sesi login tidak ditemukan saat memuat Menu Management.');
        setIsLoading(false);
        return;
      }
      setOwnerId(user.id);
      fetchMenuCatalog(user.id);
      fetchStockIngredients(user.id);
    };
    initForOwner();
  }, []);

  useEffect(() => {
    if (editingMenu) {
      const rawRows = editingMenu.recipe && Array.isArray(editingMenu.recipe) ? editingMenu.recipe : [];
      // 🥄 [USAGE UNIT] Normalisasi resep lama yang belum punya usageUnitId/gramsPerUnit
      // supaya tetap kompatibel (backward compatible) -> dianggap base_unit langsung.
      const normalizedRows = rawRows.map((row) => ({
        ...row,
        usageUnitId: row.usageUnitId ?? null,
        gramsPerUnit: Number(row.gramsPerUnit || 1),
      }));
      setRecipeRows(normalizedRows);
      // Prefetch usage unit tiap bahan yang sudah terpakai di resep ini.
      normalizedRows.forEach((row) => { if (row.ingredientId) fetchUsageUnitsForMaterial(row.ingredientId); });
    } else {
      setRecipeRows([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMenu]);

  const newMenuTotalCogs = newMenuRecipe.reduce((sum, row) => sum + Number(row.cost || 0), 0);
  const currentTotalCogs = recipeRows.reduce((sum, row) => sum + Number(row.cost || 0), 0);

  // 🧮 [FR-K06 EXTENSION] Hitung status stok RIIL suatu menu berdasarkan
  // resep (kolom JSONB `recipe`) vs stok bahan baku terkini di `stockIngredients`.
  // Ini terpisah dari toggle manual `is_available` — jadi meskipun owner lupa
  // matiin toggle-nya, dashboard tetap kasih tahu kalau bahannya sudah habis.
  const isMenuStockAvailable = (menuItem) => {
    const recipe = menuItem.recipe;
    if (!recipe || !Array.isArray(recipe) || recipe.length === 0) {
      // Belum ada resep terdaftar -> tidak bisa divalidasi, anggap aman.
      return true;
    }
    return recipe.every((ingredient) => {
      const material = stockIngredients.find((m) => m.id === ingredient.ingredientId);
      if (!material) return true; // bahan sudah dihapus dari master data, skip
      return Number(material.current_stock) >= Number(ingredient.qty || 0);
    });
  };

  // 📤 CREATE PIPELINE
  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!newMenu.menu_name.trim() || !newMenu.price || Number(newMenu.price) <= 0) {
      alert('Isi data nama menu dan nominal harga secara valid, Gar!'); return;
    }
    if (newMenuRecipe.length === 0) {
      alert('Mohon isi resep produk.'); return;
    }
    try {
      if (!ownerId) {
        alert('Sesi login tidak ditemukan, silakan login ulang.');
        return;
      }
      const { error } = await supabase.from('menus').insert([{
        menu_name: newMenu.menu_name,
        category: selectedCategory,
        price: Number(newMenu.price),
        image_url: newMenu.image_url,
        is_available: true,
        recipe: newMenuRecipe,
        user_id: ownerId
      }]);
      if (error) throw error;
      setNewMenu({ menu_name: '', price: '', image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200' });
      setNewMenuRecipe([]);
      setIsModalOpen(false);
      await fetchMenuCatalog(ownerId);
      alert('Menu berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyisipkan menu baru: ' + err.message);
    }
  };

  // 📝 UPDATE PIPELINE
  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (!editingMenu?.id) { alert('ID menu tidak ditemukan, gagal melakukan update, Gar!'); return; }
    if (!editingMenu.menu_name.trim() || !editingMenu.price || Number(editingMenu.price) <= 0) {
      alert('Form edit nama menu dan harga tidak boleh kosong, Gar!'); return;
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
        // 🔐 [BUGFIX MULTI-TENANT] Pastikan cuma bisa update menu milik sendiri.
        .eq('user_id', ownerId)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Tidak ada baris yang diperbarui (atau menu ini bukan milik akun Anda).');
      setEditingMenu(null);
      await fetchMenuCatalog(ownerId);
      alert('Data menu berhasil diperbarui!');
    } catch (err) {
      alert('Gagal memperbarui rekaman data menu: ' + err.message);
    }
  };

  // 🔄 TOGGLE AVAILABILITY
  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .update({ is_available: !currentStatus })
        .eq('id', id)
        // 🔐 [BUGFIX MULTI-TENANT] Guard kepemilikan, sama seperti update biasa.
        .eq('user_id', ownerId)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) { alert('Gagal mengubah status: tidak ada baris yang cocok di database.'); return; }
      await fetchMenuCatalog(ownerId);
    } catch (err) {
      console.error('⚠️ Gagal mengubah status availabilitas:', err.message);
    }
  };

  // ❌ DELETE PIPELINE
  const handleDeleteMenu = async (id) => {
    if (!id) { alert('ID menu tidak valid, gagal menghapus, Gar!'); return; }
    if (!window.confirm('Apakah lu beneran pengen ngehapus menu ini secara permanen dari database cloud Supabase, Gar?')) return;
    try {
      const { data, error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id)
        // 🔐 [BUGFIX MULTI-TENANT] Guard kepemilikan — tidak bisa hapus menu akun lain.
        .eq('user_id', ownerId)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Tidak ada baris yang terhapus (atau menu ini bukan milik akun Anda).');
      await fetchMenuCatalog(ownerId);
      alert('Produk resmi terhapus selamanya dari database cloud!');
    } catch (err) {
      alert('Supabase menolak aksi delete! Eror: ' + err.message);
    }
  };

  // ================= RESEP BARU =================
  const handleAddNewMenuRecipeRow = () => {
    if (stockIngredients.length === 0) { alert('Stok gudang kosong, Daftarkan bahan baku dulu di tab Stock.'); return; }
    const firstMat = stockIngredients[0];
    const initialQty = 10;
    // 🥄 [USAGE UNIT] Baris baru default ke base_unit langsung (usageUnitId null, gramsPerUnit 1).
    // Owner bisa ganti takaran ke usage unit lewat dropdown setelah daftar usage unit ke-load.
    setNewMenuRecipe([...newMenuRecipe, {
      ingredientId: firstMat.id,
      ingredientName: firstMat.material_name,
      qty: initialQty,
      unit: computeFallbackUnit(firstMat),
      usageUnitId: null,
      gramsPerUnit: 1,
      cost: Math.round(initialQty * computeUnitBaseCost(firstMat)),
    }]);
    fetchUsageUnitsForMaterial(firstMat.id);
  };

  const handleUpdateNewMenuRecipeRow = (index, key, value) => {
    const updatedRows = [...newMenuRecipe];

    if (key === 'usageUnitId') {
      const materialId = updatedRows[index].ingredientId;
      const material = stockIngredients.find(m => m.id === materialId);
      if (value === '') {
        // Owner memilih base_unit langsung.
        updatedRows[index].usageUnitId = null;
        updatedRows[index].unit = computeFallbackUnit(material);
        updatedRows[index].gramsPerUnit = 1;
      } else {
        const list = usageUnitsByMaterial[materialId] || [];
        const matchedUnit = list.find(u => u.id === value);
        if (matchedUnit) {
          updatedRows[index].usageUnitId = matchedUnit.id;
          updatedRows[index].unit = matchedUnit.unit_name;
          updatedRows[index].gramsPerUnit = Number(matchedUnit.grams_per_unit);
        }
      }
      const currentQty = Number(updatedRows[index].qty || 0);
      updatedRows[index].cost = Math.round(currentQty * (updatedRows[index].gramsPerUnit || 1) * computeUnitBaseCost(material));
      setNewMenuRecipe(updatedRows);
      return;
    }

    updatedRows[index][key] = value;
    if (key === 'ingredientId' || key === 'qty') {
      const targetId = key === 'ingredientId' ? value : updatedRows[index].ingredientId;
      const matchedMaterial = stockIngredients.find(m => m.id === targetId);
      if (matchedMaterial) {
        updatedRows[index].ingredientId = matchedMaterial.id;
        updatedRows[index].ingredientName = matchedMaterial.material_name;
        if (key === 'ingredientId') {
          // 🥄 [USAGE UNIT] Ganti bahan -> reset takaran ke base_unit & fetch usage unit bahan baru.
          updatedRows[index].usageUnitId = null;
          updatedRows[index].unit = computeFallbackUnit(matchedMaterial);
          updatedRows[index].gramsPerUnit = 1;
          fetchUsageUnitsForMaterial(matchedMaterial.id);
        }
        const currentQty = key === 'qty' ? Number(value || 0) : Number(updatedRows[index].qty || 0);
        updatedRows[index].cost = Math.round(currentQty * (updatedRows[index].gramsPerUnit || 1) * computeUnitBaseCost(matchedMaterial));
      }
    }
    setNewMenuRecipe(updatedRows);
  };

  const handleRemoveNewMenuRecipeRow = (index) => {
    const updatedRows = [...newMenuRecipe];
    updatedRows.splice(index, 1);
    setNewMenuRecipe(updatedRows);
  };

  // ================= RESEP EDIT =================
  const handleAddRecipeRow = () => {
    if (stockIngredients.length === 0) return;
    const firstMat = stockIngredients[0];
    const initialQty = 10;
    // 🥄 [USAGE UNIT] Baris baru default ke base_unit langsung (usageUnitId null, gramsPerUnit 1).
    setRecipeRows([...recipeRows, {
      ingredientId: firstMat.id,
      ingredientName: firstMat.material_name,
      qty: initialQty,
      unit: computeFallbackUnit(firstMat),
      usageUnitId: null,
      gramsPerUnit: 1,
      cost: Math.round(initialQty * computeUnitBaseCost(firstMat)),
    }]);
    fetchUsageUnitsForMaterial(firstMat.id);
  };

  const handleUpdateRecipeRow = (index, key, value) => {
    const updatedRows = [...recipeRows];

    if (key === 'usageUnitId') {
      const materialId = updatedRows[index].ingredientId;
      const material = stockIngredients.find(m => m.id === materialId);
      if (value === '') {
        // Owner memilih base_unit langsung.
        updatedRows[index].usageUnitId = null;
        updatedRows[index].unit = computeFallbackUnit(material);
        updatedRows[index].gramsPerUnit = 1;
      } else {
        const list = usageUnitsByMaterial[materialId] || [];
        const matchedUnit = list.find(u => u.id === value);
        if (matchedUnit) {
          updatedRows[index].usageUnitId = matchedUnit.id;
          updatedRows[index].unit = matchedUnit.unit_name;
          updatedRows[index].gramsPerUnit = Number(matchedUnit.grams_per_unit);
        }
      }
      const currentQty = Number(updatedRows[index].qty || 0);
      updatedRows[index].cost = Math.round(currentQty * (updatedRows[index].gramsPerUnit || 1) * computeUnitBaseCost(material));
      setRecipeRows(updatedRows);
      return;
    }

    updatedRows[index][key] = value;
    if (key === 'ingredientId' || key === 'qty') {
      const targetId = key === 'ingredientId' ? value : updatedRows[index].ingredientId;
      const matchedMaterial = stockIngredients.find(m => m.id === targetId);
      if (matchedMaterial) {
        updatedRows[index].ingredientId = matchedMaterial.id;
        updatedRows[index].ingredientName = matchedMaterial.material_name;
        if (key === 'ingredientId') {
          // 🥄 [USAGE UNIT] Ganti bahan -> reset takaran ke base_unit & fetch usage unit bahan baru.
          updatedRows[index].usageUnitId = null;
          updatedRows[index].unit = computeFallbackUnit(matchedMaterial);
          updatedRows[index].gramsPerUnit = 1;
          fetchUsageUnitsForMaterial(matchedMaterial.id);
        }
        const currentQty = key === 'qty' ? Number(value || 0) : Number(updatedRows[index].qty || 0);
        updatedRows[index].cost = Math.round(currentQty * (updatedRows[index].gramsPerUnit || 1) * computeUnitBaseCost(matchedMaterial));
      }
    }
    setRecipeRows(updatedRows);
  };

  const handleRemoveRecipeRow = (index) => {
    const updatedRows = [...recipeRows];
    updatedRows.splice(index, 1);
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                      <span onClick={() => handleToggleAvailability(item.id, item.is_available)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: item.is_available ? '#059669' : '#DC2626', cursor: 'pointer', backgroundColor: item.is_available ? '#E6F4EA' : '#FEE2E2', padding: '4px 10px', borderRadius: '12px', fontSize: '11px' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: item.is_available ? '#10B981' : '#DC2626', borderRadius: '50%' }} />{item.is_available ? 'Available' : 'Out of Stock'}
                      </span>
                      {/* ✅ [FR-K06 EXTENSION] Badge kedua: status stok bahan baku RIIL
                          (dihitung dari resep vs raw_materials), independen dari toggle di atas. */}
                      {!isMenuStockAvailable(item) && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#D97706', backgroundColor: '#FFF7ED', padding: '4px 10px', borderRadius: '12px', fontSize: '10px' }}>
                          <AlertTriangle size={11} />Bahan Baku Habis
                        </span>
                      )}
                    </div>
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

      {/* ================= MODAL: ADD NEW ITEM ================= */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '24px', height: '24px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Tambah Produk ke Menu</h2>
              </div>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
              {/* KIRI: Form */}
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
                            <input type="text" value={row.qty} onChange={(e) => handleUpdateNewMenuRecipeRow(index, 'qty', e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '40px', border: '1px solid #D1D5DB', padding: '4px', borderRadius: '6px', fontSize: '12px', outline: 'none', textAlign: 'center' }} />
                            {/* 🥄 [USAGE UNIT] Dropdown takaran: usage unit bahan ini (sdt, saset, siung, dst),
                                fallback ke base unit (gram/ml/pcs) kalau bahan belum punya usage unit. */}
                            <select
                              value={row.usageUnitId || ''}
                              onChange={(e) => handleUpdateNewMenuRecipeRow(index, 'usageUnitId', e.target.value)}
                              style={{ border: '1px solid #D1D5DB', padding: '4px', borderRadius: '6px', fontSize: '11px', outline: 'none', backgroundColor: '#fff', color: '#4B5563', fontWeight: 'bold' }}
                            >
                              {(usageUnitsByMaterial[row.ingredientId] || []).map((u) => (
                                <option key={u.id} value={u.id}>{u.unit_name}</option>
                              ))}
                              <option value="">{computeFallbackUnit(stockIngredients.find(m => m.id === row.ingredientId))}</option>
                            </select>
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

              {/* KANAN: Image Picker + Profit Analysis */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Foto Menu</label>
                  {/* ✅ ImagePickerPanel reusable — mendukung URL, Upload, dan Kamera */}
                  <ImagePickerPanel
                    currentImage={newMenu.image_url}
                    onImageChange={(url) => setNewMenu({ ...newMenu, image_url: url })}
                  />
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

      {/* ================= MODAL: EDIT ITEM ================= */}
      {editingMenu && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '920px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Edit Detil Menu Produk & Resep</h2>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setEditingMenu(null)} />
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
              {/* KIRI: Form Edit */}
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
                    <select value={editingMenu.category} onChange={(e) => setEditingMenu({...editingMenu, category: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff', height: '38px', cursor: 'pointer' }}>
                      <option value="Coffee">Coffee</option>
                      <option value="Non-Coffee">Non-Coffee</option>
                      <option value="Food">Food</option>
                      <option value="Pastry">Pastry</option>
                    </select>
                  </div>
                </div>
                <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={14}/> Pemetaan Resep Bahan Baku</h4>
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
                          <input type="text" value={row.qty} onChange={(e) => handleUpdateRecipeRow(index, 'qty', e.target.value.replace(/[^0-9]/g, ''))} style={{ width: '40px', border: '1px solid #D1D5DB', padding: '4px', borderRadius: '6px', fontSize: '12px', outline: 'none', textAlign: 'center' }} />
                          {/* 🥄 [USAGE UNIT] Dropdown takaran: usage unit bahan ini (sdt, saset, siung, dst),
                              fallback ke base unit (gram/ml/pcs) kalau bahan belum punya usage unit. */}
                          <select
                            value={row.usageUnitId || ''}
                            onChange={(e) => handleUpdateRecipeRow(index, 'usageUnitId', e.target.value)}
                            style={{ border: '1px solid #D1D5DB', padding: '4px', borderRadius: '6px', fontSize: '11px', outline: 'none', backgroundColor: '#fff', color: '#4B5563', fontWeight: 'bold' }}
                          >
                            {(usageUnitsByMaterial[row.ingredientId] || []).map((u) => (
                              <option key={u.id} value={u.id}>{u.unit_name}</option>
                            ))}
                            <option value="">{computeFallbackUnit(stockIngredients.find(m => m.id === row.ingredientId))}</option>
                          </select>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#111827' }}>Rp {(row.cost || 0).toLocaleString('id-ID')}</span>
                        <Trash size={14} color="#DC2626" style={{ cursor: 'pointer', justifySelf: 'center' }} onClick={() => handleRemoveRecipeRow(index)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KANAN: Image Picker + Margin Simulator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Foto Produk</label>
                  {/* ✅ ImagePickerPanel reusable — mendukung URL, Upload, dan Kamera */}
                  <ImagePickerPanel
                    currentImage={editingMenu.image_url}
                    onImageChange={(url) => setEditingMenu({ ...editingMenu, image_url: url })}
                  />
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