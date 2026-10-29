-- Documents bucket is private and is only accessed through server-side signed
-- URLs. The previous policies allowed any authenticated user to read or write
-- every object in the bucket, which defeated the "owner or admin" intent.

-- Defensive: make sure the bucket itself stays private even if it was created
-- before migration 00007 or changed through the dashboard.
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = '{image/png,image/jpeg,image/webp,application/pdf}'
where id = 'documents';

drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Authenticated users can read their own documents" on storage.objects;

-- The application uses the service-role key for storage, which bypasses RLS.
-- Signed URLs are minted by /api/portal/documents/url and /api/admin/documents/*
-- after an authorisation check.
