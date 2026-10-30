import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PUBLIC_INSTRUCTOR_COLUMNS, sanitizePublicInstructor } from '@/lib/instructors/public';
import { geocodeSuburb } from '@/lib/locationiq';
import { haversineKm, isPostcode, matchesInstructorSearch, REGION_ALIASES } from '@/lib/search';

/** Remove PostgREST filter syntax and wildcard characters from free text. */
function sanitizeText(value: string | null | undefined, max = 80): string {
  return (value || '')
    .replace(/[,(){}"\\%*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function toCoordinate(value: string | null, min: number, max: number): number | undefined {
  const parsed = Number.parseFloat(value || '');
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
}

function rowCoordinate(value: unknown, min: number, max: number): number | undefined {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const freeText = sanitizeText(searchParams.get('q') ?? searchParams.get('suburb'));
  const postcodeText = sanitizeText(searchParams.get('postcode'), 12);
  const searchTerm = [freeText, postcodeText].filter(Boolean).join(' ').trim();

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

  const requestedLat = toCoordinate(searchParams.get('lat'), -90, 90);
  const requestedLng = toCoordinate(searchParams.get('lng'), -180, 180);
  const requestedOrigin =
    requestedLat !== undefined &&
    requestedLng !== undefined &&
    !(requestedLat === 0 && requestedLng === 0)
      ? { lat: requestedLat, lng: requestedLng }
      : undefined;

  // Exclude deactivated instructors
  const { data: deactivated } = await supabase
    .from('listing_flags')
    .select('instructor_id')
    .eq('detail', 'deactivated')
    .eq('is_resolved', false);
  const deactivatedIds = deactivated?.map((d) => d.instructor_id).filter(Boolean) || [];

  // Dynamic column list, so keep the builder loosely typed. Search matching and
  // distance calculations happen after the filtered rows are loaded because
  // matching a full name across two columns and a text radius across locations
  // is not expressible cleanly in PostgREST.
  let query: any = supabase
    .from('instructors')
    .select(PUBLIC_INSTRUCTOR_COLUMNS.join(', '));

  query = query.eq('is_verified', true);

  if (deactivatedIds.length > 0) {
    query = query.not('id', 'in', `(${deactivatedIds.join(',')})`);
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

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows: any[] = data || [];

  // Free-text search across names, suburb, state, postcode and service areas.
  const textMatched = searchTerm
    ? rows.filter((row) => matchesInstructorSearch(row, searchTerm))
    : rows;

  // Work out where the user is searching from. An explicit coordinate (browser
  // geolocation or an autocomplete suggestion) always wins. Otherwise geocode a
  // suburb/postcode when a radius or distance sort actually needs an origin.
  const needsOrigin = (Number.isFinite(radiusKm) && radiusKm > 0) || sort === 'distance';
  let origin = requestedOrigin;

  if (!origin && needsOrigin && searchTerm) {
    const knownPlaces = new Set<string>();
    for (const row of rows) {
      if (row.suburb) knownPlaces.add(String(row.suburb).toLowerCase());
      for (const area of row.service_suburbs || []) {
        if (area) knownPlaces.add(String(area).toLowerCase());
      }
    }
    const normalised = searchTerm.toLowerCase();
    const placeMatch = Array.from(knownPlaces).find(
      (place) =>
        normalised === place ||
        normalised.startsWith(`${place} `) ||
        place.startsWith(normalised),
    );
    const looksLikePlace =
      isPostcode(searchTerm) ||
      REGION_ALIASES[normalised] !== undefined ||
      placeMatch !== undefined;

    if (looksLikePlace) {
      const geocoded = await geocodeSuburb(placeMatch ?? searchTerm);
      if (geocoded) origin = geocoded;
    }
  }

  const withDistance = textMatched.map((row) => {
    const lat = rowCoordinate(row.lat, -90, 90);
    const lng = rowCoordinate(row.lng, -180, 180);
    const distanceKm =
      origin && lat !== undefined && lng !== undefined
        ? haversineKm(origin, { lat, lng })
        : undefined;
    return { row, distanceKm };
  });

  // A radius means "within X km of the searched place". An instructor must both
  // be close enough for the learner and have a service area that reaches them.
  const radiusFiltered =
    Number.isFinite(radiusKm) && radiusKm > 0 && origin
      ? withDistance.filter(({ row, distanceKm }) => {
          const servesArea = searchTerm
            ? (row.service_suburbs || []).some(
                (area: string) => area.toLowerCase() === searchTerm.toLowerCase(),
              )
            : false;
          if (servesArea) return true;
          if (distanceKm === undefined) return false;

          const instructorRadius = Number(row.service_radius_km) || 0;
          return distanceKm <= radiusKm && (instructorRadius === 0 || distanceKm <= instructorRadius);
        })
      : withDistance;

  const byRating = (a: { row: any }, b: { row: any }) =>
    (Number(b.row.average_rating) || 0) - (Number(a.row.average_rating) || 0);

  const sorted = [...radiusFiltered].sort((a, b) => {
    switch (sort) {
      case 'price_asc':
        return (Number(a.row.hourly_rate) || Infinity) - (Number(b.row.hourly_rate) || Infinity) || byRating(a, b);
      case 'price_desc':
        return (Number(b.row.hourly_rate) || 0) - (Number(a.row.hourly_rate) || 0) || byRating(a, b);
      case 'name_asc':
        return String(a.row.first_name || '').localeCompare(String(b.row.first_name || '')) || byRating(a, b);
      case 'name_desc':
        return String(b.row.first_name || '').localeCompare(String(a.row.first_name || '')) || byRating(a, b);
      case 'distance':
        if (origin) {
          return (
            (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || byRating(a, b)
          );
        }
        return byRating(a, b);
      case 'rating':
      default:
        return byRating(a, b);
    }
  });

  const total = sorted.length;
  const from = (page - 1) * limit;
  const pageRows = sorted.slice(from, from + limit);

  const instructors = pageRows.map(({ row, distanceKm }) => {
    const safe = sanitizePublicInstructor(row);
    if (distanceKm !== undefined) {
      safe.distance_km = Math.round(distanceKm * 10) / 10;
    }
    return safe;
  });

  try {
    const ids = instructors.map((i: any) => i.id).filter(Boolean);
    await supabase.from('search_logs').insert({
      suburb: searchTerm || null,
      filters_applied: {
        q: freeText || null,
        postcode: postcodeText || null,
        radius_km: Number.isFinite(radiusKm) ? radiusKm : null,
        transmission,
        max_price: Number.isFinite(maxPrice) ? maxPrice : null,
        anxiety_friendly: anxietyFriendly,
        international_conversion: internationalConversion,
        test_centre: testCentre,
        languages: languagesParam,
        available_days: availableDays,
        sort,
        origin: origin || null,
        result_instructor_ids: ids,
      },
      results_count: total,
    });
  } catch {}

  return NextResponse.json(
    {
      instructors,
      total,
      page,
      limit,
      origin: origin ? { lat: origin.lat, lng: origin.lng } : null,
      radius_km: Number.isFinite(radiusKm) && radiusKm > 0 ? radiusKm : null,
    },
    {
      headers: {
        'Cache-Control': requestedOrigin
          ? 'private, max-age=0, no-store'
          : 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
