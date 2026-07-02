# -*- coding: utf-8 -*-
# CUANin.id — Strategic Commodity Data Ingestion Pipeline
# Tahap 3: Dynamic material scraping dari raw_materials Supabase (global, lintas semua toko)
# ─────────────────────────────────────────────────────────────────────────────
import os
import yfinance as yf
import pandas as pd
import requests
import pymongo
from pymongo import MongoClient
from datetime import datetime
from supabase import create_client, Client

print("⚡ Memulai CUANin.id Strategic Commodity Data Ingestion...")

# ─────────────────────────────────────────────────────────────────────────────
# KONEKSI SUPABASE (dipakai di awal untuk fetch raw_materials & di akhir untuk upsert)
# ─────────────────────────────────────────────────────────────────────────────
supabase_url = os.environ.get("SUPABASE_URL", "https://qvuvnuhksxofyyzqzdse.supabase.co")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase_client: Client = create_client(supabase_url, supabase_key)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 0: FETCH SEMUA BAHAN BAKU UNIK DARI SUPABASE (GLOBAL, LINTAS SEMUA TOKO)
# Mengambil material_name + unit_price sebagai fallback harga jika sumber resmi
# tidak punya data untuk bahan tersebut.
# ─────────────────────────────────────────────────────────────────────────────
print("\n📦 Fetching daftar bahan baku dari Supabase raw_materials...")

all_materials = {}  # { "Minyak Goreng": avg_unit_price, ... }

try:
    # Ambil semua baris: material_name + unit_price
    response = supabase_client.table("raw_materials") \
        .select("material_name, unit_price") \
        .execute()

    rows = response.data or []
    if not rows:
        raise ValueError("Tidak ada data di tabel raw_materials.")

    # Agregasi: jika nama bahan sama muncul di banyak toko, rata-ratakan unit_price-nya
    price_accumulator = {}
    for row in rows:
        name = row["material_name"].strip()
        price = float(row["unit_price"] or 0)
        if name not in price_accumulator:
            price_accumulator[name] = []
        price_accumulator[name].append(price)

    for name, prices in price_accumulator.items():
        all_materials[name] = round(sum(prices) / len(prices))

    print(f"✅ Ditemukan {len(all_materials)} bahan baku unik: {list(all_materials.keys())}")

except Exception as e:
    print(f"❌ Gagal fetch raw_materials: {e}")
    print("⚠️ Fallback ke 5 bahan hardcode (mode darurat).")
    all_materials = {
        "Kopi Arabica": 185000,
        "Beras Premium": 76000,
        "Daging Ayam": 42000,
        "Gula Aren": 45000,
        "Fresh Milk": 22500,
    }

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: HYBRID DATA INGESTION
# Sumber resmi yang didukung:
#   A. Yahoo Finance  → Kopi Arabica (KC=F futures, konversi ke IDR)
#   B. Badan Pangan Nasional API → bahan pangan domestik (fuzzy match)
#
# Untuk bahan yang tidak cocok ke sumber manapun:
#   → data_source = 'FALLBACK_UNIT_PRICE'
#   → harga = unit_price dari raw_materials (dirata-rata lintas toko)
#   → 4 minggu dibuat flat (harga sama semua), karena tidak ada tren resmi
# ─────────────────────────────────────────────────────────────────────────────

# ── A. Yahoo Finance: Kopi Arabica ──────────────────────────────────────────
print("\n☕ Scraping Yahoo Finance untuk Kopi Arabica...")
kopi_historical_prices = None
try:
    df_coffee = yf.download("KC=F", start="2024-01-01")["Close"].dropna().reset_index()
    df_idr    = yf.download("IDR=X", start="2024-01-01")["Close"].dropna().reset_index()
    df_coffee.columns = ["Date", "Coffee_Price_USD"]
    df_idr.columns    = ["Date", "USD_IDR"]
    df_merged = pd.merge(df_coffee, df_idr, on="Date", how="inner")
    # Konversi: harga kopi per pon → per kg dalam IDR
    # 1 kontrak KC=F = 100 pon; 1 pon ≈ 0.453 kg
    df_merged["Coffee_Price_IDR"] = (
        (df_merged["Coffee_Price_USD"] / 100 * 2.20462) * df_merged["USD_IDR"]
    )
    kopi_historical_prices = df_merged["Coffee_Price_IDR"].tail(4).astype(int).tolist()
    print(f"   ✅ Kopi (Yahoo Finance): {kopi_historical_prices}")
except Exception as e:
    print(f"   ⚠️ Yahoo Finance gagal: {e}")
    kopi_historical_prices = None  # akan fallback ke unit_price nanti

