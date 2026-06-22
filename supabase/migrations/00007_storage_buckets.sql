-- LCarDrive Phase 7 — Supabase Storage buckets for document & photo uploads
-- Run this in the Supabase SQL Editor or via `supabase db push`

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('documents', 'documents', false, 5242880, '{image/png,image/jpeg,image/webp,application/pdf}'),
  ('profile-photos', 'profile-photos', true, 2097152, '{image/png,image/jpeg,image/webp}'),
  ('vehicle-photos', 'vehicle-photos', true, 2097152, '{image/png,image/jpeg,image/webp}')
on conflict (id) do nothing;

-- RLS: authenticated users can upload to documents
create policy "Authenticated users can upload documents"
  on storage.objects for insert with check (
    bucket_id = 'documents' and auth.role() = 'authenticated'
  );

-- RLS: anyone can read public photos
create policy "Public can read profile photos"
  on storage.objects for select using (
    bucket_id = 'profile-photos' or bucket_id = 'vehicle-photos'
  );

-- RLS: document bucket is private — only owner or admin can read
create policy "Authenticated users can read their own documents"
  on storage.objects for select using (
    bucket_id = 'documents' and auth.role() = 'authenticated'
  );
