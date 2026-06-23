-- Add availability_slots JSONB column for time-slot-based availability
alter table instructors add column if not exists availability_slots jsonb default '{}'::jsonb;
