-- LCarDrive Phase 8 — Leads table for student inquiry management
-- Run this in the Supabase SQL Editor or via `supabase db push`

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references instructors(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  suburb text,
  service text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_leads_instructor on leads(instructor_id);
create index if not exists idx_leads_status on leads(status);

alter table leads enable row level security;

create policy "Instructors can view their own leads"
  on leads for select using (
    instructor_id in (
      select id from instructors where clerk_user_id = auth.jwt()->>'sub'
    )
  );

create policy "Anyone can insert leads"
  on leads for insert with check (true);

create policy "Instructors can update their own leads"
  on leads for update using (
    instructor_id in (
      select id from instructors where clerk_user_id = auth.jwt()->>'sub'
    )
  );
