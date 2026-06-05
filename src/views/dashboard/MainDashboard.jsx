import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, MessageSquare, TrendingUp, TrendingDown, AlertTriangle 
} from 'lucide-react';

// Logo cuanin.id versi mini murni CSS, presisi untuk Sidebar & Smart Cards
function CuaninLogoMini() {
  return (
    <div style={{
      width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '6px'
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

export default function MainDashboard({ onNavigateView }) {
  const { logout } = useAuth();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F3F4F6', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* ================= 1. SIDEBAR KIRI (NAVIGASI COKOK) ================= */}
      <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        
        {/* Header Branding Sidebar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', marginBottom: '32px' }}>
          <CuaninLogoMini />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
            <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
          </div>
        </div>

        {/* Menu Items List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px' }}>
          {/* Tombol Dashboard Aktif (Hijau) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#006847', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            <LayoutDashboard size={18} /> <span style={{ fontSize: '14px' }}>Dashboard</span>
          </div>
          
          {/* Tombol Sales Instan dengan Navigasi Dinamis */}
          <div onClick={() => onNavigateView('sales')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <ShoppingBag size={18} /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Sales</span>
          </div>

          {/* Sisa Menu Loop Otomatis */}
          {[
            { name: 'Stock', icon: <Archive size={18}/>, target: 'stock' },
            { name: 'Menu Management', icon: <Menu size={18}/>, target: 'menu' },
            { name: 'Staf Management', icon: <Users size={18}/>, target: 'staff' }
          ].map((menu, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }} onClick={() => onNavigateView(menu.target)}>
              {menu.icon} <span style={{ fontSize: '14px', fontWeight: '500' }}>{menu.name}</span>
            </div>
          ))}
        </div>

        {/* Footer Sidebar Profile Card */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <Settings size={18} /> <span style={{ fontSize: '14px' }}>Settings</span>
          </div>
          <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#111827', borderRadius: '12px', marginTop: '12px', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1E3A8A', fontSize: '12px' }}>WJ</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p>
              <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>PREMIUM</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN WORKSPACE KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOPBAR PROFILE & SEARCH AREA */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search analytics, financial reports, or menu items..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <MessageSquare size={16} /> Ask Brainy
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>Alex Graham</p>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>ADMINISTRATOR</span>
              </div>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '50%', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>

        {/* CONTAINER WORKSPACE ROLL DYNAMIC */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', boxSizing: 'border-box' }}>
          
          {/* SECTION A: SMART CARDS ROW SUMMARY MOCKUP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {/* Card 1: Total Penjualan */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CuaninLogoMini /></div>
                <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12}/> 12.5%</div>
              </div>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>TOTAL PENJUALAN</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp 12.450.000</h2>
            </div>

            {/* Card 2: Profit Bersih */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💵</div>
                <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingDown size={12}/> 4.2%</div>
              </div>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>PROFIT BERSIH</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp 3.120.000</h2>
            </div>

            {/* Card 3: Jumlah Transaksi */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', fontSize: '18px' }}>📝</div>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>JUMLAH TRANSAKSI</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>1.248</h2>
            </div>

            {/* Card 4: Stok Kritis Alert Badge */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={20} /></div>
                <div style={{ backgroundColor: '#DC2626', color: '#fff', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px' }}>KRITIS</div>
              </div>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', display: 'block' }}>STOK KRITIS</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>12 Items</h2>
            </div>
          </div>

          {/* SECTION B: ANALYTICS GRAPH (SALES VS EXPENSES MONITOR) */}
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Sales vs Expenses</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Visualisasi fluktuasi mingguan performa operasional</p>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#006847', borderRadius: '50%' }} /> Sales</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#4F46E5', borderRadius: '50%' }} /> Expenses</span>
              </div>
            </div>
            <div style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <svg viewBox="0 0 700 100" style={{ width: '100%', height: '100px', overflow: 'visible' }}>
                <path d="M 0 50 Q 116 20 233 40 T 466 20 T 700 30" fill="none" stroke="#006847" strokeWidth="4" />
                <path d="M 0 80 Q 116 60 233 75 T 466 55 T 700 65" fill="none" stroke="#4F46E5" strokeWidth="4" />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <span key={day}>{day}</span>)}
              </div>
            </div>
          </div>

          {/* SECTION C: TOP SELLING MENU ROW (TOP 3 LIST) */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>⭐ Top Selling Menu (Top 3)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { name: 'Kopi Susu Gula Aren', sold: '420 SOLD', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=150' },
                { name: 'Cafe Latte', sold: '315 SOLD', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=150' },
                { name: 'Avocado Toast', sold: '210 SOLD', img: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=150' }
              ].map((menu, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #F3F4F6', padding: '12px', borderRadius: '14px', backgroundColor: '#F9FAFB' }}>
                  <img src={menu.img} alt={menu.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{menu.name}</p>
                    <span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold' }}>{menu.sold}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION D: FINANCIAL DEEP DIVE BLOCK */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
            {/* Audited Profit Loss */}
            <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>LABA RUGI (AUDITED)</h3>
                <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>JULY 2026</span>
              </div>
              {[
                { label: 'Gross Revenue', val: 'Rp 12.450.000', color: '#111827' },
                { label: 'COGS (HPP)', val: '- Rp 4.350.000', color: '#DC2626' },
                { label: 'Labor Costs', val: '- Rp 2.500.000', color: '#DC2626' },
                { label: 'Operating Expenses', val: '- Rp 1.480.000', color: '#DC2626' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
                  <span style={{ color: '#6B7280', fontWeight: '500' }}>{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 'bold' }}>{row.val}</span>
                </div>
              ))}
              <div style={{ backgroundColor: '#E6F4EA', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#006847', fontWeight: 'bold' }}>NET PROFIT</span>
                  <p style={{ margin: 0, fontSize: '12px', color: '#006847', fontWeight: '500' }}>Margin: 33.1%</p>
                </div>
                <h3 style={{ margin: 0, color: '#006847', fontWeight: 'bold', fontSize: '20px' }}>Rp 4.120.000</h3>
              </div>
              {/* Smart Cards: Proactive Notification Insight Box */}
              <div style={{ backgroundColor: '#10B981', color: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.5', fontWeight: '500' }}><strong>Brainy Insights:</strong> Increasing 'Cafe Latte' margin by 5% could boost monthly net profit by Rp 450.000.</p>
              </div>
            </div>

            {/* Supply Price Trends Tracker */}
            <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>TREN HARGA BAHAN BAKU</h3>
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold' }}>KOPI ARABICA • SUSU • GULA AREN</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '40px 0', borderBottom: '1px solid #F3F4F6' }}>
                {[1, 2, 3].map((n) => <div key={n} style={{ borderTop: '1px dashed #E5E7EB', width: '100%' }} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', textAlign: 'center' }}>
                {[
                  { label: 'KOPI', val: 'Rp 185k' },
                  { label: 'BERAS', val: 'Rp 78k' },
                  { label: 'GULA', val: 'Rp 45k' },
                  { label: 'MILK', val: 'Rp 22.5k' },
                  { label: 'AYAM', val: 'Rp 42k' },
                ].map((b, i) => (
                  <div key={i}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold' }}>{b.label}</span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{b.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION E: CORE EXTRA SMART METRICS TILES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold' }}>🤝 AVERAGE TRANSACTION</span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>Rp 48.500 <span style={{ color: '#10B981', fontSize: '12px' }}>+4.2%</span></h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold' }}>💖 LOYALTY RATE</span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>64% <span style={{ color: '#10B981', fontSize: '12px' }}>+2.1%</span></h3>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold' }}>⏰ PEAK HOURS</span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>08:00 – 11:00 <span style={{ color: '#6B7280', fontSize: '11px' }}> (42% sales)</span></h3>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}