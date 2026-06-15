import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⚡ FIXED: Cukup dengerin dari onAuthStateChange aja biar gak bentrok double request di awal
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        // Jalankan checkUserRole secara aman
        await checkUserRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); // ⚡ FIXED: Gunakan maybeSingle biar gak melempar error keras jika baris tidak klop

      if (error) throw error;

      if (data) {
        setRole(data.role); // ⚡ FIXED: Simpan saja rolenya apa adanya ke dalam state (owner, manager, atau kasir)
        
        // Catatan: Pembatasan halaman (Akses Ditolak) sebaiknya lu lakukan di level komponen UI (Protected Routes), 
        // BUKAN dengan cara langsung men-signOut paksa user di dalam AuthContext yang memicu infinite loops!
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error('Error checking role:', err.message);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);