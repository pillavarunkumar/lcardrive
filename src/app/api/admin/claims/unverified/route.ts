import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data: pendingFlags } = await supabase
    .from('listing_flags')
    .select('instructor_id')
    .eq('detail', 'profile_review')
    .eq('is_resolved', false);
  const pendingIds = new Set(
    ((pendingFlags || []) as Array<{ instructor_id: string }>).map((flag) => flag.instructor_id),
  );

  const { data, error, count } = await supabase
    .from('instructors')
    .select('id, first_name, last_name, suburb, adi_registration, hourly_rate, status, is_verified, is_claimed, created_at', { count: 'exact' })
    .eq('is_verified', false)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Submitted profiles are reviewed in the onboarding queue instead, so they
  // are not searched or verified twice from this list.
  const rows = (data || []).filter((instructor: any) => !pendingIds.has(instructor.id));

  return NextResponse.json({
    claims: rows.map((i: any) => ({
      id: i.id,
      instructor_name: `${i.first_name} ${i.last_name}`,
      suburb: i.suburb,
      adi_registration: i.adi_registration,
      is_claimed: i.is_claimed,
      is_verified: i.is_verified,
      status: i.status || 'draft',
      created_at: i.created_at,
    })),
    total: rows.length,
  });
}
