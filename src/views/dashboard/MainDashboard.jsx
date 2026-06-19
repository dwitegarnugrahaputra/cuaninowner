import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, AlertTriangle, ChevronDown, 
  ChevronUp, Truck, Percent, BarChart3, ArrowRight
} from 'lucide-react';

// Impor koneksi client Supabase 
import { supabase } from '../../config/supabaseClient';

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

// 📊 HELPER: Susun rangkaian chart tren komoditas
function buildForecastSeries({ sortedDateKeys, dailyTotals, dailyAvg, growthRatePerDay, range }) {
  const ID_DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  if (range === 7) {
    const actualDaysToShow = 3;
    const projectedDaysToShow = 4;
    const series = [];
    const recentKeys = sortedDateKeys.slice(-actualDaysToShow);
    recentKeys.forEach(key => {
      const d = new Date(key);
      series.push({ label: ID_DAY_SHORT[d.getDay()], value: Math.round(dailyTotals[key]), isProjected: false });
    });
    let projectionBase = dailyAvg;
    const lastActualDate = sortedDateKeys.length > 0 ? new Date(sortedDateKeys[sortedDateKeys.length - 1]) : new Date();
    for (let i = 1; i <= projectedDaysToShow; i++) {
      projectionBase = projectionBase * (1 + growthRatePerDay);
      const futureDate = new Date(lastActualDate);
      futureDate.setDate(futureDate.getDate() + i);
      series.push({ label: ID_DAY_SHORT[futureDate.getDay()], value: Math.round(Math.max(0, projectionBase)), isProjected: true });
    }
    return series;
  }
  return [];
}

