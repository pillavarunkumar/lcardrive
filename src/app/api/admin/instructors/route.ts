import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const search = searchParams.get('search')?.trim();
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';

  let query = supabase
    .from('instructors')
    .select('*', { count: 'exact' });

  if (search) {
    const q = `%${search}%`;
    query = query.or(`first_name.ilike.${q},last_name.ilike.${q},suburb.ilike.${q},email.ilike.${q}`);
  }

  query = query.order(sort, { ascending: order === 'asc', nullsFirst: false });

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const instructorIds = (data || []).map((i: any) => i.id);

  let pendingClaimIds: Set<string> = new Set();
  if (instructorIds.length > 0) {
    const { data: flags } = await supabase
      .from('listing_flags')
      .select('instructor_id')
      .in('instructor_id', instructorIds)
      .eq('is_resolved', false);
    pendingClaimIds = new Set((flags || []).map((f: any) => f.instructor_id));
  }

  const instructors = (data || []).map((i: any) => ({
    ...i,
    has_pending_claim: pendingClaimIds.has(i.id),
  }));

  return NextResponse.json({
    instructors,
    total: count ?? 0,
    page,
    limit,
  });
}
