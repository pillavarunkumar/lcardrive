-- AI document scanning: manual review queue for low-confidence / invalid output

create table if not exists document_reviews (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references instructors(id) on delete cascade,
  clerk_user_id text not null,
  doc_type text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  confidence numeric,
  reason text,
  extracted jsonb not null default '{}'::jsonb,
  image_path text,
  model_attempts integer not null default 1,
  admin_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists idx_document_reviews_status
  on document_reviews(status, created_at desc);

create index if not exists idx_document_reviews_instructor
  on document_reviews(instructor_id);

alter table document_reviews enable row level security;
-- No policies: only the service-role key used by server routes can read/write.
