import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, TrendingUp, TrendingDown, AlertTriangle,
  ChevronDown, ChevronUp, Store, Sliders, ShieldCheck, LogOut,
  MessageSquare, User, Shield, Key, ArrowUpRight, Globe
} from 'lucide-react';

// Impor koneksi client Supabase yang ngebaca file .env lu
import { supabase } from '../../config/supabaseClient';

// Import komponen form internal settings
import InfoOutlet from '../settings/InfoOutlet.jsx';
import KonfigurasiAI from '../settings/KonfigurasiAI.jsx';
import Keamanan from '../settings/Keamanan.jsx';
import Bahasa from '../settings/Bahasa.jsx';
import EditProfile from './EditProfile.jsx';

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

export default function MainDashboard({ onNavigateView, forcedSubView }) {
  const { logout } = useAuth();
  const currentView = 'dashboard';
  
  // State kendali interaksi UI internal
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [activeSubView, setActiveSubView] = useState(forcedSubView || 'main-dashboard');

  // State Dropdown Kunci Tren Bahan Baku
  const [selectedMaterial, setSelectedMaterial] = useState('Kopi Arabica');

  const [isLoading, setIsLoading] = useState(true);
  const [financials, setFinancials] = useState({
    totalSales: 0,
    netProfit: 0,
    totalTransactions: 0,
    salesTrend: '0%',
    profitTrend: '0%',
    weeklySalesPath: 'M 0 50 Q 116 50 233 50 T 466 50 T 700 50',
    weeklyExpensesPath: 'M 0 80 Q 116 80 233 80 T 466 80 T 700 80',
    tableRows: [],
    monthLabel: 'JULY 2024',
    grossRevenue: 0,
    cogs: 0,
    laborCosts: 0,
    operatingExpenses: 0,
    netProfitMarginLabel: 'Margin: 0%',
    brainyInsightText: "Brainy Insights: Menunggu data analisis jualan masuk...",
    avgTransaction: 0,
    avgTransactionTrend: '0%',
    loyaltyRate: 0,
    loyaltyRateTrend: '0%',
    peakHoursLabel: '00:00 – 00:00',
    peakHoursPercentage: '0%'
  });
  const [criticalStockCount, setCriticalStockCount] = useState(0);
  const [topMenus, setTopMenus] = useState([]);
  
  // List master komoditas asli dari database
  const [rawTrendsFromDB, setRawTrendsFromDB] = useState([]);
  const [materialsData, setMaterialsData] = useState({});

  // State kurva reaktif linear
  const [activeCurve, setActiveCurve] = useState({
    labelColor: '#006847',
    weeks: ['Rp 0', 'Rp 0', 'Rp 0', 'Rp 0'],
    numericWeeks: [0, 0, 0, 0], 
    bottomMetrics: { name: '-', price: 'Rp 0' }
  });

  useEffect(() => {
    if (forcedSubView) {
      setActiveSubView(forcedSubView);
    }
  }, [forcedSubView]);

  {/* 🚀 ENGINE SINKRONISASI DATA LIVE SUPABASE */}
  useEffect(() => {
    if (activeSubView !== 'main-dashboard') return;

    const formatKeRupiah = (val) => {
      if (!val) return 'Rp 0';
      const cleanStr = String(val).trim();
      if (cleanStr.includes('Rp')) return cleanStr;
      const num = Number(cleanStr.replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? `Rp ${cleanStr}` : `Rp ${num.toLocaleString('id-ID')}`;
    };

    const ambilAngkaMurni = (val) => {
      if (!val) return 0;
      const num = Number(String(val).replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? 0 : num;
    };

    const prosesDanBagiDataTren = (trendsData) => {
      if (!trendsData || trendsData.length === 0) return;

      setRawTrendsFromDB(trendsData);
      const mappedTrends = {};

      trendsData.forEach(item => {
        const key = item.material_name.trim();

        mappedTrends[key] = {
          labelColor: item.hex_color || '#006847',
          weeks: [
            formatKeRupiah(item.week_1),
            formatKeRupiah(item.week_2),
            formatKeRupiah(item.week_3),
            formatKeRupiah(item.week_4)
          ],
          numericWeeks: [
            ambilAngkaMurni(item.week_1),
            ambilAngkaMurni(item.week_2),
            ambilAngkaMurni(item.week_3),
            ambilAngkaMurni(item.week_4)
          ],
          bottomMetrics: { 
            name: item.short_code || key.substring(0, 3).toUpperCase(), 
            price: item.current_price_label || formatKeRupiah(item.week_4)
          }
        };
      });

      setMaterialsData(mappedTrends);

      const currentKey = selectedMaterial.trim();
      if (mappedTrends[currentKey]) {
        setActiveCurve(mappedTrends[currentKey]);
      } else if (trendsData[0]) {
        const fallbackKey = trendsData[0].material_name.trim();
        setSelectedMaterial(fallbackKey);
        setActiveCurve(mappedTrends[fallbackKey]);
      }
    };

    async function fetchInitialCommodityTrends() {
      setIsLoading(true);
      try {
        const { data: trendsData, error: trendsError } = await supabase
          .from('raw_material_trends')
          .select('*');

        if (!trendsError && trendsData) {
          prosesDanBagiDataTren(trendsData);
        }
      } catch (err) {
        console.error('Error memuat data tren bahan baku awal dari Supabase:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialCommodityTrends();

    const cloudRealtimeChannel = supabase
      .channel('live_dashboard_commodity_trends')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'raw_material_trends' },
        async (payload) => {
          const { data: updatedTrends, error: refreshError } = await supabase
            .from('raw_material_trends')
            .select('*');
          if (!refreshError && updatedTrends) {
            prosesDanBagiDataTren(updatedTrends);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cloudRealtimeChannel);
    };
  }, [activeSubView, selectedMaterial]); 

  // ================= 🛠 COMPLETE ALGORITMA HIGH-PRECISION LINEAR CHART MATRIX =================
  // ⚡ FIXED: Sumbu X Penempatan Koordinat: Menyebar titik simpul (W1-W4) merata dari pixel 100 ke 520 [cite: Line 139]
  const xCoords = [100, 240, 380, 520]; 

  // MATH SCALE CALCULATOR UNTUK MENCARI SKALA MIN-MAX HARGA ASLI DATABASE [cite: Line 142]
  const validPrices = activeCurve.numericWeeks.filter(p => p > 0);
  const rawMax = validPrices.length > 0 ? Math.max(...validPrices) : 100000;
  const rawMin = validPrices.length > 0 ? Math.min(...validPrices) : 10000;
  const priceRange = rawMax - rawMin;

  // Set buffer atas dan bawah agar titik ekstrim tidak menempel di langit-langit kanvas SVG [cite: Line 148]
  const scaleMax = rawMax + (priceRange * 0.1 || 5000);
  const scaleMin = Math.max(0, rawMin - (priceRange * 0.1 || 2000));
  const scaleRange = scaleMax - scaleMin;

  // Batas tinggi gambar grafik di kanvas SVG (Sama dengan y1 dan y2 garis bantu horizontal) [cite: Line 153]
  const yTopBoundary = 30;   // Garis Atas (Baris 1)
  const yBottomBoundary = 150; // Garis Bawah (Baris 4)
  const yGraphHeight = yBottomBoundary - yTopBoundary; // Total tinggi aktif = 120px

  // ⚡ FORMULA PROPORSI VERTIKAL: Menghitung letak Y simpul secara absolut murni berdasarkan nilai rupiah asli pasar! [cite: Line 159]
  const calculatedPoints = activeCurve.numericWeeks.map(price => {
    if (price <= 0 || scaleRange === 0) return yBottomBoundary;
    // Semakin mahal harganya, koordinat Y semakin mengecil mendekati angka 30 (puncak kanvas) [cite: Line 162]
    const ratio = (price - scaleMin) / scaleRange;
    return yBottomBoundary - (ratio * yGraphHeight);
  });

  const linePath = `M ${xCoords[0]} ${calculatedPoints[0]} L ${xCoords[1]} ${calculatedPoints[1]} L ${xCoords[2]} ${calculatedPoints[2]} L ${xCoords[3]} ${calculatedPoints[3]}`;

  // 🛠️ FIXED ROUNDING CALCULATOR: Mengeliminasi total pecahan desimal panjang di Beras & Gula Aren [cite: Line 169]
  const yLabels = [
    scaleMax,
    scaleMax - (scaleRange * 0.3333),
    scaleMin + (scaleRange * 0.3333),
    scaleMin
  ].map(num => {
    if (num <= 0) return 'Rp 0';
    // Gunakan Math.round agar pembagian sisa split terpotong bulat mulus [cite: Line 176]
    const roundedNum = Math.round(num);
    // ⚡ FIXED: Format full ribuan tanpa 'k' (misal: "Rp 100.000") [cite: Line 178]
    return `Rp ${roundedNum.toLocaleString('id-ID')}`;
  });

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F3F4F6', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* ================= SIDEBAR KIRI ================= */}
      <div style={{ width: isMainSidebarOpen ? '260px' : '80px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0, transition: 'width 0.3s ease-in-out', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'space-between' : 'center', padding: '0 20px', marginBottom: '32px', height: '40px' }}>
          <div onClick={() => !isMainSidebarOpen && setIsMainSidebarOpen(true)} style={{ cursor: !isMainSidebarOpen ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CuaninLogoMini />
            {isMainSidebarOpen && (
              <div style={{ transition: 'opacity 0.2s', opacity: 1 }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
                <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
              </div>
            )}
          </div>
          {isMainSidebarOpen && (
            <div onClick={() => { setIsMainSidebarOpen(false); setIsSettingsOpen(false); }} style={{ cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Menu size={16} color="#93C5FD" />
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: isMainSidebarOpen ? '0 16px' : '0' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard', action: () => setActiveSubView('main-dashboard') },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales', action: () => onNavigateView('sales') },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock', action: () => onNavigateView('stock') },
            { name: 'Menu Management', icon: <Menu size={18} />, target: 'menu', action: () => onNavigateView('menu') },
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff', action: () => onNavigateView('staff') }
          ].map((menu, idx) => {
            const isActive = menu.target === 'dashboard' && activeSubView === 'main-dashboard';
            return (
              <div key={idx} onClick={menu.action} style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'flex-start' : 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: isActive ? 'bold' : '500', backgroundColor: isActive ? '#006847' : 'transparent', color: isActive ? '#ffffff' : '#93C5FD', transition: 'all 0.3s ease-in-out' }}>
                {menu.icon} {isMainSidebarOpen && <span style={{ fontSize: '14px' }}>{menu.name}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ padding: isMainSidebarOpen ? '0 16px' : '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div onClick={() => isMainSidebarOpen ? setIsSettingsOpen(!isSettingsOpen) : setIsMainSidebarOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'space-between' : 'center', padding: '12px 16px', color: isSettingsOpen || (activeSubView !== 'main-dashboard' && activeSubView !== 'edit-profile') ? '#ffffff' : '#93C5FD', backgroundColor: isSettingsOpen || (activeSubView !== 'main-dashboard' && activeSubView !== 'edit-profile') ? 'rgba(255, 255, 255, 0.08)' : 'transparent', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease-in-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: isSettingsOpen ? 'bold' : '500' }}>Settings</span>}
            </div>
            {isMainSidebarOpen && <div style={{ transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}><ChevronDown size={14} /></div>}
          </div>

          {isMainSidebarOpen && (
            <div style={{ maxHeight: isSettingsOpen ? '200px' : '0px', opacity: isSettingsOpen ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.4s, opacity 0.3s', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '14px', marginBottom: '4px' }}>
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

          <div onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'flex-start' : 'center', gap: '12px', padding: '12px 16px', color: '#FFCACA', borderRadius: '10px', cursor: 'pointer' }}>
            <LogOut size={18} /> {isMainSidebarOpen && <span style={{ fontSize: '14px', fontWeight: '500' }}>Logout</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMainSidebarOpen ? 'flex-start' : 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#111827', borderRadius: '12px', marginTop: '4px' }}>
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
            <input type="text" placeholder="Search analytics, financial reports, or menu items..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <MessageSquare size={16} /> Ask Brainy
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Bell size={20} color="#4B5563" /></button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><HelpCircle size={20} color="#4B5563" /></button>

            <div onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px', cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Alex Graham {isProfileOpen ? <ChevronUp size={14} color="#6B7280" /> : <ChevronDown size={14} color="#6B7280" />}
                </p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>ADMINISTRATOR</span>
              </div>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>

            <div style={{ position: 'absolute', top: '55px', right: '0px', width: '220px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: isProfileOpen ? 'flex' : 'none', flexDirection: 'column', padding: '6px', boxSizing: 'border-box' }}>
              <div onClick={() => { setActiveSubView('edit-profile'); setIsProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }}><User size={14} /> <span>Edit Profile</span></div>
              <div onClick={() => { setActiveSubView('keamanan'); setIsProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', fontSize: '13px', cursor: 'pointer' }}><Shield size={14} /> <span>Account Security</span></div>
            </div>
          </div>
        </div>

        {/* CONTAINER WORKSPACE UTAMA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box', position: 'relative' }}>
          
          {isLoading && activeSubView === 'main-dashboard' && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(243, 244, 246, 0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#006847' }}>
              🔄 Membaca Data Hasil Google Colab...
            </div>
          )}

          {activeSubView === 'info-outlet' && <InfoOutlet onSaveSuccess={() => setActiveSubView('main-dashboard')} />}
          {activeSubView === 'konfigurasi-ai' && <KonfigurasiAI onSaveSuccess={() => setActiveSubView('main-dashboard')} />}
          {activeSubView === 'keamanan' && <Keamanan onSaveSuccess={() => setActiveSubView('main-dashboard')} />}
          {activeSubView === 'bahasa' && <Bahasa onSaveSuccess={() => setActiveSubView('main-dashboard')} />}
          {activeSubView === 'edit-profile' && <EditProfile onSaveSuccess={() => setActiveSubView('main-dashboard')} />}

          {activeSubView === 'main-dashboard' && (
            <>
              {/* SMART CARDS ROW SUMMARY */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CuaninLogoMini /></div>
                    <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}><TrendingUp size={12}/> {financials.salesTrend}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>TOTAL PENJUALAN</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                    Rp {financials.totalSales.toLocaleString('id-ID')}
                  </h2>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💵</div>
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}><TrendingDown size={12}/> {financials.profitTrend}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>PROFIT BERSIH</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                    Rp {financials.netProfit.toLocaleString('id-ID')}
                  </h2>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📝</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>JUMLAH TRANSAKSI</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                    {financials.totalTransactions.toLocaleString('id-ID')}
                  </h2>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={20} /></div>
                    <div style={{ backgroundColor: criticalStockCount > 0 ? '#DC2626' : '#059669', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                      {criticalStockCount > 0 ? 'KRITIS' : 'AMAN'}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>STOK KRITIS</span>
                  <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: criticalStockCount > 0 ? '#DC2626' : '#111827' }}>
                    {criticalStockCount} Items
                  </h2>
                </div>
              </div>

              {/* SALES VS EXPENSES GRAPH & BREAKDOWN PANEL */}
              <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div onClick={() => setIsBreakdownOpen(!isBreakdownOpen)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Sales vs Expenses {isBreakdownOpen ? <ChevronUp size={18} color="#006847" /> : <ChevronDown size={18} color="#6B7280" />}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Visualisasi fluktuasi mingguan performa operasional</p>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#006847', borderRadius: '50%' }} /> Sales</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#4F46E5', borderRadius: '50%' }} /> Expenses</span>
                  </div>
                </div>
                <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <svg viewBox="0 0 700 100" style={{ width: '100%', height: '100px', overflow: 'visible' }}>
                    <path d={financials.weeklySalesPath} fill="none" stroke="#006847" strokeWidth="4" />
                    <path d={financials.weeklyExpensesPath} fill="none" stroke="#4F46E5" strokeWidth="4" />
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <span key={day}>{day}</span>)}
                  </div>
                </div>

                {/* BREAKDOWN PANEL DETAIL MINGGUAN */}
                <div style={{ maxHeight: isBreakdownOpen ? '400px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s, opacity 0.3s', opacity: isBreakdownOpen ? 1 : 0, borderTop: isBreakdownOpen ? '1px dashed #E5E7EB' : 'none', paddingTop: isBreakdownOpen ? '16px' : '0px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4B5563', display: 'block', marginBottom: '12px' }}>📋 RINCIAN OPERASIONAL MINGGUAN (DATABASE)</span>
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
              </div>

              {/* TOP SELLING MENU REALTIME */}
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>⭐ Top Selling Menu (Top 3 Live)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {topMenus.map((menu, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #F3F4F6', padding: '12px', borderRadius: '14px', backgroundColor: '#F9FAFB' }}>
                      <img src={menu.image_url} alt={menu.menu_name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{menu.menu_name}</p>
                        <span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold' }}>{menu.sold_count} SOLD</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINANCIAL DEEP-DIVE SECTION */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827', borderLeft: '4px solid #006847', paddingLeft: '10px' }}>Financial Deep-Dive</h3>
              </div>

              {/* PORSI GRID SETENGAH (50% - 50%) STABIL */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* BLOK LABA RUGI DARI DATABASE */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>LABA RUGI (AUDITED)</span>
                    <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px' }}>{financials.monthLabel}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px', color: '#4B5563' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Gross Revenue</span><strong style={{ color: '#111827' }}>Rp {financials.grossRevenue.toLocaleString('id-ID')}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>COGS (HPP)</span><strong style={{ color: '#DC2626' }}>- Rp {financials.cogs.toLocaleString('id-ID')}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Labor Costs</span><strong style={{ color: '#DC2626' }}>- Rp {financials.laborCosts.toLocaleString('id-ID')}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E5E7EB', paddingBottom: '12px' }}><span>Operating Expenses</span><strong style={{ color: '#DC2626' }}>- Rp {financials.operatingExpenses.toLocaleString('id-ID')}</strong></div>
                    <div style={{ backgroundColor: '#E6F4EA', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div><span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold', display: 'block' }}>NET PROFIT</span><span style={{ fontSize: '10px', color: '#059669' }}>{financials.netProfitMarginLabel}</span></div>
                      <strong style={{ fontSize: '18px', color: '#006847' }}>Rp {financials.netProfit.toLocaleString('id-ID')}</strong>
                    </div>
                    <div style={{ backgroundColor: '#006847', color: '#ffffff', padding: '14px', borderRadius: '12px', fontSize: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '16px' }}>💡</span>
                      <p style={{ margin: 0, lineHeight: '1.4' }}>{financials.brainyInsightText}</p>
                    </div>
                  </div>
                </div>

                {/* 🛠️ BOKS TREN HARGA BAHAN BAKU: INTEGRASI ALGORITMA SKALA LINEAR DAN REVISI UI MEPEET */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div><span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', display: 'block' }}>TREN HARGA BAHAN BAKU</span></div>
                    
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <select 
                        value={selectedMaterial} 
                        onChange={(e) => setSelectedMaterial(e.target.value)}
                        style={{ padding: '6px 28px 6px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#374151', backgroundColor: '#FAFAFA', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                      >
                        {rawTrendsFromDB.length > 0 ? (
                          rawTrendsFromDB.map((item) => (
                            <option key={item.id} value={item.material_name.trim()}>{item.material_name.trim().toUpperCase()}</option>
                          ))
                        ) : (
                          <>
                            <option value="Kopi Arabica">KOPI ARABICA</option>
                            <option value="Beras Premium">BERAS PREMIUM</option>
                            <option value="Daging Ayam">DAGING AYAM</option>
                            <option value="Gula Aren">GULA AREN</option>
                            <option value="Fresh Milk">FRESH MILK</option>
                          </>
                        )}
                      </select>
                      <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* WADAH FIXED RATIO AGAR GRAFIK TIDAK PENYOK */}
                  <div style={{ width: '100%', position: 'relative', marginBottom: '10px', aspectRatio: '650 / 180' }}>
                    <svg viewBox="0 0 650 180" style={{ width: '100%', height: '100%', overflow: 'visible', position: 'absolute', top: 0, left: 0 }}>
                      
                      {/* Sumbu Y Vertikal Tegak Lurus di x="75" agar tidak menimpa label */}
                      <line x1="75" y1="10" x2="75" y2="160" stroke="#9CA3AF" strokeWidth="1.5" />

                      {/* ⚡ GRIDLINE & LABEL SUMBU Y DENGAN AKURASI SKALA LINEAR ASLI */}
                      <g>
                        {/* Baris 1: Skala Tertinggi [cite: yTopBoundary = 30] */}
                        <line x1="75" y1="30" x2="550" y2="30" stroke="#F3F4F6" strokeWidth="1" />
                        <text x="65" y="34" fill="#6B7280" fontSize="11" fontWeight="bold" textAnchor="end">{yLabels[0]}</text>

                        {/* Baris 2: Mid-High */}
                        <line x1="75" y1="70" x2="550" y2="70" stroke="#F3F4F6" strokeWidth="1" />
                        <text x="65" y="74" fill="#9CA3AF" fontSize="11" textAnchor="end">{yLabels[1]}</text>

                        {/* Baris 3: Mid-Low */}
                        <line x1="75" y1="110" x2="550" y2="110" stroke="#F3F4F6" strokeWidth="1" />
                        <text x="65" y="114" fill="#9CA3AF" fontSize="11" textAnchor="end">{yLabels[2]}</text>

                        {/* Baris 4: Skala Terendah [cite: yBottomBoundary = 150] */}
                        <line x1="75" y1="150" x2="550" y2="150" stroke="#F3F4F6" strokeWidth="1" />
                        <text x="65" y="154" fill="#6B7280" fontSize="11" fontWeight="bold" textAnchor="end">{yLabels[3]}</text>
                      </g>

                      {/* 1. Jalur Garis Lurus Hasil Perhitungan Linear Matematika (Anti-Penyok) [cite: Line 166] */}
                      <path d={linePath} fill="none" stroke={activeCurve.labelColor} strokeWidth="3" style={{ transition: 'd 0.4s ease-in-out, stroke 0.3s ease' }} />

                      {/* 2. Bulatan Simpul Titik Pas Menempel Sempurna Tepat di Atas Garis Skala Sumbu Y [cite: xCoords, calculatedPoints] */}
                      {xCoords.map((xVal, index) => (
                        <g key={index}>
                          {/* Outer circle point */}
                          <circle cx={xVal} cy={calculatedPoints[index]} r="3.5" fill="#ffffff" stroke={activeCurve.labelColor} strokeWidth="2" style={{ transition: 'cy 0.4s ease-in-out' }} />
                        </g>
                      ))}
                    </svg>
                    <div style={{ position: 'absolute', top: '-15px', right: '0px', fontSize: '10px', fontWeight: 'bold', color: activeCurve.labelColor }}>
                      ● {selectedMaterial.toUpperCase()}
                    </div>
                  </div>

                  {/* Sumbu X Layout: ⚡ FIXED Sumbu X Penjajaran Teks agar tidak mepet [cite: Line 139] */}
                  {/* Gunakan display: flex dan padding merata sesuai pixel awal grafik (100) */}
                  <div style={{ display: 'flex', fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', marginTop: '4px', paddingLeft: '85px', paddingRight: '120px', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ width: '30px', textAlign: 'center' }}>Week 1</span>
                    <span style={{ width: '30px', textAlign: 'center' }}>Week 2</span>
                    <span style={{ width: '30px', textAlign: 'center' }}>Week 3</span>
                    <span style={{ width: '30px', textAlign: 'center' }}>Week 4</span>
                  </div>

                  <div style={{ display: 'flex', justify: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '14px' }}>
                    <div style={{ textAlign: 'center', padding: '0 20px' }}>
                      <span style={{ color: '#9CA3AF', fontWeight: 'bold', display: 'block', fontSize: '9px', letterSpacing: '0.5px' }}>
                        KOMODITAS TERPILIH: {activeCurve.bottomMetrics.name}
                      </span>
                      <span style={{ color: activeCurve.labelColor, marginTop: '4px', display: 'block', fontSize: '14px', fontWeight: 'bold' }}>
                        {activeCurve.bottomMetrics.price} <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 'normal' }}>/ Satuan Log</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRIPLE BOTTOM METRICS CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>📊 AVERAGE TRANSACTION</span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    Rp {financials.avgTransaction.toLocaleString('id-ID')}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>
                    {financials.avgTransactionTrend} <span style={{ color: '#9CA3AF', fontWeight: '500' }}>vs last month</span>
                  </span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>🧬 LOYALTY RATE</span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    {financials.loyaltyRate}%
                  </h3>
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>
                    {financials.loyaltyRateTrend} <span style={{ color: '#9CA3AF', fontWeight: '500' }}>from new members</span>
                  </span>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>⏰ PEAK HOURS</span>
                  <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                    {financials.peakHoursLabel}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: '500' }}>
                    Account for <strong>{financials.peakHoursPercentage}</strong> of daily sales
                  </span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}