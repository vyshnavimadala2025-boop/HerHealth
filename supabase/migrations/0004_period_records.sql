-- HerHealth — Phase 6: period & menstrual cycle tracking
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- The updated-at trigger function public.set_profiles_updated_at() (from
-- 0001_profiles.sql, already reused by 0003_daily_checkins.sql) was
-- re-verified live immediately before writing this migration: a brand-new
-- test profile was created and updated, and its updated_at timestamp
-- changed accordingly, confirming the function still exists and correctly
-- sets NEW.updated_at = now(). It is reused here rather than duplicated.
--
-- This migration is written to be safe to run more than once: table
-- creation, constraints, policies, and the trigger are all dropped-and-
-- recreated (or use IF NOT EXISTS / IF EXISTS) so re-running it does not
-- error on duplicate objects.

create table if not exists public.period_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  start_date date not null,
  end_date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Constraints: drop-then-add so this migration can be safely rerun.
alter table public.period_records drop constraint if exists period_records_user_start_date_unique;
alter table public.period_records
  add constraint period_records_user_start_date_unique unique (user_id, start_date);

alter table public.period_records drop constraint if exists period_records_end_after_start_check;
alter table public.period_records
  add constraint period_records_end_after_start_check
  check (end_date is null or end_date >= start_date);

alter table public.period_records drop constraint if exists period_records_note_length_check;
alter table public.period_records
  add constraint period_records_note_length_check
  check (note is null or char_length(note) <= 500);

alter table public.period_records enable row level security;

drop policy if exists "Users can read own period records" on public.period_records;
create policy "Users can read own period records"
  on public.period_records for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own period records" on public.period_records;
create policy "Users can insert own period records"
  on public.period_records for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own period records" on public.period_records;
create policy "Users can update own period records"
  on public.period_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own period records" on public.period_records;
create policy "Users can delete own period records"
  on public.period_records for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists period_records_set_updated_at on public.period_records;
create trigger period_records_set_updated_at
  before update on public.period_records
  for each row
  execute function public.set_profiles_updated_at();
