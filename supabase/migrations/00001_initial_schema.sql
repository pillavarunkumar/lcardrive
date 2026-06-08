-- LCarDrive Phase 1 — Initial Schema

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Instructors table
create table if not exists instructors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  bio text check (char_length(bio) <= 500),
  profile_photo_url text,
  suburb text not null,
  state text not null default 'VIC',
  postcode text,
  lat numeric,
  lng numeric,
  service_suburbs text[] default '{}',
  service_radius_km integer default 10,
  hourly_rate numeric check (hourly_rate > 0),
  package_options jsonb default '[]'::jsonb,
  licence_types text[] default '{car}',
  transmission text check (transmission in ('auto', 'manual', 'both')),
  lesson_duration_mins integer check (lesson_duration_mins in (60, 90)),
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  dual_controls boolean default true,
  languages text[] default '{}',
  gender text check (gender in ('male', 'female', 'prefer_not_to_say')),
  availability_days text[] default '{}',
  specialises_anxiety boolean default false,
  accepts_international boolean default false,
  familiar_test_centres text[] default '{}',
  adi_registration text,
  years_experience integer,
  profile_completeness integer default 0 check (profile_completeness between 0 and 100),
  is_claimed boolean default false,
  is_verified boolean default false,
  clerk_user_id text,
  social_facebook text,
  social_google_biz text,
  average_rating numeric default 0,
  avg_rating_patience numeric default 0,
  avg_rating_communication numeric default 0,
  avg_rating_value numeric default 0,
  avg_rating_punctuality numeric default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references instructors(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text not null,
  rating_overall integer not null check (rating_overall between 1 and 5),
  rating_patience integer not null check (rating_patience between 1 and 5),
  rating_communication integer not null check (rating_communication between 1 and 5),
  rating_value integer not null check (rating_value between 1 and 5),
  rating_punctuality integer not null check (rating_punctuality between 1 and 5),
  pass_outcome text check (pass_outcome in ('passed_first', 'passed_retry', 'still_learning', 'not_tested')),
  review_text text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- Listing flags for learner-reported issues
create table if not exists listing_flags (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references instructors(id) on delete cascade,
  reason text check (reason in ('incorrect_info', 'inappropriate', 'duplicate', 'other')),
  detail text,
  is_resolved boolean default false,
  created_at timestamptz default now()
);

-- Search logs for analytics
create table if not exists search_logs (
  id uuid primary key default gen_random_uuid(),
  suburb text,
  postcode text,
  filters_applied jsonb default '{}'::jsonb,
  results_count integer,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_instructors_suburb on instructors(suburb);
create index if not exists idx_instructors_slug on instructors(slug);
create index if not exists idx_instructors_verified on instructors(is_verified);
create index if not exists idx_reviews_instructor on reviews(instructor_id);
create index if not exists idx_reviews_approved on reviews(is_approved);
create index if not exists idx_search_logs_created on search_logs(created_at);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_instructors_updated_at
  before update on instructors
  for each row execute function update_updated_at();

-- Row Level Security
alter table instructors enable row level security;
alter table reviews enable row level security;
alter table listing_flags enable row level security;
alter table search_logs enable row level security;

-- RLS: anyone can read public instructor data
create policy "Public can read instructors"
  on instructors for select using (true);

-- RLS: instructors can update their own profile
create policy "Instructors can update own profile"
  on instructors for update using (clerk_user_id = auth.jwt()->>'sub');

-- RLS: anyone can insert reviews
create policy "Anyone can insert reviews"
  on reviews for insert with check (true);

-- RLS: public can read approved reviews
create policy "Public can read approved reviews"
  on reviews for select using (is_approved = true);
