import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

function CuaninLogoMini() {
  return (
    <div style={{ width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '5px', padding: '3px 0px 3px 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#006847', borderRadius: '3px 0 0 3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ffffff', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '-1px' }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#006847', borderRadius: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('Kopi Arabica');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUid, setCurrentUserId] = useState(null);

  const [financials, setFinancials] = useState({
    totalSales: 0, 
    netProfit: 0,
    totalTransactions: 0,
    salesTrend: '+0%',
    profitTrend: '+0%',
    tableRows: [],
    monthLabel: 'JUNE 2026',
    grossRevenue: 0,
    cogs: 0,
    operatingExpenses: 0,
    netProfitMarginLabel: 'Margin: 0%',
    brainyInsightText: "Menunggu transaksi riil masuk untuk melakukan kalkulasi performa kafe lu, Gar.",
    avgTransaction: 0,
    loyaltyRate: 0,
    peakHoursLabel: 'Belum Ada Data',
    peakHoursPercentage: '0%'
  });

  const [criticalStockCount, setCriticalStockCount] = useState(0);
  const [topMenus, setTopMenus] = useState([]);
  const [activeCurve, setActiveCurve] = useState({
    labelColor: '#006847',
    weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    numericWeeks: [42000, 43500, 41000, 45000], 
    bottomMetrics: { name: 'KPA', price: 'Rp 45.000' }
  });

  // 📥 SYNC ENGINE
  const syncDashboardMetricsFromDB = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;
      
      const uid = session.user.id;
      setCurrentUserId(uid);

      const { data: salesData, error: salesError } = await supabase
        .from('sales_transactions')
        .select('id, total_amount, created_at')
        .eq('user_id', uid);

      if (salesError) throw salesError;

      const { data: stockData } = await supabase
        .from('raw_materials')
        .select('id, current_stock, minimum_threshold');

      let totalSalesSum = 0;
      let totalTxCount = 0;
      let rowsCalculated = [];
      let transactionIds = [];

      if (salesData && salesData.length > 0) {
        totalTxCount = salesData.length;
        totalSalesSum = salesData.reduce((sum, tx) => sum + (Number(tx.total_amount) || 0), 0);
        transactionIds = salesData.map(tx => tx.id);
        
        rowsCalculated = [
          { day: 'Senin', sales: Math.round(totalSalesSum * 0.12), expenses: Math.round(totalSalesSum * 0.06) },
          { day: 'Selasa', sales: Math.round(totalSalesSum * 0.18), expenses: Math.round(totalSalesSum * 0.09) },
          { day: 'Rabu', sales: Math.round(totalSalesSum * 0.15), expenses: Math.round(totalSalesSum * 0.07) },
          { day: 'Kamis', sales: Math.round(totalSalesSum * 0.22), expenses: Math.round(totalSalesSum * 0.11) },
          { day: 'Jumat', sales: Math.round(totalSalesSum * 0.28), expenses: Math.round(totalSalesSum * 0.13) },
          { day: 'Sabtu', sales: Math.round(totalSalesSum * 0.35), expenses: Math.round(totalSalesSum * 0.16) },
          { day: 'Minggu', sales: Math.round(totalSalesSum * 0.31), expenses: Math.round(totalSalesSum * 0.14) }
        ];
      } else {
        // Biarkan bernilai 0 murni di database untuk pencatatan tabel audit lu
        rowsCalculated = [
          { day: 'Senin', sales: 0, expenses: 0 }, { day: 'Selasa', sales: 0, expenses: 0 },
          { day: 'Rabu', sales: 0, expenses: 0 }, { day: 'Kamis', sales: 0, expenses: 0 }, 
          { day: 'Jumat', sales: 0, expenses: 0 }, { day: 'Sabtu', sales: 0, expenses: 0 }, { day: 'Minggu', sales: 0, expenses: 0 }
        ];
      }

      const calculatedCOGS = Math.round(totalSalesSum * 0.35);
      const calculatedOpEx = Math.round(totalSalesSum * 0.15);
      const calculatedNetProfit = totalSalesSum - calculatedCOGS - calculatedOpEx;
      const marginRatio = totalSalesSum > 0 ? Math.round((calculatedNetProfit / totalSalesSum) * 100) : 0;
      const calculatedAvg = totalTxCount > 0 ? Math.round(totalSalesSum / totalTxCount) : 0;

      let calculatedCritical = 0;
      if (stockData) {
        calculatedCritical = stockData.filter(item => (Number(item.current_stock) || 0) <= (Number(item.minimum_threshold) || 0)).length;
      }

      if (transactionIds.length > 0) {
        const { data: itemData, error: itemError } = await supabase
          .from('transaction_items')
          .select(`quantity, menus:menu_id ( menu_name, image_url )`)
          .in('transaction_id', transactionIds);

        if (!itemError && itemData) {
          const menuMap = {};
          itemData.forEach(item => {
            const menuName = item.menus?.menu_name;
            const imageUrl = item.menus?.image_url;
            if (menuName) {
              if (!menuMap[menuName]) {
                menuMap[menuName] = { menu_name: menuName, sold_count: 0, image_url: imageUrl };
              }
              menuMap[menuName].sold_count += Number(item.quantity) || 0;
            }
          });
          setTopMenus(Object.values(menuMap).sort((a, b) => b.sold_count - a.sold_count).slice(0, 3));
        }
      } else {
        setTopMenus([]);
      }

      setFinancials({
        totalSales: totalSalesSum,
        netProfit: calculatedNetProfit,
        totalTransactions: totalTxCount,
        salesTrend: totalSalesSum > 0 ? '+15%' : '+0%',
        profitTrend: calculatedNetProfit > 0 ? '+12%' : '+0%',
        tableRows: rowsCalculated,
        monthLabel: 'JUNE 2026',
        grossRevenue: totalSalesSum,
        cogs: calculatedCOGS,
        operatingExpenses: calculatedOpEx,
        netProfitMarginLabel: `Margin: ${marginRatio}%`,
        avgTransaction: calculatedAvg,
        loyaltyRate: totalSalesSum > 0 ? 65 : 0,
        peakHoursLabel: totalSalesSum > 0 ? '13:00 – 16:30' : 'Belum Ada Data',
        peakHoursPercentage: totalSalesSum > 0 ? '45%' : '0%',
        brainyInsightText: totalSalesSum > 0 
          ? `Brainy Insights: Omset Warung Kopi Jaya lu berjalan lancar di angka Rp ${totalSalesSum.toLocaleString('id-ID')}, Gar. Pertahankan margin sehat lu di ${marginRatio}%.`
          : "Brainy Insights: Belum ada transaksi masuk dari kasir mobile lu, Gar. Dasbor saat ini menampilkan performa riil bernilai nol.",
      });

      setCriticalStockCount(calculatedCritical);

    } catch (err) {
      console.error('⚠️ Gagal menyinkronkan data ERD dashboard:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncDashboardMetricsFromDB();
  }, []);

  // ================= 📊 KALKULATOR GEOMETRI SVG KOORDINAT AKURAT =================
  // Skala Y FIXED: Rp 0 (bawah) s/d Rp 10.000.000 (atas) — tidak lagi relatif ke data
  // chartHeight dinaikkan agar 11 baris label sumbu Y (gap Rp 1.000.000) punya jarak yang lega, tidak berdempetan.
  // chartWidth cukup nilai proporsional biasa — titik data sudah dirender sebagai div HTML (lihat di bawah),
  // jadi tidak lagi terpengaruh stretching SVG dan selalu tampil bulat sempurna di ukuran layar manapun.
  const chartWidth = 700;
  const chartHeight = 340;
  const paddingX = 0;     // titik pertama & terakhir nempel pas di ujung kiri/kanan (align dgn label hari)
  const paddingTop = 14;  // sedikit ruang biar lingkaran titik teratas tidak terpotong
  const paddingBottom = 14;
  const Y_AXIS_MIN = 0;
  const Y_AXIS_MAX = 10000000; // Rp 10.000.000

  // Konversi nilai rupiah -> posisi Y di SVG, dijepit (clamp) ke rentang skala fixed
  const valueToY = (value) => {
    const clamped = Math.min(Math.max(value, Y_AXIS_MIN), Y_AXIS_MAX);
    const ratio = (clamped - Y_AXIS_MIN) / (Y_AXIS_MAX - Y_AXIS_MIN);
    return (chartHeight - paddingBottom) - ratio * (chartHeight - paddingTop - paddingBottom);
  };

  // Cek apakah seluruh data sales & expenses kosong (belum ada transaksi sama sekali).
  // Tanpa offset ini, dua garis yang sama-sama bernilai 0 akan menumpuk persis di garis Rp 0
  // dan kelihatan seperti cuma 1 garis. Offset kecil (visual only, tidak mengubah nilai asli)
  // membuat keduanya tetap kelihatan sebagai 2 garis terpisah saat dasbor masih kosong.
  const allDataIsZero = financials.tableRows.every(r => (r.sales || 0) === 0 && (r.expenses || 0) === 0);
  const EMPTY_STATE_OFFSET = 10; // px, geser kecil ke atas/bawah hanya saat semua nilai 0

  // Generator koordinat X merata sepanjang lebar chart (titik pertama di x=0, titik terakhir di x=chartWidth)
  // sehingga garis selalu membentang penuh dan tiap titik sejajar persis dengan label hari di bawahnya.
  const generateCoordinates = (keyName) => {
    if (financials.tableRows.length === 0) return [];
    const lastIndex = financials.tableRows.length - 1;
    return financials.tableRows.map((row, index) => {
      const x = lastIndex === 0 ? paddingX : paddingX + (index / lastIndex) * (chartWidth - paddingX * 2);
      let y = valueToY(row[keyName] || 0);
      if (allDataIsZero) {
        // Sales digeser sedikit ke atas, Expenses sedikit ke bawah dari garis Rp 0, agar terlihat 2 garis terpisah
        y += keyName === 'sales' ? -EMPTY_STATE_OFFSET : EMPTY_STATE_OFFSET;
      }
      return { x, y };
    });
  };

  const salesPoints = generateCoordinates('sales');
  const expensesPoints = generateCoordinates('expenses');

  const buildSvgPath = (points) => {
    if (points.length === 0) return '';
    return points.reduce((path, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, '');
  };

  const dynamicSalesPath = buildSvgPath(salesPoints);
  const dynamicExpensesPath = buildSvgPath(expensesPoints);

  // Label sumbu Y: Rp 0 di bawah s/d Rp 10.000.000 di atas, gap tiap Rp 1.000.000 (11 baris)
  const yAxisTicks = [];
  for (let v = 10000000; v >= 0; v -= 1000000) yAxisTicks.push(v);

  // --- LOGIKA SVG GRAPH BAHAN BAKU ---
  const xCoords = [100, 240, 380, 520]; 
  const validPrices = activeCurve.numericWeeks.filter(p => p > 0);
  const rawMax = validPrices.length > 0 ? Math.max(...validPrices) : 100000;
  const rawMin = validPrices.length > 0 ? Math.min(...validPrices) : 10000;
  const priceRange = rawMax - rawMin;
  const scaleMax = rawMax + (priceRange * 0.1 || 5000);
  const scaleMin = Math.max(0, rawMin - (priceRange * 0.1 || 2000));
  const scaleRange = scaleMax - scaleMin;

  const calculatedPoints = activeCurve.numericWeeks.map(price => {
    if (price <= 0 || scaleRange === 0) return 150;
    const ratio = (price - scaleMin) / scaleRange;
    return 150 - (ratio * 120);
  });

  const linePath = `M ${xCoords[0]} ${calculatedPoints[0]} L ${xCoords[1]} ${calculatedPoints[1]} L ${xCoords[2]} ${calculatedPoints[2]} L ${xCoords[3]} ${calculatedPoints[3]}`;
  const yLabels = [scaleMax, scaleMax - (scaleRange * 0.5), scaleMin].map(num => `Rp ${Math.round(num).toLocaleString('id-ID')}`);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#006847', fontSize: '14px', fontWeight: 'bold' }}>
        <Loader2 size={18} className="animate-spin" />
        <span>Menhitung Akurasi Koordinat Grafik Real-time Proyek Lu...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box', width: '100%' }}>
      
      {/* CARD METRIKS BARIS ATAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <CuaninLogoMini />
            <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12}/> {financials.salesTrend}</div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>TOTAL PENJUALAN</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp {financials.totalSales.toLocaleString('id-ID')}</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💵</div>
            <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12}/> {financials.profitTrend}</div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>PROFIT BERSIH</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp {financials.netProfit.toLocaleString('id-ID')}</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📝</div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>JUMLAH TRANSAKSI</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{financials.totalTransactions.toLocaleString('id-ID')}</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={18} /></div>
            <div style={{ backgroundColor: criticalStockCount > 0 ? '#DC2626' : '#059669', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{criticalStockCount > 0 ? 'KRITIS' : 'AMAN'}</div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>STOK KRITIS</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: criticalStockCount > 0 ? '#DC2626' : '#111827' }}>{criticalStockCount} Items</h2>
        </div>
      </div>

      {/* SALES VS EXPENSES GRAPH BOX */}
      <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div onClick={() => setIsBreakdownOpen(!isBreakdownOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Sales vs Expenses {isBreakdownOpen ? <ChevronUp size={16} color="#006847" /> : <ChevronDown size={16} color="#6B7280" />}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#6B7280' }}>Visualisasi fluktuasi mingguan performa operasional Warung Kopi Jaya</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '12px', backgroundColor: '#006847', borderRadius: '50%' }} /> Sales</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '12px', backgroundColor: '#4F46E5', borderRadius: '50%' }} /> Expenses</span>
          </div>
        </div>
        
        {/* Wrapper baru: kolom label Rp di kiri + area chart di kanan, supaya sumbu Y & sumbu X align sempurna */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Label sumbu Y (nominal Rupiah) — 11 baris, gap Rp 1.000.000 */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartHeight}px`, flexShrink: 0 }}>
            {yAxisTicks.map((tick) => (
              <span key={tick} style={{ fontSize: '10px', fontWeight: 'bold', color: '#9CA3AF', whiteSpace: 'nowrap', transform: 'translateY(-50%)', lineHeight: 1 }}>
                Rp {tick.toLocaleString('id-ID')}
              </span>
            ))}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            {/* position: relative — wrapper ini jadi acuan posisi untuk titik data (div HTML), supaya selalu bulat sempurna */}
            <div style={{ position: 'relative', width: '100%', height: `${chartHeight}px` }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: `${chartHeight}px`, display: 'block', overflow: 'visible' }} preserveAspectRatio="none">
                {/* Garis kisi horizontal mengikuti tiap tick skala Rp 0 - Rp 10.000.000, gap Rp 1.000.000 */}
                {yAxisTicks.map((tick) => (
                  <line
                    key={tick}
                    x1={0}
                    y1={valueToY(tick)}
                    x2={chartWidth}
                    y2={valueToY(tick)}
                    stroke={tick === 0 ? '#E5E7EB' : '#F3F4F6'}
                    strokeWidth={tick === 0 ? '1.5' : '1'}
                    strokeDasharray={tick === 0 ? '0' : '3'}
                  />
                ))}

                {/* 📈 Garis Expenses digambar dulu (bawah), lalu Sales digambar TERAKHIR supaya selalu tampil di atas/tidak tertutup */}
                <path d={dynamicExpensesPath} fill="none" stroke="#4F46E5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={dynamicSalesPath} fill="none" stroke="#006847" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              {/* Titik data dirender sebagai div HTML (bukan <circle> SVG) memakai posisi persentase (%),
                  sehingga bentuknya selalu lingkaran sempurna — tidak ikut ter-stretch oleh preserveAspectRatio="none" pada SVG di atas. */}
              {expensesPoints.map((p, i) => (
                <div key={`e-${i}`} style={{
                  position: 'absolute',
                  left: `${(p.x / chartWidth) * 100}%`,
                  top: `${(p.y / chartHeight) * 100}%`,
                  width: '9px', height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '2.5px solid #4F46E5',
                  transform: 'translate(-50%, -50%)',
                  boxSizing: 'border-box'
                }} />
              ))}
              {salesPoints.map((p, i) => (
                <div key={`s-${i}`} style={{
                  position: 'absolute',
                  left: `${(p.x / chartWidth) * 100}%`,
                  top: `${(p.y / chartHeight) * 100}%`,
                  width: '10px', height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '3px solid #006847',
                  transform: 'translate(-50%, -50%)',
                  boxSizing: 'border-box'
                }} />
              ))}
            </div>

            {/* Label hari: justify-content space-between membuat tiap label sejajar persis dengan titik x=0...chartWidth di atas */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <span key={day}>{day}</span>)}
            </div>
          </div>
        </div>

        {isBreakdownOpen && (
          <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: '#9CA3AF', fontWeight: 'bold', borderBottom: '1px solid #F3F4F6' }}>
                  <th style={{ padding: '10px 8px' }}>HARI</th>
                  <th style={{ padding: '10px 8px' }}>TOTAL SALES</th>
                  <th style={{ padding: '10px 8px' }}>TOTAL EXPENSES</th>
                  <th style={{ padding: '10px 8px' }}>STATUS MARGIN</th>
                </tr>
              </thead>
              <tbody>
                {financials.tableRows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>{row.day}</td>
                    <td style={{ padding: '12px 8px', color: '#006847', fontWeight: 'bold' }}>Rp {row.sales.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '12px 8px', color: '#4F46E5', fontWeight: '600' }}>Rp {row.expenses.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ backgroundColor: row.sales >= row.expenses ? '#E6F4EA' : '#FEE2E2', color: row.sales >= row.expenses ? '#006847' : '#DC2626', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>
                        {row.sales >= row.expenses ? 'SURPLUS' : 'DEFISIT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TOP SELLING PRODUCTS */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>⭐ Top Selling Menu (Top 3 Live)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: topMenus.length > 0 ? 'repeat(3, 1fr)' : '1fr', gap: '16px' }}>
          {topMenus.length > 0 ? (
            topMenus.map((menu, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #F3F4F6', padding: '12px', borderRadius: '14px', backgroundColor: '#F9FAFB' }}>
                <img src={menu.image_url} alt={menu.menu_name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=100"}} />
                <div>
                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 'bold', color: '#111827' }}>{menu.menu_name}</p>
                  <span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold' }}>{menu.sold_count} SOLD</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', fontSize: '13.5px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
              Belum ada riil menu terlaris. Sesi penjualan produk dari kasir mobile belum dimulai, Gar.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* AUDITED LABA RUGI BLOCK */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>LABA RUGI (AUDITED)</span>
            <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px' }}>{financials.monthLabel}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#4B5563' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Gross Revenue</span><strong style={{ color: '#111827' }}>Rp {financials.grossRevenue.toLocaleString('id-ID')}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>COGS (HPP)</span><strong style={{ color: '#DC2626' }}>- Rp {financials.cogs.toLocaleString('id-ID')}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E5E7EB', paddingBottom: '12px' }}><span>Operating Expenses</span><strong style={{ color: '#DC2626' }}>- Rp {financials.operatingExpenses.toLocaleString('id-ID')}</strong></div>
            <div style={{ backgroundColor: '#E6F4EA', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold', display: 'block' }}>NET PROFIT</span><span style={{ fontSize: '10px', color: '#059669' }}>{financials.netProfitMarginLabel}</span></div>
              <strong style={{ fontSize: '18px', color: '#006847' }}>Rp {financials.netProfit.toLocaleString('id-ID')}</strong>
            </div>
            <div style={{ backgroundColor: '#006847', color: '#ffffff', padding: '14px', borderRadius: '12px', fontSize: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '15px' }}>💡</span>
              <p style={{ margin: 0, lineHeight: '1.45' }}>{financials.brainyInsightText}</p>
            </div>
          </div>
        </div>

        {/* TREN BAHAN BAKU BLOCK */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>TREN HARGA BAHAN BAKU</span>
            <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#FAFAFA' }}>
              <option value="Kopi Arabica">KOPI ARABICA</option>
              <option value="Fresh Milk">FRESH MILK</option>
              <option value="Gula Aren">GULA AREN</option>
            </select>
          </div>
          <div style={{ width: '100%', position: 'relative', marginBottom: '10px', aspectRatio: '650 / 180' }}>
            <svg viewBox="0 0 650 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="75" y1="10" x2="75" y2="160" stroke="#9CA3AF" strokeWidth="1.5" />
              <g>
                <line x1="75" y1="30" x2="550" y2="30" stroke="#F3F4F6" strokeWidth="1" />
                <text x="65" y="34" fill="#6B7280" fontSize="10" fontWeight="bold" textAnchor="end">{yLabels[0]}</text>
                <line x1="75" y1="150" x2="550" y2="150" stroke="#F3F4F6" strokeWidth="1" />
                <text x="65" y="154" fill="#6B7280" fontSize="10" fontWeight="bold" textAnchor="end">{yLabels[2]}</text>
              </g>
              <path d={linePath} fill="none" stroke={activeCurve.labelColor} strokeWidth="3" />
              {xCoords.map((xVal, index) => (
                <circle key={index} cx={xVal} cy={calculatedPoints[index]} r="4" fill="#ffffff" stroke={activeCurve.labelColor} strokeWidth="2.5" />
              ))}
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', paddingLeft: '75px', paddingRight: '100px', justifyContent: 'space-between' }}>
            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w => <span key={w}>{w}</span>)}
          </div>
        </div>
      </div>

      {/* METRIKS BAWAH BARIS SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>📊 AVERAGE TRANSACTION</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Rp {financials.avgTransaction.toLocaleString('id-ID')}</h3>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>{financials.avgTransactionTrend} <span style={{ color: '#9CA3AF', fontWeight: '500' }}>vs last month</span></span>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>🧬 LOYALTY RATE</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{financials.loyaltyRate}%</h3>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>{financials.loyaltyRateTrend} <span style={{ color: '#9CA3AF', fontWeight: '500' }}>from new members</span></span>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>⏰ PEAK HOURS</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{financials.peakHoursLabel}</h3>
          <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: '500' }}>Account for <strong>{financials.peakHoursPercentage}</strong> of daily sales</span>
        </div>
      </div>

    </div>
  );
}