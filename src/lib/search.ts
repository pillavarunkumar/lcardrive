export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SearchableInstructor {
  first_name?: string | null;
  last_name?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  service_suburbs?: string[] | null;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Learners commonly search for a capital city or state rather than a suburb.
 * Treat those as region searches so "Melbourne" returns Victorian instructors
 * instead of requiring the literal word "Melbourne" in every profile.
 */
export const REGION_ALIASES: Record<string, string> = {
  melbourne: 'VIC',
  victoria: 'VIC',
  vic: 'VIC',
  sydney: 'NSW',
  'new south wales': 'NSW',
  nsw: 'NSW',
  brisbane: 'QLD',
  queensland: 'QLD',
  qld: 'QLD',
  perth: 'WA',
  'western australia': 'WA',
  wa: 'WA',
  adelaide: 'SA',
  'south australia': 'SA',
  sa: 'SA',
  canberra: 'ACT',
  'australian capital territory': 'ACT',
  act: 'ACT',
  hobart: 'TAS',
  tasmania: 'TAS',
  tas: 'TAS',
  darwin: 'NT',
  'northern territory': 'NT',
  nt: 'NT',
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

/** Great-circle distance between two coordinates in kilometres. */
export function haversineKm(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * Case-insensitive, token-based match against an instructor's name, suburb,
 * postcode, state and service areas. Requiring every token means "Priya
 * Sharma" matches the full name while "Point Cook" can match a service area.
 */
export function matchesInstructorSearch(
  instructor: SearchableInstructor,
  searchTerm: string,
): boolean {
  const tokens = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const haystack = [
    instructor.first_name,
    instructor.last_name,
    instructor.suburb,
    instructor.state,
    instructor.postcode,
    ...(instructor.service_suburbs || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const state = (instructor.state || '').toLowerCase();

  // A full region name (e.g. "New South Wales") is not made of individual
  // tokens that appear in a profile, so check it before token matching.
  const region = REGION_ALIASES[searchTerm.toLowerCase().trim()];
  if (region && state === region.toLowerCase()) return true;

  return tokens.every((token) => {
    const tokenRegion = REGION_ALIASES[token];
    if (tokenRegion !== undefined) return state === tokenRegion.toLowerCase();
    return haystack.includes(token);
  });
}

export function isPostcode(value: string): boolean {
  return /^\d{4}$/.test(value.trim());
}
