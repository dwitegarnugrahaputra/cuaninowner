import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, ShoppingBag, Archive, Menu, Users, Settings, 
  Search, Bell, HelpCircle, Plus, MessageSquare, Paperclip, Send,
  Calendar, Download, AlertCircle, Truck, DollarSign, BarChart3, ChevronRight,
  Sparkles, Clock, Rocket, ShieldAlert, ArrowUpRight
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
  const [activeTab, setActiveTab] = useState('forecast'); // Default diset ke forecast sesuai mockup baru lu
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    alert(`Fitur integrasi AI database belum terhubung. Pesan: "${chatInput}"`);
    setChatInput('');
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif', overflow: 'hidden', margin: 0, padding: 0 }}>
      
      {/* ================= SIDEBAR KIRI ================= */}
      <div style={{ width: '260px', backgroundColor: '#1E3A8A', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 24px', marginBottom: '32px' }}>
          <CuaninLogoMini />
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>cuanin.id</h2>
            <span style={{ fontSize: '9px', color: '#93C5FD', letterSpacing: '0.5px', fontWeight: 'bold' }}>POS INTELLIGENCE</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 16px' }}>
          <div onClick={() => onNavigateView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
            <LayoutDashboard size={18} /> <span style={{ fontSize: '14px', fontWeight: '500' }}>Dashboard</span>
          </div>
          {[
            { name: 'Sales', icon: <ShoppingBag size={18}/> },
            { name: 'Stock', icon: <Archive size={18}/> },
            { name: 'Menu Management', icon: <Menu size={18}/> },
            { name: 'Staf Management', icon: <Users size={18}/> }
          ].map((menu, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#93C5FD', borderRadius: '10px', cursor: 'pointer' }}>
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

      {/* ================= SECONDARY PANEL: HANYA MUNCUL JIKA CHAT AKTIF ================= */}
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

      {/* ================= WORKSPACE UTAMA KANAN ================= */}
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

        {/* ================= VIEW 1: TAB ASK BRAINY ================= */}
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

        {/* ================= VIEW 2: TAB INSIGHTS ================= */}
        {activeTab === 'insights' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>Business Intelligence Insights</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time analysis and strategic recommendations for your business.</p>
              </div>
            </div>
            {/* Box Konten Singkat Insights */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Ingredient Cost Distribution (Caffe Latte)</h3>
              <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Visualisasi data distribusi biaya bahan baku aktif.</div>
            </div>
          </div>
        )}

        {/* ================= VIEW 3: TAB FORECAST UTUH (image_d0e1de.png) ================= */}
        {activeTab === 'forecast' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Teks Utama */}
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>Future Forecast</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>AI-powered revenue projections and strategic growth insights for your business.</p>
            </div>

            {/* CARD MAIN: REVENUE FORECAST CHART */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Revenue Forecast</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>Projected revenue trend for the next 90 days</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: '500' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563' }}><div style={{ width: '10px', height: '10px', backgroundColor: '#006847', borderRadius: '50%' }} /> Current Trend</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4B5563' }}><div style={{ width: '12px', height: '0px', borderTop: '2px dashed #10B981' }} /> Projected Growth</span>
                  <select style={{ border: '1px solid #E5E7EB', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: '#4B5563', backgroundColor: '#FFF', fontWeight: '500', outline: 'none' }}>
                    <option>Next 3 Months</option>
                  </select>
                </div>
              </div>

              {/* BAR + LINE GRID HYBRID CHART MURNI CSS & SVG */}
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
                {/* SVG Proyeksi Garis Putus-putus Kenaikan */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
                  <line x1="330" y1="100" x2="680" y2="20" stroke="#10B981" strokeWidth="3" strokeDasharray="6,6" />
                  <circle cx="330" cy="100" r="4" fill="#006847" />
                </svg>
                {/* Label Garis Waktu Horisontal Bawah */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '11px', fontWeight: 'bold', color: '#9CA3AF', borderTop: '1px solid #E5E7EB', paddingTop: '10px', marginTop: '4px', textAlign: 'center' }}>
                  <span>Current (Oct)</span>
                  <span>November</span>
                  <span>December</span>
                  <span>January 2024</span>
                </div>
              </div>
            </div>

            {/* TWO SIDES COMPONENT ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Box Kiri: Inventory Demand Forecast */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>📋 Inventory Demand Forecast</h4>
                    <span style={{ backgroundColor: '#E6F4EA', color: '#006847', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.3px' }}>HIGH ACCURACY</span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>Coffee bean consumption is expected to spike during the holiday season.</p>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#006847' }}>+20% <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Stock increase recommended</span></h3>
                </div>
                <span style={{ fontSize: '13px', color: '#006847', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>Adjust Purchase Order <ArrowUpRight size={14} style={{ marginLeft: '4px' }} /></span>
              </div>

              {/* Box Kanan: Peak Hour Prediction */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>⏰ Peak Hour Prediction</h4>
                    <span style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '20px', letterSpacing: '0.3px' }}>NEXT WEEKEND</span>
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

            {/* LOWER CONTAINER: STRATEGIC OPPORTUNITIES ROW */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Strategic Opportunities</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>AI-driven suggestions to maximize your business potential</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Item Opportunity 1 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', border: '1px solid #F3F4F6', borderRadius: '12px', backgroundColor: '#F9FAFB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Rocket size={16} color="#006847" /></div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>Launch a seasonal promotion</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>Predicted 15% revenue lift by bundling winter specials.</p>
                    </div>
                  </div>
                  <button style={{ backgroundColor: '#006847', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Execute</button>
                </div>

                {/* Item Opportunity 2 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', border: '1px solid #F3F4F6', borderRadius: '12px', backgroundColor: '#F9FAFB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={16} color="#4F46E5" /></div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>Negotiate bulk discount for milk supplier</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>Your current volume qualifies for a 5% tier reduction.</p>
                    </div>
                  </div>
                  <button style={{ backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Review Contract</button>
                </div>

                {/* Item Opportunity 3 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', border: '1px solid #F3F4F6', borderRadius: '12px', backgroundColor: '#F9FAFB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#FFF7ED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={16} color="#EA580C" /></div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>Reduce evening operating hours</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>Low traffic between 9PM-10PM results in net loss for utilities.</p>
                    </div>
                  </div>
                  <button style={{ backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #E5E7EB', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Adjust Hours</button>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', color: '#006847', fontWeight: 'bold', cursor: 'pointer' }}>View all 12 opportunities</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}