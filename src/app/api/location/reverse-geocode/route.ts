import { NextResponse } from 'next/server';
import { reverseGeocode } from '@/lib/locationiq';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }

  try {
    const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    if (!result) {
      return NextResponse.json({ error: 'No results' }, { status: 404 });
    }
    const address = result.address || {};
    const suburb = address.suburb || address.city || address.town || address.municipality || '';
    const state = address.state || '';
    const display = [suburb, state].filter(Boolean).join(', ');
    return NextResponse.json({ display, suburb, state });
  } catch {
    return NextResponse.json({ error: 'Reverse geocode failed' }, { status: 500 });
  }
}
