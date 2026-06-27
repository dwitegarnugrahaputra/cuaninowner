import React, { useState } from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Bahasa({ onSaveSuccess }) {
  const { language, setLanguage, t } = useLanguage();
  const [justSaved, setJustSaved] = useState(false);

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    setJustSaved(true);

    // Tampilkan konfirmasi singkat, lalu reset setelah 2 detik
    setTimeout(() => setJustSaved(false), 2000);

    if (onSaveSuccess) onSaveSuccess();
  };

  const languageOptions = [
    { code: 'id', flag: '🇮🇩', labelKey: 'language_option_id' },
    { code: 'en', flag: '🇬🇧', labelKey: 'language_option_en' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.2s ease-out', textAlign: 'left' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{t('language_page_title')}</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>{t('language_page_desc')}</p>
      </div>

      {/* Card pilihan bahasa */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Languages size={20} color="#006847" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>{t('language_page_title')}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {languageOptions.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelectLanguage(opt.code)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: '12px', cursor: 'pointer',
                  border: isSelected ? '1.5px solid #006847' : '1px solid #E5E7EB',
                  backgroundColor: isSelected ? '#E6F4EA' : '#ffffff',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '22px' }}>{opt.flag}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: isSelected ? '#006847' : '#111827' }}>{t(opt.labelKey)}</span>
                </div>
                {isSelected && (
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#006847', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#ffffff" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {justSaved && (
          <div style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: '#E6F4EA', color: '#006847', borderRadius: '8px', fontSize: '12.5px', fontWeight: 'bold', textAlign: 'center' }}>
            ✓ {t('language_saved_message')}
          </div>
        )}
      </div>

    </div>
  );
}