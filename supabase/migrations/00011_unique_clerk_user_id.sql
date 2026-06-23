-- Add unique constraint on clerk_user_id for upsert support
alter table instructors add constraint instructors_clerk_user_id_key unique (clerk_user_id);
