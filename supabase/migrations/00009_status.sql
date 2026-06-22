-- Add status column for instructor review workflow
alter table instructors add column if not exists status text default 'draft';

-- Set all existing instructors to approved so they remain visible
update instructors set status = 'approved' where status = 'draft';
