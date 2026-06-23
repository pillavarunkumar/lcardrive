-- Run this entire script in your Supabase SQL editor to add ALL missing columns

-- ===== Migration 00002: Licences & Documents =====
alter table instructors add column if not exists drivers_licence_number text;
alter table instructors add column if not exists drivers_licence_expiry date;
alter table instructors add column if not exists adi_registration_expiry date;
alter table instructors add column if not exists certificate_iv_reference text;
alter table instructors add column if not exists certificate_iv_date date;
alter table instructors add column if not exists wwcc_number text;
alter table instructors add column if not exists wwcc_expiry date;
alter table instructors add column if not exists police_check_date date;
alter table instructors add column if not exists medical_assessment_date date;
alter table instructors add column if not exists medical_assessment_expiry date;
alter table instructors add column if not exists public_liability_provider text;
alter table instructors add column if not exists public_liability_policy_number text;
alter table instructors add column if not exists public_liability_expiry date;

-- ===== Migration 00003: Document Image URLs =====
alter table instructors add column if not exists drivers_licence_image_url text;
alter table instructors add column if not exists adi_registration_image_url text;
alter table instructors add column if not exists certificate_iv_image_url text;
alter table instructors add column if not exists wwcc_image_url text;
alter table instructors add column if not exists police_check_image_url text;
alter table instructors add column if not exists medical_assessment_image_url text;
alter table instructors add column if not exists public_liability_image_url text;
alter table instructors add column if not exists vehicle_image_url text;

-- ===== Migration 00004: Verification Timestamps =====
alter table instructors add column if not exists identity_verified_at timestamptz;
alter table instructors add column if not exists documents_submitted_at timestamptz;

-- ===== Migration 00005: Vehicle Fields =====
alter table instructors add column if not exists vehicle_rego text;
alter table instructors add column if not exists vehicle_color text;

-- ===== Migration 00006: Verified Name =====
alter table instructors add column if not exists verified_name text;

-- ===== Migration 00007: Storage Buckets =====
-- (run this separately via Supabase dashboard or API)

-- ===== Migration 00008: Leads Table =====
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references instructors(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  suburb text,
  service text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_leads_instructor on leads(instructor_id);
create index if not exists idx_leads_status on leads(status);

-- Add updated_at trigger for leads
create trigger update_leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- RLS for leads
alter table leads enable row level security;

create policy "Instructors can view their own leads"
  on leads for select using (
    instructor_id = (select id from instructors where clerk_user_id = auth.jwt()->>'sub')
  );

create policy "Anyone can insert leads"
  on leads for insert with check (true);

create policy "Instructors can update their own leads"
  on leads for update using (
    instructor_id = (select id from instructors where clerk_user_id = auth.jwt()->>'sub')
  );

-- ===== Migration 00009: Status Column =====
alter table instructors add column if not exists status text default 'draft';

-- ===== Migration 00010: Availability Slots =====
alter table instructors add column if not exists availability_slots jsonb default '{}'::jsonb;

-- ===== Migration 00011: Unique Constraint on clerk_user_id =====
-- First clean up any duplicate clerk_user_id values
delete from instructors a using (
  select min(id) as id, clerk_user_id
  from instructors
  where clerk_user_id is not null
  group by clerk_user_id
  having count(*) > 1
) b
where a.clerk_user_id = b.clerk_user_id and a.id <> b.id;

alter table instructors add constraint instructors_clerk_user_id_key unique (clerk_user_id);

-- ===== Migration 00012: Missing Profile Fields =====
alter table instructors add column if not exists teaching_style text;
alter table instructors add column if not exists primary_learner_types text;
alter table instructors add column if not exists vehicle_transmission text;
