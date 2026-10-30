const LOCATIONIQ_KEY = process.env.LOCATIONIQ_API_KEY;
const BASE = 'https://us1.locationiq.com/v1';

export async function autocompleteSuburb(query: string) {
  if (!LOCATIONIQ_KEY) return [];
  const res = await fetch(
    `${BASE}/autocomplete?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&limit=5&countrycodes=au&tag=place:suburb`,
  );
  if (!res.ok) return [];
  return res.json();
}

const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

export async function geocodeSuburb(suburb: string, state?: string) {
  if (!LOCATIONIQ_KEY) return null;
  const place = suburb.trim();
  if (!place) return null;

  const query = [place, state?.trim(), 'Australia'].filter(Boolean).join(', ');
  if (geocodeCache.has(query)) return geocodeCache.get(query) ?? null;

  try {
    const res = await fetch(
      `${BASE}/search?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=au`,
    );
    if (!res.ok) {
      geocodeCache.set(query, null);
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) {
      geocodeCache.set(query, null);
      return null;
    }
    const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    if (!Number.isFinite(result.lat) || !Number.isFinite(result.lng)) {
      geocodeCache.set(query, null);
      return null;
    }
    geocodeCache.set(query, result);
    return result;
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number) {
  if (!LOCATIONIQ_KEY) return null;
  const res = await fetch(
    `${BASE}/reverse?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json&normalizeaddress=1`,
  );
  if (!res.ok) return null;
  return res.json();
}
