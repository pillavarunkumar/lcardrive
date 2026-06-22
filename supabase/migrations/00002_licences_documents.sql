-- LCarDrive Phase 2 — Licences & Documents for Instructors

alter table if exists instructors add column if not exists drivers_licence_number text;
alter table if exists instructors add column if not exists drivers_licence_expiry date;
alter table if exists instructors add column if not exists adi_registration_expiry date;
alter table if exists instructors add column if not exists certificate_iv_reference text;
alter table if exists instructors add column if not exists certificate_iv_date date;
alter table if exists instructors add column if not exists wwcc_number text;
alter table if exists instructors add column if not exists wwcc_expiry date;
alter table if exists instructors add column if not exists police_check_date date;
alter table if exists instructors add column if not exists medical_assessment_date date;
alter table if exists instructors add column if not exists medical_assessment_expiry date;
alter table if exists instructors add column if not exists public_liability_provider text;
alter table if exists instructors add column if not exists public_liability_policy_number text;
alter table if exists instructors add column if not exists public_liability_expiry date;
