import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PUBLIC_INSTRUCTOR_COLUMNS, sanitizePublicInstructor } from '@/lib/instructors/public';

/** Remove PostgREST filter syntax and wildcard characters from free text. */
function sanitizeText(value: string | null | undefined, max = 80): string {
  return (value || '')
    .replace(/[,(){}"\\%*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const searchRaw = searchParams.get('suburb');
  const searchTerm = sanitizeText(searchRaw?.split(',')[0]);
  const radiusKm = Number.parseInt(searchParams.get('radius_km') || '', 10);
  const transmission = searchParams.get('transmission');
  const maxPrice = Number.parseFloat(searchParams.get('max_price') || '');
  const anxietyFriendly = searchParams.get('anxiety_friendly');
  const internationalConversion = searchParams.get('international_conversion');
  const testCentre = sanitizeText(searchParams.get('test_centre'), 80);
  const testCentreFamiliarity = searchParams.get('test_centre_familiarity');
  const languagesParam = searchParams.get('languages');
  const availableDays = searchParams.get('available_days');
  const sort = searchParams.get('sort') || 'rating';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12', 10) || 12));

  // Exclude deactivated instructors
  const { data: deactivated } = await supabase
    .from('listing_flags')
    .select('instructor_id')
    .eq('detail', 'deactivated')
    .eq('is_resolved', false);
  const deactivatedIds = deactivated?.map(d => d.instructor_id).filter(Boolean) || [];

  // Dynamic column list, so keep the builder loosely typed.
  let query: any = supabase
    .from('instructors')
    .select(PUBLIC_INSTRUCTOR_COLUMNS.join(', '), { count: 'exact' });

  query = query.eq('is_verified', true);

  if (deactivatedIds.length > 0) {
    query = query.not('id', 'in', `(${deactivatedIds.join(',')})`);
  }

  if (searchTerm) {
    const q = `%${searchTerm}%`;
    query = query.or(`first_name.ilike.${q},last_name.ilike.${q},suburb.ilike.${q},postcode.ilike.${q},service_suburbs.cs.{${searchTerm}}`);
  }

  if (Number.isFinite(radiusKm) && radiusKm > 0) {
    query = query.gte('service_radius_km', radiusKm);
  }

  if (transmission === 'auto' || transmission === 'manual') {
    query = query.or(`transmission.eq.${transmission},transmission.eq.both`);
  }

  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    query = query.lte('hourly_rate', maxPrice);
  }

  if (anxietyFriendly === 'true') {
    query = query.eq('specialises_anxiety', true);
  }

  if (internationalConversion === 'true') {
    query = query.eq('accepts_international', true);
  }

  if (testCentre) {
    query = query.contains('familiar_test_centres', [testCentre]);
  }

  if (testCentreFamiliarity === 'true') {
    query = query.not('familiar_test_centres', 'eq', '{}');
  }

  if (languagesParam) {
    const langs = languagesParam
      .split(',')
      .map((l) => sanitizeText(l, 30))
      .filter(Boolean)
      .slice(0, 5);
    if (langs.length === 1) {
      query = query.contains('languages', langs);
    } else if (langs.length > 1) {
      const orConditions = langs.map((l) => `languages.cs.{${l}}`).join(',');
      query = query.or(orConditions);
    }
  }

  if (availableDays) {
    if (availableDays === 'weekdays') {
      query = query.overlaps('availability_days', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    } else if (availableDays === 'weekends') {
      query = query.overlaps('availability_days', ['Sat', 'Sun']);
    }
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('hourly_rate', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order('hourly_rate', { ascending: false, nullsFirst: false });
      break;
    case 'rating':
      query = query.order('average_rating', { ascending: false, nullsFirst: false });
      break;
    case 'name_asc':
      query = query.order('first_name', { ascending: true, nullsFirst: false });
      break;
    case 'name_desc':
      query = query.order('first_name', { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order('average_rating', { ascending: false, nullsFirst: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const instructors = (data || []).map((inst: any) => sanitizePublicInstructor(inst));

  try {
    const ids = instructors.map((i: any) => i.id).filter(Boolean);
    await supabase.from('search_logs').insert({
      suburb: searchTerm || null,
      filters_applied: {
        transmission, max_price: Number.isFinite(maxPrice) ? maxPrice : null,
        anxiety_friendly: anxietyFriendly,
        international_conversion: internationalConversion,
        test_centre: testCentre,
        languages: languagesParam,
        available_days: availableDays,
        sort,
        result_instructor_ids: ids,
      },
      results_count: count ?? 0,
    });
  } catch {}

  return NextResponse.json(
    { instructors, total: count ?? 0, page, limit },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  );
}
