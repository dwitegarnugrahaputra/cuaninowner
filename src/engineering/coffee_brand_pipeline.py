# -*- coding: utf-8 -*-
# CUANin.id — Coffee Brand Comparison Pipeline
# Tahap Tambahan: Estimasi harga & skor kualitas brand biji kopi Indonesia via Gemini.
#
# Berbeda dengan scrapping_pipeline.py (yang men-scan SEMUA raw_materials milik user,
# per-bahan, per-outlet), script ini KHUSUS untuk satu use case spesifik:
# "brand biji kopi mana yang paling worth-it buat outlet beli?"
#
# Datanya GLOBAL (bukan spesifik ke stok satu outlet), makanya daftar brand di sini
# CURATED (dikurasi manual) — bukan dari raw_materials, karena brand kopi umum di
# Indonesia relatif tetap dan tidak tergantung apa yang dicatat tiap outlet di stok
# mereka masing-masing.
#
# Jalan TERPISAH dari scrapping_pipeline.py, idealnya di-schedule via cron/GitHub
# Actions yang sama (mis. mingguan), supaya data di tabel `coffee_brand_trends`
# tetap segar.
# ─────────────────────────────────────────────────────────────────────────────
import os
import re
import json
import time
import requests
import argparse
from datetime import datetime, timezone
from supabase import create_client, Client

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────────────────────
GEMINI_API_KEY  = os.environ.get("GEMINI_API_KEY")
SUPABASE_URL    = os.environ.get("SUPABASE_URL", "https://qvuvnuhksxofyyzqzdse.supabase.co")
SUPABASE_KEY    = os.environ.get("SUPABASE_KEY")

# CATATAN: sama seperti ai_fallback.py, gemini-2.0-flash sudah di-shutdown Google
# per 1 Juni 2026 — pakai gemini-2.5-flash-lite yang masih gratis di free tier.
GEMINI_MODEL    = "gemini-2.5-flash-lite"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

RATE_LIMIT_DELAY   = 10   # detik, jeda antar request Gemini (hindari rate limit RPM)
MAX_RETRIES         = 3
RETRY_BACKOFF_BASE  = 30  # detik (30s, 60s, 90s)

# ─────────────────────────────────────────────────────────────────────────────
# DAFTAR BRAND BIJI KOPI YANG DIBANDINGKAN (curated, umum tersedia di Indonesia)
# Silakan tambah/kurangi sesuai kebutuhan bisnis — daftar ini yang menentukan
# baris apa saja yang muncul di bar chart "Perbandingan Brand Biji Kopi" Dashboard.
# ─────────────────────────────────────────────────────────────────────────────
COFFEE_BRANDS = [
    "Kapal Api Biji Kopi Arabika",
    "ABC Kopi Bubuk Premium",
    "Excelso Coffee Beans",
    "Kopi Toraja Sapan",
    "Kopi Kenangan Signature Beans",
    "Aroma Coffee Bandung",
    "Fore Coffee Beans",
    "Kopi Luwak Liar",
]

# Warna tetap per brand supaya konsisten antar run (fallback ke rotasi palet
# kalau ada brand baru yang belum dipetakan manual)
FIXED_COLOR_MAP = {
    "Kapal Api Biji Kopi Arabika":     "#006847",
    "ABC Kopi Bubuk Premium":          "#1E3A8A",
    "Excelso Coffee Beans":            "#7C3AED",
    "Kopi Toraja Sapan":               "#D97706",
    "Kopi Kenangan Signature Beans":   "#DC2626",
    "Aroma Coffee Bandung":            "#0EA5E9",
    "Fore Coffee Beans":               "#10B981",
    "Kopi Luwak Liar":                 "#F59E0B",
}
COLOR_PALETTE = [
    "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
]

def get_color_for_brand(name, index):
    return FIXED_COLOR_MAP.get(name, COLOR_PALETTE[index % len(COLOR_PALETTE)])

