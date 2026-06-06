import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, Calendar, Download, TrendingUp, 
  AlertTriangle, Shield, ArrowRight, MessageSquare 
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

export default function SalesMonitoring({ onNavigateView }) {
  const { logout } = useAuth();
  
  // Karena ini adalah file SalesMonitoring, maka view aktif internalnya adalah 'sales'
  const currentView = 'sales';

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* ================= 1. SIDEBAR KIRI (NAVIGASI DENGAN ANIMASI) ================= */}
      <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', marginBottom: '32px' }}>
          <CuaninLogoMini />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
            <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
          </div>
        </div>

        {/* Menu Items List dengan Implementasi Efek Animasi ON Mulus */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px' }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} />, target: 'dashboard' },
            { name: 'Sales', icon: <ShoppingBag size={18} />, target: 'sales' },
            { name: 'Stock', icon: <Archive size={18} />, target: 'stock' },
            { name: 'Menu Management', icon: <Menu size={18} />, target: 'menu' },
            { name: 'Staff Management', icon: <Users size={18} />, target: 'staff' }
          ].map((menu, idx) => {
            const isActive = currentView === menu.target;

            return (
              <div 
                key={idx} 
                onClick={() => onNavigateView(menu.target)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 16px', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  fontWeight: isActive ? 'bold' : '500',
                  backgroundColor: isActive ? '#006847' : 'transparent', 
                  color: isActive ? '#ffffff' : '#93C5FD',
                  
                  // --- KUNCI ANIMASI MICRO-INTERACTION TRANSISI ---
                  transition: 'all 0.3s ease-in-out',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {menu.icon} <span style={{ fontSize: '14px' }}>{menu.name}</span>
              </div>
            );
          })}
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
              <span style={{ fontSize: '10px', color: '#93C5FD', fontWeight: '500' }}>Merchant #8821</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN WORKSPACE KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOPBAR HEADER AREA (SUDAH DISINKRONKAN 100% DENGAN DASHBOARD & ICON MESSAGESQUARE) */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search analytics, financial reports, or menu items..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Tombol Ask Brainy Hijau Tua Lengkap Dengan Ikon Sesuai Request */}
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <MessageSquare size={16} /> Ask Brainy
            </button>
            
            <Bell size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            <HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            
            {/* Profil Data Identitas Alex Graham */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px' }}>
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

        {/* CONTEN CONTAINER VIEW (SCROLLABLE) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
          
          {/* TITLE & FILTER BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Sales Monitoring</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time insights for Warung Kopi Jaya</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', color: '#4B5563', fontWeight: 'bold' }}>
                <Calendar size={16} /> <span>Today, Oct 24</span>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>

          {/* THREE HEAD ROW SUMMARY CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.1fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💵</div>
                <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12}/> 12.5%</div>
              </div>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Today's Revenue</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>Rp 14.250.000</h2>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '18px' }}>🧾</div>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Total Transactions</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>342 TXs</h2>
              <span style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>⏰ Peak Hour: 12:00 - 13:00</span>
            </div>

            <div style={{ backgroundColor: '#991B1B', padding: '24px', borderRadius: '16px', color: '#ffffff', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={20} color="#fff" /></div>
                <span style={{ backgroundColor: '#ffffff', color: '#991B1B', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px', letterSpacing: '0.5px' }}>CRITICAL</span>
              </div>
              <span style={{ fontSize: '12px', color: '#FCA5A5', fontWeight: '500' }}>Void Alerts</span>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: 'bold' }}>4 Alerts</h2>
              <span style={{ fontSize: '11px', color: '#FCA5A5', display: 'block', marginTop: '6px' }}>Action required for Cashier #2</span>
            </div>
          </div>

          {/* LOWER SECTION LAYOUT MIX (FEED VS CASHIER TARGET) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Live Transaction Feed</h3>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>
                  <div style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }} /> LIVE UPDATING
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', fontWeight: 'bold' }}>
                    <th style={{ padding: '12px 8px' }}>TIME</th>
                    <th style={{ padding: '12px 8px' }}>TX ID</th>
                    <th style={{ padding: '12px 8px' }}>CASHIER</th>
                    <th style={{ padding: '12px 8px' }}>TOTAL (RP)</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                    <td style={{ padding: '14px 8px', color: '#6B7280' }}>14:45</td>
                    <td style={{ padding: '14px 8px', fontWeight: '500' }}>TX-90215</td>
                    <td style={{ padding: '14px 8px' }}>Andi S.</td>
                    <td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp 125.000</td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <span style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>SUCCESS</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: '#FEF2F2', color: '#991B1B' }}>
                    <td style={{ padding: '14px 8px', fontWeight: '500' }}>14:42</td>
                    <td style={{ padding: '14px 8px', fontWeight: 'bold', textDecoration: 'line-through' }}>TX-90212</td>
                    <td style={{ padding: '14px 8px', fontWeight: '500' }}>Dani P.</td>
                    <td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp 450.000</td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <span style={{ backgroundColor: '#DC2626', color: '#ffffff', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>VOID</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                    <td style={{ padding: '14px 8px', color: '#6B7280' }}>14:38</td>
                    <td style={{ padding: '14px 8px', fontWeight: '500' }}>TX-90211</td>
                    <td style={{ padding: '14px 8px' }}>Siti R.</td>
                    <td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp 82.500</td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <span style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>SUCCESS</span>
                    </td>
                  </tr>
                  <tr style={{ color: '#111827' }}>
                    <td style={{ padding: '14px 8px', color: '#6B7280' }}>14:30</td>
                    <td style={{ padding: '14px 8px', fontWeight: '500' }}>TX-90210</td>
                    <td style={{ padding: '14px 8px' }}>Andi S.</td>
                    <td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp 312.000</td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <span style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>SUCCESS</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Cashier Performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { rank: 1, name: 'Andi S.', orders: '128 ORDERS', sales: 'Rp 5.2M', color: '#FBBF24', bg: '#FEF3C7' },
                    { rank: 2, name: 'Siti R.', orders: '94 ORDERS', sales: 'Rp 3.8M', color: '#9CA3AF', bg: '#F3F4F6' },
                    { rank: 3, name: 'Dani P.', orders: '62 ORDERS', sales: 'Rp 2.1M', color: '#B45309', bg: '#FFEDD5' }
                  ].map((cashier, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', backgroundColor: cashier.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: cashier.color }}>
                          {cashier.rank}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{cashier.name}</p>
                          <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '500' }}>{cashier.orders}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: cashier.rank === 1 ? '#10B981' : '#111827' }}>{cashier.sales}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#111827', fontWeight: 'bold' }}>TEAM TARGET</span>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 'bold' }}>72%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{ width: '72%', height: '100%', backgroundColor: '#10B981', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: '#6B7280' }}>
                  <span>Rp 14.4M achieved</span>
                  <span>Rp 20M</span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER BANNER: AI FRAUD ANALYTICS ENGINE */}
          <div style={{ backgroundColor: '#0B1530', borderRadius: '20px', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={12} /> FRAUD ANALYTICS ENGINE
              </div>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', letterSpacing: '-0.3px' }}>Secure your business with AI</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF', maxWidth: '520px', lineHeight: '1.5' }}>
                Brainy is actively monitoring your transaction patterns for anomalies, double voids, and cashier fraud tendencies in real-time.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'conic-gradient(#10B981 0% 14%, #1E293B 14% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                  <div style={{ width: '50px', height: '50px', backgroundColor: '#0B1530', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                    14%
                  </div>
                </div>
                <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 'bold', letterSpacing: '0.3px' }}>Anomaly Score</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold', textAlign: 'right', display: 'block' }}>● Risk Detection: Active</span>
                <button style={{ backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span>Investigate Pattern</span> <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}