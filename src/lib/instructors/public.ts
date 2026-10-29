/**
 * Columns that are safe to expose on public pages and public APIs.
 * Never add email, phone, clerk_user_id, identity documents, document URLs or
 * verification metadata to this list.
 */
export const PUBLIC_INSTRUCTOR_COLUMNS = [
  'id',
  'slug',
  'first_name',
  'last_name',
  'suburb',
  'state',
  'postcode',
  'lat',
  'lng',
  'bio',
  'profile_photo_url',
  'hourly_rate',
  'package_options',
  'licence_types',
  'transmission',
  'lesson_duration_mins',
  'specialises_anxiety',
  'accepts_international',
  'languages',
  'years_experience',
  'gender',
  'teaching_style',
  'primary_learner_types',
  'vehicle_make',
  'vehicle_model',
  'vehicle_year',
  'vehicle_color',
  'vehicle_transmission',
  'dual_controls',
  'service_suburbs',
  'service_radius_km',
  'familiar_test_centres',
  'availability_days',
  'availability_slots',
  'average_rating',
  'avg_rating_patience',
  'avg_rating_communication',
  'avg_rating_value',
  'avg_rating_punctuality',
  'review_count',
  'is_verified',
  'is_claimed',
  'social_facebook',
  'social_google_biz',
] as const;

const PUBLIC_COLUMN_SET = new Set<string>(PUBLIC_INSTRUCTOR_COLUMNS);

const ARRAY_FIELDS = [
  'service_suburbs',
  'licence_types',
  'languages',
  'availability_days',
  'familiar_test_centres',
  'package_options',
] as const;

const NUMBER_FIELDS = [
  'lat',
  'lng',
  'service_radius_km',
  'hourly_rate',
  'lesson_duration_mins',
  'average_rating',
  'avg_rating_patience',
  'avg_rating_communication',
  'avg_rating_value',
  'avg_rating_punctuality',
  'review_count',
  'years_experience',
  'vehicle_year',
] as const;

export function sanitizePublicInstructor<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (PUBLIC_COLUMN_SET.has(key)) safe[key] = value;
  }

  // The database allows nulls for many optional fields. Normalise them here so
  // every public page/API can render without null checks or NaN output.
  for (const field of ARRAY_FIELDS) {
    if (!Array.isArray(safe[field])) safe[field] = [];
  }
  for (const field of NUMBER_FIELDS) {
    const value = safe[field];
    safe[field] =
      typeof value === 'number' && Number.isFinite(value)
        ? value
        : value === null || value === undefined || value === ''
          ? 0
          : Number.isFinite(Number(value))
            ? Number(value)
            : 0;
  }
  for (const field of ['dual_controls', 'specialises_anxiety', 'accepts_international', 'is_verified', 'is_claimed']) {
    safe[field] = Boolean(safe[field]);
  }

  return safe;
}
