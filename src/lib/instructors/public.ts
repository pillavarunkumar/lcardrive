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

export function sanitizePublicInstructor<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (PUBLIC_COLUMN_SET.has(key)) safe[key] = value;
  }
  return safe;
}
