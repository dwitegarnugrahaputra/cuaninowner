# cuanin.id - Owner Command Center 🚀
> **Business Assistance & Smart POS Management Platform**

cuanin.id adalah platform Point of Sales (POS) modern yang diintegrasikan dengan kecerdasan buatan (AI) untuk membantu digitalisasi, otomatisasi inventori, serta pengawasan keamanan finansial bagi para pelaku usaha (Merchant PREMIUM). Repository **cuaninowner** ini merupakan modul khusus ring pusat kendali (Command Center) yang dirancang eksklusif untuk level hak akses **OWNER**.

---

## 🛠️ Main Features (Fitur Utama)

Aplikasi dashboard owner ini menggunakan arsitektur desentralisasi berbasis *Workspace Sub-View Changer* internal, sehingga owner dapat mengelola seluruh konfigurasi bisnis secara langsung tanpa interupsi navigasi:

*   📊 **Sales Monitoring & Real-time Live Feed:** Pantau metrik pendapatan harian, total transaksi, jam sibuk (*peak hours*), serta live feed transaksi kasir (Success vs Void) secara instan.
*   🧠 **AI Fraud Analytics Engine:** Proteksi otomatis bermesin AI untuk mendeteksi anomali pola transaksi kasir, tindakan *double voids*, dan indikasi kecurangan di lapangan secara real-time.
*   📦 **Stock Intelligence Hub & OCR Supplies Log:** Manajemen inventori cerdas mendeteksi bahan menipis, spend belanja bulanan, log restok otomatis berbasis pemindaian nota otomatis (OCR Scan), serta rekomendasi *Brainy Proactive Insight*.
*   👤 **Owner Profile Dropdown Panel:** Panel menu mengambang (*floating menu*) di hulu topbar kanan untuk akses kilat ke modul *Edit Profile* (Informasi Dasar Owner & Update Password), *Account Security*, dan *API Credentials*.
*   ⚙️ **Decentralized Internal Settings:** Sistem pengaturan modular internal langsung di dalam satu halaman kerja (Info Outlet, Konfigurasi Parameter Brainy AI, Keamanan Sistem, dan Pengaturan Bahasa).

---

## 💻 Tech Stack (Spesifikasi Teknologi)

*   **Frontend Library:** React.js (Functional Components & Hooks)
*   **Build Tool & Dev Server:** Vite
*   **Icons Framework:** Lucide React (Premium smooth vector icons)
*   **Context & State Management:** React Context API (Auth Context Engine)
*   **Styling Engine:** Inline JavaScript Styling object murni (Pixel-Perfect Responsive Layout)

---

## ⚙️ Installation & Local Development (Cara Menjalankan)

Ikuti langkah berikut untuk mereplikasi dan menjalankan project ini di komputer lokal lu, Gar:

1.  **Clone Repository:**
```bash
    git clone [https://github.com/dwitegarnugrahaputra/cuaninowner.git](https://github.com/dwitegarnugrahaputra/cuaninowner.git)
    cd cuaninowner
    ```

2.  **Install Dependencies:**
```bash
    npm install
    ```

3.  **Run Development Server:**
```bash
    npm run dev
    ```
    Buka browser lu dan akses URL lokal di: `http://localhost:5173`

---

## 📂 Project Directory Structure

```text
src/
├── context/
│   └── AuthContext.jsx       # Pintu keamanan otentikasi sesi global
├── views/
│   ├── dashboard/
│   │   ├── MainDashboard.jsx  # Dashboard utama rangkuman performa bisnis
│   │   └── EditProfile.jsx    # Form kelola profil owner & ubah kata sandi
│   ├── sales/
│   │   └── SalesMonitoring.jsx # Feed transaksi real-time & AI Fraud Analytics
│   ├── stock/
│   │   └── StockIntelligence.jsx # Pusat kendali inventori & AI Proactive Insight
│   └── settings/
│       ├── InfoOutlet.jsx    # Form desentralisasi data fisik merchant
│       ├── KonfigurasiAI.jsx # Setelan parameter respons AI Brainy POS
│       ├── Keamanan.jsx      # Panel regulasi kebijakan sekuritas
│       └── Bahasa.jsx        # Pengaturan lokalisasi bahasa sistem