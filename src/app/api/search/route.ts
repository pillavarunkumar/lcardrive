import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const suburbRaw = searchParams.get('suburb')?.trim();
  const suburb = suburbRaw?.split(',')[0]?.trim();
  const radiusKm = searchParams.get('radius_km');
  const transmission = searchParams.get('transmission');
  const maxPrice = searchParams.get('max_price');
  const anxietyFriendly = searchParams.get('anxiety_friendly');
  const internationalConversion = searchParams.get('international_conversion');
  const testCentre = searchParams.get('test_centre');
  const languagesParam = searchParams.get('languages');
  const availableDays = searchParams.get('available_days');
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);

  let query = supabase.from('instructors').select('*', { count: 'exact' });

  query = query.eq('is_verified', true);

  if (suburb) {
    const q = `%${suburb.toLowerCase()}%`;
    query = query.or(`suburb.ilike.${q},service_suburbs.cs.{${suburb}}`);
  }

  if (radiusKm) {
    query = query.eq('service_radius_km', parseInt(radiusKm, 10));
  }

  if (transmission && transmission !== 'both') {
    query = query.or(`transmission.eq.${transmission},transmission.eq.both`);
  }

  if (maxPrice) {
    query = query.lte('hourly_rate', parseFloat(maxPrice));
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

  if (languagesParam) {
    const langs = languagesParam.split(',').map((l) => l.trim());
    for (const lang of langs) {
      query = query.contains('languages', [lang]);
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
    default:
      query = query.order('average_rating', { ascending: false, nullsFirst: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await supabase.from('search_logs').insert({
      suburb,
      filters_applied: { transmission, max_price: maxPrice, anxiety_friendly: anxietyFriendly, international_conversion: internationalConversion, test_centre: testCentre, languages: languagesParam, available_days: availableDays, sort },
      results_count: count ?? 0,
    });
  } catch {};

  return NextResponse.json({ instructors: data || [], total: count ?? 0, page, limit });
}
