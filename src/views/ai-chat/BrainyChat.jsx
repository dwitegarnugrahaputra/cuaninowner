import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, Plus, MessageSquare, Paperclip, Send,
  Calendar, Download, AlertCircle, Truck, DollarSign, BarChart3, ChevronRight,
  Clock, Rocket, ArrowUpRight
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

export default function BrainyChat({ onNavigateView }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('forecast'); // Default tab aktif saat dimuat
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    alert(`Fitur integrasi AI database belum terhubung. Pesan: "${chatInput}"`);
    setChatInput('');
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* ================= 1. SIDEBAR KIRI ================= */}
      <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', marginBottom: '32px' }}>
          <CuaninLogoMini />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
            <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>POS INTELLIGENCE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px' }}>
          {/* Tombol Dashboard (Bisa diklik balik ke dashboard utama) */}
          <div onClick={() => onNavigateView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <LayoutDashboard size={18} /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Dashboard</span>
          </div>

          {/* Tombol Sales Terhubung ke Halaman Sales Monitoring */}
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

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <Settings size={18} /> <span style={{ fontSize: '14px' }}>Settings</span>
          </div>
          <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#111827', borderRadius: '12px', marginTop: '12px', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1E3A8A', fontSize: '12px' }}>WJ</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p>
              <span style={{ fontSize: '10px', color: '#93C5FD', fontWeight: '500' }}>Branch: Jakarta South</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. SECONDARY PANEL: RECENT CHATS (HANYA JIKA TAB ASK BRAINY AKTIF) ================= */}
      {activeTab === 'ask-brainy' && (
        <div style={{ width: '280px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', padding: '24px 16px', boxSizing: 'border-box', flexShrink: 0, backgroundColor: '#FAFAFA' }}>
          <button style={{ width: '100%', padding: '12px', backgroundColor: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}>
            <Plus size={16} /> New Conversation
          </button>
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', marginBottom: '12px', display: 'block' }}>RECENT CHATS</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '12px', padding: '12px', backgroundColor: '#E6F4EA', borderRadius: '12px', cursor: 'pointer', border: '1px solid #C2E7CB' }}>
              <MessageSquare size={18} color="#006847" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>Analisis Profit Oct</p>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. WORKSPACE UTAMA KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA', overflow: 'hidden' }}>
        
        {/* TOPBAR SUB-NAVIGATION */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '100%' }}>
            <span onClick={() => setActiveTab('ask-brainy')} style={{ fontSize: '14px', fontWeight: activeTab === 'ask-brainy' ? 'bold' : '500', color: activeTab === 'ask-brainy' ? '#10B981' : '#6B7280', borderBottom: activeTab === 'ask-brainy' ? '2px solid #10B981' : 'none', padding: '24px 0', cursor: 'pointer' }}>Ask Brainy</span>
            <span onClick={() => setActiveTab('insights')} style={{ fontSize: '14px', fontWeight: activeTab === 'insights' ? 'bold' : '500', color: activeTab === 'insights' ? '#10B981' : '#6B7280', borderBottom: activeTab === 'insights' ? '2px solid #10B981' : 'none', padding: '24px 0', cursor: 'pointer' }}>Insights</span>
            <span onClick={() => setActiveTab('forecast')} style={{ fontSize: '14px', fontWeight: activeTab === 'forecast' ? 'bold' : '500', color: activeTab === 'forecast' ? '#10B981' : '#6B7280', borderBottom: activeTab === 'forecast' ? '2px solid #10B981' : 'none', padding: '24px 0', cursor: 'pointer' }}>Forecast</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '300px' }}>
              <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px' }} />
              <input type="text" placeholder="Search business metrics, reports, or ask B..." style={{ width: '100%', padding: '8px 14px 8px 38px', border: '1px solid #E5E7EB', borderRadius: '20px', fontSize: '13px', backgroundColor: '#F3F4F6', outline: 'none' }} />
            </div>
            <Bell size={20} color="#4B5563" />
            <HelpCircle size={20} color="#4B5563" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #E5E7EB', paddingLeft: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>Alex Graham</p>
                <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 'bold' }}>Admin</span>
              </div>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* ================= KONDISI VIEW A: TAB ASK BRAINY ================= */}
        {activeTab === 'ask-brainy' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: '#10B981', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '28px', color: '#fff' }}>🤖</span>
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>How can Brainy help you today?</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', textAlign: 'center', maxWidth: '420px', lineHeight: '1.5' }}>Ask me about your sales performance, inventory trends, or menu optimization.</p>
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1px solid #E5E7EB' }}>
              <form onSubmit={handleSendChat} style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '8px 16px', backgroundColor: '#F9FAFB' }}>
                <Paperclip size={20} color="#9CA3AF" style={{ marginRight: '12px' }} />
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Tanya sesuatu ke Brainy..." style={{ flex: 1, border: 'none', backgroundColor: 'transparent', fontSize: '14px', outline: 'none', padding: '10px 0' }} />
                <button type="submit" style={{ border: 'none', backgroundColor: '#10B981', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={16} fill="#fff" /></button>
              </form>
            </div>
          </div>
        )}

        {/* ================= KONDISI VIEW B: TAB INSIGHTS UTUH DENGAN GRAFIK ================= */}
        {activeTab === 'insights' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Business Intelligence Insights</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time analysis and strategic recommendations for your business.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>
                  <Calendar size={16} /> <span>Oct 1 - Oct 30, 2023</span>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <Download size={16} /> Export Report
                </button>
              </div>
            </div>

            {/* Donut Chart Component Row */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Ingredient Cost Distribution (Caffe Latte)</h3>
              <p style={{ margin: '4px 0 20px 0', fontSize: '13px', color: '#6B7280' }}>Comparing ingredient procurement costs against category profitability</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '80px', padding: '20px 0' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '50%', background: 'conic-gradient(#006847 0% 35%, #059669 35% 60%, #34D399 60% 80%, #A7F3D0 80% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '110px', height: '110px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold' }}>Total Cost</span>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>100%</h2>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Milk Cost', pct: '35.0% (Rp 21,350/L)', color: '#006847' },
                    { label: 'Coffee Beans', pct: '25.0% (Premium Blend)', color: '#059669' },
                    { label: 'Packaging & Other', pct: '20.0% (Cups, Sugar)', color: '#34D399' },
                    { label: 'Target Margin', pct: '20.0% (Calculated)', color: '#A7F3D0' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '3px', marginTop: '3px', flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#111827' }}>{item.label}</p>
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>{item.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Brainy Insight Message Box */}
            <div style={{ backgroundColor: '#E6F4EA', borderRadius: '16px', border: '1px solid #A7F3D0', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#006847', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <AlertCircle size={20} />
              </div>
              <div style={{ fontFamily: 'sans-serif', color: '#111827', fontSize: '14px', lineHeight: '1.6' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>Brainy's Analysis</h3>
                <p style={{ margin: '0 0 12px 0' }}>I've detected a significant anomaly in your procurement costs. Your latest delivery from <strong>Dairy Fresh Co.</strong> reflects a <span style={{ color: '#DC2626', fontWeight: 'bold' }}>15.5% increase</span> in the unit price of full-cream milk (Rp 18,500 → Rp 21,350 per liter).</p>
                <p style={{ margin: 0 }}>This has caused an immediate impact on your <em>"Coffee Selection"</em> category. Specifically, the margin for your best-selling <strong>Caffe Latte</strong> has dropped from 68% to 53%. If left unaddressed, this trend will result in a projected profit loss of <strong>Rp 4,200,000</strong> by the end of next month.</p>
              </div>
            </div>

            {/* Recommendation Action Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { title: 'Review Vendor Prices', desc: 'Compare current milk costs with three alternative local suppliers in the Jakarta South area.', action: 'View Alternatives', icon: <Truck size={22} color="#006847" /> },
                { title: 'Adjust Menu Pricing', desc: 'Recommended: Increase Caffe Latte price by Rp 2,000 to recover 12% of the lost margin.', action: 'Update Pricing', icon: <DollarSign size={22} color="#006847" /> },
                { title: 'Cost Breakdown', desc: "Deep dive into the per-ingredient cost analysis for all items in the 'Coffee Selection'.", action: 'View Details', icon: <BarChart3 size={22} color="#006847" /> }
              ].map((tile, i) => (
                <div key={i} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                  <div>
                    {tile.icon}
                    <h4 style={{ margin: '6px 0 6px 0', fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{tile.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>{tile.desc}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#006847', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>{tile.action} <ChevronRight size={14} /></span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= KONDISI VIEW C: TAB FORECAST UTUH ================= */}
        {activeTab === 'forecast' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>Future Forecast</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>AI-powered revenue projections and strategic growth insights for your business.</p>
            </div>

            {/* REVENUE FORECAST CHART CARD */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Revenue Forecast</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>Projected revenue trend for the next 90 days</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: '500' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563' }}><div style={{ width: '10px', height: '10px', backgroundColor: '#006847', borderRadius: '50%' }} /> Current Trend</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563' }}><div style={{ width: '12px', height: '0px', borderTop: '2px dashed #10B981' }} /> Projected Growth</span>
                </div>
              </div>

              <div style={{ position: 'relative', height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '20px' }}>
                <div style={{ display: 'flex', width: '60%', justifyContent: 'space-between', alignItems: 'flex-end', height: '100%', paddingRight: '20px', boxSizing: 'border-box' }}>
                  {[
                    { h: '70px', m: 'Current (Oct)' },
                    { h: '95px', m: '' },
                    { h: '110px', m: '' },
                    { h: '115px', m: 'November' },
                    { h: '105px', m: '' },
                    { h: '140px', m: '' }
                  ].map((bar, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '40px' }}>
                      <div style={{ width: '100%', height: bar.h, backgroundColor: '#006847', borderRadius: '6px 6px 0 0' }} />
                    </div>
                  ))}
                </div>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
                  <line x1="330" y1="100" x2="680" y2="20" stroke="#10B981" strokeWidth="3" strokeDasharray="6,6" />
                  <circle cx="330" cy="100" r="4" fill="#006847" />
                </svg>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '11px', fontWeight: 'bold', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', paddingTop: '10px', marginTop: '4px', textAlign: 'center' }}>
                  <span>Current (Oct)</span>
                  <span>November</span>
                  <span>December</span>
                  <span>January 2024</span>
                </div>
              </div>
            </div>

            {/* TWO SIDES DATA TILES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>📋 Inventory Demand Forecast</h4>
                    <span style={{ backgroundColor: '#E6F4EA', color: '#006847', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '20px' }}>HIGH ACCURACY</span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>Coffee bean consumption is expected to spike during the holiday season.</p>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#006847' }}>+20% <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Stock recommended</span></h3>
                </div>
                <span style={{ fontSize: '13px', color: '#006847', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Adjust Purchase Order <ArrowUpRight size={14} style={{ marginLeft: '4px' }} /></span>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>⏰ Peak Hour Prediction</h4>
                    <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '20px' }}>NEXT WEEKEND</span>
                  </div>
                  <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>Significant traffic increase predicted for Saturday morning brunch.</p>
                  <div style={{ display: 'flex', gap: '28px', borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 'bold' }}>START TIME</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>09:30 AM</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 'bold' }}>INTENSITY</span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#4F46E5' }}>Very High</p>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '13px', color: '#006847', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Optimize Staffing Schedule <ArrowUpRight size={14} style={{ marginLeft: '4px' }} /></span>
              </div>
            </div>

            {/* STRATEGIC OPPORTUNITIES LIST */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Strategic Opportunities</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>AI-driven suggestions to maximize your business potential</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { title: 'Launch a seasonal promotion', desc: 'Predicted 15% revenue lift by bundling winter specials.', icon: <Rocket size={16} color="#006847" />, label: 'Execute', bg: '#E6F4EA' },
                  { title: 'Negotiate bulk discount for milk supplier', desc: 'Your current volume qualifies for a 5% tier reduction.', icon: <DollarSign size={16} color="#4F46E5" />, label: 'Review Contract', bg: '#EEF2FF' },
                  { title: 'Reduce evening operating hours', desc: 'Low traffic between 9PM-10PM results in net loss for utilities.', icon: <Clock size={16} color="#EA580C" />, label: 'Adjust Hours', bg: '#FFF7ED' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', border: '1px solid #F3F4F6', borderRadius: '12px', backgroundColor: '#F9FAFB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '36px', height: '36px', backgroundColor: item.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{item.title}</h4>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>{item.desc}</p>
                      </div>
                    </div>
                    <button style={{ backgroundColor: idx === 0 ? '#006847' : '#ffffff', color: idx === 0 ? '#fff' : '#4B5563', border: idx === 0 ? 'none' : '1px solid #E5E7EB', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{item.label}</button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}