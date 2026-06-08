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
  dual_controls: boolean;
  languages: string[];
  gender?: 'male' | 'female' | 'prefer_not_to_say';
  availability_days: string[];
  specialises_anxiety: boolean;
  accepts_international: boolean;
  familiar_test_centres: string[];
  adi_registration?: string;
  years_experience?: number;
  profile_completeness: number;
  is_claimed: boolean;
  is_verified: boolean;
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
  test_centre?: string;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
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
