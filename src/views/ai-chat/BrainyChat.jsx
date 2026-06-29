import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../config/supabaseClient';
import { 
  Send, Bot, MessageSquare, Sparkles, Loader2, Plus, 
  Truck, Percent, Calendar, Archive, Clock, ArrowRight, Trash2
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 📊 HELPER: Susun rangkaian chart (aktual + proyeksi)
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
  const [userName, setUserName] = useState('Bapak/Ibu Owner');

  // State Manajemen Chat & Integritas AI
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dbSnapshot, setDbSnapshot] = useState('');
  const messagesEndRef = useRef(null);

  // STATE PERSISTENCE HISTORY CHAT BOT REAKTIF
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Dropdown Selection State
  const [menuList, setMenuList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('Caffe Latte');

  // State Otomatisasi Generator Tab Insights & Forecast
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

  // 📥 1. PIPELINE: Muat Daftar Sesi Chat dari LocalStorage pas pertama kali masuk
  useEffect(() => {
    const savedSessions = localStorage.getItem('cuanin_brainy_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setChatSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
        setMessages(parsed[0].history);
      }
    }
  }, []);

  // 📥 2. AUTOMATIC BUSINESS CONTEXT & DEFAULT MESSAGES INJECTION
  useEffect(() => {
    async function compileBusinessContext() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentOwnerName = 'Bapak/Ibu Owner';
        if (session && session.user) {
          currentOwnerName = session.user.user_metadata?.full_name || session.user.email.split('@')[0].toUpperCase();
          setUserName(currentOwnerName);
        }

        const savedSessions = localStorage.getItem('cuanin_brainy_sessions');
        if (!savedSessions || JSON.parse(savedSessions).length === 0) {
          const initialId = 'sess_' + Date.now();
          const initialHistory = [
            { role: 'brainy', text: `Selamat datang, Bapak/Ibu ${currentOwnerName}. Saya adalah Brainy, asisten finansial virtual internal Anda di cuanin.id. Apakah ada indikator performa operasional Warung Kopi Jaya yang ingin Anda evaluasi hari ini?` }
          ];
          const defaultSession = [{ id: initialId, title: 'Evaluasi Performa Awal', timeLabel: 'Baru Saja', history: initialHistory }];
          
          setChatSessions(defaultSession);
          setActiveSessionId(initialId);
          setMessages(initialHistory);
          localStorage.setItem('cuanin_brainy_sessions', JSON.stringify(defaultSession));
        }

        const { data: menus } = await supabase.from('menus').select('menu_name, price, is_available');
        const { data: staff } = await supabase.from('staff').select('name, role_id, status');
        const { data: sales } = await supabase.from('sales_transactions').select('total_amount, status, payment_method').limit(15);

        if (menus && menus.length > 0) {
          setMenuList(menus);
          setSelectedMenu(menus[0].menu_name); 
        }

        const menuStr = menus && menus.length > 0 ? menus.map(m => `- ${m.menu_name}: Rp ${m.price} (${m.is_available ? 'Tersedia' : 'Habis'})`).join('\n') : 'BELUM ADA REKAMAN DATA PRODUK PADA SISTEM.';
        const staffStr = staff && staff.length > 0 ? staff.map(s => `- ${s.name}: Peran ID ${s.role_id} (${s.status})`).join('\n') : 'BELUM ADA REKAMAN DATA SUMBER DAYA MANUSIA.';
        
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
  }, [userName]);

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

  // 🚀 TAB ANALYTICS GENERATOR VIA LIVE AI
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
            Tolah buatkan analisis pengadaan bahan baku sepanjang 2 paragraf secara formal, objektif, taktis, dan sopan kepada pengguna bernama ${userName}. Gunakan sapaan Bapak/Ibu.
            
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

            Tolong buatkan analisis komprehensif sepanjang 2 paragraf mengenai "Proyeksi Finansial & Manajemen Inventaris Masa Depan" ditujukan kepada manajemen outlet atas nama ${userName}. Gunayan gaya bahasa formal, sopan, dan profesional.
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

  // ✅ FIX: handleSendMessage sekarang membuat `updatedMessages` secara eksplisit
  // sebelum dipakai, sehingga tidak ada lagi ReferenceError yang membuat balasan
  // Brainy gagal tampil secara diam-diam.
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input;
    const updatedMessages = [...messages, { role: 'user', text: userMessage }]; // ✅ didefinisikan di sini
    setMessages(updatedMessages);
    setInput('');
    setIsGenerating(true);

    try {
      const systemInstruction = `
        Anda adalah "Brainy", penasihat bisnis virtual, CFO virtual, dan analis kecerdasan buatan (AI) profesional yang terintegrasi penuh di dalam sistem POS manajemen cuanin.id. 
        Tugas utama Anda adalah membantu manajemen outlet (atas nama Bapak/Ibu ${userName}) dalam menganalisis kinerja operasional bisnis Warung Kopi Jaya.
        Wajib menggunakan gaya bahasa Indonesia yang formal, sopan, whitespace: pre-wrap, objektif, dan berbasis data keuangan.

        Berikut adalah ringkasan data kondisi database aktual saat ini yang harus Anda jadikan sebagai parameter mutlak dalam menjawab instruksi pengguna jika relevan:
        ${dbSnapshot}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + `\n\nPertanyaan Pengguna: ${userMessage}` }] }
        ]
      });

      const aiText = response.text || `Mohon maaf Bapak/Ibu ${userName}, terjadi kendala teknis dalam pemrosesan data saya.`;
      const finalMessages = [...updatedMessages, { role: 'brainy', text: aiText }]; // ✅ kini valid

      setMessages(finalMessages);
      updateSessionHistoryInStorage(activeSessionId, finalMessages);

    } catch (err) {
      console.error('Gemini API Error:', err);
      const errMessages = [...updatedMessages, { role: 'brainy', text: 'Terjadi kegagalan komunikasi dengan API Intelligence Server.' }]; // ✅ kini valid
      setMessages(errMessages);
      updateSessionHistoryInStorage(activeSessionId, errMessages);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSessionHistoryInStorage = (sessionId, freshHistory) => {
    const updated = chatSessions.map(sess => {
      if (sess.id === sessionId) {
        let dynamicTitle = sess.title;
        if (sess.title === 'Sesi Baru...' && freshHistory.length > 1) {
          dynamicTitle = freshHistory[1].text.substring(0, 18) + '...';
        }
        return { ...sess, title: dynamicTitle, history: freshHistory };
      }
      return sess;
    });
    setChatSessions(updated);
    localStorage.setItem('cuanin_brainy_sessions', JSON.stringify(updated));
  };

  const handleNewConversation = () => {
    if (messages.length > 1 && activeSessionId) {
      updateSessionHistoryInStorage(activeSessionId, messages);
    }

    const newId = 'sess_' + Date.now();
    const cleanHistory = [
      { role: 'brainy', text: `Sesi analisis baru telah dimulai. Silakan ajukan parameter evaluasi performa operasional Warung Kopi Jaya yang baru, Bapak/Ibu ${userName}.` }
    ];
    
    const newSessionObj = {
      id: newId,
      title: 'Sesi Baru...',
      timeLabel: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      history: cleanHistory
    };

    const updatedSessions = [newSessionObj, ...chatSessions];
    setChatSessions(updatedSessions);
    setActiveSessionId(newId);
    setMessages(cleanHistory);
    localStorage.setItem('cuanin_brainy_sessions', JSON.stringify(updatedSessions));
    setActiveSubTab('ask-brainy');
  };

  const handleSelectSession = (sess) => {
    setActiveSessionId(sess.id);
    setMessages(sess.history);
    setActiveSubTab('ask-brainy');
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Hapus riwayat percakapan sesi analisis ini, Gar?')) return;
    
    const filtered = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(filtered);
    localStorage.setItem('cuanin_brainy_sessions', JSON.stringify(filtered));

    if (activeSessionId === sessionId) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
        setMessages(filtered[0].history);
      } else {
        setMessages([]);
        setActiveSessionId(null);
      }
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 120px)', backgroundColor: '#ffffff', overflow: 'hidden' }}>
      
      {/* ================= RECENT CHATS SUB-SIDEBAR ================= */}
      <div style={{ width: '250px', backgroundColor: '#ffffff', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0 }}>
        <button onClick={handleNewConversation} style={{ width: '100%', padding: '12px', backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}>
          <Plus size={16} /> Sesi Analisis Baru
        </button>
        
        <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>RIWAYAT EVALUASI VIA STORAGE</span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {chatSessions.length > 0 ? (
            chatSessions.map((sess) => {
              const isSelected = sess.id === activeSessionId;
              return (
                <div 
                  key={sess.id}
                  onClick={() => handleSelectSession(sess)}
                  style={{ 
                    padding: '12px', 
                    backgroundColor: isSelected ? '#E6F4EA' : 'transparent', 
                    border: isSelected ? '1px solid #10B981' : '1px solid #F3F4F6', 
                    borderRadius: '10px', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={16} color={isSelected ? '#006847' : '#9CA3AF'} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{sess.title}</p>
                      <span style={{ fontSize: '10px', color: '#6B7280' }}>{sess.timeLabel}</span>
                    </div>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteSession(e, sess.id); }} style={{ background: 'none', border: 'none', padding: 0, color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', fontSize: '12px' }}>Belum ada histori obrolan.</div>
          )}
        </div>
      </div>

      {/* ================= WORKSPACE UTAMA KANAN ================= */}
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

        {/* SUB-VIEW AREA CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#FAFAFA' }}>
          
          {/* TAB A: INTERACTIVE CHAT WORKSPACE */}
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
                    type="text" disabled={isGenerating || !activeSessionId} value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder={activeSessionId ? `Ajukan parameter analisis operasional, Bapak/Ibu ${userName}...` : "Silakan klik 'Sesi Analisis Baru' untuk memulai percakapan, Gar."} 
                    style={{ flex: 1, padding: '14px 60px 14px 20px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none' }} 
                  />
                  <button type="submit" disabled={isGenerating || !input.trim() || !activeSessionId} style={{ position: 'absolute', right: '12px', width: '38px', height: '38px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB B: INSIGHTS DASHBOARD */}
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
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Ingredient Cost Distribution ({selectedMenu})</h3>
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

              <div style={{ backgroundColor: '#E6F4EA', borderRadius: '16px', border: '1px solid #10B981', padding: '24px', display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                  {isTabAnalyzing ? <Loader2 size={22} className="animate-spin"/> : <Bot size={22}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#006847' }}>Brainy's Analysis</h4>
                  <div style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#065f46', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{aiInsightText}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB C: FORECAST PREDICTIVE (SINKRONISASI VISUAL KONDENSASI BATANG - ANTI RENGGANG) */}
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
                  /* 🔥 FIXED OPTIMIZATION: Membatasi max-width kontainer serta mengunci susunan flex agar pilar diagram merapat padat */
                  <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '28px', padding: '0 24px 20px 24px', width: '100%', maxWidth: '650px', margin: '0 auto' }}>
                    {forecastChartData.map((point, idx) => {
                      const maxValue = Math.max(1, ...forecastChartData.map(d => d.value));
                      const barHeightPx = Math.max(6, Math.round((point.value / maxValue) * 130));
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '60px', flexShrink: 0 }}>
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#374151', whiteSpace: 'nowrap' }}>
                            {point.value >= 1000000 ? `Rp ${(point.value / 1000000).toFixed(1)}jt` : `Rp ${(point.value / 1000).toFixed(0)}rb`}
                          </span>
                          <div style={{ width: '36px', height: `${barHeightPx}px`, backgroundColor: point.isProjected ? '#34D399' : '#006847', borderRadius: '6px 6px 0 0', border: point.isProjected ? '2px dashed #10B981' : 'none', boxSizing: 'border-box', transition: 'height 0.3s ease' }} />
                          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>{point.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ backgroundColor: '#EFF6FF', borderRadius: '16px', border: '1px solid #3B82F6', padding: '24px', display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#1E3A8A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}><Sparkles size={22}/></div>
                <div style={{ flex: 1 }}><h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Log Prediktif Peramalan Bisnis</h4>
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