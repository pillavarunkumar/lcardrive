import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data, error, count } = await supabase
    .from('instructors')
    .select('id, first_name, last_name, suburb, adi_registration, hourly_rate, is_verified, is_claimed, created_at', { count: 'exact' })
    .eq('is_verified', false)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    claims: (data || []).map((i: any) => ({
      id: i.id,
      instructor_name: `${i.first_name} ${i.last_name}`,
      suburb: i.suburb,
      adi_registration: i.adi_registration,
      is_claimed: i.is_claimed,
      is_verified: i.is_verified,
      created_at: i.created_at,
    })),
    total: count ?? 0,
  });
}
