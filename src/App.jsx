import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './views/auth/Login.jsx';
import Register from './views/auth/Register.jsx'; // Mengimpor file registrasi baru

function TemporaryDashboard() {
  const { user, role, logout } = useAuth();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', border: '1px solid #E5E7EB', padding: '40px', borderRadius: '16px', backgroundColor: '#fff' }}>
        <h2>Berhasil Masuk! 👑</h2>
        <p>Email: {user?.email}</p>
        <p>Role: <strong>{role?.toUpperCase()}</strong></p>
        <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '12px' }}>Logout</button>
      </div>
    </div>
  );
}

function MainRouter() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('login'); // State penentu alur halaman Auth

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F9FA' }}>
        <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #E5E7EB', borderTop: '4px solid #006847', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <h4 style={{ color: '#374151', margin: '0' }}>Memvalidasi Kredensial Akses...</h4>
        </div>
      </div>
    );
  }

  // Jika session login aktif di Supabase, langsung lempar ke dashboard utama
  if (user) return <TemporaryDashboard />;

  // Jika tidak, handle alur antar muka lokal berdasarkan aksi klik user
  return screen === 'login' ? (
    <Login onNavigate={setScreen} />
  ) : (
    <Register onNavigate={setScreen} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}