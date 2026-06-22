-- LCarDrive Phase 3 — Document image storage for instructors

alter table if exists instructors add column if not exists drivers_licence_image_url text;
alter table if exists instructors add column if not exists adi_registration_image_url text;
alter table if exists instructors add column if not exists certificate_iv_image_url text;
alter table if exists instructors add column if not exists wwcc_image_url text;
alter table if exists instructors add column if not exists police_check_image_url text;
alter table if exists instructors add column if not exists medical_assessment_image_url text;
alter table if exists instructors add column if not exists public_liability_image_url text;
alter table if exists instructors add column if not exists vehicle_image_url text;