# ── B. Badan Pangan Nasional API ─────────────────────────────────────────────
# Mapping: keyword → URL endpoint
# Fuzzy match dua arah: nama bahan di raw_materials di-check apakah mengandung
# salah satu keyword ini (atau sebaliknya).
BADAN_PANGAN_SOURCES = {
    "beras":       "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/beras-premium",
    "ayam":        "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/daging-ayam",
    "gula":        "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/gula-konsumsi",
    "minyak":      "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/minyak-goreng",
    "cabai merah": "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/cabai-merah-keriting",
    "cabai rawit": "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/cabai-rawit-merah",
    "bawang merah":"https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/bawang-merah",
    "bawang putih":"https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/bawang-putih",
    "telur":       "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/telur-ayam-ras",
    "tepung":      "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/tepung-terigu",
    "daging sapi": "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/daging-sapi-murni",
    "ikan":        "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/ikan-kembung",
    "susu":        "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/susu-kental-manis",
    "kedelai":     "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/kedelai-biji-kering",
    "jagung":      "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/jagung-pipilan-kering",
}

# Cache hasil fetch Badan Pangan supaya URL yang sama tidak di-hit dua kali
# jika ada beberapa bahan yang match ke keyword yang sama
badan_pangan_cache = {}  # { keyword: [w1, w2, w3, w4] or None }

def fetch_badan_pangan(keyword, url):
    """Fetch 4-week historical price dari Badan Pangan API untuk satu keyword."""
    if keyword in badan_pangan_cache:
        return badan_pangan_cache[keyword]
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            parsed = resp.json().get("historical_4_weeks", [])
            if len(parsed) == 4:
                badan_pangan_cache[keyword] = parsed
                return parsed
    except Exception:
        pass
    badan_pangan_cache[keyword] = None
    return None

def fuzzy_match_badan_pangan(material_name_lower):
    """
    Cari keyword Badan Pangan yang cocok secara fuzzy (dua arah .includes()).
    Return (keyword, url) pertama yang cocok, atau (None, None).
    """
    for keyword, url in BADAN_PANGAN_SOURCES.items():
        if keyword in material_name_lower or material_name_lower in keyword:
            return keyword, url
    return None, None

def fuzzy_match_kopi(material_name_lower):
    """Cek apakah bahan ini adalah varian kopi (untuk pakai data Yahoo Finance)."""
    kopi_keywords = ["kopi", "coffee", "arabica", "robusta", "espresso"]
    return any(k in material_name_lower for k in kopi_keywords)

