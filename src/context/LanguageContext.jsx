import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

// ============================================================
// LanguageContext.jsx
// Context global untuk bahasa aktif ('id' atau 'en') di seluruh dashboard.
// Dipasang SEKALI di App.jsx (membungkus seluruh aplikasi), lalu setiap
// komponen anak memanggil useLanguage() untuk mengambil teks terjemahan.
// ============================================================

const LanguageContext = createContext(undefined);

const STORAGE_KEY = 'cuanin_language';

export function LanguageProvider({ children }) {
  // Ambil bahasa tersimpan dari localStorage saat pertama load, default 'id'
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'id' ? saved : 'id';
  });

  // Setiap kali bahasa berubah, simpan ke localStorage agar tidak reset saat refresh
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === 'id' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  // Fungsi t('key') — mengambil teks sesuai bahasa aktif dari kamus translations.js.
  // Jika key tidak ditemukan, tampilkan key itu sendiri (memudahkan saat development:
  // langsung kelihatan key mana yang belum didaftarkan di kamus, tanpa membuat UI blank/error).
  const t = (key) => {
    const dict = translations[language] || translations.id;
    return dict[key] !== undefined ? dict[key] : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook yang dipanggil di tiap komponen: const { t, language, setLanguage } = useLanguage();
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage() harus dipanggil di dalam <LanguageProvider>. Pastikan App.jsx sudah dibungkus LanguageProvider.');
  }
  return context;
}