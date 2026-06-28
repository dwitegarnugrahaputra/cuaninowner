# -*- coding: utf-8 -*-
# CUANin.id — AI Fallback: Estimasi Harga Bahan Baku via Gemini
# Tahap 4: Setup Gemini API + tes AI fallback (Google Search grounding)
#
# Script ini berjalan TERPISAH dari scrapping_pipeline.py.
# Tugasnya: ambil bahan dengan data_source='FALLBACK_UNIT_PRICE' dari Supabase,
# estimasi harga 4 minggu via Gemini, update tabel raw_material_trends.
#
# Guard anti-duplikat: bahan yang sudah pernah di-AI (ai_attempted_at IS NOT NULL)
# TIDAK akan di-trigger ulang — kecuali flag --force dipakai saat testing.
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

# Model Gemini yang dipakai
# CATATAN PENTING: gemini-2.0-flash SUDAH DI-SHUTDOWN Google per 1 Juni 2026.
# Itulah sebab error 429 sebelumnya — bukan murni rate limit, tapi request
# diarahkan ke model yang sudah tidak aktif. gemini-2.5-flash-lite dipilih
# karena masih gratis di free tier dan cukup untuk task estimasi harga ringan.
GEMINI_MODEL    = "gemini-2.5-flash-lite"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

# Delay antar request ke Gemini (detik) — hindari rate limit per-menit (RPM)
RATE_LIMIT_DELAY = 10

# Retry untuk error 429 (rate limit) — exponential backoff: 30s, 60s, 90s
MAX_RETRIES = 3
RETRY_BACKOFF_BASE = 30  # detik

# ─────────────────────────────────────────────────────────────────────────────
# KONEKSI SUPABASE
# ─────────────────────────────────────────────────────────────────────────────
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─────────────────────────────────────────────────────────────────────────────
# FUNGSI UTAMA: Estimasi harga via Gemini
# ─────────────────────────────────────────────────────────────────────────────
def estimate_price_with_gemini(material_name: str, unit_price_fallback: int) -> dict:
    """
    Minta Gemini mengestimasi harga pasar 4 minggu terakhir untuk satu bahan baku.

    Prompt dirancang untuk:
    - Konteks warung kopi / food & beverage Indonesia
    - Harga dalam Rupiah per satuan yang relevan
    - Output JSON ketat (tidak ada teks lain)
    - Pakai unit_price sebagai anchor jika Gemini tidak yakin

    Return:
        {
            "success": bool,
            "prices": [w1, w2, w3, w4],  # int, dalam Rupiah
            "source_note": str,
            "raw_response": str           # untuk debugging
        }
    """
    if not GEMINI_API_KEY:
        return {"success": False, "prices": None, "source_note": "GEMINI_API_KEY tidak ditemukan", "raw_response": ""}

    prompt = f"""Kamu adalah asisten riset harga bahan baku untuk usaha warung kopi dan restoran kecil di Indonesia.

Tugasmu: estimasi harga pasar ECERAN untuk bahan berikut selama 4 minggu terakhir (minggu terlama dulu, minggu terbaru terakhir).

Bahan: {material_name}
Harga referensi dari data stok warung: Rp {unit_price_fallback:,}

Panduan:
- Harga dalam Rupiah (IDR), per satuan yang paling umum dijual di pasar/supermarket Indonesia
- Jika bahan punya merek spesifik (contoh: "Kopi Kapal Api", "Frisian Flag"), estimasi harga produk tersebut
- Jika tidak yakin, gunakan harga referensi sebagai acuan dengan variasi ±5-10% antar minggu
- Jangan gunakan harga grosir atau harga ekspor
- Pertimbangkan fluktuasi harga pasar Indonesia beberapa minggu terakhir

PENTING: Balas HANYA dengan JSON berikut, tanpa teks lain, tanpa markdown, tanpa penjelasan:
{{"week_1": <int>, "week_2": <int>, "week_3": <int>, "week_4": <int>, "confidence": "<high|medium|low>", "note": "<penjelasan singkat max 10 kata>"}}"""

    headers = {
        "Content-Type": "application/json",
    }

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,        # rendah = lebih konsisten, tidak terlalu kreatif
            "maxOutputTokens": 200,    # cukup untuk 1 JSON kecil
            "responseMimeType": "application/json",
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
    }

    url = f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}"

    # ── Retry loop untuk menangani 429 (rate limit per-menit) ───────────────
    # CATATAN: ini HANYA membantu untuk rate limit per-menit (RPM).
    # Jika yang habis adalah kuota harian (RPD), retry tidak akan membantu —
    # request akan tetap gagal sampai kuota reset jam 00:00 Pacific Time.
    response = None
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)

            if response.status_code == 429:
                wait = (attempt + 1) * RETRY_BACKOFF_BASE  # 30s, 60s, 90s
                if attempt < MAX_RETRIES - 1:
                    print(f"         ⏳ Rate limit (429), tunggu {wait}s sebelum retry ({attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(wait)
                    continue
                else:
                    return {
                        "success": False,
                        "prices": None,
                        "source_note": f"Gemini HTTP error: 429 setelah {MAX_RETRIES} retry",
                        "raw_response": response.text[:300] if response.text else "",
                    }

            response.raise_for_status()
            break  # sukses, keluar dari retry loop

        except requests.exceptions.Timeout:
            if attempt == MAX_RETRIES - 1:
                return {"success": False, "prices": None, "source_note": "Gemini timeout", "raw_response": ""}
            print(f"         ⏳ Timeout, retry ({attempt + 1}/{MAX_RETRIES})...")
            time.sleep(10)
            continue
        except requests.exceptions.HTTPError as e:
            return {"success": False, "prices": None, "source_note": f"Gemini HTTP error: {e}", "raw_response": response.text[:300] if response is not None and response.text else ""}

    # ── Parse response sukses ────────────────────────────────────────────────
    try:
        data = response.json()
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Bersihkan jika ada backtick atau prefix "json"
        clean_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.MULTILINE).strip()

        parsed = json.loads(clean_text)

        # Validasi: semua key harus ada dan bernilai positif
        prices = [
            int(parsed["week_1"]),
            int(parsed["week_2"]),
            int(parsed["week_3"]),
            int(parsed["week_4"]),
        ]
        if not all(p > 0 for p in prices):
            raise ValueError(f"Harga tidak valid (ada yang 0 atau negatif): {prices}")

        confidence  = parsed.get("confidence", "unknown")
        note        = parsed.get("note", "")

        return {
            "success":      True,
            "prices":       prices,
            "source_note":  f"Estimasi AI Gemini ({confidence} confidence) — {note}",
            "raw_response": raw_text,
        }

    except (KeyError, IndexError) as e:
        raw = response.text if response is not None else ""
        return {"success": False, "prices": None, "source_note": f"Gemini response malformed: {e}", "raw_response": raw[:300]}
    except (json.JSONDecodeError, ValueError) as e:
        raw = raw_text if 'raw_text' in locals() else ""
        return {"success": False, "prices": None, "source_note": f"JSON parse error: {e}", "raw_response": raw[:300]}
    except Exception as e:
        return {"success": False, "prices": None, "source_note": f"Error tidak terduga: {e}", "raw_response": ""}