# ─────────────────────────────────────────────────────────────────────────────
# RULE-BASED TREND ANALYSIS (analyzePriceTrend)
# Dipakai untuk bahan dengan data_source = 'OFFICIAL' (Yahoo Finance / Badan
# Pangan) sehingga Brainy tidak lagi hanya bilang "sumber data resmi", tapi
# benar-benar menjelaskan arah tren harga + rekomendasi beli/tunggu stok.
#
# Rule % perubahan dihitung dari titik pertama (Week 1) ke titik terakhir
# (Week 4), persis seperti spesifikasi yang sudah disepakati:
#   >= +8%        -> segera beli (tren naik tinggi)
#   +2% s/d +8%    -> beli bertahap
#   -2% s/d +2%    -> stabil, beli sesuai kebutuhan
#   -8% s/d -2%    -> bisa ditunda
#   <= -8%         -> waktu baik untuk beli banyak
#
# Untuk bahan dengan hasil AI (AI_ESTIMATE + ai_insight_text dari Gemini),
# insight AI tetap diprioritaskan — fungsi ini TIDAK menimpa data AI_ESTIMATE,
# hanya dipakai untuk OFFICIAL yang selama ini belum punya insight naratif.
# ─────────────────────────────────────────────────────────────────────────────
def analyze_price_trend(material_name, prices):
    """
    Analisis tren harga 4 minggu & hasilkan insight naratif + rekomendasi
    pembelian, mengikuti rule yang sama dengan analyzePriceTrend() Brainy.

    Args:
        material_name : nama bahan baku (untuk narasi)
        prices         : list 4 harga mingguan [w1, w2, w3, w4]

    Return:
        {
            "pct_change": float,      # persentase perubahan w1 -> w4
            "trend_label": str,       # "naik tajam" | "naik" | "stabil" | "turun" | "turun tajam"
            "insight_text": str,      # narasi 1-2 kalimat untuk ditampilkan di dashboard
            "recommendation": str,    # "BELI_SEGERA" | "BELI_BERTAHAP" | "SESUAI_KEBUTUHAN" | "BISA_DITUNDA" | "BELI_BANYAK"
        }
    """
    first, last = prices[0], prices[-1]
    pct_change = ((last - first) / first * 100) if first else 0.0

    if pct_change >= 8:
        trend_label = "naik tajam"
        recommendation = "BELI_SEGERA"
        insight_text = (
            f"Harga {material_name} naik tajam sebesar {pct_change:.1f}% dalam 4 minggu terakhir. "
            f"Segera lakukan pembelian stok karena tren kenaikan cukup tinggi sehingga berpotensi "
            f"meningkatkan biaya operasional apabila pembelian ditunda."
        )
    elif pct_change >= 2:
        trend_label = "naik"
        recommendation = "BELI_BERTAHAP"
        insight_text = (
            f"Harga {material_name} menunjukkan tren naik sebesar {pct_change:.1f}% dalam 4 minggu terakhir. "
            f"Mulai menambah stok secara bertahap agar tidak terdampak kenaikan harga berikutnya."
        )
    elif pct_change <= -8:
        trend_label = "turun tajam"
        recommendation = "BELI_BANYAK"
        insight_text = (
            f"Harga {material_name} turun tajam sebesar {abs(pct_change):.1f}% dalam 4 minggu terakhir. "
            f"Ini merupakan waktu yang baik untuk membeli stok dalam jumlah lebih besar karena harga sedang "
            f"berada pada tren penurunan."
        )
    elif pct_change <= -2:
        trend_label = "turun"
        recommendation = "BISA_DITUNDA"
        insight_text = (
            f"Harga {material_name} turun sebesar {abs(pct_change):.1f}% dalam 4 minggu terakhir. "
            f"Pembelian dapat ditunda apabila stok masih mencukupi karena harga masih memiliki peluang turun."
        )
    else:
        trend_label = "stabil"
        recommendation = "SESUAI_KEBUTUHAN"
        insight_text = (
            f"Harga {material_name} relatif stabil (perubahan {pct_change:+.1f}%) dalam 4 minggu terakhir. "
            f"Harga relatif stabil sehingga pembelian cukup dilakukan sesuai kebutuhan operasional."
        )

    return {
        "pct_change": round(pct_change, 2),
        "trend_label": trend_label,
        "insight_text": insight_text,
        "recommendation": recommendation,
    }


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 (LANJUTAN): Loop semua bahan, tentukan sumber data untuk tiap bahan
# ─────────────────────────────────────────────────────────────────────────────
print("\n🔍 Matching & fetching harga untuk setiap bahan baku...")

raw_ingested_database = {}
# Struktur: { material_name: { "historical_prices": [...], "source_origin": "...", "data_source": "..." } }

for material_name, avg_unit_price in all_materials.items():
    name_lower = material_name.lower()

    # ── Coba 1: Yahoo Finance (kopi) ────────────────────────────────────────
    if fuzzy_match_kopi(name_lower):
        if kopi_historical_prices:
            raw_ingested_database[material_name] = {
                "historical_prices": kopi_historical_prices,
                "source_origin": "Yahoo Finance API (ICE Futures)",
                "data_source": "OFFICIAL",
            }
            print(f"   ☕ {material_name} → Yahoo Finance")
            continue
        # Yahoo Finance gagal tapi nama kopi → fallback ke unit_price
        # (tidak ke Badan Pangan, karena Badan Pangan tidak punya harga kopi specialty)

    # ── Coba 2: Badan Pangan API (fuzzy match) ───────────────────────────────
    keyword, url = fuzzy_match_badan_pangan(name_lower)
    if keyword:
        prices = fetch_badan_pangan(keyword, url)
        if prices:
            raw_ingested_database[material_name] = {
                "historical_prices": prices,
                "source_origin": "Portal API Badan Pangan Nasional",
                "data_source": "OFFICIAL",
            }
            print(f"   🌾 {material_name} → Badan Pangan (keyword: '{keyword}')")
            continue
        else:
            print(f"   ⚠️  {material_name} → Badan Pangan '{keyword}' gagal/kosong, fallback unit_price")

    # ── Fallback: unit_price dari raw_materials ──────────────────────────────
    # Harga flat 4 minggu (tidak ada tren historis resmi).
    # Tandai data_source='FALLBACK_UNIT_PRICE' supaya Tahap 5 (AI) bisa memprioritaskan ini.
    flat_price = int(avg_unit_price) if avg_unit_price > 0 else 0
    raw_ingested_database[material_name] = {
        "historical_prices": [flat_price, flat_price, flat_price, flat_price],
        "source_origin": "Fallback: unit_price dari data stok warung",
        "data_source": "FALLBACK_UNIT_PRICE",
    }
    print(f"   📦 {material_name} → FALLBACK unit_price (Rp {flat_price:,}) — kandidat AI Tahap 5")

