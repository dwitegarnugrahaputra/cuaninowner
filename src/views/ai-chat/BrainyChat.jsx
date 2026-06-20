import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../config/supabaseClient';
import { 
  Send, Bot, MessageSquare, Sparkles, Loader2, Plus, 
  BarChart3, Truck, Percent, Calendar, Archive, Clock, ArrowRight
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 📊 HELPER: Susun rangkaian chart (aktual + proyeksi) untuk mode 7 hari (harian) atau 30 hari (per-minggu)
function buildForecastSeries({ sortedDateKeys, dailyTotals, dailyAvg, growthRatePerDay, range }) {
  const ID_DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  if (range === 7) {
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

  const series = [];
  const last7Keys = sortedDateKeys.slice(-7);
  const actualWeekTotal = last7Keys.reduce((sum, k) => sum + dailyTotals[k], 0);
  series.push({
    label: 'Minggu Ini',
    value: Math.round(actualWeekTotal > 0 ? actualWeekTotal : dailyAvg * 7),
    isProjected: false
  });

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

export default function BrainyChat() {
  const [activeSubTab, setActiveSubTab] = useState('ask-brainy');

  // 👤 State Nama Pengguna Dinamis
  const [userName, setUserName] = useState('Bapak/Ibu Owner');

  // State Manajemen Chat & Integritas AI
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dbSnapshot, setDbSnapshot] = useState('');
  const messagesEndRef = useRef(null);

  // ⚡ Dropdown Selection State
  const [menuList, setMenuList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('Caffe Latte');

  // State Otomatisasi Generator Tab Insights & Forecast Berbasis Live AI
  const [aiInsightText, setAiInsightsText] = useState('Sedang menganalisis struktur pengadaan bahan baku...');
  const [aiForecastText, setAiForecastText] = useState('Sedang memproyeksikan tren permintaan pasar...');
  const [isTabAnalyzing, setIsTabAnalyzing] = useState(false);

  // 📊 State Chart Forecast Omset
  const [forecastRange, setForecastRange] = useState(7); 
  const [forecastChartData, setForecastChartData] = useState([]); 
  const [isForecastChartLoading, setIsForecastChartLoading] = useState(true);
  const [forecastGrowthRate, setForecastGrowthRate] = useState(0); 
  const [forecastDailyAvg, setForecastDailyAvg] = useState(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // 📥 AUTOMATIC PROFILE & CONTEXT INJECTION PIPELINE
  useEffect(() => {
    async function compileBusinessContext() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentOwnerName = 'Bapak/Ibu Owner';
        if (session && session.user) {
          currentOwnerName = session.user.user_metadata?.full_name || session.user.email.split('@')[0].toUpperCase();
          setUserName(currentOwnerName);
        }

        setMessages([
          { role: 'brainy', text: `Selamat datang, Bapak/Ibu ${currentOwnerName}. Saya adalah Brainy, asisten finansial virtual internal Anda di cuanin.id. Apakah ada indikator performa operasional Warung Kopi Jaya yang ingin Anda evaluasi hari ini?` }
        ]);

        const { data: menus } = await supabase.from('menus').select('menu_name, price, is_available');
        const { data: staff } = await supabase.from('staff').select('name, role, status');
        const { data: sales } = await supabase.from('sales_transactions').select('total_amount, status, payment_method').limit(15);

        if (menus && menus.length > 0) {
          setMenuList(menus);
          setSelectedMenu(menus[0].menu_name); 
        } else {
          setMenuList([]); 
        }

        const menuStr = menus && menus.length > 0 ? menus.map(m => `- ${m.menu_name}: Rp ${m.price} (${m.is_available ? 'Tersedia' : 'Habis'})`).join('\n') : 'BELUM ADA REKAMAN DATA PRODUK PADA SISTEM.';
        const staffStr = staff && staff.length > 0 ? staff.map(s => `- ${s.name}: Peran ${s.role} (${s.status})`).join('\n') : 'BELUM ADA REKAMAN DATA SUMBER DAYA MANUSIA.';
        
        let totalRevenue = 0;
        if (sales && sales.length > 0) {
          totalRevenue = sales.filter(tx => tx.status === 'Completed' || tx.status === 'SUCCESS').reduce((sum, tx) => sum + Number(tx.total_amount || 0), 0);
        }

        const snapshot = `
CONTEKSTUAL DATA REAL-TIME OPERASIONAL OUTLET:
--- KATALOG MENU AKTIF ---
${menuStr}

--- STRUKTUR KEANGGOTAAN TIM ---
${staffStr}

--- RINGKASAN DATA FINANSIAL TERKINI ---
- Total Akumulasi Pendapatan Terlacak: Rp ${totalRevenue.toLocaleString('id-ID')}
- Jumlah Feed Transaksi Terbaru: ${sales ? sales.length : 0} Entri data.
        `;
        setDbSnapshot(snapshot);
      } catch (err) {
        console.error('⚠️ Gagal memuat data konteks database:', err.message);
      }
    }
    compileBusinessContext();
  }, []);

  // 📊 PIPELINE FORECAST CHART
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
          setForecastDailyAvg(0);
          setForecastGrowthRate(0);
          setForecastChartData(buildEmptyFallbackChart(forecastRange));
          setIsForecastChartLoading(false);
          return;
        }

        const dailyTotals = {}; 
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

        let growthRatePerDay = 0;
        if (sortedDateKeys.length >= 2) {
          const midIndex = Math.floor(sortedDateKeys.length / 2);
          const firstHalfKeys = sortedDateKeys.slice(0, Math.max(1, midIndex));
          const secondHalfKeys = sortedDateKeys.slice(midIndex);

          const firstHalfAvg = firstHalfKeys.reduce((sum, k) => sum + dailyTotals[k], 0) / firstHalfKeys.length;
          const secondHalfAvg = secondHalfKeys.reduce((sum, k) => sum + dailyTotals[k], 0) / secondHalfKeys.length;

          if (firstHalfAvg > 0) {
            const totalGrowth = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
            const daysBetweenHalves = Math.max(1, Math.round(sortedDateKeys.length / 2));
            growthRatePerDay = totalGrowth / daysBetweenHalves;
          }
        }

        growthRatePerDay = Math.max(-0.15, Math.min(0.15, growthRatePerDay));

        setForecastDailyAvg(dailyAvg);
        setForecastGrowthRate(growthRatePerDay);

        const chartData = buildForecastSeries({
          sortedDateKeys,
          dailyTotals,
          dailyAvg,
          growthRatePerDay,
          range: forecastRange
        });

        setForecastChartData(chartData);
      } catch (err) {
        console.error('⚠️ Gagal memproses kalkulasi tren pendapatan:', err.message);
        setForecastChartData(buildEmptyFallbackChart(forecastRange));
      } finally {
        setIsForecastChartLoading(false);
      }
    }

    buildForecastChart();
  }, [activeSubTab, forecastRange]);

  // 🚀 INTERCEPTOR TRIGGER FORMAL ANALYTICS GENERATOR
  useEffect(() => {
    if (activeSubTab === 'ask-brainy' || !dbSnapshot) return;

    async function generateTabAnalytics() {
      setIsTabAnalyzing(true);
      try {
        let customPrompt = '';
        if (activeSubTab === 'insights') {
          customPrompt = `
            Berdasarkan data snapshot operasional outlet saat ini:
            ${dbSnapshot}

            Pengguna saat ini sedang mengevaluasi menu "${selectedMenu}" pada opsi dropdown Business Intelligence.
            Tolong buatkan analisis pengadaan bahan baku sepanjang 2 paragraf secara formal, objektif, taktis, dan sopan kepada pengguna bernama ${userName}. Gunakan sapaan Bapak/Ibu.
            
            Kondisi Aturan:
            1. Jika katalog menu produk tertulis 'BELUM ADA REKAMAN DATA PRODUK...', berikan catatan formal di paragraf pertama bahwa basis data menu management masih memerlukan sinkronisasi entri data awal, sehingga sistem memuat data "Caffe Latte" sebagai model visualisasi blueprint presentasi.
            2. Di paragraf kedua, berikan evaluasi simulasi Harga Pokok Penjualan (HPP) strategis: Jelaskan bahwa jika menu "${selectedMenu}" ini diproduksi, komponen inti komoditas rentan terhadap fluktuasi inflasi sebesar 15.5% dari mitra penyuplai (vendor) utama, yang berisiko menekan net profit margin hingga menyentuh angka 20%. Berikan rekomendasi mitigasi risiko korporat yang harus dipersiapkan.
          `;
        } else if (activeSubTab === 'forecast') {
          const growthPercentText = (forecastGrowthRate * 100).toFixed(2);
          customPrompt = `
            Berdasarkan data snapshot operasional outlet saat ini:
            ${dbSnapshot}

            Parameter data tambahan hasil kalkulasi algoritma prediktif (historis sales_transactions):
            - Rata-rata omset harian historis: Rp ${Math.round(forecastDailyAvg).toLocaleString('id-ID')}
            - Tingkat pertumbuhan harian (growth rate): ${growthPercentText}% per hari

            Tolong buatkan analisis komprehensif sepanjang 2 paragraf mengenai "Proyeksi Finansial & Manajemen Inventaris Masa Depan" ditujukan kepada manajemen outlet atas nama ${userName}. Gunakan gaya bahasa formal, sopan, dan profesional.
            Catatan Penting: Jika data transaksi finansial masih bernilai kosong (Rp 0), sampaikan secara objektif dan sopan bahwa grafik di bawah ini merupakan estimasi pemodelan awal (initial model prediction). Berikan rekomendasi manajemen operasional bahwa entitas bisnis harus mempersiapkan buffer stock komoditas sebesar +20% untuk mengantisipasi lonjakan permintaan musim liburan, dan ingatkan manajemen untuk melakukan optimalisasi penugasan staf kasir di akhir pekan (weekend) mulai pukul 09:30 AM guna memitigasi antrean struk transaksi pada peak hour.
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
        console.error('⚠️ Gagal menghasilkan analisis analitik otomatis:', err);
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
        Anda adalah "Brainy", penasihat bisnis virtual, CFO virtual, dan analis kecerdasan buatan (AI) profesional yang terintegrasi penuh di dalam sistem POS manajemen cuanin.id. 
        Tugas utama Anda adalah membantu manajemen outlet (atas nama Bapak/Ibu ${userName}) dalam menganalisis kinerja operasional bisnis Warung Kopi Jaya.
        Wajib menggunakan gaya bahasa Indonesia yang formal, sopan, objektif, dan berbasis data keuangan. Hindari bahasa gaul, santai, atau kasual.

        Berikut adalah ringkasan data kondisi database aktual saat ini yang harus Anda jadikan sebagai parameter mutlak dalam menjawab instruksi pengguna jika relevan:
        ${dbSnapshot}

        Aturan Khusus:
        1. Apabila pengguna menanyakan rumus matematika akuntansi atau formulas keekonomian, sajikan jawaban terstruktur menggunakan bullet points bercetak tebal agar mudah dipahami secara manajerial.
        2. Apabila pengguna menanyakan perihal di luar koridor bisnis, keuangan, atau manajemen kafe, ingatkan pengguna secara sopan untuk kembali fokus pada optimasi profitabilitas operasional outlet.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + `\n\nPertanyaan Pengguna: ${userMessage}` }] }
        ]
      });

      const aiText = response.text || `Mohon maaf Bapak/Ibu ${userName}, terjadi kendala teknis dalam pemrosesan data saya. Mohon ajukan kembali pertanyaan Anda beberapa saat lagi.`;
      setMessages(prev => [...prev, { role: 'brainy', text: aiText }]);
    } catch (err) {
      console.error('Gemini API Error:', err);
      setMessages(prev => [...prev, { role: 'brainy', text: 'Terjadi kegagalan komunikasi dengan API Intelligence Server. Mohon pastikan kredensial parameter kunci Anda valid.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      { role: 'brainy', text: `Sesi analisis telah diperbarui. Silakan ajukan parameter evaluasi performa operasional Warung Kopi Jaya yang baru, Bapak/Ibu ${userName}.` }
    ]);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 120px)', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      
      {/* ================= RECENT CHATS SUB-SIDEBAR ================= */}
      <div style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0 }}>
        <button onClick={handleNewConversation} style={{ width: '100%', padding: '12px', backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}>
          <Plus size={16} /> Sesi Analisis Baru
        </button>
        
        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>RIWAYAT EVALUASI</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '12px', backgroundColor: '#E6F4EA', border: '1px solid #10B981', borderRadius: '10px', cursor: 'pointer' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#006847', display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14}/> Analisis Profit Okt</p>
            <span style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', display: 'block' }}>2 jam yang lalu</span>
          </div>
        </div>
      </div>

      {/* ================= WORKSPACE INTERKONEKSI DATA UTAMA KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
        
        {/* SUB-TABS INTERFACE LAYER HEADER */}
        <div style={{ height: '50px', borderBottom: '1px solid #E5E7EB', display: 'flex', padding: '0 32px', gap: '24px', alignItems: 'center', flexShrink: 0, backgroundColor: '#ffffff' }}>
          {['ask-brainy', 'insights', 'forecast'].map((tab) => {
            const isActive = activeSubTab === tab;
            let tabLabel = 'Asisten Brainy';
            if (tab === 'insights') tabLabel = 'Business Insights';
            if (tab === 'forecast') tabLabel = 'Business Forecast';

            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                style={{
                  height: '100%', padding: '0 4px', backgroundColor: 'transparent', border: 'none',
                  borderBottom: isActive ? '3px solid #10B981' : '3px solid transparent',
                  color: isActive ? '#10B981' : '#4B5563', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', outline: 'none'
                }}
              >
                {tabLabel}
              </button>
            );
          })}
        </div>

        {/* SUB-VIEW AREA CONTENT SUBTAB DYNAMIC VIEW RE-RENDERER */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#FAFAFA' }}>
          
          {/* TAB A: CORE INTERACTIVE LIVE CHAT */}
          {activeSubTab === 'ask-brainy' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                    <span>Brainy sedang melakukan kalkulasi database kuantitatif cuanin.id...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT MESSAGE CHAT BAR */}
              <div style={{ padding: '24px 40px', backgroundColor: '#ffffff', borderTop: '1px solid #E5E7EB' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', position: 'relative', alignItems: 'center' }}>
                  <input 
                    type="text" disabled={isGenerating} value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={`Ajukan parameter analisis operasional, Bapak/Ibu ${userName}...`} 
                    style={{ flex: 1, padding: '14px 60px 14px 20px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none' }} 
                  />
                  <button type="submit" disabled={isGenerating || !input.trim()} style={{ position: 'absolute', right: '12px', width: '38px', height: '38px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB B: INSIGHTS DASHBOARD DINAMIS */}
          {activeSubTab === 'insights' && (
            <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Business Intelligence Insights</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time analysis and strategic recommendations for your business.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', padding: '4px 12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold' }}>Pilih Menu:</span>
                    <select value={selectedMenu} onChange={(e) => setSelectedMenu(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: 'bold', color: '#006847', cursor: 'pointer', padding: '6px' }}>
                      {menuList.length > 0 ? menuList.map((m, idx) => <option key={idx} value={m.menu_name}>{m.menu_name}</option>) : <option value="Caffe Latte">Caffe Latte (Data Kosong)</option>}
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
                  <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'conic-gradient(#006847 0% 35%, #0284c7 35% 60%, #34d399 60% 80%, #a7f3d0 80% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '130px', height: '130px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>Total Cost</span>
                      <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>100%</span>
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
                        <div style={{ width: '14px', height: '14px', backgroundColor: item.color, borderRadius: '4px', marginTop: '2px' }} />
                        <div><p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{item.label} <span style={{ color: '#6B7280', marginLeft: '6px', fontWeight: '500' }}>{item.percent}</span></p><span style={{ fontSize: '11px', color: '#9CA3AF' }}>({item.desc})</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brainy's Analysis Connected to Live Gemini */}
              <div style={{ backgroundColor: '#E6F4EA', borderRadius: '16px', border: '1px solid #10B981', padding: '24px', display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                  {isTabAnalyzing ? <Loader2 size={22} className="animate-spin"/> : <Bot size={22}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#006847' }}>Brainy's Analysis {isTabAnalyzing && <span style={{ fontSize: '11px', color: '#059669', fontStyle: 'italic', fontWeight: 'normal' }}>(Brainy lagi menghitung database...)</span>}</h4>
                  <div style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#065f46', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{aiInsightText}</div>
                </div>
              </div>

              {/* 🔥 FIXED OPTIMIZATION GRID: Implementasi 3 Kartu Mengambang Aksi BI Strategis Berbasis Data Sesuai Mockup figma image_be9424.png */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '4px', marginBottom: '16px' }}>
                
                {/* CARD 1: REVIEW VENDOR PRICES */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center' }}>
                    <Truck size={18} color="#006847" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Review Vendor Prices</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280', lineHeight: '1.5', flex: 1 }}>
                    Bandingkan pengadaan harga susu atau komoditas utama saat ini dengan alternatif supplier lokal terpercaya di area Kota Tegal.
                  </p>
                  <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#006847', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <span>View Alternatives</span> <ArrowRight size={14} />
                  </button>
                </div>

                {/* CARD 2: ADJUST MENU PRICING */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center' }}>
                    <Percent size={18} color="#006847" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Adjust Menu Pricing</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280', lineHeight: '1.5', flex: 1 }}>
                    Rekomendasi: Naikkan harga dasar varian {selectedMenu} sebesar Rp 2.000 guna memulihkan batas aman cushion margin profit 12%.
                  </p>
                  <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#006847', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <span>Update Pricing</span> <ArrowRight size={14} />
                  </button>
                </div>

                {/* CARD 3: COST BREAKDOWN */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={18} color="#006847" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Cost Breakdown</h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280', lineHeight: '1.5', flex: 1 }}>
                    Analisis mendalam komponen HPP per bahan baku terikat untuk seluruh item di dalam kategori produk kafe saat ini.
                  </p>
                  <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: '#006847', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <span>View Details</span> <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB C: FORECAST PREDICTIVE DASHBOARD LENGKAP */}
          {activeSubTab === 'forecast' && (
            <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', height: '100%' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Revenue Forecast Projections</h4>
                  <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '3px' }}>
                    <button onClick={() => setForecastRange(7)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', backgroundColor: forecastRange === 7 ? '#006847' : 'transparent', color: forecastRange === 7 ? '#ffffff' : '#4B5563' }}>7 Hari</button>
                    <button onClick={() => setForecastRange(30)} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', backgroundColor: forecastRange === 30 ? '#006847' : 'transparent', color: forecastRange === 30 ? '#ffffff' : '#4B5563' }}>30 Hari</button>
                  </div>
                </div>

                {isForecastChartLoading ? (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}><Loader2 size={16} className="animate-spin" /> Menghitung peramalan tren finansial...</div>
                ) : (
                  <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 24px 20px 24px' }}>
                    {forecastChartData.map((point, idx) => {
                      const maxValue = Math.max(1, ...forecastChartData.map(d => d.value));
                      const barHeightPx = Math.max(6, Math.round((point.value / maxValue) * 130));
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#374151' }}>{point.value >= 1000000 ? `Rp ${(point.value / 1000000).toFixed(1)}jt` : `Rp ${(point.value / 1000).toFixed(0)}rb`}</span>
                          <div style={{ width: '32px', height: `${barHeightPx}px`, backgroundColor: point.isProjected ? '#34D399' : '#006847', borderRadius: '6px 6px 0 0', border: point.isProjected ? '2px dashed #10B981' : 'none', boxSizing: 'border-box' }} />
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{point.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#EFF6FF', borderRadius: '16px', border: '1px solid #3B82F6', padding: '24px', display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#1E3A8A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}><Sparkles size={22}/></div>
                <div style={{ flex: 1 }}><h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1E3A8A' }}>Log Prediktif Peramalan Bisnis</h4>
                  <div style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#1E40AF', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{aiForecastText}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}