export default function Dashboard() {
  // State UI Internal
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('Kopi Arabica');
  const [isLoading, setIsLoading] = useState(true);

  // State Finansial Terkoneksi Real-time
  const [financials, setFinancials] = useState({
    totalSales: 4500000, // Data mock awal ter-render
    netProfit: 1850000,
    totalTransactions: 142,
    salesTrend: '+12%',
    profitTrend: '-2.4%',
    weeklySalesPath: 'M 0 60 Q 116 30 233 70 T 466 20 T 700 40',
    weeklyExpensesPath: 'M 0 80 Q 116 90 233 60 T 466 75 T 700 85',
    tableRows: [
      { day: 'Senin', sales: 650000, expenses: 320000 },
      { day: 'Selasa', sales: 710000, expenses: 340000 },
      { day: 'Rabu', sales: 580000, expenses: 310000 },
      { day: 'Kamis', sales: 820000, expenses: 400000 },
      { day: 'Jumat', sales: 950000, expenses: 450000 }
    ],
    monthLabel: 'JUNE 2026',
    grossRevenue: 4500000,
    cogs: 1800000,
    laborCosts: 500000,
    operatingExpenses: 350000,
    netProfitMarginLabel: 'Margin: 41%',
    brainyInsightText: "Brainy Insights: Omset lu lagi stabil, Gar. Tapi pantau pengadaan susu di pasar, ada indikasi naik minggu depan.",
    avgTransaction: 31690,
    avgTransactionTrend: '+4.2%',
    loyaltyRate: 68,
    loyaltyRateTrend: '+1.5%',
    peakHoursLabel: '13:00 – 16:30',
    peakHoursPercentage: '45%'
  });

  const [criticalStockCount, setCriticalStockCount] = useState(2);
  const [topMenus, setTopMenus] = useState([
    { menu_name: 'Es Kopi Susu Gula Aren', sold_count: 84, image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=100' },
    { menu_name: 'Caffe Latte', sold_count: 52, image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?q=80&w=100' },
    { menu_name: 'Croissant Bakar', sold_count: 31, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=100' }
  ]);
  
  const [rawTrendsFromDB, setRawTrendsFromDB] = useState([]);
  const [activeCurve, setActiveCurve] = useState({
    labelColor: '#006847',
    weeks: ['Rp 0', 'Rp 0', 'Rp 0', 'Rp 0'],
    numericWeeks: [42000, 43500, 41000, 45000], 
    bottomMetrics: { name: 'KPA', price: 'Rp 45.000' }
  });

  // 📝 DATA LINEAR GRAFIK BAHAN BAKU 
  const xCoords = [100, 240, 380, 520]; 
  const validPrices = activeCurve.numericWeeks.filter(p => p > 0);
  const rawMax = validPrices.length > 0 ? Math.max(...validPrices) : 100000;
  const rawMin = validPrices.length > 0 ? Math.min(...validPrices) : 10000;
  const priceRange = rawMax - rawMin;
  const scaleMax = rawMax + (priceRange * 0.1 || 5000);
  const scaleMin = Math.max(0, rawMin - (priceRange * 0.1 || 2000));
  const scaleRange = scaleMax - scaleMin;

  const yTopBoundary = 30;   
  const yBottomBoundary = 150; 
  const yGraphHeight = yBottomBoundary - yTopBoundary;

  const calculatedPoints = activeCurve.numericWeeks.map(price => {
    if (price <= 0 || scaleRange === 0) return yBottomBoundary;
    const ratio = (price - scaleMin) / scaleRange;
    return yBottomBoundary - (ratio * yGraphHeight);
  });

  const linePath = `M ${xCoords[0]} ${calculatedPoints[0]} L ${xCoords[1]} ${calculatedPoints[1]} L ${xCoords[2]} ${calculatedPoints[2]} L ${xCoords[3]} ${calculatedPoints[3]}`;

  const yLabels = [
    scaleMax,
    scaleMax - (scaleRange * 0.3333),
    scaleMax - (scaleRange * 0.6666),
    scaleMin
  ].map(num => `Rp ${Math.round(num).toLocaleString('id-ID')}`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box', width: '100%' }}>
      
      {/* SMART CARDS ROW SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CuaninLogoMini /></div>
            <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12}/> {financials.salesTrend}</div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>TOTAL PENJUALAN</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp {financials.totalSales.toLocaleString('id-ID')}</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>💵</div>
            <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingDown size={12}/> {financials.profitTrend}</div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>PROFIT BERSIH</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp {financials.netProfit.toLocaleString('id-ID')}</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📝</div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>JUMLAH TRANSAKSI</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{financials.totalTransactions.toLocaleString('id-ID')}</h2>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={18} /></div>
            <div style={{ backgroundColor: criticalStockCount > 0 ? '#DC2626' : '#059669', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>{criticalStockCount > 0 ? 'KRITIS' : 'AMAN'}</div>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>STOK KRITIS</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: criticalStockCount > 0 ? '#DC2626' : '#111827' }}>{criticalStockCount} Items</h2>
        </div>
      </div>

      {/* SALES VS EXPENSES GRAPH & BREAKDOWN PANEL */}
      <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
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
        <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <svg viewBox="0 0 700 100" style={{ width: '100%', height: '100px', overflow: 'visible' }}>
            <path d={financials.weeklySalesPath} fill="none" stroke="#006847" strokeWidth="3.5" />
            <path d={financials.weeklyExpensesPath} fill="none" stroke="#4F46E5" strokeWidth="3.5" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <span key={day}>{day}</span>)}
          </div>
        </div>

        {/* BREAKDOWN PANEL DETAIL MINGGUAN */}
        {isBreakdownOpen && (
          <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4B5563', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>📋 RINCIAN OPERASIONAL MINGGUAN (DATABASE)</span>
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

      {/* TOP SELLING MENU REALTIME */}
      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>⭐ Top Selling Menu (Top 3 Live)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {topMenus.map((menu, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #F3F4F6', padding: '12px', borderRadius: '14px', backgroundColor: '#F9FAFB' }}>
              <img src={menu.image_url} alt={menu.menu_name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
              <div>
                <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 'bold', color: '#111827' }}>{menu.menu_name}</p>
                <span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold' }}>{menu.sold_count} SOLD</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PORSI GRID SETENGAH (50% - 50%) STABIL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* BLOK LABA RUGI DARI DATABASE */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
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
              <span style={{ fontSize: '15px' }}>💡</span>
              <p style={{ margin: 0, lineHeight: '1.45' }}>{financials.brainyInsightText}</p>
            </div>
          </div>
        </div>

        {/* BOKS TREN HARGA BAHAN BAKU DENGAN LINEAR CHART GRAPH SVG */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div><span style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', display: 'block' }}>TREN HARGA BAHAN BAKU</span></div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select 
                value={selectedMaterial} 
                onChange={(e) => setSelectedMaterial(e.target.value)}
                style={{ padding: '6px 28px 6px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#374151', backgroundColor: '#FAFAFA', outline: 'none', cursor: 'pointer', appearance: 'none' }}
              >
                <option value="Kopi Arabica">KOPI ARABICA</option>
                <option value="Fresh Milk">FRESH MILK</option>
                <option value="Gula Aren">GULA AREN</option>
              </select>
              <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ width: '100%', position: 'relative', marginBottom: '10px', aspectRatio: '650 / 180' }}>
            <svg viewBox="0 0 650 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="75" y1="10" x2="75" y2="160" stroke="#9CA3AF" strokeWidth="1.5" />
              <g>
                <line x1="75" y1="30" x2="550" y2="30" stroke="#F3F4F6" strokeWidth="1" />
                <text x="65" y="34" fill="#6B7280" fontSize="10" fontWeight="bold" textAnchor="end">{yLabels[0]}</text>
                <line x1="75" y1="70" x2="550" y2="70" stroke="#F3F4F6" strokeWidth="1" />
                <text x="65" y="74" fill="#9CA3AF" fontSize="10" textAnchor="end">{yLabels[1]}</text>
                <line x1="75" y1="110" x2="550" y2="110" stroke="#F3F4F6" strokeWidth="1" />
                <text x="65" y="74" fill="#9CA3AF" fontSize="10" textAnchor="end">{yLabels[2]}</text>
                <line x1="75" y1="150" x2="550" y2="150" stroke="#F3F4F6" strokeWidth="1" />
                <text x="65" y="154" fill="#6B7280" fontSize="10" fontWeight="bold" textAnchor="end">{yLabels[3]}</text>
              </g>
              <path d={linePath} fill="none" stroke={activeCurve.labelColor} strokeWidth="3" />
              {xCoords.map((xVal, index) => (
                <circle key={index} cx={xVal} cy={calculatedPoints[index]} r="4" fill="#ffffff" stroke={activeCurve.labelColor} strokeWidth="2.5" />
              ))}
            </svg>
          </div>

          <div style={{ display: 'flex', fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', marginTop: '4px', paddingLeft: '75px', paddingRight: '100px', justifyContent: 'space-between', marginBottom: '16px' }}>
            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(w => <span key={w}>{w}</span>)}
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
            <span style={{ color: '#9CA3AF', fontWeight: 'bold', display: 'block', fontSize: '10px' }}>KOMODITAS: {activeCurve.bottomMetrics.name}</span>
            <span style={{ color: activeCurve.labelColor, marginTop: '2px', display: 'block', fontSize: '14px', fontWeight: 'bold' }}>{activeCurve.bottomMetrics.price} <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 'normal' }}>/ Kg</span></span>
          </div>
        </div>
      </div>

      {/* TRIPLE BOTTOM METRICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>📊 AVERAGE TRANSACTION</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Rp {financials.avgTransaction.toLocaleString('id-ID')}</h3>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>{financials.avgTransactionTrend} <span style={{ color: '#9CA3AF', fontWeight: '500' }}>vs last month</span></span>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>🧬 LOYALTY RATE</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{financials.loyaltyRate}%</h3>
          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>{financials.loyaltyRateTrend} <span style={{ color: '#9CA3AF', fontWeight: '500' }}>from new members</span></span>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>⏰ PEAK HOURS</span>
          <h3 style={{ margin: '6px 0 2px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{financials.peakHoursLabel}</h3>
          <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: '500' }}>Account for <strong>{financials.peakHoursPercentage}</strong> of daily sales</span>
        </div>
      </div>

    </div>
  );
}