# ─────────────────────────────────────────────────────────────────────────────
# KONEKSI SUPABASE
# ─────────────────────────────────────────────────────────────────────────────
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─────────────────────────────────────────────────────────────────────────────
# FUNGSI UTAMA: Estimasi harga & skor kualitas satu brand via Gemini
# (Google Search grounding diaktifkan supaya harga & reputasi brand lebih akurat
# ketimbang murni dari pengetahuan internal model.)
# ─────────────────────────────────────────────────────────────────────────────
def estimate_coffee_brand_with_gemini(brand_name: str) -> dict:
    """
    Return:
        {
            "success": bool,
            "price_per_kg": int,       # Rupiah per kg biji kopi
            "quality_score": int,      # 0-100, dari reputasi/ulasan/rating pasar
            "price_trend_pct": float,  # % perubahan harga estimasi 4 minggu terakhir
            "insight": str,            # 2-3 kalimat, untuk ditampilkan di Dashboard
            "source_note": str,
            "raw_response": str
        }
    """
    if not GEMINI_API_KEY:
        return {"success": False, "source_note": "GEMINI_API_KEY tidak ditemukan", "raw_response": ""}

    prompt = f"""Kamu adalah asisten riset pembelian bahan baku untuk usaha kafe/warung kopi di Indonesia.

Brand biji kopi yang dianalisis: {brand_name}

Tugasmu:
1. Estimasi harga pasar ECERAN saat ini untuk 1 kg biji kopi brand ini di Indonesia (Rupiah).
2. Beri skor kualitas 0-100 berdasarkan reputasi brand, rating pembeli, dan konsistensi mutu (bukan sekadar harga — brand murah tapi mutu bagus tetap bisa dapat skor tinggi).
3. Estimasi persentase perubahan harga brand ini dalam 4 minggu terakhir (boleh positif/negatif/mendekati 0 kalau stabil).
4. Tulis insight singkat (2-3 kalimat) yang membandingkan value brand ini secara umum — apakah worth-it dibeli untuk kafe kecil-menengah, dan kenapa.

Panduan:
- Harga dalam Rupiah (IDR) per kg, harga ECERAN (bukan grosir/ekspor)
- Kalau tidak yakin persis, berikan estimasi wajar berdasarkan segmen pasar brand tersebut (premium/menengah/ekonomis)
- Bahasa Indonesia, nada profesional dan netral

PENTING: Balas HANYA dengan JSON berikut, tanpa teks lain, tanpa markdown:
{{"price_per_kg": <int>, "quality_score": <int 0-100>, "price_trend_pct": <float>, "confidence": "<high|medium|low>", "insight": "<insight 2-3 kalimat>"}}"""

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        # 🔍 Google Search grounding — supaya Gemini bisa cek harga/reputasi riil
        # di web, bukan cuma menebak dari pengetahuan internal yang bisa basi.
        "tools": [{"google_search": {}}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 500,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
    }

    url = f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}"

    response = None
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=20)
            if response.status_code == 429:
                wait = (attempt + 1) * RETRY_BACKOFF_BASE
                if attempt < MAX_RETRIES - 1:
                    print(f"         ⏳ Rate limit (429), tunggu {wait}s sebelum retry ({attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(wait)
                    continue
                return {"success": False, "source_note": f"Gemini HTTP error: 429 setelah {MAX_RETRIES} retry", "raw_response": response.text[:300] if response.text else ""}
            response.raise_for_status()
            break
        except requests.exceptions.Timeout:
            if attempt == MAX_RETRIES - 1:
                return {"success": False, "source_note": "Gemini timeout", "raw_response": ""}
            print(f"         ⏳ Timeout, retry ({attempt + 1}/{MAX_RETRIES})...")
            time.sleep(10)
            continue
        except requests.exceptions.HTTPError as e:
            return {"success": False, "source_note": f"Gemini HTTP error: {e}", "raw_response": response.text[:300] if response is not None and response.text else ""}

    # ── Parse response ──────────────────────────────────────────────────────
    try:
        data = response.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        # Karena Google Search grounding aktif, responseMimeType JSON ketat tidak
        # selalu bisa dipaksakan — bersihkan kemungkinan markdown/backtick manual.
        clean_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.MULTILINE).strip()
        # Ambil blok JSON pertama kalau model menambahkan teks di luar JSON
        json_match = re.search(r"\{.*\}", clean_text, flags=re.DOTALL)
        if json_match:
            clean_text = json_match.group(0)

        parsed = json.loads(clean_text)

        price_per_kg    = int(parsed["price_per_kg"])
        quality_score   = max(0, min(100, int(parsed["quality_score"])))
        price_trend_pct = float(parsed.get("price_trend_pct", 0))
        confidence      = parsed.get("confidence", "unknown")
        insight         = parsed.get("insight", "").strip()

        if price_per_kg <= 0:
            raise ValueError(f"Harga tidak valid: {price_per_kg}")

        if not insight:
            insight = f"Estimasi harga dan kualitas {brand_name} berdasarkan analisis pasar umum, insight detail belum tersedia."

        return {
            "success":         True,
            "price_per_kg":    price_per_kg,
            "quality_score":   quality_score,
            "price_trend_pct": price_trend_pct,
            "source_note":     f"Estimasi AI Gemini + Google Search grounding ({confidence} confidence)",
            "insight":         insight,
            "raw_response":    raw_text,
        }

    except (KeyError, IndexError) as e:
        raw = response.text if response is not None else ""
        return {"success": False, "source_note": f"Gemini response malformed: {e}", "raw_response": raw[:300]}
    except (json.JSONDecodeError, ValueError) as e:
        raw = raw_text if 'raw_text' in locals() else ""
        return {"success": False, "source_note": f"JSON parse error: {e}", "raw_response": raw[:300]}
    except Exception as e:
        return {"success": False, "source_note": f"Error tidak terduga: {e}", "raw_response": ""}


