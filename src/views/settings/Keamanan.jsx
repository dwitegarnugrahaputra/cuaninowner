import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Shield, Key, Lock, Clock, Smartphone, Save, Eye, EyeOff, Loader2, Monitor, History, UserCog } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// 📍 Reverse geocode koordinat GPS jadi "Kota, Provinsi" pakai OpenStreetMap Nominatim
// (gratis, tanpa API key). Dipakai untuk mengisi location_info di activity_logs
// secara riil, bukan hardcode lagi.
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id',
        },
      }
    );
    if (!res.ok) throw new Error('Gagal reverse geocode');
    const data = await res.json();
    const addr = data.address || {};

    // Fallback berurutan karena tiap daerah punya struktur alamat berbeda
    const city = addr.city || addr.town || addr.county || addr.village || addr.suburb || '';
    const province = addr.state || '';

    if (city && province) return `${city}, ${province}`;
    if (province) return province;
    return 'Lokasi tidak diketahui';
  } catch (err) {
    console.error('⚠️ Gagal reverse geocode:', err.message);
    return 'Lokasi tidak diketahui';
  }
}

// 📍 Ambil koordinat GPS browser owner, lalu ubah jadi nama kota via reverseGeocode.
// Tidak pernah melempar error ke pemanggil — selalu resolve, dengan fallback teks
// kalau user menolak izin lokasi, GPS mati, atau request timeout.
function getCurrentLocationName() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve('Lokasi tidak diketahui');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationName = await reverseGeocode(latitude, longitude);
        resolve(locationName);
      },
      (error) => {
        console.warn('⚠️ Izin lokasi ditolak/gagal:', error.message);
        resolve('Lokasi tidak diketahui');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  });
}

