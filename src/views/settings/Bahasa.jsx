import React, { useState } from 'react';
import { Languages, Globe, Save } from 'lucide-react';

export default function Bahasa({ onSaveSuccess }) {
  // State untuk menyimpan pilihan bahasa aktif secara lokal
  const [selectedLang, setSelectedLang] = useState('id'); // 'id' = Indonesia, 'en' = Inggris

  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert(`Bahasa berhasil diubah ke: ${selectedLang === 'id' ? 'Bahasa Indonesia' : 'English'}. Sistem lokalisasi diaplikasikan!`);
    onSaveSuccess();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.2s ease-out', textAlign: 'left' }}>
      
      {/* Header Title */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Pengaturan Bahasa</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Pilih bahasa pengantar antarmuka sistem kasir, laporan finansial, dan interaksi analitis Brainy lu.</p>
      </div>

      {/* Form Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* BLOK KIRI: PILIHAN BAHASA */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Languages size={20} color="#006847" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Pilih Bahasa Antarmuka</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Opsi 1: Bahasa Indonesia */}
            <div 
              onClick={() => setSelectedLang('id')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
                borderRadius: '12px', border: selectedLang === 'id' ? '2px solid #006847' : '1px solid #E5E7EB',
                backgroundColor: selectedLang === 'id' ? '#E6F4EA' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '24px' }}>🇮🇩</span>
                <div>
                  <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>Bahasa Indonesia</strong>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Gunakan bahasa Indonesia standar untuk operasional penuh lokalan.</span>
                </div>
              </div>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #006847', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedLang === 'id' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#006847' }} />}
              </div>
            </div>

            {/* Opsi 2: Bahasa Inggris */}
            <div 
              onClick={() => setSelectedLang('en')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
                borderRadius: '12px', border: selectedLang === 'en' ? '2px solid #006847' : '1px solid #E5E7EB',
                backgroundColor: selectedLang === 'en' ? '#E6F4EA' : '#ffffff', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '24px' }}>🇺🇸</span>
                <div>
                  <strong style={{ fontSize: '14px', color: '#111827', display: 'block' }}>English (United States)</strong>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Apply standard English for globally aligned financial definitions and reports.</span>
                </div>
              </div>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #006847', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedLang === 'en' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#006847' }} />}
              </div>
            </div>

          </div>
        </div>

        {/* BLOK KANAN: PREVIEW & SAVE BUTTON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Globe size={18} color="#1E3A8A" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>Catatan Lokalisasi</h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>
              Perubahan bahasa ini akan langsung diaplikasikan ke seluruh perangkat kasir tablet, cetakan struk printer thermal, serta gaya analisis grafik keuangan di *dashboard* utama lu.
            </p>
          </div>

          <button 
            type="button"
            onClick={handleFormSubmit}
            style={{ width: '100%', padding: '14px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 104, 71, 0.2)' }}
          >
            <Save size={16} /> Terapkan Bahasa
          </button>
        </div>

      </div>
    </div>
  );
}