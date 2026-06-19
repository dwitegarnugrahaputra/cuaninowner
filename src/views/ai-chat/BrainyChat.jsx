import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../config/supabaseClient';
import { 
  Send, Bot, ArrowLeft, MessageSquare, Sparkles, Loader2,
  LayoutDashboard, ShoppingBag, Archive, Menu as MenuIcon, Users, Settings, LogOut, ChevronDown, Plus,
  Bell, HelpCircle, Search, TrendingUp, BarChart3, LineChart, AlertTriangle, ArrowRight, Truck, Percent, Calendar, Clock
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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

// 📊 HELPER: Susun rangkaian chart (aktual + proyeksi) untuk mode 7 hari (harian) atau 30 hari (per-minggu)
function buildForecastSeries({ sortedDateKeys, dailyTotals, dailyAvg, growthRatePerDay, range }) {
  const ID_DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  if (range === 7) {
    // Mode harian: 3 hari aktual terakhir (kalau ada) + 4 hari proyeksi ke depan
    const actualDaysToShow = 3;
    const projectedDaysToShow = 4;
    const series = [];

    const recentKeys = sortedDateKeys.slice(-actualDaysToShow);
    recentKeys.forEach(key => {
      const d = new Date(key);
      series.push({
        label: ID_DAY_SHORT[d.getDay()],
        value: Math.round(dailyTotals[key]),
        isProjected: false
      });
    });

    // Titik basis untuk proyeksi: pakai rata-rata harian historis (dailyAvg), bukan hari terakhir saja,
    // supaya tidak terlalu sensitif terhadap 1 hari yang kebetulan sepi/ramai.
    let projectionBase = dailyAvg;
    const lastActualDate = sortedDateKeys.length > 0 ? new Date(sortedDateKeys[sortedDateKeys.length - 1]) : new Date();

    for (let i = 1; i <= projectedDaysToShow; i++) {
      projectionBase = projectionBase * (1 + growthRatePerDay);
      const futureDate = new Date(lastActualDate);
      futureDate.setDate(futureDate.getDate() + i);
      series.push({
        label: ID_DAY_SHORT[futureDate.getDay()],
        value: Math.round(Math.max(0, projectionBase)),
        isProjected: true
      });
    }
    return series;
  }

  // Mode 30 hari: dikelompokkan per-minggu (1 bar aktual minggu terakhir + 3 bar proyeksi minggu ke depan)
  const series = [];

  // Minggu aktual terakhir: ambil 7 hari terakhir data riil (kalau ada), dirata-ratakan jadi total mingguan
  const last7Keys = sortedDateKeys.slice(-7);
  const actualWeekTotal = last7Keys.reduce((sum, k) => sum + dailyTotals[k], 0);
  series.push({
    label: 'Minggu Ini',
    value: Math.round(actualWeekTotal > 0 ? actualWeekTotal : dailyAvg * 7),
    isProjected: false
  });

  // 3 minggu proyeksi ke depan, dihitung dari rata-rata harian yang tumbuh sesuai growthRatePerDay (compounding per hari)
  let runningDailyAvg = dailyAvg;
  for (let week = 1; week <= 3; week++) {
    let weekTotal = 0;
    for (let day = 1; day <= 7; day++) {
      runningDailyAvg = runningDailyAvg * (1 + growthRatePerDay);
      weekTotal += Math.max(0, runningDailyAvg);
    }
    series.push({
      label: `Minggu ${week + 1}`,
      value: Math.round(weekTotal),
      isProjected: true
    });
  }

  return series;
}

// 📊 HELPER: Fallback chart kosong saat belum ada data transaksi sukses sama sekali
function buildEmptyFallbackChart(range) {
  if (range === 7) {
    const ID_DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return { label: ID_DAY_SHORT[d.getDay()], value: 0, isProjected: i > 2 };
    });
  }
  return [
    { label: 'Minggu Ini', value: 0, isProjected: false },
    { label: 'Minggu 2', value: 0, isProjected: true },
    { label: 'Minggu 3', value: 0, isProjected: true },
    { label: 'Minggu 4', value: 0, isProjected: true }
  ];
}

