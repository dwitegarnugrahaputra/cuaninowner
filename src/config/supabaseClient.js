import { createClient } from '@supabase/supabase-js';

// Masukkan kredensial aman Supabase yang udah lu pegang di notepad
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);