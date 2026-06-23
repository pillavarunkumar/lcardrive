-- Add missing profile editor columns
alter table instructors add column if not exists teaching_style text;
alter table instructors add column if not exists primary_learner_types text;
alter table instructors add column if not exists vehicle_transmission text;
