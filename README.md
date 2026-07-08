# 🚀 CUAN.in – AI-Integrated POS Owner Dashboard

> **The Intelligent Business Command Center for Modern Merchants**

**CUAN.in Owner Dashboard** merupakan pusat kendali utama dari ekosistem **CUAN.in POS**, sebuah platform Point of Sales modern yang menggabungkan manajemen retail digital dengan *Artificial Intelligence* (AI). Aplikasi ini dirancang khusus untuk membantu pemilik usaha mengelola operasional outlet, memantau pengeluaran, mengotomatisasi pelacakan inventaris, serta memperoleh insight bisnis yang mendalam secara real-time.

---

## 🌐 CUAN.in Ecosystem

```
                 CUAN.in Ecosystem
                         │
                  Owner Dashboard ─── [Supabase Auth & DB]
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
      ▼                  ▼                  ▼
 Sales & Expenses   Brainy AI Chat     Data Engineering
 Monitoring App     (Consultant)       (Python Pipeline)
```

Setiap modul di dalam dashboard ini dirancang agar saling terintegrasi demi menyajikan visibilitas penuh terhadap kesehatan finansial dan operasional bisnis Anda tanpa harus berada di lokasi.

## ✨ Fitur Utama (Main Features)

### 📊 Centralized Business Dashboard & Monitoring

* **Main Dashboard:** Menyajikan metrik finansial krusial seperti total pendapatan, total transaksi, ringkasan performa penjualan harian, dan visualisasi grafik statistik secara real-time menggunakan recharts.
* **Sales Monitoring:** Pelacakan dan dokumentasi live feed untuk setiap transaksi penjualan yang masuk.
* **Expenses Management:** Pencatatan, kategorisasi, dan pengelolaan menyeluruh atas pengeluaran atau biaya operasional outlet untuk kalkulasi margin keuntungan bersih yang akurat.

### 🧠 Fitur Pintar Berbasis AI (AI-Powered Insights)

* **Stock Intelligence:** Manajemen stok tingkat lanjut dengan analisis prediktif untuk mendeteksi batas minimum barang (low stock alert) guna mencegah terjadinya kehabisan bahan baku.
* **BrainyChat (AI Assistant):** Asisten AI interaktif (didukung oleh Google Gen AI) yang tertanam langsung di aplikasi. Owner dapat berkonsultasi secara personal seputar performa toko, strategi marketing, maupun analisis tren bisnis.
* **Konfigurasi AI:** Menu pengaturan khusus untuk melakukan kustomisasi parameter AI agar sesuai dengan model bisnis spesifik outlet.

### ⚙️ Manajemen Operasional & Manajemen Cabang

* **Menu Management:** Kelola seluruh katalog produk, variasi menu, harga jual, serta ketersediaannya secara dinamis.
* **Staff Management:** Pengaturan hak akses, pendaftaran akun staf, dan monitoring performa kerja tim/karyawan.
* **Localization & Security:** Proteksi keamanan berlapis pada akun user (Security Settings) serta dukungan multi-bahasa yang fleksibel demi kenyamanan operasional.

### 🛠️ Data Engineering & Automated Pipeline

* **Scraping Pipeline:** Implementasi skrip otomatisasi untuk penarikan data eksternal guna memetakan tren komoditas pasar secara berkala.
* **Coffee Brand Pipeline:** Pipeline analitik khusus yang mengekstrak data pasar komoditas kopi ter-update demi akurasi penyesuaian harga menu dari hulu ke hilir.

## 🛠️ Tech Stack

### Frontend & UI

* **React.js 19 & Vite 8** – Framework antarmuka generasi terbaru yang sangat cepat dan responsif.
* **Tailwind CSS** – Kerangka kerja styling berbasis utility-first untuk desain modern.
* **Lucide React** – Koleksi ikon UI yang ringan dan konsisten.
* **Recharts** – Library chart komprehensif untuk visualisasi data analitik dashboard.
* **React Router Dom v7 & Context API** – Pengelolaan routing halaman modern dan manajemen global state (seperti autentikasi dan preferensi bahasa).

### Backend, AI & Automation

