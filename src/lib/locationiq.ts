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

export async function geocodeSuburb(suburb: string, state: string) {
  if (!LOCATIONIQ_KEY) return null;
  const res = await fetch(
    `${BASE}/search?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(suburb + ', ' + state + ', Australia')}&format=json&limit=1`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}
