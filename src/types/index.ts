export interface Instructor {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  bio?: string;
  profile_photo_url?: string;
  suburb: string;
  state: string;
  postcode?: string;
  lat?: number;
  lng?: number;
  service_suburbs: string[];
  service_radius_km: number;
  hourly_rate?: number;
  package_options: PackageOption[];
  licence_types: LicenceType[];
  transmission?: 'auto' | 'manual' | 'both';
  lesson_duration_mins?: 60 | 90;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_rego?: string;
  vehicle_color?: string;
  dual_controls: boolean;
  teaching_style?: string;
  primary_learner_types?: string;
  vehicle_transmission?: string;
  languages: string[];
  gender?: 'male' | 'female' | 'prefer_not_to_say';
  availability_days: string[];
  availability_slots?: Record<string, string[]>;
  specialises_anxiety: boolean;
  accepts_international: boolean;
  familiar_test_centres: string[];
  adi_registration?: string;
  adi_registration_expiry?: string;
  drivers_licence_number?: string;
  drivers_licence_expiry?: string;
  certificate_iv_reference?: string;
  certificate_iv_date?: string;
  wwcc_number?: string;
  wwcc_expiry?: string;
  police_check_date?: string;
  medical_assessment_date?: string;
  medical_assessment_expiry?: string;
  public_liability_provider?: string;
  public_liability_policy_number?: string;
  public_liability_expiry?: string;
  drivers_licence_image_url?: string;
  adi_registration_image_url?: string;
  certificate_iv_image_url?: string;
  wwcc_image_url?: string;
  police_check_image_url?: string;
  medical_assessment_image_url?: string;
  public_liability_image_url?: string;
  vehicle_image_url?: string;
  years_experience?: number;
  profile_completeness: number;
  is_claimed: boolean;
  is_verified: boolean;
  has_pending_claim?: boolean;
  verified_name?: string;
  identity_verified_at?: string;
  documents_submitted_at?: string;
  clerk_user_id?: string;
  social_facebook?: string;
  social_google_biz?: string;
  average_rating: number;
  avg_rating_patience: number;
  avg_rating_communication: number;
  avg_rating_value: number;
  avg_rating_punctuality: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface PackageOption {
  hours: number;
  price: number;
  label: string;
}

export type LicenceType = 'car' | 'motorbike' | 'truck' | 'bus';

export interface Review {
  id: string;
  instructor_id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating_overall: number;
  rating_patience: number;
  rating_communication: number;
  rating_value: number;
  rating_punctuality: number;
  pass_outcome: PassOutcome;
  review_text?: string;
  is_approved: boolean;
  created_at: string;
}

export type PassOutcome = 'passed_first' | 'passed_retry' | 'still_learning' | 'not_tested';

export interface ListingFlag {
  id: string;
  instructor_id: string;
  reason: 'incorrect_info' | 'inappropriate' | 'duplicate' | 'other';
  detail?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  instructor_id: string;
  name: string;
  email: string;
  phone?: string;
  suburb?: string;
  service?: string;
  message?: string;
  status: 'new' | 'contacted' | 'booked' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface SearchLog {
  id: string;
  suburb?: string;
  postcode?: string;
  filters_applied?: Record<string, unknown>;
  results_count?: number;
  created_at: string;
}

export interface SearchFilters {
  suburb?: string;
  postcode?: string;
  radius_km?: number;
  licence_type?: LicenceType;
  transmission?: 'auto' | 'manual' | 'both';
  min_price?: number;
  max_price?: number;
  languages?: string[];
  gender?: string;
  anxiety_friendly?: boolean;
  international_conversion?: boolean;
  test_centre_familiarity?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'name_asc' | 'name_desc';
}

export interface AIQuery {
  suburb: string;
  transmission?: string;
  special_needs: string[];
  available_days: string[];
  max_hourly_rate: number;
}

export interface AIMatchResult {
  id: string;
  reason: string;
}
