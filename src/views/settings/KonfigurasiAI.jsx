import React, { useState } from 'react';
import { Sliders, Eye, Brain, ShieldAlert, Zap, MessageSquare, Save } from 'lucide-react';

export default function KonfigurasiAI({ onSaveSuccess }) {
  // State untuk mengontrol parameter Brainy POS Engine
  const [fraudSensitivity, setFraudSensitivity] = useState(75);
  const [isAutoRestockEnabled, setIsAutoRestockEnabled] = useState(true);
  const [aiTone, setAiTone] = useState('Profesional & Analitis');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.2s ease-out', textAlign: 'left' }}>
      
      {/* Header Title */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Konfigurasi AI</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Sesuaikan parameter kecerdasan buatan Brainy untuk mengoptimalkan proteksi dan analisis bisnis lu.</p>
      </div>

      {/* Grid Layout Pengaturan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* BLOK KIRI: CORE ENGINE PARAMETERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Fraud Detection Engine */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldAlert size={20} color="#DC2626" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Fraud Analytics Engine</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>Sensitivitas Deteksi Anomali</label>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#006847' }}>{fraudSensitivity}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={fraudSensitivity} 
                  onChange={(e) => setFraudSensitivity(e.target.value)}
                  style={{ width: '100%', accentColor: '#006847', cursor: 'pointer' }} 
                />
                <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                  *Semakin tinggi sensitivitas, semakin ketat Brainy memantau double void, diskon mencurigakan, dan kecenderungan fraud kasir secara real-time.
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Inventory & Demand Forecasting */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Zap size={20} color="#006847" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Smart Inventory Automation</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: '#111827', display: 'block' }}>Proactive Restock Drafts</strong>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Otomatis buat draf pembelian ke vendor saat pasokan menipis.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={isAutoRestockEnabled}
                  onChange={() => setIsAutoRestockEnabled(!isAutoRestockEnabled)}
                  style={{ width: '18px', height: '18px', accentColor: '#006847', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* BLOK KANAN: PERSONALISASI CHATBOT & SAVE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 3: Brainy Persona */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <MessageSquare size={20} color="#1E3A8A" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Persona & Gaya Komunikasi</h3>
            </div>
            
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>Gaya Bahasa Ask Brainy</label>
              <select 
                value={aiTone} 
                onChange={(e) => setAiTone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                <option>Profesional & Analitis</option>
                <option>Santai & Humoris (Bestie Vibe)</option>
                <option>To-The-Point / Ringkas</option>
              </select>
            </div>
          </div>

          {/* FIX PERBAIKAN: Kode flexbox dan penutupan tag button sudah di-align dengan presisi */}
          <button 
            onClick={onSaveSuccess}
            style={{ 
              width: '100%', 
              padding: '14px', 
              backgroundColor: '#006847', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: '14px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              boxShadow: '0 4px 6px -1px rgba(0, 104, 71, 0.2)' 
            }}
          >
            <Save size={16} /> Simpan Konfigurasi AI
          </button>

        </div>

      </div>
    </div>
  );
}