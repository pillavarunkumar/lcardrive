import { NextResponse } from 'next/server';
import { reverseGeocode } from '@/lib/locationiq';
import { rateLimit } from '@/lib/http/rate-limit';

export async function GET(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limit = rateLimit(`location-reverse:${ip}`, 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many location requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = Number.parseFloat(searchParams.get('lat') || '');
  const lng = Number.parseFloat(searchParams.get('lng') || '');

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: 'Valid lat and lng required' }, { status: 400 });
  }

  try {
    const result = await reverseGeocode(lat, lng);
    if (!result) {
      return NextResponse.json({ error: 'No results' }, { status: 404 });
    }
    const address = result.address || {};
    const suburb = address.suburb || address.city || address.town || address.municipality || '';
    const state = address.state || '';
    const display = [suburb, state].filter(Boolean).join(', ');
    return NextResponse.json(
      { display, suburb, state },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  } catch {
    return NextResponse.json({ error: 'Reverse geocode failed' }, { status: 500 });
  }
}
