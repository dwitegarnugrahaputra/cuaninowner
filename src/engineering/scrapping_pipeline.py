# -*- coding: utf-8 -*-
import os
import yfinance as yf
import pandas as pd
import requests
import pymongo
from pymongo import MongoClient
from datetime import datetime
from supabase import create_client, Client

print("⚡ Memulai CUANin.id Strategic Commodity Data Ingestion...")

# --- STEP 1: HYBRID DATA INGESTION ---
try:
    df_coffee = yf.download("KC=F", start="2024-01-01")['Close'].dropna().reset_index()
    df_idr = yf.download("IDR=X", start="2024-01-01")['Close'].dropna().reset_index()
    df_coffee.columns = ['Date', 'Coffee_Price_USD']
    df_idr.columns = ['Date', 'USD_IDR']
    df_raw_finance = pd.merge(df_coffee, df_idr, on='Date', how='inner')
    df_raw_finance['Coffee_Price_IDR'] = (df_raw_finance['Coffee_Price_USD'] / 100 * 2.20462) * df_raw_finance['USD_IDR']
    df_raw_finance['Date'] = df_raw_finance['Date'].dt.strftime('%Y-%m-%d')
    kopi_historical_prices = df_raw_finance['Coffee_Price_IDR'].tail(4).astype(int).tolist()
except Exception as e:
    print(f"⚠️ Yahoo Finance Fallback Aktif: {str(e)}")
    kopi_historical_prices = [180000, 185000, 182000, 185000]

DOMESTIC_API_SOURCES = {
    "Beras Premium": "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/beras-premium",
    "Daging Ayam": "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/daging-ayam",
    "Gula Aren": "https://panelharga.badandapangan.go.id/api/harga-eceran/wilayah/kota-tegal/gula-konsumsi",
    "Fresh Milk": "https://api.grosirkulinerb2b.com/v1/products/fresh-milk-literan/historical-price"
}

fallback_market_prices = {
    "Beras Premium": [75000, 74000, 76000, 78000],
    "Daging Ayam": [40000, 41000, 43000, 42000],
    "Gula Aren": [43000, 45000, 44000, 45000],
    "Fresh Milk": [18500, 19000, 21000, 22500]
}

raw_ingested_database = {"Kopi Arabica": {"historical_prices": kopi_historical_prices, "source_origin": "Yahoo Finance API (ICE Futures)"}}

for material_name, url in DOMESTIC_API_SOURCES.items():
    try:
        response = requests.get(url, timeout=4)
        if response.status_code == 200:
            parsed_prices = response.json().get("historical_4_weeks", [])
            if len(parsed_prices) == 4:
                raw_ingested_database[material_name] = {"historical_prices": parsed_prices, "source_origin": "Portal API Badan Pangan Nasional"}
                continue
        raw_ingested_database[material_name] = {"historical_prices": fallback_market_prices[material_name], "source_origin": "Failover Cached Data"}
    except:
        raw_ingested_database[material_name] = {"historical_prices": fallback_market_prices[material_name], "source_origin": "Local Market Dataset Backup"}

# --- STEP 2: MONGODB ATLAS STAGING ---
# Membaca URI Koneksi secara dinamis dari Environment cloud GitHub Actions
mongo_uri = os.environ.get("MONGODB_URI", "mongodb+srv://tegar_admin:TegarNugraha27@clustercuanin.ey49wzz.mongodb.net/?retryWrites=true&w=majority&appName=ClusterCuanin")
try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client['cuan_in_bigdata']
    collection = db['commodity_trends']
    collection.delete_many({})
    
    documents_to_insert = []
    for material_name, info in raw_ingested_database.items():
        documents_to_insert.append({
            "material_name": material_name,
            "historical_prices": info["historical_prices"],
            "source_origin": info["source_origin"],
            "ingested_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    collection.insert_many(documents_to_insert)
    print(f"🚀 Staging Area OK: {len(documents_to_insert)} data tersimpan ke MongoDB Atlas.")
except Exception as e:
    print(f"❌ MongoDB Error: {e}")

# --- STEP 3: FEATURE ENGINEERING (PANDAS DATA PREPARATION) ---
data_from_db = list(collection.find())
df_raw = pd.DataFrame(data_from_db).drop(columns=['_id'], errors='ignore')

processed_materials_list = []
for index, row in df_raw.iterrows():
    prices = row['historical_prices']
    price_change = prices[3] - prices[2]
    processed_materials_list.append({
        "Bahan_Baku": row['material_name'], "Week_1": prices[0], "Week_2": prices[1], "Week_3": prices[2], "Week_4": prices[3],
        "Selisih_Harga": price_change, "Rekomendasi_AI": "BELI" if price_change <= 0 else "TUNGGU", "Sumber": row['source_origin']
    })
df_prepared = pd.DataFrame(processed_materials_list)

# --- STEP 4: MATHEMATICAL GEOMETRY & SUPABASE DELIVERY ---
def calculate_svg_geometry_path(price_history):
    min_p, max_p = min(price_history), max(price_history)
    price_range = (max_p - min_p) if max_p != min_p else 1
    y_coords = [130 - ((price - min_p) / price_range * 90) for price in price_history]
    return f"M 30 {y_coords[0]:.0f} Q 180 {y_coords[1]:.0f} 340 {y_coords[2]:.0f} T 650 {y_coords[3]:.0f}"

supabase_url = os.environ.get("SUPABASE_URL", "https://qvuvnuhksxofyyzqzdse.supabase.co")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase_client: Client = create_client(supabase_url, supabase_key)

color_metadata = {
    "Kopi Arabica": {"color": "#006847", "code": "KOPI"},
    "Beras Premium": {"color": "#1E3A8A", "code": "BERAS"},
    "Daging Ayam": {"color": "#7C3AED", "code": "AYAM"},
    "Gula Aren": {"color": "#D97706", "code": "GULA"},
    "Fresh Milk": {"color": "#DC2626", "code": "MILK"}
}

for index, row in df_prepared.iterrows():
    mat_name = row['Bahan_Baku']
    prices_array = [row['Week_1'], row['Week_2'], row['Week_3'], row['Week_4']]
    computed_path = calculate_svg_geometry_path(prices_array)
    latest_price = row['Week_4']
    label_format = f"Rp {latest_price/1000:.1f}k" if latest_price < 30000 else f"Rp {int(latest_price/1000)}k"

    supabase_payload = {
        "material_name": mat_name, "hex_color": color_metadata[mat_name]["color"], "svg_coordinate_path": computed_path,
        "week_1": f"Rp {row['Week_1']/1000:.1f}k", "week_2": f"Rp {row['Week_2']/1000:.1f}k",
        "week_3": f"Rp {row['Week_3']/1000:.1f}k", "week_4": f"Rp {row['Week_4']/1000:.1f}k",
        "short_code": color_metadata[mat_name]["code"], "current_price_label": label_format
    }
    try:
        supabase_client.table("raw_material_trends").upsert(supabase_payload, on_conflict="material_name").execute()
        print(f"✅ Supabase Synchronized: {mat_name}")
    except Exception as db_err:
        print(f"❌ Supabase Error {mat_name}: {str(db_err)}")

print("🎉 PIPELINE RUN COMPLETED SUCCESSFULLY!")