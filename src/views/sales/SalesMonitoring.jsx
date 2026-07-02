import React, { useState, useEffect } from 'react';
import { 
  Calendar, Download, TrendingUp, TrendingDown, AlertTriangle, 
  ArrowRight, Loader2, ChevronDown
} from 'lucide-react';

// Impor koneksi client Supabase resmi proyek cuanin.id
import { supabase } from '../../config/supabaseClient';

export default function SalesMonitoring() {
  // ================= STATE INTEGRASI DATABASE SUPABASE =================
  const [transactions, setTransactions] = useState([]);
  const [cashierPerformance, setCashierPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [summary, setSummary] = useState({
    todayRevenue: 0,
    totalTransactions: 0,
    voidAlerts: 0
  });

  // 🚀 LIVE STREAM FEEDS: Sinkronisasi data transaksi penjualan
  useEffect(() => {
    async function fetchSalesAndStaffData() {
      setIsLoading(true);
      try {
        // ✅ [MULTI-TENANT FIX] Ambil user_id owner yang sedang login lebih dulu
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) { setIsLoading(false); return; }

        // 1. Tarik Data Master Transaksi Penjualan - SINKRONISASI KOLOM JABATAN RELASIONAL (ANTI-ERROR)
        const { data: salesData, error: salesError } = await supabase
          .from('sales_transactions')
          .select(`
            id,
            invoice_number,
            customer_name,
            total_amount,
            payment_method,
            status,
            created_at,
            staff:served_by ( id, name, image_url, role_id )
          `)
          .eq('user_id', uid)
          .order('created_at', { ascending: false });

        if (salesError) throw salesError;

        if (salesData) {
          setTransactions(salesData);

          // 2. Kalkulasi Matematika Akuntansi Cards Induk
          const completedSales = salesData.filter(tx => tx.status === 'Completed' || tx.status === 'SUCCESS');
          const revenue = completedSales.reduce((sum, tx) => sum + Number(tx.total_amount || 0), 0);
          const voids = salesData.filter(tx => tx.status === 'VOID' || tx.status === 'Critical').length;

          setSummary({
            todayRevenue: revenue,
            totalTransactions: salesData.length,
            voidAlerts: voids
          });

          // 3. AGREGASI CASHIER PERFORMANCE
          const performanceMap = {};

          salesData.forEach(tx => {
            if (tx.staff) {
              const cashierId = tx.staff.id;
              const isCompleted = tx.status === 'Completed' || tx.status === 'SUCCESS';

              if (!performanceMap[cashierId]) {
                performanceMap[cashierId] = {
                  name: tx.staff.name,
                  avatar: tx.staff.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                  orderCount: 0,
                  totalRevenue: 0
                };
              }

              performanceMap[cashierId].orderCount += 1;
              if (isCompleted) {
                performanceMap[cashierId].totalRevenue += Number(tx.total_amount || 0);
              }
            }
          });

          const sortedRank = Object.values(performanceMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
          setCashierPerformance(sortedRank);
        }
      } catch (err) {
        console.error('⚠️ Gagal mensinkronisasikan data jualan di frontend:', err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSalesAndStaffData();
  }, []);

  // 📥 CORE EXPORT SPREADSHEET ENGINE (CSV & EXCEL BINARY BLOB)
  const handleExportDataStream = (formatType) => {
    if (transactions.length === 0) {
      alert('Katalog riwayat transaksi masih kosong, data apa yang mau diekspor, Gar?');
      return;
    }

    // Susun susunan baris header spreadsheet tabel
    const headers = ['Waktu', 'Nomor Invoice', 'Nama Kasir', 'Metode Pembayaran', 'Total Transaksi', 'Status Keamanan'];
    
    // Petakan baris data objek dari database Supabase
    const rows = transactions.map(tx => [
      new Date(tx.created_at).toLocaleString('id-ID'),
      tx.invoice_number,
      tx.staff ? tx.staff.name : 'General Staff',
      tx.payment_method || 'Cash',
      tx.total_amount,
      tx.status
    ]);

    const filename = `cuanin_sales_report_${new Date().toISOString().slice(0,10)}`;

    if (formatType === 'csv') {
      // === JALUR CSV GENERATOR ===
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (formatType === 'excel') {
      // === JALUR COMPATIBLE EXCEL SPREADSHEET (.XLS) GENERATOR VIA HTML TEMPLATE ===
      let excelTemplate = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
      excelTemplate += `<head><meta charset="utf-8"></head><body>`;
      excelTemplate += `<table border="1"><tr style="background-color: #006847; color: #ffffff; font-weight: bold;">`;
      
      headers.forEach(h => { excelTemplate += `<th>${h}</th>`; });
      excelTemplate += `</tr>`;
      
      rows.forEach(row => {
        excelTemplate += `<tr>`;
        row.forEach(cell => { excelTemplate += `<td>${cell}</td>`; });
        excelTemplate += `</tr>`;
      });
      
      excelTemplate += `</table></body></html>`;

      const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsExportDropdownOpen(false); // Tutup dropdown otomatis
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box', width: '100%', position: 'relative' }}>
      
      {/* SCREEN COVER LOADING */}
      {isLoading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#006847', gap: '8px' }}>
          <Loader2 size={18} className="animate-spin" /> <span>Sinkronisasi Live Feed Penjualan...</span>
        </div>
      )}

      {/* TITLE BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Sales Monitoring</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Real-time business insights for Warung Kopi Jaya</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', color: '#4B5563', fontWeight: 'bold' }}>
            <Calendar size={16} /> <span>Live Feed Stream</span>
          </div>
          
          {/* 🔥 DOUBLE CHOICE SELECTION DROPDOWN EXPORT BUTTON */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#10B981', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)' }}
            >
              <Download size={16} /> <span>Export Report</span> <ChevronDown size={14} />
            </button>

            {isExportDropdownOpen && (
              <div style={{ position: 'absolute', right: 0, marginTop: '6px', width: '160px', backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div onClick={() => handleExportDataStream('csv')} style={{ padding: '10px 16px', fontSize: '13px', color: '#374151', cursor: 'pointer', backgroundColor: '#fff', transition: 'background 0.2s', fontWeight: '600' }} onMouseEnter={(e)=>e.target.style.backgroundColor='#F3F4F6'} onMouseLeave={(e)=>e.target.style.backgroundColor='#fff'}>
                  📄 Format .CSV
                </div>
                <div onClick={() => handleExportDataStream('excel')} style={{ padding: '10px 16px', fontSize: '13px', color: '#006847', cursor: 'pointer', backgroundColor: '#fff', transition: 'background 0.2s', borderTop: '1px solid #F3F4F6', fontWeight: 'bold' }} onMouseEnter={(e)=>e.target.style.backgroundColor='#E6F4EA'} onMouseLeave={(e)=>e.target.style.backgroundColor='#fff'}>
                  📊 Format Excel (.XLS)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* METRIKS CARDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💵</div>
            <div style={{ backgroundColor: '#E6F4EA', color: '#006847', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={12}/> Live</div>
          </div>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Live Aggregate Revenue</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>
            Rp {summary.todayRevenue.toLocaleString('id-ID')}
          </h2>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ width: '36px', height: '36px', backgroundColor: '#EEF2FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '18px' }}>🧾</div>
          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Total Live Volume</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>
            {summary.totalTransactions} TXs
          </h2>
        </div>

        <div style={{ backgroundColor: summary.voidAlerts > 0 ? '#991B1B' : '#0B1530', padding: '24px', borderRadius: '16px', color: '#ffffff', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={20} color="#fff" /></div>
            <span style={{ backgroundColor: '#ffffff', color: summary.voidAlerts > 0 ? '#991B1B' : '#0B1530', fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px' }}>
              {summary.voidAlerts > 0 ? 'CRITICAL' : 'SECURE'}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#FFCACA', fontWeight: '500' }}>Void / Alert Records</span>
          <h2 style={{ margin: '4px 0 0 0', fontSize: '26px', fontWeight: 'bold' }}>{summary.voidAlerts} Alerts</h2>
        </div>
      </div>

      {/* LOWER WORKSPACE GRID MIX LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* LIVE TRANSACTION FEED */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Live Transaction Feed</h3>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#10B981', borderRadius: '50%' }} /> DATABASE CONNECTED
            </span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#9CA3AF', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 8px' }}>WAKTU</th>
                <th style={{ padding: '12px 8px' }}>INVOICE ID</th>
                <th style={{ padding: '12px 8px' }}>SERVED BY</th>
                <th style={{ padding: '12px 8px' }}>TOTAL AMOUNT</th>
                <th style={{ padding: '12px 8px', textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isVoid = tx.status === 'VOID' || tx.status === 'Critical';
                  const formattedTime = new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #F3F4F6', backgroundColor: isVoid ? '#FEF2F2' : 'transparent', color: isVoid ? '#991B1B' : '#111827' }}>
                      <td style={{ padding: '14px 8px', color: '#6B7280' }}>{formattedTime}</td>
                      <td style={{ padding: '14px 8px', fontWeight: '500' }}>{tx.invoice_number}</td>
                      <td style={{ padding: '14px 8px', fontWeight: '500', color: '#1E3A8A' }}>
                        {tx.staff ? tx.staff.name : 'General Staff'}
                      </td>
                      <td style={{ padding: '14px 8px', fontWeight: 'bold' }}>Rp {Number(tx.total_amount || 0).toLocaleString('id-ID')}</td>
                      <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                        <span style={{ backgroundColor: isVoid ? '#DC2626' : '#E6F4EA', color: isVoid ? '#ffffff' : '#006847', padding: '4px 12px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', minWidth: '65px' }}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>Belum ada riwayat transaksi jualan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CASHIER PERFORMANCE BOARD */}
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Cashier Performance Board</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cashierPerformance.length > 0 ? (
              cashierPerformance.map((cashier, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', padding: '12px', border: '1px solid #F3F4F6', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: i === 0 ? '#FEF3C7' : '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: i === 0 ? '#FBBF24' : '#9CA3AF' }}>
                      {i + 1}
                    </div>
                    <img src={cashier.avatar} alt={cashier.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e)=>{e.target.src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}} />
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#111827' }}>{cashier.name}</p>
                      <span style={{ fontSize: '10px', color: '#6B7280' }}>{cashier.orderCount} Struk Terbit</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#006847' }}>
                    Rp {cashier.totalRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', margin: '12px 0' }}>Belum ada omset kasir terdata minggu ini.</p>
            )}
          </div>
        </div>

      </div>

      {/* FRAUD PATTERN DETECTION WARNING */}
      {summary.voidAlerts > 0 && (
        <div style={{ backgroundColor: '#0B1530', borderRadius: '20px', padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', marginTop: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚠️ FRAUD ANALYTICS ALERT
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold' }}>Anomalous Pattern Detected!</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF', maxWidth: '520px' }}>
              Brainy POS berhasil mengidentifikasi {summary.voidAlerts} aktivitas janggal pada riwayat penutupan kasir. Segera lakukan peninjauan log data.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'conic-gradient(#DC2626 0% 65%, #1E293B 65% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#0B1530', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#EF4444' }}>65%</div>
              </div>
              <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Risk Score</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 'bold' }}>• Status: High Danger</span>
              <button style={{ backgroundColor: '#DC2626', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '12px 20px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <span>Investigate Pattern</span> <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}