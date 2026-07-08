import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, X, Save, Loader2, Receipt, TrendingDown, Calendar, Wallet
} from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

// 🏷️ Kategori OPEX standar untuk F&B/cafe kecil-menengah — bisa ditambah
// nanti kalau owner butuh kategori lain, tinggal extend array ini.
const EXPENSE_CATEGORIES = [
  'Sewa Tempat',
  'Listrik & Air',
  'Gaji & Bonus Staf',
  'Marketing & Promosi',
  'Peralatan & Maintenance',
  'Internet & Langganan',
  'Lainnya',
];

function formatRupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export default function ExpensesManagement() {
  const [ownerId, setOwnerId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    description: '',
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10), // yyyy-mm-dd untuk <input type="date">
  });

  // 📥 READ PIPELINE: Ambil riwayat pengeluaran milik owner yang login
  const fetchExpenses = async (uid) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        // 🔐 [KONSISTEN MULTI-TENANT] Sama seperti MenuManagement.jsx — filter
        // ketat berdasarkan pemilik akun. Kolom di tabel `expenses` ini bernama
        // `owner_user_id` (BUKAN `user_id` seperti tabel lain), mengikuti
        // konvensi yang sudah dipakai MainDashboard.jsx & BrainyChat.jsx saat
        // membaca data ini untuk perhitungan P&L.
        .eq('owner_user_id', uid)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      console.error('⚠️ Gagal memuat data pengeluaran:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('⚠️ Sesi login tidak ditemukan saat memuat Expenses Management.');
        setIsLoading(false);
        return;
      }
      setOwnerId(user.id);
      fetchExpenses(user.id);
    };
    init();
  }, []);

  // 📤 CREATE PIPELINE
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || Number(form.amount) <= 0) {
      alert('Isi nama pengeluaran dan nominal yang valid dulu, Gar!');
      return;
    }
    if (!ownerId) {
      alert('Sesi login tidak ditemukan, silakan login ulang.');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('expenses').insert([{
        owner_user_id: ownerId,
        description: form.description.trim(),
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.expense_date,
      }]);
      if (error) throw error;
      setForm({
        description: '',
        category: EXPENSE_CATEGORIES[0],
        amount: '',
        expense_date: new Date().toISOString().slice(0, 10),
      });
      setIsModalOpen(false);
      await fetchExpenses(ownerId);
    } catch (err) {
      alert('Gagal menyimpan pengeluaran: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ❌ DELETE PIPELINE
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Yakin mau hapus catatan pengeluaran ini secara permanen?')) return;
    try {
      const { data, error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', ownerId) // 🔐 guard kepemilikan, konsisten dengan tabel lain
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Tidak ada baris yang terhapus (atau data ini bukan milik akun Anda).');
      await fetchExpenses(ownerId);
    } catch (err) {
      alert('Gagal menghapus pengeluaran: ' + err.message);
    }
  };

  // 📊 Ringkasan cepat: total bulan berjalan + total keseluruhan
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const totalThisMonth = expenses
    .filter(exp => (exp.expense_date || '').startsWith(currentMonthKey))
    .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const totalAllTime = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={24} color="#006847" /> Pengeluaran / OPEX
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#6B7280' }}>
            Catat biaya operasional (sewa, listrik, gaji, marketing, dll) untuk perhitungan Laba Rugi yang akurat.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <Plus size={16} /> Tambah Pengeluaran
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', backgroundColor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={20} color="#DC2626" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>Total Bulan Ini</span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{formatRupiah(totalThisMonth)}</h3>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', backgroundColor: '#E6F4EA', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={20} color="#006847" />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>Total Keseluruhan (All-Time)</span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{formatRupiah(totalAllTime)}</h3>
          </div>
        </div>
      </div>

      {/* TABLE RIWAYAT PENGELUARAN */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>Riwayat Pengeluaran</h3>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 size={16} className="animate-spin" /> Memuat data...
          </div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            Belum ada catatan pengeluaran. Klik "Tambah Pengeluaran" untuk mulai mencatat.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', textAlign: 'left' }}>
                <th style={{ padding: '12px 24px', color: '#6B7280', fontWeight: '600' }}>Tanggal</th>
                <th style={{ padding: '12px 24px', color: '#6B7280', fontWeight: '600' }}>Deskripsi</th>
                <th style={{ padding: '12px 24px', color: '#6B7280', fontWeight: '600' }}>Kategori</th>
                <th style={{ padding: '12px 24px', color: '#6B7280', fontWeight: '600', textAlign: 'right' }}>Jumlah</th>
                <th style={{ padding: '12px 24px' }}></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 24px', color: '#4B5563' }}>
                    {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td style={{ padding: '14px 24px', fontWeight: '600', color: '#111827' }}>{exp.description}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                      {exp.category || 'Lainnya'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 'bold', color: '#DC2626' }}>
                    - {formatRupiah(exp.amount)}
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                    <Trash2 size={15} color="#DC2626" style={{ cursor: 'pointer' }} onClick={() => handleDeleteExpense(exp.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: TAMBAH PENGELUARAN */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleAddExpense} style={{ width: '460px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#111827' }}>Tambah Pengeluaran Baru</h2>
              <X size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Deskripsi Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bayar listrik Juni, Gaji kasir shift pagi, dll"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: '#fff', height: '40px', cursor: 'pointer' }}
                  >
                    {EXPENSE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Tanggal</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      required
                      value={form.expense_date}
                      onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nominal (Rp)</label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9]/g, '') })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontWeight: 'bold' }}
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                Batal
              </button>
              <button type="submit" disabled={isSaving} style={{ padding: '10px 24px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: isSaving ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: isSaving ? 0.7 : 1 }}>
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}