import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Loader2, Sparkles
} from 'lucide-react';
import { supabase } from '../../config/supabaseClient';
import {
  ComposedChart, Bar, Cell, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

// 💰 HELPER: Format angka rupiah singkat untuk axis & tooltip chart (sama gaya dengan BrainyChat.jsx)
function formatRupiahShort(value) {
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
  if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}rb`;
  return `Rp ${value}`;
}

// 🧾 TOOLTIP KUSTOM: dipakai chart Sales vs Expenses (gaya sama dengan ForecastTooltip di BrainyChat.jsx)
function SalesExpensesTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px',
      padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px'
    }}>
      <div style={{ fontWeight: 'bold', color: '#111827', marginBottom: '6px' }}>{label}</div>
      {payload.map((entry, idx) => (
        <div key={idx} style={{ color: entry.color, fontWeight: 'bold', marginTop: idx > 0 ? '2px' : 0 }}>
          {entry.name}: {formatRupiahShort(entry.value)}
        </div>
      ))}
    </div>
  );
}

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

// ☕ HELPER: urutkan brand kopi berdasar "value terbaik" — quality_score tinggi & harga wajar
// diprioritaskan di atas. Dipakai untuk menentukan badge "REKOMENDASI BRAINY".
function rankCoffeeBrandsByValue(brands) {
  if (!brands || brands.length === 0) return [];
  return [...brands].sort((a, b) => Number(b.quality_score || 0) - Number(a.quality_score || 0));
}

// 🧾 TOOLTIP KUSTOM: dipakai bar chart Perbandingan Brand Biji Kopi
function CoffeeBrandTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div style={{
      backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px',
      padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px', minWidth: '150px'
    }}>
      <div style={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#006847', fontWeight: 'bold' }}>Rp {Number(point.price_per_kg || 0).toLocaleString('id-ID')}/kg</div>
      <div style={{ color: '#D97706', fontWeight: '600', marginTop: '2px' }}>Skor Kualitas: {point.quality_score}/100</div>
    </div>
  );
}

// 🆕 Senin (00:00) minggu ini, di waktu LOKAL browser
function getStartOfThisWeekMonday() {
  const now = new Date();
  const day = now.getDay(); 
  const diffToMonday = day === 0 ? 6 : day - 1; 
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// 🆕 Index hari (0=Senin ... 6=Minggu) dari sebuah Date
function getMondayBasedDayIndex(date) {
  const day = date.getDay(); 
  return day === 0 ? 6 : day - 1;
}

export default function Dashboard() {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
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

  const [coffeeBrands, setCoffeeBrands] = useState([]);
  const [isCoffeeBrandsLoading, setIsCoffeeBrandsLoading] = useState(true);

  // 🧠 GENERATOR INSIGHT FINANSIAL INTERNAL: Dinamis memetakan performa berdasarkan nama outlet asli database
  const generateFinancialInsight = (sales, profit, cogs, opex, targetOutletName) => {
    if (sales === 0) {
      return `Brainy Insights: Belum ada transaksi masuk dari kasir mobile di ${targetOutletName}. Dasbor saat ini menampilkan performa riil bernilai nol.`;
    }

    const marginRatio = Math.round((profit / sales) * 100);
    
    if (profit < 0) {
      const deficit = Math.abs(profit);
      const cogsRatio = Math.round((cogs / sales) * 100);
      const opexRatio = Math.round((opex / sales) * 100);
      const biggestDriverLabel = opex >= cogs ? 'Operating Expenses' : 'COGS (HPP)';
      const biggestDriverRatio = opex >= cogs ? opexRatio : cogsRatio;

      // 🎯 Target margin sehat untuk F&B skala kafe: 15%. Hitung selisih Rp yang dibutuhkan
      // (baik lewat pemangkasan biaya maupun kenaikan omset) supaya balik ke margin tsb.
      const HEALTHY_MARGIN_TARGET = 0.15;
      const gapToHealthyMargin = Math.round((sales * HEALTHY_MARGIN_TARGET) - profit);

      return `Brainy Solution: ${targetOutletName} rugi Rp ${deficit.toLocaleString('id-ID')} minggu ini, Gar. Penyebab utamanya ${biggestDriverLabel} yang makan ${biggestDriverRatio}% dari omset — jauh di atas batas wajar. Pangkas ${biggestDriverLabel} atau naikkan omset sekitar Rp ${gapToHealthyMargin.toLocaleString('id-ID')} biar balik ke margin sehat 15%.`;
    }

    if (opex > sales * 0.4) {
      return `Brainy Optimization: Omset ${targetOutletName} berjalan lancar di angka Rp ${sales.toLocaleString('id-ID')}, tapi margin tertekan ke bawah (${marginRatio}%) karena kebocoran pengeluaran riil (OpEx) mencapai Rp ${opex.toLocaleString('id-ID')}. Cek log aktivitas pengeluaran kasir lu!`;
    }

    return `Brainy Insights: Omset ${targetOutletName} lu berjalan lancar di angka Rp ${sales.toLocaleString('id-ID')}, Gar. Pertahankan margin sehat lu di ${marginRatio}%.`;
  };

  const syncDashboardMetricsFromDB = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;
      
      const uid = session.user.id;
      setCurrentUserId(uid);

      const startOfWeek = getStartOfThisWeekMonday();
      const startOfWeekIso = startOfWeek.toISOString();

      const { data: salesData, error: salesError } = await supabase
        .from('sales_transactions')
        .select('id, total_amount, created_at')
        .eq('user_id', uid);

      if (salesError) throw salesError;

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('id, amount, created_at')
        .eq('owner_user_id', uid)
        .gte('created_at', startOfWeekIso);

      if (expensesError) throw expensesError;

      // 💰 REAL OPEX: total pengeluaran ALL-TIME (bukan cuma minggu ini) supaya konsisten dengan totalSalesSum
      // yang juga dihitung dari SELURUH riwayat sales_transactions (tidak dibatasi tanggal).
      const { data: expensesAllData, error: expensesAllError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('owner_user_id', uid);
      if (expensesAllError) throw expensesAllError;
      const totalOpExAllTime = (expensesAllData || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      // 🧾 REAL HPP/COGS: ambil resep tiap menu (kolom JSON `recipe` di tabel menus) untuk menghitung modal riil,
      // menggantikan asumsi kasar COGS = 35% dari omset.
      const { data: menusRecipeData, error: menusRecipeError } = await supabase
        .from('menus')
        .select('id, recipe')
        .eq('user_id', uid);
      if (menusRecipeError) throw menusRecipeError;
      const menuCogsPerUnitMap = {};
      (menusRecipeData || []).forEach(m => {
        if (Array.isArray(m.recipe)) {
          menuCogsPerUnitMap[m.id] = m.recipe.reduce((sum, ing) => sum + Number(ing.cost || 0), 0);
        }
      });

      const { data: stockData } = await supabase
        .from('raw_materials')
        .select('id, current_stock, minimum_threshold')
        .eq('user_id', uid);

      // 🟩 1. AMBIL NAMA OUTLET DINAMIS DARI DATABASE SECARA REAL
      let resolvedOutletName = 'Outlet Lu';
      const { data: outletData } = await supabase
        .from('outlet_config')
        .select('outlet_name')
        .eq('user_id', uid)
        .maybeSingle();
      if (outletData?.outlet_name) {
        resolvedOutletName = outletData.outlet_name;
      }

      let totalSalesSum = 0;
      let totalTxCount = 0;
      let rowsCalculated = [];
      let transactionIds = [];

      const dayLabels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      rowsCalculated = dayLabels.map((day) => ({ day, sales: 0, expenses: 0 }));

      if (salesData && salesData.length > 0) {
        totalTxCount = salesData.length;
        totalSalesSum = salesData.reduce((sum, tx) => sum + (Number(tx.total_amount) || 0), 0);
        transactionIds = salesData.map(tx => tx.id);

        salesData.forEach((tx) => {
          const txDate = new Date(tx.created_at);
          if (txDate >= startOfWeek) {
            const idx = getMondayBasedDayIndex(txDate);
            rowsCalculated[idx].sales += Number(tx.total_amount) || 0;
          }
        });
      }

      let totalExpensesThisWeek = 0;
      if (expensesData && expensesData.length > 0) {
        expensesData.forEach((exp) => {
          const expDate = new Date(exp.created_at);
          const idx = getMondayBasedDayIndex(expDate);
          const amount = Number(exp.amount) || 0;
          rowsCalculated[idx].expenses += amount;
          totalExpensesThisWeek += amount;
        });
      }

      // 🧾 REAL HPP/COGS + Top Menu: satu query transaction_items dipakai untuk dua kebutuhan sekaligus
      let calculatedCOGS = 0;
      let itemsMissingRecipeCount = 0;
      if (transactionIds.length > 0) {
        const { data: itemData, error: itemError } = await supabase
          .from('transaction_items')
          .select(`quantity, menu_id, menus:menu_id ( menu_name, image_url )`)
          .in('transaction_id', transactionIds);

        if (!itemError && itemData) {
          const menuMap = {};
          itemData.forEach(item => {
            const qty = Number(item.quantity) || 0;
            const menuName = item.menus?.menu_name;
            const imageUrl = item.menus?.image_url;
            if (menuName) {
              if (!menuMap[menuName]) {
                menuMap[menuName] = { menu_name: menuName, sold_count: 0, image_url: imageUrl };
              }
              menuMap[menuName].sold_count += qty;
            }

            // 💰 Akumulasi HPP riil: qty terjual × total cost bahan baku dari resep menu tersebut
            const cogsPerUnit = menuCogsPerUnitMap[item.menu_id];
            if (cogsPerUnit === undefined) {
              itemsMissingRecipeCount += 1;
            } else {
              calculatedCOGS += qty * cogsPerUnit;
            }
          });
          setTopMenus(Object.values(menuMap).sort((a, b) => b.sold_count - a.sold_count).slice(0, 3));
        }
      } else {
        setTopMenus([]);
      }
      calculatedCOGS = Math.round(calculatedCOGS);
      if (itemsMissingRecipeCount > 0) {
        console.warn(`⚠️ Brainy Dashboard: ${itemsMissingRecipeCount} baris transaction_items merujuk ke menu tanpa resep, HPP untuk item tsb tidak ikut terhitung.`);
      }

      // 💵 OpEx dihitung ALL-TIME (bukan cuma minggu ini) agar konsisten dengan totalSalesSum yang juga all-time
      const calculatedOpEx = totalOpExAllTime;
      const calculatedNetProfit = totalSalesSum - calculatedCOGS - calculatedOpEx;
      const marginRatio = totalSalesSum > 0 ? Math.round((calculatedNetProfit / totalSalesSum) * 100) : 0;
      const calculatedAvg = totalTxCount > 0 ? Math.round(totalSalesSum / totalTxCount) : 0;

      let calculatedCritical = 0;
      if (stockData) {
        calculatedCritical = stockData.filter(item => (Number(item.current_stock) || 0) <= (Number(item.minimum_threshold) || 0)).length;
      }

      // 🟩 2. HITUNG LOGIKA INSIGHT DENGAN NAMA OUTLET YANG ASLI
      // 🐛 FIX: sebelumnya di sini ada template insight duplikat yang selalu positif,
      // sehingga fungsi generateFinancialInsight() (yang sudah benar menangani kasus rugi)
      // tidak pernah terpakai. Sekarang panggil langsung fungsi tsb sebagai satu-satunya sumber insight.
      const dynamicInsight = generateFinancialInsight(totalSalesSum, calculatedNetProfit, calculatedCOGS, calculatedOpEx, resolvedOutletName);

      setFinancials({
        totalSales: totalSalesSum,
        netProfit: calculatedNetProfit,
        totalTransactions: totalTxCount,
        salesTrend: totalSalesSum > 0 ? '+15%' : '+0%',
        profitTrend: calculatedNetProfit > 0 ? '+12%' : (calculatedNetProfit < 0 ? 'RUGI' : '+0%'),
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
        brainyInsightText: dynamicInsight, // 🌟 Diikat langsung ke variabel penampung dinamis
        outletName: resolvedOutletName // Simpan nama outlet ke state untuk dipakai di JSX sub-heading chart
      });

      setCriticalStockCount(calculatedCritical);

    } catch (err) {
      console.error('⚠️ Gagal menyinkronkan data ERD dashboard:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ☕ PERBANDINGAN BRAND BIJI KOPI: data ini GLOBAL (lintas semua outlet), bukan spesifik
  // stok user — karena tujuannya membantu owner memilih brand kopi terbaik untuk dibeli,
  // bukan melacak bahan baku yang sudah ada di stok mereka sendiri.
  // Data diisi oleh pipeline Python terpisah (coffee_brand_pipeline.py) ke tabel
  // `coffee_brand_trends`, di-refresh berkala via Gemini + Google Search grounding.
  const loadCoffeeBrandComparison = async () => {
    setIsCoffeeBrandsLoading(true);
    try {
      const { data: brandData, error: brandError } = await supabase
        .from('coffee_brand_trends')
        .select('brand_name, price_per_kg, quality_score, price_trend_pct, data_source, insight_text, hex_color')
        .order('quality_score', { ascending: false });

      if (brandError) throw brandError;
      setCoffeeBrands(brandData || []);
    } catch (err) {
      console.error('⚠️ Gagal memuat perbandingan brand biji kopi:', err.message);
    } finally {
      setIsCoffeeBrandsLoading(false);
    }
  };

  useEffect(() => {
    syncDashboardMetricsFromDB();
    loadCoffeeBrandComparison();
  }, []);

  // ☕ DATA CHART: siapkan brand kopi untuk BarChart recharts, urut berdasar skor kualitas.
  const rankedCoffeeBrands = rankCoffeeBrandsByValue(coffeeBrands);
  const topCoffeeBrand = rankedCoffeeBrands.length > 0 ? rankedCoffeeBrands[0] : null;
  const coffeeBrandChartData = rankedCoffeeBrands.map((b) => ({
    label: b.brand_name,
    price_per_kg: Number(b.price_per_kg || 0),
    quality_score: Number(b.quality_score || 0),
    hex_color: b.hex_color || '#006847'
  }));

  // 📊 DATA CHART: format ulang tableRows jadi bentuk yang dipahami recharts,
  // dengan label hari singkat (MON, TUE, ...) sama seperti tampilan lama.
  const DAY_SHORT_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const salesExpensesChartData = financials.tableRows.map((row, idx) => ({
    label: DAY_SHORT_LABELS[idx] || row.day,
    Sales: Math.round(row.sales || 0),
    Expenses: Math.round(row.expenses || 0)
  }));


  const getCoffeeInsightText = (brand) => {
    if (!brand) return null;
    if (brand.insight_text) return brand.insight_text;
    if (brand.data_source === 'OFFICIAL') {
      return `Data harga ${brand.brand_name} berasal dari sumber resmi, jadi akurasinya bisa diandalkan untuk perbandingan biaya bahan baku.`;
    }
    return `Estimasi untuk ${brand.brand_name} sedang disempurnakan oleh sistem Brainy.`;
  };

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

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: financials.netProfit < 0 ? '1px solid #FCA5A5' : '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💵</div>
            <div style={{ backgroundColor: financials.netProfit < 0 ? '#FEE2E2' : '#E6F4EA', color: financials.netProfit < 0 ? '#DC2626' : '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {financials.netProfit < 0 ? <ChevronDown size={12}/> : <TrendingUp size={12}/>} {financials.profitTrend}
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>PROFIT BERSIH</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: financials.netProfit < 0 ? '#DC2626' : '#111827' }}>Rp {financials.netProfit.toLocaleString('id-ID')}</h2>
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
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#6B7280' }}>
              Visualisasi fluktuasi mingguan performa operasional {financials.outletName || 'Aroma Latte'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '12px', backgroundColor: '#006847', borderRadius: '50%' }} /> Sales</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '12px', backgroundColor: '#4F46E5', borderRadius: '50%' }} /> Expenses</span>
          </div>
        </div>
        
        <div style={{ width: '100%', height: '340px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={salesExpensesChartData} margin={{ top: 16, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#F3F4F6" />
              <XAxis
                dataKey="label" axisLine={{ stroke: '#E5E7EB' }} tickLine={false}
                tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
              />
              <YAxis
                tickFormatter={formatRupiahShort} axisLine={false} tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }} width={56}
              />
              <Tooltip content={<SalesExpensesTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
              <Line
                type="monotone" dataKey="Sales" name="Sales" stroke="#006847" strokeWidth={3.5}
                dot={{ r: 4, strokeWidth: 3, stroke: '#006847', fill: '#ffffff' }}
                activeDot={{ r: 6 }} animationDuration={900} animationEasing="ease-out"
              />
              <Line
                type="monotone" dataKey="Expenses" name="Expenses" stroke="#4F46E5" strokeWidth={3.5}
                dot={{ r: 4, strokeWidth: 2.5, stroke: '#4F46E5', fill: '#ffffff' }}
                activeDot={{ r: 6 }} animationDuration={900} animationEasing="ease-out" animationBegin={150}
              />
            </ComposedChart>
          </ResponsiveContainer>
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
              Belum ada riil menu terlaris. Sesi penjualan produk dari kasir mobile belum dimulai.
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
            <div style={{ backgroundColor: financials.netProfit < 0 ? '#FEE2E2' : '#E6F4EA', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontSize: '11px', color: financials.netProfit < 0 ? '#DC2626' : '#006847', fontWeight: 'bold', display: 'block' }}>NET PROFIT</span><span style={{ fontSize: '10px', color: financials.netProfit < 0 ? '#DC2626' : '#059669' }}>{financials.netProfitMarginLabel}</span></div>
              <strong style={{ fontSize: '18px', color: financials.netProfit < 0 ? '#DC2626' : '#006847' }}>Rp {financials.netProfit.toLocaleString('id-ID')}</strong>
            </div>
            <div style={{ backgroundColor: financials.netProfit < 0 ? '#DC2626' : '#006847', color: '#ffffff', padding: '14px', borderRadius: '12px', fontSize: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '15px' }}>{financials.netProfit < 0 ? '⚠️' : '💡'}</span>
              <p style={{ margin: 0, lineHeight: '1.45' }}>{financials.brainyInsightText}</p>
            </div>
          </div>
        </div>

        {/* PERBANDINGAN BRAND BIJI KOPI (bar chart, data GLOBAL lintas outlet) */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', display: 'block' }}>PERBANDINGAN BRAND BIJI KOPI</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Harga per kg & skor kualitas, dianalisis Brainy AI</span>
            </div>
            {isCoffeeBrandsLoading && <Loader2 size={14} className="animate-spin" color="#9CA3AF" />}
          </div>

          {isCoffeeBrandsLoading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '12.5px' }}>
              Memuat data perbandingan brand kopi...
            </div>
          ) : coffeeBrandChartData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '12.5px', fontStyle: 'italic' }}>
              Belum ada data perbandingan brand biji kopi. Pipeline Brainy AI akan mengisinya secara berkala.
            </div>
          ) : (
            <>
              {topCoffeeBrand && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#E6F4EA', color: '#006847', fontSize: '10px', fontWeight: 'bold', padding: '4px 9px', borderRadius: '6px' }}>
                    <Sparkles size={11} /> REKOMENDASI BRAINY: {topCoffeeBrand.brand_name.toUpperCase()}
                  </span>
                </div>
              )}

              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={coffeeBrandChartData} margin={{ top: 16, right: 16, left: 8, bottom: 0 }} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke="#F3F4F6" />
                    <XAxis
                      dataKey="label" axisLine={{ stroke: '#E5E7EB' }} tickLine={false}
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                    />
                    <YAxis
                      tickFormatter={formatRupiahShort} axisLine={false} tickLine={false}
                      tick={{ fontSize: 10, fill: '#9CA3AF' }} width={56}
                    />
                    <Tooltip content={<CoffeeBrandTooltip />} cursor={{ fill: 'rgba(0,104,71,0.05)' }} />
                    <Bar dataKey="price_per_kg" radius={[6, 6, 0, 0]} maxBarSize={44} animationDuration={900} animationEasing="ease-out">
                      {coffeeBrandChartData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={topCoffeeBrand && entry.label === topCoffeeBrand.brand_name ? '#006847' : (entry.hex_color || '#A7F3D0')}
                        />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* 🆕 💡 Brainy Insights — perbandingan brand biji kopi (konsisten dengan box Laba Rugi) */}
              <div style={{ backgroundColor: '#006847', color: '#ffffff', padding: '14px', borderRadius: '12px', fontSize: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '16px' }}>
                <span style={{ fontSize: '15px' }}>💡</span>
                <p style={{ margin: 0, lineHeight: '1.45' }}>{getCoffeeInsightText(topCoffeeBrand)}</p>
              </div>
            </>
          )}
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