export default function BrainyChat({ onNavigateView }) {
  const { logout } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('ask-brainy');

  // State Manajemen Chat & Integritas AI
  const [messages, setMessages] = useState([
    { role: 'brainy', text: 'Halo Gar! Gua Brainy, asisten finansial AI internal cuanin.id. Ada yang bisa gua bantu pantau dari performa bisnis Warung Kopi Jaya hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dbSnapshot, setDbSnapshot] = useState('');
  const messagesEndRef = useRef(null);

  // ⚡ DYNAMIC MENU ARRAYS & DROPDOWN SELECTION STATE
  const [menuList, setMenuList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('Caffe Latte');

  // State Otomatisasi Generator Tab Insights & Forecast Berbasis Live AI
  const [aiInsightText, setAiInsightsText] = useState('Sedang menganalisis struktur pengadaan bahan baku...');
  const [aiForecastText, setAiForecastText] = useState('Sedang memproyeksikan tren permintaan pasar...');
  const [isTabAnalyzing, setIsTabAnalyzing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 📊 STATE CHART FORECAST OMSET (terhubung Supabase: sales_transactions)
  const [forecastRange, setForecastRange] = useState(7); // toggle: 7 hari atau 30 hari
  const [forecastChartData, setForecastChartData] = useState([]); // [{ label, value, isProjected }]
  const [isForecastChartLoading, setIsForecastChartLoading] = useState(true);
  const [forecastGrowthRate, setForecastGrowthRate] = useState(0); // growth harian (desimal, misal 0.05 = 5%/hari)
  const [forecastDailyAvg, setForecastDailyAvg] = useState(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // 📥 AUTOMATIC CONTEXT INJECTION PIPELINE (Ambil katalog menu asli & transaksi)
  useEffect(() => {
    async function compileBusinessContext() {
      try {
        const { data: menus } = await supabase.from('menus').select('menu_name, price, is_available');
        const { data: staff } = await supabase.from('staff').select('name, role, status');
        const { data: sales } = await supabase.from('sales_transactions').select('total_amount, status, payment_method').limit(15);

        // Jika ada data menu asli, masukkan ke list dropdown
        if (menus && menus.length > 0) {
          setMenuList(menus);
          setSelectedMenu(menus[0].menu_name); // Set default pilihan ke item pertama database
        } else {
          setMenuList([]); // Kosong
        }

        const menuStr = menus && menus.length > 0 ? menus.map(m => `- ${m.menu_name}: Rp ${m.price} (${m.is_available ? 'Tersedia' : 'Habis'})`).join('\n') : 'KOSONG / BELUM ADA DATA MENU DI MENU MANAGEMENT';
        const staffStr = staff && staff.length > 0 ? staff.map(s => `- ${s.name}: Role ${s.role} (${s.status})`).join('\n') : 'KOSONG / BELUM ADA DATA STAFF';
        
        let totalRevenue = 0;
        if (sales && sales.length > 0) {
          totalRevenue = sales.filter(tx => tx.status === 'Completed' || tx.status === 'SUCCESS').reduce((sum, tx) => sum + Number(tx.total_amount || 0), 0);
        }

        const snapshot = `
CONTEXT DATA REAL-TIME WARUNG KOPI JAYA:
--- KATALOG MENU PRODUK ---
${menuStr}

--- PILAR TIM KARYAWAN ---
${staffStr}

--- RINGKASAN FINANSIAL TERKINI ---
- Total Omset penjualan terlacak: Rp ${totalRevenue.toLocaleString('id-ID')}
- Total baris transaksi feed terbaru: ${sales ? sales.length : 0} item.
        `;
        setDbSnapshot(snapshot);
      } catch (err) {
        console.error('⚠️ Gagal menyuntikkan konteks database ke AI:', err.message);
      }
    }
    compileBusinessContext();
  }, []);

  // 📊 PIPELINE FORECAST CHART: Hitung proyeksi omset harian dari histori sales_transactions asli
  useEffect(() => {
    if (activeSubTab !== 'forecast') return;

    async function buildForecastChart() {
      setIsForecastChartLoading(true);
      try {
        const { data: sales, error } = await supabase
          .from('sales_transactions')
          .select('total_amount, status, created_at')
          .order('created_at', { ascending: true });

        if (error) throw error;

        const completedSales = (sales || []).filter(
          tx => tx.status === 'Completed' || tx.status === 'SUCCESS'
        );

        if (completedSales.length === 0) {
          // Belum ada transaksi sukses sama sekali -> tidak ada basis historis untuk dihitung
          setForecastDailyAvg(0);
          setForecastGrowthRate(0);
          setForecastChartData(buildEmptyFallbackChart(forecastRange));
          setIsForecastChartLoading(false);
          return;
        }

        // 1. Kelompokkan total omset per HARI kalender (YYYY-MM-DD) dari created_at
        const dailyTotals = {}; // { 'YYYY-MM-DD': totalOmsetHariItu }
        completedSales.forEach(tx => {
          const dateKey = new Date(tx.created_at).toISOString().slice(0, 10);
          dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + Number(tx.total_amount || 0);
        });

        const sortedDateKeys = Object.keys(dailyTotals).sort();
        const firstDate = new Date(sortedDateKeys[0]);
        const lastDate = new Date(sortedDateKeys[sortedDateKeys.length - 1]);
        const totalSpanDays = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1);

        const totalRevenueAllTime = Object.values(dailyTotals).reduce((sum, v) => sum + v, 0);
        const dailyAvg = totalRevenueAllTime / totalSpanDays;

        // 2. Hitung growth rate: bandingkan rata-rata harian separuh AWAL vs separuh AKHIR periode histori
        let growthRatePerDay = 0;
        if (sortedDateKeys.length >= 2) {
          const midIndex = Math.floor(sortedDateKeys.length / 2);
          const firstHalfKeys = sortedDateKeys.slice(0, Math.max(1, midIndex));
          const secondHalfKeys = sortedDateKeys.slice(midIndex);

          const firstHalfAvg = firstHalfKeys.reduce((sum, k) => sum + dailyTotals[k], 0) / firstHalfKeys.length;
          const secondHalfAvg = secondHalfKeys.reduce((sum, k) => sum + dailyTotals[k], 0) / secondHalfKeys.length;

          if (firstHalfAvg > 0) {
            // Growth total antar 2 periode, lalu dirubah jadi rate HARIAN (dibagi rentang hari antar titik tengah kedua periode)
            const totalGrowth = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
            const daysBetweenHalves = Math.max(1, Math.round(sortedDateKeys.length / 2));
            growthRatePerDay = totalGrowth / daysBetweenHalves;
          }
        }

        // Pengaman: clamp growth rate harian agar tidak ekstrem akibat data historis yang sangat sedikit/fluktuatif
        growthRatePerDay = Math.max(-0.15, Math.min(0.15, growthRatePerDay));

        setForecastDailyAvg(dailyAvg);
        setForecastGrowthRate(growthRatePerDay);

        // 3. Susun data chart: gabungan beberapa hari AKTUAL terakhir (solid) + proyeksi ke depan (putus-putus)
        const chartData = buildForecastSeries({
          sortedDateKeys,
          dailyTotals,
          dailyAvg,
          growthRatePerDay,
          range: forecastRange
        });

        setForecastChartData(chartData);
      } catch (err) {
        console.error('⚠️ Gagal membangun grafik forecast omset:', err.message);
        setForecastChartData(buildEmptyFallbackChart(forecastRange));
      } finally {
        setIsForecastChartLoading(false);
      }
    }

    buildForecastChart();
  }, [activeSubTab, forecastRange]);

  // 🚀 INTERCEPTOR TRIGGER: Otomatis nembak AI pas sub-tab insights / forecast dibuka atau menu dropdown diubah
  useEffect(() => {
    if (activeSubTab === 'ask-brainy' || !dbSnapshot) return;

    async function generateTabAnalytics() {
      setIsTabAnalyzing(true);
      try {
        let customPrompt = '';
        if (activeSubTab === 'insights') {
          customPrompt = `
            Berdasarkan Snapshot data cafe saat ini:
            ${dbSnapshot}

            Gua saat ini sedang memilih menu "${selectedMenu}" pada opsi dropdown BI analitik gua.
            Tolong buatkan analisis pengadaan bahan baku sepanjang 2 paragraf menggunakan panggilan 'lu' 'gua' santai layaknya anak Jakarta/Surabaya yang kritis.
            
            Kondisi Aturan:
            1. Jika katalog menu produk tertulis 'KOSONG / BELUM ADA DATA MENU...', tegur gua (Tegar) secara santai di paragraf pertama kalau database menu managemen gua masih kosong melompong sehingga lu terpaksa ngerender simulasi data "Caffe Latte" sebagai blueprint pengujian presentasi.
            2. Di paragraf kedua, berikan simulasi analisis HPP cerdas: Katakan jika menu "${selectedMenu}" ini dibuat, komponen utamanya (seperti Susu atau sediaan pelengkap) rentan terkena lonjakan inflasi 15.5% dari vendor utama, sehingga berisiko menekan target margin keuntungan bersih hingga ke angka 20%. Berikan rekomendasi bagaimana gua harus bersiap mengantisipasinya.
          `;
        } else if (activeSubTab === 'forecast') {
          const growthPercentText = (forecastGrowthRate * 100).toFixed(2);
          customPrompt = `
            Berdasarkan Snapshot data cafe berikut ini:
            ${dbSnapshot}

            Data tambahan hasil kalkulasi grafik forecast omset (dihitung dari histori asli sales_transactions):
            - Rata-rata omset harian historis: Rp ${Math.round(forecastDailyAvg).toLocaleString('id-ID')}
            - Growth rate harian terhitung: ${growthPercentText}% per hari

            Tolong buatkan analisis singkat sepanjang 2 paragraf mengenai "Proyeksi Finansial & Inventory Masa Depan", dengan mengacu pada angka rata-rata omset harian dan growth rate di atas sebagai dasar argumen lu (sebut angkanya secara natural, jangan kaku).
            Catatan Penting: Jika data transaksi dan finansial jualan gua masih kosong (Rp 0), ulas secara santai dan kritis bahwa karena data transaksi jualan lu masih kosong melompong di database Supabase, grafik di bawah ini merupakan estimasi awal (initial model prediction). Berikan rekomendasi taktis bahwa kedepannya Warung Kopi Jaya harus bersiap menghadapi lonjakan +20% konsumsi bahan baku saat musim liburan, dan ingatkan gua untuk mulai mengisi shift staff kasir weekend jam 09:30 AM karena itu titik peak hour paling rawan penumpukan struk.
          `;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: customPrompt }] }]
        });

        if (activeSubTab === 'insights') {
          setAiInsightsText(response.text || 'Gagal memuat analisis insight.');
        } else {
          setAiForecastText(response.text || 'Gagal memuat analisis forecast.');
        }
      } catch (err) {
        console.error('⚠️ Gagal memproses analitik sub-tab AI:', err);
      } finally {
        setIsTabAnalyzing(false);
      }
    }

    generateTabAnalytics();
  }, [activeSubTab, dbSnapshot, selectedMenu, forecastDailyAvg, forecastGrowthRate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsGenerating(true);

    try {
      const systemInstruction = `
        Lu adalah "Brainy", asisten bisnis, CFO virtual, dan analis kecerdasan buatan (AI) handal yang terintegrasi di dalam sistem POS cuanin.id. 
        Tugas utama lu adalah membantu owner cafe (bernama Tegar) menganalisis performa cafe-nya yang bernama "Warung Kopi Jaya".
        Gunakan gaya bahasa yang santai, humanis, akrab seperti memakai panggilan 'lu' dan 'gua', layaknya gaya bicara anak tongkrongan Jakarta/Surabaya, tapi isi analisis lu harus tetap kritis, tajam, logis, dan berbasis data. Jangan kaku!

        Berikut adalah data kondisi live database cafe saat ini yang wajib lu jadikan acuan mutlak untuk menjawab pertanyaan user jika relevan:
        ${dbSnapshot}

        Aturan: Jika ditanya rumus matematika atau kalkulasi keuangan, jawab dengan menggunakan bullet points bold agar mudah dibaca. Jika ditanya hal di luar bisnis atau cafe, ingatkan user secara santai untuk fokus ngomongin cuan cafe aja.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + `\n\nPertanyaan User: ${userMessage}` }] }
        ]
      });

      const aiText = response.text || 'Waduh Gar, otak gua lagi nge-blank bentar. Coba ulangi pertanyaannya, deh.';
      setMessages(prev => [...prev, { role: 'brainy', text: aiText }]);
    } catch (err) {
      console.error('Gemini API Error:', err);
      setMessages(prev => [...prev, { role: 'brainy', text: 'Eror koneksi API Gemini, Gar! Pastikan kuota API Key lu aman atau coba refresh halaman.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      { role: 'brainy', text: 'Sesi chat di-reset! Yuk Gar, mari kita ulas dari nol lagi perihal strategi cuan Warung Kopi Jaya.' }
    ]);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* ================= SIDEBAR KIRI UTAMA ================= */}
      <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px', marginBottom: '32px' }}>
          <CuaninLogoMini />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
            <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px' }}>
          <div onClick={() => onNavigateView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', color: '#93C5FD' }}><LayoutDashboard size={18} /> <span style={{ fontSize: '14px' }}>Dashboard</span></div>
          <div onClick={() => onNavigateView('sales')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', color: '#93C5FD' }}><ShoppingBag size={18} /> <span style={{ fontSize: '14px' }}>Sales</span></div>
          <div onClick={() => onNavigateView('stock')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', color: '#93C5FD' }}><Archive size={18} /> <span style={{ fontSize: '14px' }}>Stock</span></div>
          <div onClick={() => onNavigateView('menu')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', color: '#93C5FD' }}><MenuIcon size={18} /> <span style={{ fontSize: '14px' }}>Menu Management</span></div>
          <div onClick={() => onNavigateView('staff')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', color: '#93C5FD' }}><Users size={18} /> <span style={{ fontSize: '14px' }}>Staff Management</span></div>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div onClick={() => setIsSettingsOpen(!isSettingsOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={18} /> <span style={{ fontSize: '14px' }}>Settings</span></div>
            <ChevronDown size={14} />
          </div>
          <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#FFCACA', borderRadius: '10px', cursor: 'pointer' }}><LogOut size={18} /> <span style={{ fontSize: '14px' }}>Logout</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#111827', borderRadius: '12px', marginTop: '4px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1E3A8A', fontSize: '12px' }}>WJ</div>
            <div style={{ flex: 1, textAlign: 'left' }}><p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p><span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>PREMIUM PLAN</span></div>
          </div>
        </div>
      </div>

      {/* ================= RECENT CHATS SUB-SIDEBAR ================= */}
      <div style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0 }}>
        <button onClick={handleNewConversation} style={{ width: '100%', padding: '12px', backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}>
          <Plus size={16} /> New Conversation
        </button>
        
        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>RECENT CHATS</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '12px', backgroundColor: '#E6F4EA', border: '1px solid #10B981', borderRadius: '10px', cursor: 'pointer' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#006847', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14}/> Analisis Profit Oct</p>
            <span style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', display: 'block' }}>2 hours ago</span>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'transparent', borderRadius: '10px', cursor: 'pointer' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14}/> Efektivitas Promo Beli 2 Gratis 1</p>
            <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>Yesterday</span>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'transparent', borderRadius: '10px', cursor: 'pointer' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14}/> Prediksi Stok Susu</p>
            <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>Oct 24, 2023</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN WORKSPACE KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
        
        {/* TOP BAR LAYOUT */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between', flexShrink: 0 }}>
          
          {/* SUB-TABS NAVIGATION */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '100%' }}>
            {['ask-brainy', 'insights', 'forecast'].map((tab) => {
              const isActive = activeSubTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  style={{
                    height: '100%',
                    padding: '0 4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #10B981' : '3px solid transparent',
                    color: isActive ? '#10B981' : '#4B5563',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  {tab === 'ask-brainy' ? 'Ask Brainy' : tab}
                </button>
              );
            })}
          </div>

          {/* UTILITIES & PROFILE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '300px' }}>
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
              <input type="text" placeholder="Cari data atau tanya AI..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
            </div>
            <Bell size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            <HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>Alex Graham</p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>Administrator</span>
              </div>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* SUB-VIEW AREA CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#FAFAFA' }}>
          
          {/* VIEW A: CHAT CORE TAB */}
          {activeSubTab === 'ask-brainy' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {messages.length === 1 && (
                  <div style={{ textAlign: 'center', margin: '40px auto', maxWidth: '420px' }}>
                    <div style={{ width: '56px', height: '56px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}><Bot size={28}/></div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>How can Brainy help you today?</h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6B7280', lineHeight: '1.4' }}>Ask me about your sales performance, staff shifts roster, or menu optimization insights.</p>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isBrainy = msg.role === 'brainy';
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: isBrainy ? 'flex-start' : 'flex-end', gap: '14px', maxWidth: '75%', alignSelf: isBrainy ? 'flex-start' : 'flex-end' }}>
                      {isBrainy && <div style={{ width: '32px', height: '32px', backgroundColor: '#006847', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bot size={16}/></div>}
                      <div style={{ backgroundColor: isBrainy ? '#ffffff' : '#006847', color: isBrainy ? '#111827' : '#ffffff', padding: '14px 18px', borderRadius: isBrainy ? '4px 16px 16px 16px' : '16px 16px 4px 16px', border: isBrainy ? '1px solid #E5E7EB' : 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {isGenerating && (
                  <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', alignItems: 'center', color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#E5E7EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={16} className="animate-spin" /></div>
                    <span>Brainy sedang merangkum log keuangan Warung Kopi Jaya...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT CONTAINER */}
              <div style={{ padding: '24px 40px', backgroundColor: '#ffffff', borderTop: '1px solid #E5E7EB' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', position: 'relative', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    disabled={isGenerating}
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Tanya sesuatu ke Brainy..." 
                    style={{ flex: 1, padding: '14px 60px 14px 20px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none', backgroundColor: isGenerating ? '#F9FAFB' : '#ffffff' }} 
                  />
                  <button type="submit" disabled={isGenerating || !input.trim()} style={{ position: 'absolute', right: '12px', width: '38px', height: '38px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ⚡ VIEW B: INSIGHTS DASHBOARD DINAMIS */}
          {activeSubTab === 'insights' && (
            <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', height: '100%' }}>
              
              {/* Header section dengan Dropdown Dinamis Terkoneksi Supabase */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Business Intelligence Insights</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time analysis and strategic recommendations for your business.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  
                  {/* ⚡ DROPDOWN SELECTION HUB */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', padding: '4px 12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Pilih Menu:</span>
                    <select 
                      value={selectedMenu}
                      onChange={(e) => setSelectedMenu(e.target.value)}
                      style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: 'bold', color: '#006847', backgroundColor: 'transparent', cursor: 'pointer', padding: '6px' }}
                    >
                      {menuList.length > 0 ? (
                        menuList.map((m, idx) => (
                          <option key={idx} value={m.menu_name}>{m.menu_name}</option>
                        ))
                      ) : (
                        <option value="Caffe Latte">Caffe Latte (Simulasi - Data Kosong)</option>
                      )}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', color: '#4B5563', fontWeight: 'bold' }}>
                    <Calendar size={14}/> <span>Oct 1 - Oct 30, 2023</span>
                  </div>
                  <button style={{ padding: '10px 18px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Export Report</button>
                </div>
              </div>

              {/* Graphic Chart Box */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Ingredient Cost Distribution ({selectedMenu})</h3>
                <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px', display: 'block' }}>Comparing ingredient procurement costs against category profitability</span>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '80px', marginTop: '32px', padding: '0 40px' }}>
                  <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'conic-gradient(#006847 0% 35%, #0284c7 35% 60%, #34d399 60% 80%, #a7f3d0 80% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '130px', height: '130px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>Total Cost</span>
                      <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>100%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    {[
                      { label: 'Bahan Utama / Susu', percent: '35.0%', desc: 'Rp 21,350/Unit', color: '#006847' },
                      { label: 'Bahan Baku Kopi', percent: '25.0%', desc: 'Premium Blend', color: '#0284c7' },
                      { label: 'Packaging / Cups', percent: '20.0%', desc: 'Cups, Sugar, Sleeve', color: '#34d399' },
                      { label: 'Target Margin Bersih', percent: '20.0%', desc: 'Calculated Net Profit', color: '#a7f3d0' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ width: '14px', height: '14px', backgroundColor: item.color, borderRadius: '4px', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{item.label} <span style={{ color: '#6B7280', marginLeft: '6px', fontWeight: '500' }}>{item.percent}</span></p>
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({item.desc})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brainy's Analysis Connected to Live Gemini */}
              <div style={{ backgroundColor: '#E6F4EA', borderRadius: '16px', border: '1px solid #10B981', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                  {isTabAnalyzing ? <Loader2 size={22} className="animate-spin"/> : <Bot size={22}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#006847', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Brainy's Analysis {isTabAnalyzing && <span style={{ fontSize: '11px', color: '#059669', fontStyle: 'italic', fontWeight: 'normal' }}>(Brainy lagi menghitung database...)</span>}
                  </h4>
                  <div style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#065f46', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {aiInsightText}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '16px' }}>
                {[
                  { icon: <Truck size={18} color="#006847"/>, title: 'Review Vendor Prices', desc: 'Compare current material costs with alternative local suppliers in the Tegal area.', action: 'View Alternatives' },
                  { icon: <Percent size={18} color="#006847"/>, title: 'Adjust Menu Pricing', desc: `Recommended: Review pricing strategy for ${selectedMenu} to secure a stable 12% profit cushion.`, action: 'Update Pricing' },
                  { icon: <BarChart3 size={18} color="#006847"/>, title: 'Cost Breakdown', desc: `Deep dive into the per-ingredient cost analysis for all items inside this category.`, action: 'View Details' }
                ].map((card, idx) => (
                  <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{card.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', lineHeight: '1.5', flex: 1 }}>{card.desc}</p>
                    <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#006847', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                      {card.action} <ArrowRight size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ⚡ VIEW C: FORECAST PREDICTIVE DASHBOARD LENGKAP */}
          {activeSubTab === 'forecast' && (
            <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', height: '100%' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Future Forecast</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>AI-powered revenue projections and strategic growth insights for your business.</p>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Revenue Forecast</h4>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      {forecastRange === 7
                        ? 'Proyeksi omset harian untuk minggu ini berdasarkan data transaksi asli'
                        : 'Proyeksi omset mingguan untuk 30 hari ke depan berdasarkan data transaksi asli'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: '#4B5563' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#006847', borderRadius: '50%' }}/> Current Trend</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', border: '2px dashed #10B981', borderRadius: '50%' }}/> Projected Growth</div>
                    <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                      <button
                        onClick={() => setForecastRange(7)}
                        style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: forecastRange === 7 ? '#006847' : 'transparent', color: forecastRange === 7 ? '#ffffff' : '#4B5563', transition: 'all 0.15s' }}
                      >
                        7 Hari
                      </button>
                      <button
                        onClick={() => setForecastRange(30)}
                        style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: forecastRange === 30 ? '#006847' : 'transparent', color: forecastRange === 30 ? '#ffffff' : '#4B5563', transition: 'all 0.15s' }}
                      >
                        30 Hari
                      </button>
                    </div>
                  </div>
                </div>

                {isForecastChartLoading ? (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" /> Menghitung proyeksi dari data transaksi...
                  </div>
                ) : (
                  (() => {
                    const maxValue = Math.max(1, ...forecastChartData.map(d => d.value));
                    const maxBarHeightPx = 130;

                    return (
                      <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 24px 20px 24px', position: 'relative', marginTop: '10px' }}>
                        {forecastChartData.map((point, idx) => {
                          const barHeightPx = Math.max(6, Math.round((point.value / maxValue) * maxBarHeightPx));
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
                              <span style={{ fontSize: '10px', color: point.isProjected ? '#059669' : '#374151', fontWeight: 'bold' }}>
                                {point.value >= 1000000
                                  ? `Rp ${(point.value / 1000000).toFixed(1)}jt`
                                  : `Rp ${(point.value / 1000).toFixed(0)}rb`}
                              </span>
                              <div style={{
                                width: '32px',
                                height: `${barHeightPx}px`,
                                backgroundColor: point.isProjected ? '#34D399' : '#006847',
                                borderRadius: '6px 6px 0 0',
                                border: point.isProjected ? '2px dashed #10B981' : 'none',
                                boxSizing: 'border-box'
                              }} />
                              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: point.isProjected ? 'normal' : '600' }}>{point.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>

              <div style={{ backgroundColor: '#EFF6FF', borderRadius: '16px', border: '1px solid #3B82F6', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#1E3A8A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                  {isTabAnalyzing ? <Loader2 size={22} className="animate-spin"/> : <Sparkles size={22}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1E3A8A' }}>AI Predictive Forecast Log</h4>
                  <div style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#1E40AF', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {aiForecastText}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1E3A8A' }}><Archive size={16}/> <span>Inventory Demand Forecast</span></div>
                    <span style={{ backgroundColor: '#E1F5FE', color: '#0284c7', fontSize: '9px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' }}>HIGH ACCURACY</span>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.4' }}>Coffee bean consumption is expected to spike during the holiday season.</p>
                    <h3 style={{ margin: '12px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#006847' }}>+20% <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal' }}>Stock increase recommended</span></h3>
                  </div>
                  <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#006847', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Adjust Purchase Order →</button>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1E3A8A' }}><Clock size={16}/> <span>Peak Hour Prediction</span></div>
                    <span style={{ backgroundColor: '#EEEFEE', color: '#4B5563', fontSize: '9px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px' }}>NEXT WEEKEND</span>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', lineHeight: '1.4' }}>Significant traffic increase predicted for Saturday morning brunch.</p>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '4px' }}>
                      <div><span style={{ fontSize: '10px', color: '#9CA3AF', display: 'block' }}>START TIME</span><span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1E3A8A' }}>09:30 AM</span></div>
                      <div><span style={{ fontSize: '10px', color: '#9CA3AF', display: 'block' }}>INTENSITY</span><span style={{ fontSize: '15px', fontWeight: 'bold', color: '#DC2626' }}>Very High</span></div>
                    </div>
                  </div>
                  <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#006847', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Optimize Staff Guide →</button>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>Strategic Opportunities</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { title: 'Launch a seasonal promotion', subtitle: 'Predicted 15% revenue lift by bundling winter specials.', type: 'execute', label: 'Execute' },
                    { title: 'Negotiate bulk discount for milk supplier', subtitle: 'Your current volume qualifies for a 5% tier reduction.', type: 'review', label: 'Review Contract' },
                    { title: 'Reduce evening operating hours', subtitle: 'Low traffic between 9PM-10PM results in net loss for utilities.', type: 'adjust', label: 'Adjust Hours' }
                  ].map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', border: '1px solid #F3F4F6', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{row.title}</p>
                        <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', display: 'block' }}>{row.subtitle}</span>
                      </div>
                      <button style={{ 
                        padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: row.type === 'execute' ? 'none' : '1px solid #D1D5DB',
                        backgroundColor: row.type === 'execute' ? '#006847' : '#ffffff', color: row.type === 'execute' ? '#ffffff' : '#374151'
                      }}>{row.label}</button>
                    </div>
                  ))}
                </div>
                <button style={{ display: 'block', margin: '16px auto 0 auto', background: 'none', border: 'none', color: '#6B7280', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>View all 12 opportunities</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}