import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sjupcucvzrqqwghavuwk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdXBjdWN2enJxcXdnaGF2dXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzc4NjIsImV4cCI6MjA5NDkxMzg2Mn0.YXPFseYx3PblFTHf_rcqeizbBMBHy6CTUd7LXo_9YIM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
