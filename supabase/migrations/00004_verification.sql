ALTER TABLE instructors ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMPTZ;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS documents_submitted_at TIMESTAMPTZ;
