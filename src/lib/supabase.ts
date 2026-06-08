import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const supabase = supabaseUrl
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY || '', {
      auth: { persistSession: false },
    })
  : null;
