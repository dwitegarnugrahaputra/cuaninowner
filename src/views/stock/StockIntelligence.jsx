import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, Download, FileText, Edit2, ShoppingCart, 
  AlertTriangle, AlertCircle, Loader2 
} from 'lucide-react';

// Impor koneksi client Supabase murni 
import { supabase } from '../../config/supabaseClient';

export default function StockIntelligence() {
  // ================= STATE INTEGRASI DATABASE INVENTORY =================
  const [materials, setMaterials] = useState([]);
  const [supplyLogs, setSupplyLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [stockSummary, setStockSummary] = useState({
    totalValue: 0,
    criticalCount: 0,
    monthlySpend: 0 
  });

  // 🚀 ENGINE REVISI REALTIME: Fungsi mandiri untuk fetch data inventory agar bisa dipanggil berulang secara realtime
  const refreshInventoryCalculations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      // Pipeline 1: Ambil data Master Bahan Baku (khusus outlet milik user ini)
      const { data: matData, error: matError } = await supabase
        .from('raw_materials')
        .select('*')
        .eq('user_id', uid)
        .order('material_name', { ascending: true });

      if (matError) throw matError;

      // Pipeline 2: Ambil seluruh riwayat log supply untuk kalkulasi spending bulanan (khusus user ini)
      const { data: logData, error: logError } = await supabase
        .from('supply_logs')
        .select('*, raw_materials(material_name, unit_price)')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (logError) throw logError;

      let calculatedValue = 0;
      let calculatedCritical = 0;

      if (matData) {
        setMaterials(matData);
        // 📐 MATEMATIKA AGREGASI: Hitung Total Nilai Aset Inventori & Jumlah Item Kritis
        // ✅ [FIX] Menggunakan minimum_threshold dari database — konsisten dengan logika Flutter
        calculatedValue = matData.reduce((sum, item) => sum + (Number(item.current_stock) * Number(item.unit_price)), 0);
        calculatedCritical = matData.filter(item => Number(item.current_stock) <= Number(item.minimum_threshold)).length;
      } else {
        setMaterials([]);
      }

      // 📅 PIPELINE AKUNTANSI DINAMIS: Hitung total pengeluaran hanya untuk bulan berjalan saat ini
      let calculatedMonthlySpend = 0;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0 = Januari, 11 = Desember

      if (logData) {
        // Simpan SEMUA log (tidak dipotong) — pemotongan 5 teratas dilakukan saat render
        setSupplyLogs(logData);

        logData.forEach(log => {
          const logDate = new Date(log.created_at);
          // Cek apakah log transaksi supply ini terjadi di bulan dan tahun yang sama dengan hari ini
          if (logDate.getFullYear() === currentYear && logDate.getMonth() === currentMonth) {
            const pricePerUnit = log.raw_materials ? Number(log.raw_materials.unit_price) : 0;
            calculatedMonthlySpend += Number(log.quantity_added) * pricePerUnit;
          }
        });
      } else {
        setSupplyLogs([]);
      }

      setStockSummary({
        totalValue: calculatedValue,
        criticalCount: calculatedCritical,
        monthlySpend: calculatedMonthlySpend
      });

    } catch (err) {
      console.error('⚠️ Gagal menyinkronkan data Stock Intelligence ke Supabase:', err.message);
    }
  };

  // Fetch data live stock dan logs dari Supabase secara paralel + Realtime Listener
  useEffect(() => {
    let inventorySubscription = null;

    async function initFetch() {
      setIsLoading(true);
      await refreshInventoryCalculations();
      setIsLoading(false);

      // ⚡ REALTIME PIPELINE SAKTI: Dengerin perubahan data di tabel raw_materials dan supply_logs
      // ✅ [MULTI-TENANT FIX] filter postgres_changes agar hanya trigger untuk baris milik user ini,
      // supaya perubahan data tenant lain tidak memicu refetch di sini.
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) return;

      inventorySubscription = supabase
        .channel('live_inventory_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'raw_materials', filter: `user_id=eq.${uid}` },
          (payload) => {
            console.log('🔄 Terjadi fluktuasi stok sisa bahan baku, Gar! Menghitung ulang...', payload);
            refreshInventoryCalculations();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'supply_logs', filter: `user_id=eq.${uid}` },
          (payload) => {
            console.log('📝 Ada log supply baru masuk (OCR/Manual), Gar! Menyegarkan data...', payload);
            refreshInventoryCalculations();
          }
        )
        .subscribe();
    }
    initFetch();

    return () => {
      if (inventorySubscription) supabase.removeChannel(inventorySubscription);
    };
  }, []);

  // 👁️ Daftar log yang ditampilkan: 5 teratas secara default, atau semua jika showAllLogs aktif
  const visibleLogs = showAllLogs ? supplyLogs : supplyLogs.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', width: '100%', position: 'relative' }}>
      
      {/* LAYOVER LOADING SINKRONISASI SUPABASE BAR */}
      {isLoading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(248, 249, 250, 0.7)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#006847', gap: '8px' }}>
          <Loader2 size={18} className="animate-spin" /> <span>Menghubungkan ke Inventory Engine Supabase...</span>
        </div>
      )}

      {/* HEADER PAGE TITLE */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Stock Intelligence Hub</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time inventory insights and automated OCR processing for Warung Kopi Jaya.</p>
      </div>

      {/* THREE METRICS SUMMARY CARDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📦</div>
            <span style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>Live</span>
          </div>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Total Inventory Value (Rp)</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
            Rp {stockSummary.totalValue.toLocaleString('id-ID')}
          </h2>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ 
              width: '36px', height: '36px', 
              backgroundColor: stockSummary.criticalCount > 0 ? '#FEE2E2' : '#E6F4EA', 
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: stockSummary.criticalCount > 0 ? '#DC2626' : '#006847' 
            }}><AlertTriangle size={18} /></div>
            <span style={{ 
              backgroundColor: stockSummary.criticalCount > 0 ? '#FEE2E2' : '#E6F4EA', 
              color: stockSummary.criticalCount > 0 ? '#DC2626' : '#006847', 
              padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' 
            }}>
              {materials.length === 0 ? 'No Data' : stockSummary.criticalCount > 0 ? 'Action Needed' : 'Secure'}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Critical Items (Count)</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: stockSummary.criticalCount > 0 ? '#DC2626' : '#111827' }}>
            {stockSummary.criticalCount} Items
          </h2>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={18} color="#4B5563" /></div>
            <span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
              {stockSummary.monthlySpend > 0 ? 'Active' : 'No Spend'}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Monthly Supply Spend</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
            Rp {stockSummary.monthlySpend.toLocaleString('id-ID')}
          </h2>
        </div>
      </div>

      {/* LOWER TWO COLS MIX LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* COMPONENT LIVE INVENTORY TABLE */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Live Inventory</h3>
            <div style={{ display: 'flex', gap: '12px', color: '#6B7280' }}>
              <SlidersHorizontal size={18} style={{ cursor: 'pointer' }} />
              <Download size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 8px' }}>NAMA BAHAN</th>
                <th style={{ padding: '12px 8px' }}>KATEGORI</th>
                <th style={{ padding: '12px 8px' }}>SISA STOK</th>
                <th style={{ padding: '12px 8px' }}>SATUAN</th>
                <th style={{ padding: '12px 8px' }}>HARGA/SATUAN</th>
                <th style={{ padding: '12px 8px' }}>TOTAL HARGA</th>
                <th style={{ padding: '12px 8px' }}>STATUS</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {materials.length > 0 ? (
                materials.map((row) => {
                  // ✅ [FIX] Menggunakan minimum_threshold dari database — konsisten dengan logika Flutter
                  const isCritical = Number(row.current_stock) <= Number(row.minimum_threshold);
                  const isOut = Number(row.current_stock) <= 0;
                  const totalItemPrice = Number(row.current_stock) * Number(row.unit_price);

                  let statusLabel = 'AMAN';
                  let badgeBg = '#E6F4EA';
                  let badgeText = '#006847';

                  if (isOut) {
                    statusLabel = 'HABIS';
                    badgeBg = '#FEE2E2';
                    badgeText = '#DC2626';
                  } else if (isCritical) {
                    statusLabel = 'MENIPIS';
                    badgeBg = '#FFF7ED';
                    badgeText = '#D97706';
                  }

                  return (
                    <tr style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }} key={row.id}>
                      <td style={{ padding: '14px 8px', fontWeight: 'bold', maxWidth: '180px' }}>{row.material_name}</td>
                      <td style={{ padding: '14px 8px', color: '#6B7280' }}>{row.category}</td>
                      <td style={{ padding: '14px 8px', fontWeight: 'bold', color: isCritical ? '#DC2626' : '#111827' }}>
                        {Number(row.current_stock).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '14px 8px', color: '#6B7280' }}>{row.unit}</td>
                      <td style={{ padding: '14px 8px', fontWeight: '600', color: '#4B5563' }}>
                        Rp {Number(row.unit_price).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '14px 8px', fontWeight: 'bold', color: '#006847' }}>
                        Rp {totalItemPrice.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <span style={{ backgroundColor: badgeBg, color: badgeText, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                          {statusLabel}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right', color: '#9CA3AF' }}><Edit2 size={14} style={{ cursor: 'pointer' }} /></td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: '#9CA3AF', fontWeight: '500' }}>
                    Data Bahan Baku Kosong.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* COMPONENT RECENT SUPPLY LOG */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Recent Supply Log</h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '20px',
              // 📜 Saat expanded, batasi tinggi & aktifkan scroll biar card tidak melar tak terkendali
              maxHeight: showAllLogs ? '420px' : 'none',
              overflowY: showAllLogs ? 'auto' : 'visible',
              paddingRight: showAllLogs ? '4px' : '0'
            }}
          >
            {visibleLogs.length > 0 ? (
              visibleLogs.map((log) => {
                const isOcr = log.source_type === 'OCR Scan';
                const timeString = new Date(log.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
                
                return (
                  <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={16} color="#6B7280" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{log.supplier_name}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                        +{log.quantity_added} {(log.raw_materials && log.raw_materials.material_name) || 'Bahan'}
                      </p>
                      <span style={{ fontSize: '10px', color: isOcr ? '#10B981' : '#9CA3AF', fontWeight: '500', display: 'block', marginTop: '2px' }}>
                        {timeString} • {log.source_type}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '12px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>
                Belum ada pasokan log masuk.
              </div>
            )}
          </div>
          {/* 🔽 Tombol expand/collapse: hanya tampil bila log lebih dari 5 */}
          {supplyLogs.length > 5 && (
            <button
              onClick={() => setShowAllLogs((prev) => !prev)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {showAllLogs ? `Show Less` : `View All Logs (${supplyLogs.length})`}
            </button>
          )}
        </div>
      </div>

      {/* BRAINY FLOATING AUTOMATED RESTOCK NOTIFICATION BOX */}
      {materials.length > 0 && stockSummary.criticalCount > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '58%', transform: 'translateX(-50%)', width: 'calc(100% - 350px)', maxWidth: '640px', backgroundColor: '#111827', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', boxSizing: 'border-box', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold', letterSpacing: '0.5px', display: 'block' }}>BRAINY INSIGHT</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#E5E7EB', lineHeight: '1.4' }}>
                Ada {stockSummary.criticalCount} bahan baku menipis di bawah batas minimum. Buat draf restok otomatis?
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button onClick={() => alert('Draf diabaikan')} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#E5E7EB', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Ignore</button>
            <button 
              onClick={() => {
                // ✅ [FIX] Filter menggunakan minimum_threshold dari database — konsisten dengan kalkulasi di atas
                const criticalItems = materials.filter(item => Number(item.current_stock) <= Number(item.minimum_threshold));
                let message = `*⚠️ PEMBERITAHUAN RESTOK OTOMATIS - cuanin.id* %0A%0A`;
                message += `Halo Admin Stok, Brainy AI mendeteksi bahwa bahan baku berikut sudah menyentuh batas minimum dan harus segera di-restok: %0A%0A`;
                
                criticalItems.forEach((item, idx) => {
                  message += `${idx + 1}. *${item.material_name}* %0A`;
                  message += `   - Sisa Stok: ${Number(item.current_stock).toLocaleString('id-ID')} ${item.unit} %0A`;
                  message += `   - Batas Minimum: ${item.minimum_threshold} ${item.unit} %0A%0A`;
                });

                message += `Mohon segera buat Purchase Order (PO) ke pihak supplier resmi. Terima kasih!`;
                const adminWhatsAppNumber = "628512345678"; 
                window.open(`https://wa.me/${adminWhatsAppNumber}?text=${message}`, '_blank');
              }} 
              style={{ backgroundColor: '#10B981', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

    </div>
  );
}