# ─────────────────────────────────────────────────────────────────────────────
# FUNGSI UTAMA: Proses semua brand di COFFEE_BRANDS, upsert ke Supabase
# ─────────────────────────────────────────────────────────────────────────────
def run_coffee_brand_pipeline(dry_run: bool = False, limit: int = None):
    print("=" * 60)
    print("☕ CUANin.id — Coffee Brand Comparison Pipeline")
    print(f"   Model : {GEMINI_MODEL}")
    print(f"   Mode  : {'DRY RUN (tidak update Supabase)' if dry_run else 'LIVE'}")
    print(f"   Brand : {len(COFFEE_BRANDS)} brand dalam daftar curated")
    print("=" * 60)

    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY tidak ditemukan di environment variable!")
        return

    brands_to_process = COFFEE_BRANDS[:limit] if limit else COFFEE_BRANDS
    stats = {"success": 0, "failed": 0}

    for idx, brand_name in enumerate(brands_to_process, 1):
        print(f"\n[{idx}/{len(brands_to_process)}] 🔍 {brand_name}")
        result = estimate_coffee_brand_with_gemini(brand_name)
        now_iso = datetime.now(timezone.utc).isoformat()

        if result["success"]:
            print(f"         ✅ Rp {result['price_per_kg']:,}/kg | Skor: {result['quality_score']}/100 | Tren: {result['price_trend_pct']:+.1f}%")
            print(f"         💡 {result['insight']}")

            if not dry_run:
                payload = {
                    "brand_name":       brand_name,
                    "price_per_kg":     result["price_per_kg"],
                    "quality_score":    result["quality_score"],
                    "price_trend_pct":  result["price_trend_pct"],
                    "hex_color":        get_color_for_brand(brand_name, idx - 1),
                    "data_source":      "AI_ESTIMATE",
                    "insight_text":     result["insight"],
                    "source_origin":    result["source_note"],
                    "updated_at":       now_iso,
                }
                try:
                    supabase.table("coffee_brand_trends") \
                        .upsert(payload, on_conflict="brand_name") \
                        .execute()
                    print(f"         💾 Supabase updated.")
                    stats["success"] += 1
                except Exception as db_err:
                    print(f"         ❌ Supabase error: {db_err}")
                    stats["failed"] += 1
            else:
                stats["success"] += 1
        else:
            print(f"         ❌ Gagal: {result['source_note']}")
            if result.get("raw_response"):
                print(f"         Raw: {result['raw_response'][:200]}")
            stats["failed"] += 1

        if idx < len(brands_to_process):
            time.sleep(RATE_LIMIT_DELAY)

    print(f"""
╔══════════════════════════════════════════════════╗
║   ☕ COFFEE BRAND PIPELINE SELESAI — CUANin.id   ║
╠══════════════════════════════════════════════════╣
║  Total diproses : {len(brands_to_process):<4}                        ║
║  ✅ Berhasil    : {stats['success']:<4}                        ║
║  ❌ Gagal       : {stats['failed']:<4}                        ║
║  {'⚠️  DRY RUN — tidak ada yang disimpan ke Supabase' if dry_run else '💾 Data sudah tersimpan ke Supabase'}
╚══════════════════════════════════════════════════╝
""")


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="CUANin.id Coffee Brand Comparison Pipeline — estimasi harga & skor kualitas brand biji kopi via Gemini"
    )
    parser.add_argument("--dry-run", action="store_true", help="Hanya print hasil, tidak update Supabase")
    parser.add_argument("--limit", type=int, default=None, help="Batasi jumlah brand yang diproses (untuk testing)")

    args = parser.parse_args()
    run_coffee_brand_pipeline(dry_run=args.dry_run, limit=args.limit)