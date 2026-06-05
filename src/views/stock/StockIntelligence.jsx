import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, TrendingUp, AlertTriangle, ShoppingCart, 
  TrendingDown, FileText, Edit2, SlidersHorizontal, Download, MessageSquare,
  AlertCircle
} from 'lucide-react';

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

export default function StockIntelligence({ onNavigateView }) {
  const { logout } = useAuth();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#F8F9FA', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* ================= 1. SIDEBAR KIRI (NAVIGASI AKTIF STOCK) ================= */}
      <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', marginBottom: '32px' }}>
          <CuaninLogoMini />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
            <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>BUSINESS ASSISTANCE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px' }}>
          <div onClick={() => onNavigateView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <LayoutDashboard size={18} /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Dashboard</span>
          </div>
          <div onClick={() => onNavigateView('sales')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <ShoppingBag size={18} /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Sales</span>
          </div>
          {/* Menu Stock Aktif Hijau Tua */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#006847', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Archive size={18} /> <span style={{ fontSize: '14px' }}>Stock</span>
          </div>
          {[
            { name: 'Menu Management', icon: <Menu size={18}/>, target: 'menu' },
            { name: 'Staf Management', icon: <Users size={18}/>, target: 'staff' }
          ].map((menu, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }} onClick={() => onNavigateView(menu.target)}>
              {menu.icon} <span style={{ fontSize: '14px', fontWeight: '500' }}>{menu.name}</span>
            </div>
          ))}
        </div>

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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* TOPBAR HEADER AREA - FIXED & 100% KONSISTEN */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '450px' }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
            <input type="text" placeholder="Search stock, supplies, or reports..." style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '24px', fontSize: '13px', backgroundColor: '#F9FAFB', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Tombol Ask Brainy Hijau Tua Sesuai Standar Dashboard & Sales */}
            <button onClick={() => onNavigateView('chat')} style={{ backgroundColor: '#006847', color: '#fff', border: 'none', borderRadius: '24px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <MessageSquare size={16} /> Ask Brainy
            </button>
            
            <Bell size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            <HelpCircle size={20} color="#4B5563" style={{ cursor: 'pointer' }} />
            
            {/* Identitas User Alex Graham Standar */}
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

        {/* CONTAINER CONTENT VIEW (SCROLLABLE) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 100px 32px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
          
          {/* HEADER PAGE TITLE */}
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Stock Intelligence Hub</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time inventory insights and automated OCR processing.</p>
          </div>

          {/* THREE METRICS SUMMARY CARDS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {/* Card 1: Total Inventory Value */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📦</div>
                <span style={{ backgroundColor: '#E6F4EA', color: '#006847', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px' }}>+5.2%</span>
              </div>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Total Inventory Value (Rp)</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp 45.500.000</h2>
            </div>

            {/* Card 2: Critical Items Count */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><AlertTriangle size={18} /></div>
                <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px' }}>Action Needed</span>
              </div>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Critical Items (Count)</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>12 Items</h2>
            </div>

            {/* Card 3: Monthly Supply Spend */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#F3F4F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={18} color="#4B5563" /></div>
                <span style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '8px' }}>-1.5%</span>
              </div>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', display: 'block' }}>Monthly Supply Spend</span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Rp 12.300.000</h2>
            </div>
          </div>

          {/* LOWER TWO COLS MIX LAYOUT (TABLE VS RECENT LOGS) */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
            
            {/* LEFT CONTAINER: LIVE INVENTORY TABLE */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
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
                    <th style={{ padding: '12px 8px' }}>STATUS</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { nama: 'Houseblend Coffee Beans', kat: 'Coffee', stok: '15.5', unit: 'kg', stat: 'AMAN', color: '#E6F4EA', text: '#006847' },
                    { nama: 'Full Cream Milk (Dairy Fresh)', kat: 'Dairy', stok: '4.0', unit: 'Litre', stat: 'MENIPIS', color: '#FFF7ED', text: '#D97706', alert: true },
                    { nama: 'Palm Sugar Liquid', kat: 'Sweetener', stok: '0.5', unit: 'Litre', stat: 'HABIS', color: '#FEE2E2', text: '#DC2626', alert: true },
                    { nama: 'Oat Milk (Oatside)', kat: 'Dairy', stok: '12.0', unit: 'Litre', stat: 'AMAN', color: '#E6F4EA', text: '#006847' }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6', color: '#111827' }}>
                      <td style={{ padding: '14px 8px', fontWeight: 'bold', maxWidth: '180px' }}>{row.nama}</td>
                      <td style={{ padding: '14px 8px', color: '#6B7280' }}>{row.kat}</td>
                      <td style={{ padding: '14px 8px', fontWeight: 'bold', color: row.alert ? '#DC2626' : '#111827' }}>{row.stok}</td>
                      <td style={{ padding: '14px 8px', color: '#6B7280' }}>{row.unit}</td>
                      <td style={{ padding: '14px 8px' }}>
                        <span style={{ backgroundColor: row.color, color: row.text, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>{row.stat}</span>
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right', color: '#9CA3AF' }}><Edit2 size={14} style={{ cursor: 'pointer' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RIGHT CONTAINER: RECENT SUPPLY LOG (OCR ENGINE SEED) */}
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Recent Supply Log</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                {[
                  { vendor: 'Dairy Fresh Co.', desc: '24L Full Cream Milk', time: 'Just now • OCR Scan', isOcr: true },
                  { vendor: 'Bean Masters', desc: '10kg Houseblend', time: '2 hours ago • OCR Scan', isOcr: true },
                  { vendor: 'Gula Melaka Hub', desc: '5L Liquid Sugar', time: 'Yesterday • Manual Entry', isOcr: false }
                ].map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={16} color="#6B7280" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{log.vendor}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>{log.desc}</p>
                      <span style={{ fontSize: '10px', color: log.isOcr ? '#10B981' : '#9CA3AF', fontWeight: '500', display: 'block', marginTop: '2px' }}>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button style={{ width: '100%', padding: '10px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                View All Logs
              </button>
            </div>
          </div>

        </div>

        {/* ================= 3. FLOATING POP-UP: BRAINY PROACTIVE INSIGHT NOTE ================= */}
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 64px)', maxWidth: '640px', backgroundColor: '#111827', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', boxSizing: 'border-box', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold', letterSpacing: '0.5px', display: 'block' }}>BRAINY INSIGHT</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#E5E7EB' }}>Stock for Full Cream Milk is projected to run out in 3 days. Create restock draft?</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#E5E7EB', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Ignore</button>
            <button style={{ backgroundColor: '#10B981', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Confirm</button>
          </div>
        </div>

      </div>
    </div>
  );
}