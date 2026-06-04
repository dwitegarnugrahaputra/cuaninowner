import { createClient } from '@supabase/supabase-js';

// Masukkan kredensial aman Supabase yang udah lu pegang di notepad
const supabaseUrl = 'https://qvuvnuhksxofyyzqzdse.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_-3Z2QYcYb8W62LPloGiYVQ_KsvgU0dt'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);