* **Supabase** – Layanan Backend-as-a-Service (BaaS) untuk penanganan real-time database relasional, manajemen storage, dan Session Autentikasi (Login / Register).
* **Google Gen AI (@google/genai)** – Integrasi Model AI mutakhir untuk menunjang engine utama dari fitur Brainy AI Assistant dan Stock Intelligence prediktif.
* **Python (Data Engineering)** – Skrip automasi berbasis Python memanfaatkan pustaka pengumpul data (BeautifulSoup / Selenium) untuk pipeline intelijen pasar.
* **GitHub Actions** – Penjadwalan alur pipeline berkala secara otomatis via CI/CD workflow (commodity_pipeline.yml).

## 📂 Struktur Repositori (Project Structure)

```
cuaninowner/
├── .github/workflows/       # CI/CD & Automasi Schedule Data Pipeline
├── public/                  # Ikon & Asset statis aplikasi global
└── src/
    ├── assets/              # Gambar & Grafis pendukung UI
    ├── components/shared/   # Komponen UI global (Sidebar, TopBar)
    ├── config/              # Inisialisasi & Konfigurasi Supabase Client
    ├── context/             # State Management (AuthContext & Language)
    ├── engineering/         # Modul Python (Scraping & Analisis Komoditas)
    ├── views/               # Direktori Halaman Utama Aplikasi:
    │   ├── ai-chat/         # BrainyChat AI Assistant View
    │   ├── auth/            # Halaman Login & Registrasi Akun Owner
    │   ├── dashboard/       # Dashboard Utama & Edit Profil
    │   ├── expenses/        # Manajemen Pengeluaran Finansial
    │   ├── menu/            # Pengelolaan Katalog Menu & Produk
    │   ├── sales/           # Monitoring Live Transaksi Kasir
    │   ├── settings/        # Konfigurasi AI, Bahasa, Keamanan & Outlet
    │   ├── staff/           # Manajemen Karyawan / Staf Outlet
    │   └── stock/           # Modul Prediktif Stock Intelligence
    ├── App.jsx              # Alur routing halaman global (React Router)
    └── main.jsx             # Entry point utama React Application
```

## 🚀 Memulai Pengembangan Lokal (Local Development)

**1. Kloning Repositori**

```bash
git clone https://github.com/dwitegarnugrahaputra/cuaninowner.git
cd cuaninowner
```

**2. Jalankan Aplikasi Frontend (React + Vite)**

Pastikan Node.js sudah terinstal di sistem Anda.

```bash
# Instalasi seluruh dependensi project
npm install

# Jalankan server lokal untuk development
npm run dev
```

Buka tautan lokal yang muncul pada terminal Anda (biasanya `http://localhost:5173`).

**3. Eksekusi Skrip Python (Data Engineering)**

Jika ingin melakukan pengujian penarikan data komoditas pasar secara manual dari lokal:

```bash
# Masuk ke direktori pipeline data
cd src/engineering

# Jalankan skrip pipeline scraping
python scrapping_pipeline.py
```

## 🔑 Variabel Lingkungan (Environment Variables)

Buat file `.env` pada direktori root proyek ini dan sesuaikan nilai dengan kredensial Anda:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
VITE_AI_SERVICE_URL=your_ai_brainy_endpoint
# Tambahkan API Key Google Gen AI untuk fungsionalitas LLM lokal
VITE_GEMINI_API_KEY=your_google_genai_api_key
```

## 📈 Status Perkembangan (Development Status)

| Modul / Fitur | Status | Deskripsi |
| --- | --- | --- |
| **Authentication & Supabase DB** | ✅ | Selesai (Sesi login & registrasi terproteksi) |
| **Main Dashboard & Profiling** | ✅ | Selesai (Penyajian grafik dengan Recharts & akumulasi finansial) |
| **Sales & Expenses Monitoring** | ✅ | Selesai (Pelacakan transaksi & pengeluaran operasional) |
| **Menu & Staff Management** | ✅ | Selesai (Modifikasi katalog menu dan akun karyawan) |
| **Stock Intelligence (AI)** | ✅ | Selesai (Prediksi manajemen inventori & low-stock alert via Google AI) |
| **Brainy AI Chat Assistant** | ✅ | Selesai (Asisten chatbot cerdas untuk konsultasi bisnis) |
| **Automated Data Pipeline** | ✅ | Selesai (Skrip scraping & integrasi GitHub Workflows) |

## 👨‍💻 Developer

**Dwi Tegar Nugraha Putra** | Informatics Student – Indonesia

## 📄 Lisensi

Hak Cipta © 2026 CUAN.in. Seluruh Hak Dilindungi Undang-Undang.