print(f"\n📊 Total bahan diproses: {len(raw_ingested_database)}")
official_count  = sum(1 for v in raw_ingested_database.values() if v["data_source"] == "OFFICIAL")
fallback_count  = len(raw_ingested_database) - official_count
print(f"   ✅ Sumber resmi : {official_count} bahan")
print(f"   📦 Fallback     : {fallback_count} bahan (akan di-AI Tahap 5)")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: MONGODB ATLAS STAGING
# Seluruh hasil ingestion disimpan ke MongoDB sebagai NoSQL staging layer
# sebelum dikirim ke Supabase Postgres.
# ─────────────────────────────────────────────────────────────────────────────
print("\n🗄️  Menyimpan ke MongoDB Atlas staging...")

mongo_uri = os.environ.get(
    "MONGODB_URI",
    "mongodb+srv://tegar_admin:TegarNugraha27@clustercuanin.ey49wzz.mongodb.net/?retryWrites=true&w=majority&appName=ClusterCuanin"
)

try:
    mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = mongo_client["cuan_in_bigdata"]
    collection = db["commodity_trends"]
    collection.delete_many({})

    docs_to_insert = []
    for mat_name, info in raw_ingested_database.items():
        docs_to_insert.append({
            "material_name": mat_name,
            "historical_prices": info["historical_prices"],
            "source_origin": info["source_origin"],
            "data_source": info["data_source"],
            "ingested_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })

    collection.insert_many(docs_to_insert)
    print(f"🚀 Staging OK: {len(docs_to_insert)} dokumen tersimpan ke MongoDB Atlas.")

except Exception as e:
    print(f"❌ MongoDB Error: {e}")
    print("⚠️  Pipeline lanjut tanpa staging MongoDB (data tetap dikirim ke Supabase).")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: FEATURE ENGINEERING (PANDAS)
# Baca dari MongoDB staging → hitung selisih harga, rekomendasi beli/tunggu
# ─────────────────────────────────────────────────────────────────────────────
print("\n⚙️  Feature engineering...")

try:
    data_from_db = list(collection.find())
    df_raw = pd.DataFrame(data_from_db).drop(columns=["_id"], errors="ignore")
except Exception:
    # MongoDB gagal → pakai dict langsung
    df_raw = pd.DataFrame([
        {
            "material_name": k,
            "historical_prices": v["historical_prices"],
            "source_origin": v["source_origin"],
            "data_source": v["data_source"],
        }
        for k, v in raw_ingested_database.items()
    ])

processed_list = []
for _, row in df_raw.iterrows():
    prices = row["historical_prices"]
    price_change = prices[3] - prices[2]

    # Rule-based trend analysis (analyzePriceTrend) — dipakai untuk narasi
    # insight & rekomendasi yang konsisten dengan rule 8%/2%/-2%/-8%.
    trend_result = analyze_price_trend(row["material_name"], prices)

    processed_list.append({
        "Bahan_Baku":     row["material_name"],
        "Week_1":         prices[0],
        "Week_2":         prices[1],
        "Week_3":         prices[2],
        "Week_4":         prices[3],
        "Selisih_Harga":  price_change,
        "Pct_Change":     trend_result["pct_change"],
        "Trend_Label":    trend_result["trend_label"],
        "Insight_Text":   trend_result["insight_text"],
        "Rekomendasi_AI": trend_result["recommendation"],
        "Sumber":         row["source_origin"],
        "data_source":    row["data_source"],
    })

df_prepared = pd.DataFrame(processed_list)
print(f"   ✅ {len(df_prepared)} baris siap dikirim ke Supabase.")

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4: MATHEMATICAL GEOMETRY + SUPABASE DELIVERY
# SVG path dihitung dari 4-point price history.
# Color di-generate otomatis dari hash nama bahan (tidak hardcode).
# data_source, ai_attempted_at, ai_attempt_succeeded juga di-upsert.
# ─────────────────────────────────────────────────────────────────────────────

def calculate_svg_geometry_path(price_history):
    """Hitung SVG cubic bezier path dari 4 titik harga."""
    min_p, max_p = min(price_history), max(price_history)
    price_range = (max_p - min_p) if max_p != min_p else 1
    y_coords = [130 - ((price - min_p) / price_range * 90) for price in price_history]
    return f"M 30 {y_coords[0]:.0f} Q 180 {y_coords[1]:.0f} 340 {y_coords[2]:.0f} T 650 {y_coords[3]:.0f}"

# Palet warna dinamis — generate dari hash nama bahan
# Supaya warna konsisten antar run meski bahan bertambah
FIXED_COLOR_MAP = {
    # Bahan lama (warna dipertahankan sama persis)
    "Kopi Arabica":   "#006847",
    "Beras Premium":  "#1E3A8A",
    "Daging Ayam":    "#7C3AED",
    "Gula Aren":      "#D97706",
    "Fresh Milk":     "#DC2626",
}

COLOR_PALETTE = [
    "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
    "#06B6D4", "#A855F7", "#22C55E", "#EAB308", "#3B82F6",
]

def get_color_for_material(name, index):
    """Ambil warna dari FIXED_COLOR_MAP jika ada; otherwise rotasi palet."""
    return FIXED_COLOR_MAP.get(name, COLOR_PALETTE[index % len(COLOR_PALETTE)])

def format_price_label(price):
    """Format harga ke string Rp ringkas untuk label chart."""
    if price < 1000:
        return f"Rp {price}"
    return f"Rp {price / 1000:.1f}k" if price < 100000 else f"Rp {int(price / 1000)}k"

def generate_short_code(name):
    """Generate kode 4-5 huruf dari nama bahan."""
    words = name.upper().split()
    if len(words) == 1:
        return words[0][:5]
    return "".join(w[0] for w in words)[:5]

print("\n📡 Mengirim data ke Supabase raw_material_trends...")

success_count = 0
error_count   = 0

for idx, row in df_prepared.iterrows():
    mat_name    = row["Bahan_Baku"]
    prices_arr  = [row["Week_1"], row["Week_2"], row["Week_3"], row["Week_4"]]
    svg_path    = calculate_svg_geometry_path(prices_arr)
    latest_price = row["Week_4"]
    color       = get_color_for_material(mat_name, idx)
    short_code  = generate_short_code(mat_name)

    payload = {
        "material_name":       mat_name,
        "hex_color":           color,
        "svg_coordinate_path": svg_path,
        "week_1":              format_price_label(row["Week_1"]),
        "week_2":              format_price_label(row["Week_2"]),
        "week_3":              format_price_label(row["Week_3"]),
        "week_4":              format_price_label(row["Week_4"]),
        "short_code":          short_code,
        "current_price_label": format_price_label(latest_price),
        # Kolom Tahap 1 (sudah ada di skema Supabase):
        "data_source":         row["data_source"],
        # ai_attempted_at dan ai_attempt_succeeded TIDAK di-reset di sini,
        # karena bisa jadi bahan ini sudah pernah di-AI di run sebelumnya.
        # Kolom itu hanya diupdate oleh Tahap 5 (AI fallback script).
    }

    # ── Insight tren untuk bahan OFFICIAL (Yahoo Finance / Badan Pangan) ────
    # Bahan AI_ESTIMATE TIDAK disentuh di sini — insight-nya murni dari Gemini
    # (ai_fallback.py) dan harus tetap diprioritaskan sesuai spesifikasi.
    # Bahan FALLBACK_UNIT_PRICE juga tidak diisi di sini karena masih flat
    # (belum ada tren nyata) dan menunggu giliran AI Tahap 5.
    if row["data_source"] == "OFFICIAL":
        payload["ai_insight_text"] = row["Insight_Text"]

    try:
        supabase_client.table("raw_material_trends") \
            .upsert(payload, on_conflict="material_name") \
            .execute()
        insight_tag = " 💡 insight tren" if row["data_source"] == "OFFICIAL" else ""
        print(f"   ✅ {mat_name} [{row['data_source']}]{insight_tag}")
        success_count += 1
    except Exception as db_err:
        print(f"   ❌ Error {mat_name}: {db_err}")
        error_count += 1

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
print(f"""
╔══════════════════════════════════════════════════════╗
║       🎉 PIPELINE RUN SELESAI — CUANin.id           ║
╠══════════════════════════════════════════════════════╣
║  Total bahan diproses : {len(raw_ingested_database):<4}                       ║
║  ✅ Berhasil ke Supabase : {success_count:<4}                    ║
║  ❌ Error Supabase       : {error_count:<4}                    ║
║  📊 Sumber resmi   : {official_count:<4}                       ║
║  📦 Fallback unit_price  : {fallback_count:<4} (antrean AI Tahap 5) ║
╚══════════════════════════════════════════════════════╝
""")