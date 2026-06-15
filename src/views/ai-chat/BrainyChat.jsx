import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../config/supabaseClient';
import { 
  Send, Bot, ArrowLeft, MessageSquare, Sparkles, Loader2,
  LayoutDashboard, ShoppingBag, Archive, Menu as MenuIcon, Users, Settings, LogOut, ChevronDown, Plus,
  Bell, HelpCircle, Search, TrendingUp, BarChart3, LineChart
} from 'lucide-react';

// Inisialisasi Engine Gemini dengan API Key murni milik Tegar
const ai = new GoogleGenAI({ apiKey: 'AIzaSyADXX9AkMETb7hcYCbWImyeFutbrkc3vrA' });

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

export default function BrainyChat({ onNavigateView }) {
  const { logout } = useAuth();
  
  // ⚡ SUB-TAB CONTROLLER BAR: 'ask-brainy' VS 'insights' VS 'forecast'
  const [activeSubTab, setActiveSubTab] = useState('ask-brainy');

  // State Manajemen Chat & Integritas AI
  const [messages, setMessages] = useState([
    { role: 'brainy', text: 'Halo Gar! Gua Brainy, asisten finansial AI internal cuanin.id. Ada yang bisa gua bantu pantau dari performa bisnis Warung Kopi Jaya hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dbSnapshot, setDbSnapshot] = useState('');
  const messagesEndRef = useRef(null);

  // State Kontrol Dropdown Sidebar Internal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-scroll ke chat paling bawah biar UX mulus
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // 📥 AUTOMATIC CONTEXT INJECTION PIPELINE (Makanan Otak Gemini)
  useEffect(() => {
    async function compileBusinessContext() {
      try {
        const { data: menus } = await supabase.from('menus').select('menu_name, price, is_available');
        const { data: staff } = await supabase.from('staff').select('name, role, status');
        const { data: sales } = await supabase.from('sales_transactions').select('total_amount, status, payment_method').limit(15);

        const menuStr = menus ? menus.map(m => `- ${m.menu_name}: Rp ${m.price} (${m.is_available ? 'Tersedia' : 'Habis'})`).join('\n') : 'Kosong';
        const staffStr = staff ? staff.map(s => `- ${s.name}: Role ${s.role} (${s.status})`).join('\n') : 'Kosong';
        
        let totalRevenue = 0;
        if (sales) {
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
            <div style={{ flex: 1, textAlign: 'left' }}><p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Warung Kopi Jaya</p><span style={{ fontSize: '10px', color: '#10B981', fontWeight: 'bold' }}>PREMIUM</span></div>
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
            <span style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px', display: 'block' }}>Active Stream</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN WORKSPACE KANAN ================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
        
        {/* ⚡ INTEGRATED UNIFIED TOP BAR LAYOUT (Persis Seperti Screenshot Lu) */}
        <div style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between', flexShrink: 0 }}>
          
          {/* SUB-TABS NAVIGATION INDICATORS */}
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

          {/* SEARCH COMPONENT & ACCOUNT PROFILE METRICS */}
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

        {/* SUB-VIEW AREA WRAPPER */}
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

          {/* ⚡ VIEW B: INSIGHTS LOG DATA TEMPLATE */}
          {activeSubTab === 'insights' && (
            <div style={{ padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={18} color="#10B981" /> AI Business Insights Log</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Deteksi tren penjualan otomatis berbasis historikal algoritma.</p>
                <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed #E5E7EB', borderRadius: '12px', marginTop: '20px', color: '#9CA3AF', fontStyle: 'italic' }}>
                  Pipeline visual grafik tren margin profit susu vs COGS sedang disinkronisasikan.
                </div>
              </div>
            </div>
          )}

          {/* ⚡ VIEW C: FORECAST PREDICTIVE NODE TEMPLATE */}
          {activeSubTab === 'forecast' && (
            <div style={{ padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}><LineChart size={18} color="#1E3A8A" /> AI Predictive Stock Forecast</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Proyeksi ketahanan stok bahan baku Warung Kopi Jaya untuk 7 hari ke depan.</p>
                <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed #E5E7EB', borderRadius: '12px', marginTop: '20px', color: '#9CA3AF', fontStyle: 'italic' }}>
                  Kalkulator matriks estimasi pemakaian komoditas biji kopi/susu aktif.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}