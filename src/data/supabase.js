// ===================================
// SUPABASE CLIENT
// ===================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { CONFIG } from '../config.js';

const supabaseUrl = CONFIG.SUPABASE.URL;
const supabaseKey = CONFIG.SUPABASE.ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Log connection status for verification
console.log('🔌 Supabase Client Initialized');
supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
        console.error('❌ Supabase Connection Error:', error);
    } else {
        console.log('✅ Supabase Connected. Session:', data.session ? 'Active' : 'None');
    }
});