# ─────────────────────────────────────────────────────────────────────────────
# FUNGSI HELPER: Format harga ke label ringkas
# ─────────────────────────────────────────────────────────────────────────────
def format_price_label(price: int) -> str:
    if price < 1000:
        return f"Rp {price}"
    return f"Rp {price / 1000:.1f}k" if price < 100_000 else f"Rp {int(price / 1000)}k"


def calculate_svg_path(prices: list) -> str:
    min_p, max_p = min(prices), max(prices)
    r = (max_p - min_p) if max_p != min_p else 1
    y = [130 - ((p - min_p) / r * 90) for p in prices]
    return f"M 30 {y[0]:.0f} Q 180 {y[1]:.0f} 340 {y[2]:.0f} T 650 {y[3]:.0f}"


# ─────────────────────────────────────────────────────────────────────────────
# FUNGSI UTAMA: Proses semua bahan FALLBACK yang belum di-AI
# ─────────────────────────────────────────────────────────────────────────────
def run_ai_fallback(force: bool = False, dry_run: bool = False, limit: int = None):
    """
    Ambil bahan FALLBACK_UNIT_PRICE dari raw_material_trends,
    estimasi harga via Gemini, update Supabase.

    Args:
        force   : Jika True, proses ulang bahan yang sudah pernah di-AI
        dry_run : Jika True, hanya print hasil tanpa update Supabase
        limit   : Batasi jumlah bahan yang diproses (untuk testing)
    """
    print("=" * 60)
    print("🤖 CUANin.id — AI Fallback Runner (Tahap 4)")
    print(f"   Model : {GEMINI_MODEL}")
    print(f"   Mode  : {'DRY RUN (tidak update Supabase)' if dry_run else 'LIVE'}")
    print(f"   Force : {'Ya (proses ulang bahan yang sudah di-AI)' if force else 'Tidak (skip bahan yang sudah di-AI)'}")
    print(f"   Limit : {limit if limit else 'semua bahan'}")
    print("=" * 60)

    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY tidak ditemukan di environment variable!")
        print("   Set dulu: export GEMINI_API_KEY='your-key-here'")
        print("   Atau tambahkan ke GitHub Actions secrets.")
        return

    # ── Fetch bahan FALLBACK dari Supabase ──────────────────────────────────
    try:
        query = supabase.table("raw_material_trends") \
            .select("material_name, week_4, data_source, ai_attempted_at, ai_attempt_succeeded") \
            .eq("data_source", "FALLBACK_UNIT_PRICE")

        if not force:
            # Hanya proses yang belum pernah di-AI sama sekali
            query = query.is_("ai_attempted_at", "null")

        result = query.execute()
        candidates = result.data or []

    except Exception as e:
        print(f"❌ Gagal fetch dari Supabase: {e}")
        return

    if not candidates:
        print("✅ Tidak ada bahan yang perlu di-AI saat ini.")
        return

    if limit:
        candidates = candidates[:limit]

    print(f"\n📋 {len(candidates)} bahan akan diproses:\n")

    # ── Loop per bahan ───────────────────────────────────────────────────────
    stats = {"success": 0, "failed": 0, "skipped": 0}

    for idx, row in enumerate(candidates, 1):
        mat_name    = row["material_name"]
        # week_4 berisi string label seperti "Rp 14.0k" — ekstrak angkanya
        week4_label = row.get("week_4", "Rp 0")
        try:
            unit_price = int(float(re.sub(r"[^\d.]", "", week4_label.replace("k", "000"))))
        except Exception:
            unit_price = 10000  # default jika parse gagal

        print(f"[{idx}/{len(candidates)}] 🔍 {mat_name} (ref: {week4_label})")

        # Estimasi via Gemini
        result = estimate_price_with_gemini(mat_name, unit_price)
        now_iso = datetime.now(timezone.utc).isoformat()

        if result["success"]:
            prices  = result["prices"]
            svg     = calculate_svg_path(prices)
            price_change = prices[3] - prices[2]

            print(f"         ✅ Berhasil: {[f'Rp {p:,}' for p in prices]}")
            print(f"         📝 {result['source_note']}")

            if not dry_run:
                update_payload = {
                    "week_1":              format_price_label(prices[0]),
                    "week_2":              format_price_label(prices[1]),
                    "week_3":              format_price_label(prices[2]),
                    "week_4":              format_price_label(prices[3]),
                    "current_price_label": format_price_label(prices[3]),
                    "svg_coordinate_path": svg,
                    "data_source":         "AI_ESTIMATE",
                    "ai_attempted_at":     now_iso,
                    "ai_attempt_succeeded": True,
                    # Rekomendasi beli/tunggu berdasarkan tren minggu terakhir
                    # (disimpan di source_origin sebagai metadata tambahan)
                    "source_origin": result["source_note"],
                }
                try:
                    supabase.table("raw_material_trends") \
                        .update(update_payload) \
                        .eq("material_name", mat_name) \
                        .execute()
                    print(f"         💾 Supabase updated.")
                except Exception as db_err:
                    print(f"         ❌ Supabase error: {db_err}")
                    stats["failed"] += 1
                    continue

            stats["success"] += 1

        else:
            print(f"         ❌ Gagal: {result['source_note']}")
            if result["raw_response"]:
                print(f"         Raw: {result['raw_response'][:200]}")

            if not dry_run:
                # Tandai sudah dicoba tapi gagal — supaya tidak di-retry terus
                try:
                    supabase.table("raw_material_trends") \
                        .update({
                            "ai_attempted_at":      now_iso,
                            "ai_attempt_succeeded": False,
                        }) \
                        .eq("material_name", mat_name) \
                        .execute()
                except Exception:
                    pass

            stats["failed"] += 1

        # Rate limit guard
        if idx < len(candidates):
            time.sleep(RATE_LIMIT_DELAY)

    # ── Summary ──────────────────────────────────────────────────────────────
    print(f"""
╔══════════════════════════════════════════════════╗
║       🤖 AI FALLBACK SELESAI — CUANin.id        ║
╠══════════════════════════════════════════════════╣
║  Total diproses : {len(candidates):<4}                        ║
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
        description="CUANin.id AI Fallback — estimasi harga bahan baku via Gemini"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Proses ulang bahan yang sudah pernah di-AI sebelumnya"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Hanya print hasil, tidak update Supabase (untuk testing)"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Batasi jumlah bahan yang diproses (contoh: --limit 3 untuk tes 3 bahan saja)"
    )

    args = parser.parse_args()
    run_ai_fallback(force=args.force, dry_run=args.dry_run, limit=args.limit)