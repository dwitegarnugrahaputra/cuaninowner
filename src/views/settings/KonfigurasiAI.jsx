import React, { useState, useEffect } from 'react';
import { 
  Sliders, Eye, Brain, ShieldAlert, Zap, MessageSquare, Save, 
  Loader2, BellRing, Target, ShieldCheck, HelpCircle
} from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function KonfigurasiAI({ onSaveSuccess }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaveLoading] = useState(false);
  const [currentUid, setCurrentUserId] = useState(null);

  // 📐 STATE ENGINE: 100% Mengakomodasi 4 Pilar Kustomisasi Intelijen Lu
  const [aiProfile, setAiProfile] = useState({
    business_category: 'F&B (Makanan & Minuman)',
    business_scale: 'Mikro (1 Cabang, Stok Terbatas)',
    target_market: 'Mahasiswa & Pekerja Muda',
    ai_tone: 'Formal & Kaku (Laporan Korporat)',
    output_format: 'Rangkuman Teks & Poin Poin Penting',
    financial_level: 'Pemula (Istilah Sederhana: Untung Bersih)',
    low_stock_threshold: 5,
    anomali_threshold: 30,
    promo_weeks_threshold: 2,
    hide_supplier_cost: false,
    hide_customer_privacy: false
  });

  // 📥 RADAR PIPELINE: Muat konfigurasi kustomisasi AI dari database Supabase
  useEffect(() => {
    async function fetchAIConfig() {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          setIsLoading(false);
          return;
        }
        const uid = session.user.id;
        setCurrentUserId(uid);

        const { data, error } = await supabase
          .from('ai_config')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setAiProfile({
            business_category: data.business_category || 'F&B (Makanan & Minuman)',
            business_scale: data.business_scale || 'Mikro (1 Cabang, Stok Terbatas)',
            target_market: data.target_market || 'Mahasiswa & Pekerja Muda',
            ai_tone: data.ai_tone || 'Formal & Kaku (Laporan Korporat)',
            output_format: data.output_format || 'Rangkuman Teks & Poin Poin Penting',
            financial_level: data.financial_level || 'Pemula (Istilah Sederhana: Untung Bersih)',
            low_stock_threshold: data.low_stock_threshold || 5,
            anomali_threshold: data.anomali_threshold || 30,
            promo_weeks_threshold: data.promo_weeks_threshold || 2,
            hide_supplier_cost: !!data.hide_supplier_cost,
            hide_customer_privacy: !!data.hide_customer_privacy
          });
        }
      } catch (err) {
        console.error('⚠️ Gagal memuat parameter kecerdasan AI:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAIConfig();
  }, []);

  // 💾 ACTION PIPELINE: Kirim parameter mutlak menuju tabel data ai_config
  const handleSaveAIConfig = async (e) => {
    e.preventDefault();
    if (!currentUid) return;
    setIsSaveLoading(true);

    try {
      const payload = {
        user_id: currentUid,
        business_category: aiProfile.business_category,
        business_scale: aiProfile.business_scale,
        target_market: aiProfile.target_market,
        ai_tone: aiProfile.ai_tone,
        output_format: aiProfile.output_format,
        financial_level: aiProfile.financial_level,
        low_stock_threshold: Number(aiProfile.low_stock_threshold) || 5,
        anomali_threshold: Number(aiProfile.anomali_threshold) || 30,
        promo_weeks_threshold: Number(aiProfile.promo_weeks_threshold) || 2,
        hide_supplier_cost: aiProfile.hide_supplier_cost,
        hide_customer_privacy: aiProfile.hide_customer_privacy
      };

      const { error } = await supabase
        .from('ai_config')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      alert('Konfigurasi Brainy AI Intelligence Berhasil Diperbarui!');
      
      // Jalankan callback sukses dari TopBar/App jika terpasang
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert('Gagal menyimpan konfigurasi AI: ' + err.message);
    } finally {
      setIsSaveLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#006847', fontSize: '14px', fontWeight: 'bold' }}>
        <Loader2 size={16} className="animate-spin" />
        <span>Menyusun Parameter Algoritma Otomatisasi AI...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box', textAlign: 'left' }}>
      
      {/* HEADER UTAMA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Personalized AI Configuration</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Atur pilar kecerdasan, batas privasi data, dan pemicu otomasi proaktif Brainy AI.</p>
        </div>
      </div>

      <form onSubmit={handleSaveAIConfig} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* MIX WORKSPACE GRID LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* CONTAINER SEKTOR KIRI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* PILAR 1: PROFIL & KARAKTERISTIK BISNIS */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
                <Target size={18} color="#006847" /> 1. Profil & Karakteristik Bisnis
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Kategori Bisnis</label>
                  <select value={aiProfile.business_category} onChange={(e) => setAiProfile({...aiProfile, business_category: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                    <option value="F&B (Makanan & Minuman)">F&B (Makanan & Minuman)</option>
                    <option value="Retail Pakaian / Baju">Retail Pakaian / Baju</option>
                    <option value="Apotek / Medis">Apotek / Medis</option>
                    <option value="Minimarket / Toko Kelontong">Minimarket / Toko Kelontong</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Skala Usaha</label>
                  <select value={aiProfile.business_scale} onChange={(e) => setAiProfile({...aiProfile, business_scale: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                    <option value="Mikro (1 Cabang, Stok Terbatas)">Mikro (1 Cabang)</option>
                    <option value="Berkembang (2-5 Cabang, Omzet Menengah)">Berkembang (2-5 Cabang)</option>
                    <option value="Enterprise (Banyak Cabang, Inventaris Besar)">Enterprise (Skala Besar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Target Pasar Pelanggan Utama</label>
                <input type="text" required placeholder="Contoh: Mahasiswa, Pekerja Kantoran, Keluarga Muda Gen-Z" value={aiProfile.target_market} onChange={(e) => setAiProfile({...aiProfile, target_market: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* PILAR 2: GAYA ANALISIS & KOMUNIKASI AI */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
                <MessageSquare size={18} color="#1E3A8A" /> 2. Gaya Analisis & Komunikasi AI
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Bahasa & Tone Bicara</label>
                  <select value={aiProfile.ai_tone} onChange={(e) => setAiProfile({...aiProfile, ai_tone: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                    <option value="Formal & Kaku (Laporan Korporat)">Formal & Kaku (Laporan Resmi)</option>
                    <option value="Santai & Kasual Layaknya Teman Bisnis">Santai & Kasual (Bestie Vibe)</option>
                    <option value="Objektif & Fokus Pada Angka Saja">Objektif & Ringkas</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Preferensi Format Output</label>
                  <select value={aiProfile.output_format} onChange={(e) => setAiProfile({...aiProfile, output_format: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                    <option value="Rangkuman Teks & Poin Poin Penting">Rangkuman Teks & Poin-poin</option>
                    <option value="Dominan Tabel Angka Matriks">Dominan Tabel Angka Matriks</option>
                    <option value="Grafik Visual & Proyeksi">Grafik Visual & Proyeksi</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Level Keahlian Akuntansi Finansial</label>
                <select value={aiProfile.financial_level} onChange={(e) => setAiProfile({...aiProfile, financial_level: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#FAFAFA', cursor: 'pointer' }}>
                  <option value="Pemula (Istilah Sederhana: Untung Bersih)">Pemula (Istilah Umum: Untung Bersih, Modal Sisa)</option>
                  <option value="Profesional (Istilah Akuntansi: EBITDA, COGS, OpEx)">Profesional (Istilah Finansial: EBITDA, COGS, OpEx)</option>
                </select>
              </div>
            </div>

          </div>

          {/* CONTAINER SEKTOR KANAN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* PILAR 3: OTOMATISASI & PEMICU NOTIFIKASI (TRIGGER) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
                <BellRing size={18} color="#10B981" /> 3. Otomatisasi Proaktif AI
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563' }}>Stok Kritis (Low Stock Alert)</label>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#006847' }}>{aiProfile.low_stock_threshold} Hari</span>
                  </div>
                  <input type="range" min="2" max="15" value={aiProfile.low_stock_threshold} onChange={(e) => setAiProfile({...aiProfile, low_stock_threshold: e.target.value})} style={{ width: '100%', accentColor: '#006847', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563' }}>Sensitivitas Anomali Omset</label>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#006847' }}>{aiProfile.anomali_threshold}%</span>
                  </div>
                  <input type="range" min="10" max="60" value={aiProfile.anomali_threshold} onChange={(e) => setAiProfile({...aiProfile, anomali_threshold: e.target.value})} style={{ width: '100%', accentColor: '#006847', cursor: 'pointer' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563' }}>Trigger Promo Dead Stock</label>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#006847' }}>{aiProfile.promo_weeks_threshold} Minggu</span>
                  </div>
                  <input type="range" min="1" max="6" value={aiProfile.promo_weeks_threshold} onChange={(e) => setAiProfile({...aiProfile, promo_weeks_threshold: e.target.value})} style={{ width: '100%', accentColor: '#006847', cursor: 'pointer' }} />
                </div>
              </div>
            </div>

            {/* PILAR 4: BATASAN DATA & PRIVASI (GUARDRAILS) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
                <ShieldAlert size={18} color="#DC2626" /> 4. Guardrails & Privasi
              </h3>

              <div style={{ padding: '10px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', fontSize: '11.5px', color: '#991B1B', lineHeight: '1.4' }}>
                <strong>Akses Level Jabatan Terkunci Enkripsi:</strong> Akun staf kasir dibatasi otomatis oleh sistem. Staf kasir dilarang keras menanyakan total profit margin ke AI Brainy.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                  <input type="checkbox" checked={aiProfile.hide_supplier_cost} onChange={(e) => setAiProfile({...aiProfile, hide_supplier_cost: e.target.checked})} style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#006847' }} />
                  <span>Sembunyikan Harga Modal Supplier dari AI</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                  <input type="checkbox" checked={aiProfile.hide_customer_privacy} onChange={(e) => setAiProfile({...aiProfile, hide_customer_privacy: e.target.checked})} style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#006847' }} />
                  <span>Anonimkan Data Privasi HP Pelanggan</span>
                </label>
              </div>
            </div>

            {/* BUTTON ACTION SIMPAN UTUH */}
            <button 
              type="submit" 
              disabled={isSaving} 
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
                boxShadow: '0 4px 6px -1px rgba(0, 104, 71, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              <span>Simpan Parameter AI Master</span>
            </button>

          </div>

        </div>

      </form>
    </div>
  );
}