export default function Keamanan({ onSaveSuccess }) {
  const { t } = useLanguage(); // 🌐 hook terjemahan — t('key') mengambil teks sesuai bahasa aktif
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdateLoading] = useState(false);
  const [currentUid, setCurrentUserId] = useState(null);

  // State interaksi form keamanan
  const [showPassword, setShowPassword] = useState(false);
  const [idleTimeout, setIdleTimeout] = useState('15');
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  // 🗒️ State Log Aktivitas Riil (gabungan owner + seluruh staff: admin stok & kasir)
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  // 📥 READ PIPELINE: Muat data sesi auth dan aturan keamanan dari database
  useEffect(() => {
    async function loadSecurityPipeline() {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          setIsLoading(false);
          return;
        }

        const uid = session.user.id;
        setCurrentUserId(uid);

        // Tarik Konfigurasi Timeout Kasir dari Database
        const { data: configData } = await supabase
          .from('security_config')
          .select('idle_timeout')
          .eq('user_id', uid)
          .maybeSingle();

        if (configData) {
          setIdleTimeout(configData.idle_timeout);
        }

        // Catat sesi login OWNER ini sendiri sebagai satu baris activity log,
        // supaya log "Aktif Sekarang" juga riil berasal dari database, bukan hardcode.
        // Deteksi sederhana ini mencegah log duplikat tiap kali halaman Keamanan dibuka ulang
        // dalam jangka waktu singkat (dicek lewat sessionStorage per tab browser).
        const alreadyLoggedThisSession = sessionStorage.getItem('owner_login_logged');
        if (!alreadyLoggedThisSession) {
          const userAgent = navigator.userAgent;
          let detectedDevice = 'Windows PC (Desktop)';
          if (userAgent.includes('Mac')) detectedDevice = 'MacOS (Desktop)';
          if (userAgent.includes('Android') || userAgent.includes('iPhone')) detectedDevice = 'Mobile Device';

          // 📍 Ambil lokasi GPS asli owner (bukan hardcode lagi). Proses ini tidak
          // memblokir/menggagalkan insert log walau izin lokasi ditolak — tetap
          // fallback ke teks default lewat getCurrentLocationName().
          const locationName = await getCurrentLocationName();

          await supabase.from('activity_logs').insert([{
            user_id: uid,
            actor_type: 'owner',
            staff_id: null,
            actor_name: session.user.email || 'Owner',
            action_type: 'login',
            description: 'Owner login ke dashboard web',
            device_info: detectedDevice,
            location_info: locationName
          }]);
          sessionStorage.setItem('owner_login_logged', 'true');
        }

        // Muat seluruh riwayat log aktivitas (owner + staff) untuk toko ini
        await fetchActivityLogs(uid);
      } catch (err) {
        console.error('⚠️ Gagal memuat data konfigurasi keamanan:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadSecurityPipeline();
  }, []);

  // Ambil seluruh log aktivitas milik toko ini (owner + admin stok + kasir),
  // diurutkan dari yang terbaru, dibatasi 50 baris terakhir agar list tetap ringan.
  const fetchActivityLogs = async (uid) => {
    setIsLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, actor_type, actor_name, action_type, description, device_info, location_info, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (err) {
      console.error('⚠️ Gagal memuat log aktivitas:', err.message);
    } finally {
      setIsLogsLoading(false);
    }
  };

  const handlePasswordChange = (e, field) => {
    setPasswordData({ ...passwordData, [field]: e.target.value });
  };

  // 📤 ACTION PIPELINE: Eksekusi simpan massal aturan keamanan dan update sandi
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!currentUid) return;
    setIsUpdateLoading(true);

    try {
      // 1. Validasi & Proses Eksekusi Ganti Password Riil di Supabase Auth
      if (passwordData.new) {
        if (passwordData.new !== passwordData.confirm) {
          alert('Konfirmasi password baru tidak cocok, Gar! Periksa kembali.');
          setIsUpdateLoading(false);
          return;
        }

        if (passwordData.new.length < 6) {
          alert('Keamanan Lemah: Password baru minimal harus 6 karakter, Gar!');
          setIsUpdateLoading(false);
          return;
        }

        const { error: authError } = await supabase.auth.updateUser({
          password: passwordData.new
        });
        if (authError) throw authError;
      }

      // 2. Simpan Parameter Durasi Kunci Otomatis Sesi Kasir
      const { error: dbError } = await supabase
        .from('security_config')
        .upsert({
          user_id: currentUid,
          idle_timeout: idleTimeout
        }, { onConflict: 'user_id' });

      if (dbError) throw dbError;

      alert('🔐 Aturan Proteksi & Enkripsi Kredensial Akun Berhasil Diperbarui!');
      
      // Kosongkan form password kembali demi keamanan
      setPasswordData({ current: '', new: '', confirm: '' });

      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      alert('Gagal mengamankan konfigurasi: ' + err.message);
    } finally {
      setIsUpdateLoading(false);
    }
  };

  // Label waktu relatif sederhana: "Baru saja", "5 menit lalu", atau tanggal lengkap jika sudah lama
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMinutes = Math.floor((now - past) / 60000);

    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    return past.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Ikon & warna berbeda untuk owner (web) vs staff (mobile), supaya mudah dibedakan sekilas
  const getActorIcon = (actorType) => {
    if (actorType === 'owner') return <Monitor size={18} color="#006847" />;
    return <Smartphone size={18} color="#4F46E5" />;
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#006847', fontSize: '14px', fontWeight: 'bold' }}>
        <Loader2 size={16} className="animate-spin" />
        <span>Menyinkronkan Log Enkripsi & Hak Akses Sesi...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.2s ease-out', textAlign: 'left' }}>
      
      {/* Header Title */}
      <div>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{t('security_page_title')}</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>{t('security_page_desc')}</p>
      </div>

      {/* Grid Layout Pengaturan Keamanan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* BLOK KIRI: AUTHENTICATION & ACCESS CONTROL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Ganti Password Administrator */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Key size={20} color="#006847" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>{t('security_credentials_title')}</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>{t('security_current_password')}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={passwordData.current}
                    onChange={(e) => handlePasswordChange(e, 'current')}
                    placeholder="Masukkan password admin sekarang" 
                    style={{ width: '100%', padding: '10px 40px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                  />
                  <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>{t('security_new_password')}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={passwordData.new}
                      onChange={(e) => handlePasswordChange(e, 'new')}
                      placeholder="Minimal 6 karakter" 
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>{t('security_confirm_password')}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: '12px' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={passwordData.confirm}
                      onChange={(e) => handlePasswordChange(e, 'confirm')}
                      placeholder="Ulangi password baru" 
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Log Aktivitas Riil (Owner + Seluruh Staff: Admin Stok & Kasir) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={20} color="#1E3A8A" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>{t('security_activity_log_title')}</h3>
              </div>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{activityLogs.length} {t('security_activity_count')}</span>
            </div>

            {isLogsLoading ? (
              <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9CA3AF', fontSize: '12.5px' }}>
                <Loader2 size={14} className="animate-spin" /> <span>{t('loading')}</span>
              </div>
            ) : activityLogs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', fontSize: '12.5px' }}>
                {t('security_activity_empty')}
              </div>
            ) : (
              // List bisa di-scroll, dibatasi tingginya agar tidak memanjangkan seluruh halaman
              <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activityLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 }}>
                      <div style={{ flexShrink: 0 }}>{getActorIcon(log.actor_type)}</div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: '13px', color: '#111827', display: 'block' }}>{log.actor_name}</strong>
                        <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.description || log.action_type}
                          {log.device_info ? ` • ${log.device_info}` : ''}
                          {log.location_info ? ` • ${log.location_info}` : ''}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 'bold', flexShrink: 0, marginLeft: '12px' }}>{formatRelativeTime(log.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* BLOK KANAN: SESSION TIMEOUT & ACTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 3: Sesi Idle Timeout Kasir */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Clock size={20} color="#D97706" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>{t('security_idle_title')}</h3>
            </div>
            
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151', display: 'block', marginBottom: '6px' }}>{t('security_idle_label')}</label>
              <select 
                value={idleTimeout} 
                onChange={(e) => setIdleTimeout(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                <option value="5">{t('security_idle_5min')}</option>
                <option value="15">{t('security_idle_15min')}</option>
                <option value="30">{t('security_idle_30min')}</option>
                <option value="never">{t('security_idle_never')}</option>
              </select>
              <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', display: 'block', lineHeight: '1.4' }}>
                *Aplikasi tablet kasir otomatis terkunci jika tidak disentuh selama batas waktu di atas, demi mencegah staf lain menyalahgunakan slip transaksi.
              </span>
            </div>
          </div>

          {/* Card 4: Ringkasan jenis aktor yang tercatat (info kecil, membantu owner memahami sumber log) */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <UserCog size={20} color="#4B5563" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>{t('security_legend_title')}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#4B5563' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Monitor size={14} color="#006847" /> <span>{t('security_legend_owner')}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Smartphone size={14} color="#4F46E5" /> <span>{t('security_legend_staff')}</span></div>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleFormSubmit}
            disabled={isUpdating}
            style={{ width: '100%', padding: '14px', backgroundColor: '#006847', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 104, 71, 0.2)', transition: 'all 0.15s' }}
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            <span>{t('security_save_button')}</span>
          </button>

        </div>


      </div>
    </div>
  );
}