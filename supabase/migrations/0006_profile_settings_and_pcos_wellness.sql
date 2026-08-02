-- HerHealth — Phase 9: profile settings + optional PCOS/PCOD wellness tracking
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- public.set_profiles_updated_at() (from 0001_profiles.sql, already reused
-- by 0003, 0004, and 0005) was re-verified live immediately before writing
-- this migration: a brand-new test profile was created and updated, and
-- its updated_at timestamp changed accordingly, confirming the function
-- still exists and correctly sets NEW.updated_at = now(). It is reused
-- here rather than duplicated.
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout,
-- and every alter is drop-then-add, so a second run doesn't error and
-- doesn't touch or delete any existing data.

-- A. Opt-in flag lives on the existing profiles table (a single scalar per
-- user, same shape as age_range/onboarding_completed) — no new table for
-- this. Existing profiles RLS policies (auth.uid() = id, for select and
-- update) already cover this new column with no changes required.
alter table public.profiles
  add column if not exists pcos_tracking_enabled boolean not null default false;

-- B. Wellness entries are a dated, one-to-many list — a dedicated table,
-- consistent with daily_checkins/period_records/journal_entries.
create table if not exists public.pcos_wellness_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  observations text[] not null default '{}',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pcos_wellness_entries drop constraint if exists pcos_wellness_entries_observations_check;
alter table public.pcos_wellness_entries
  add constraint pcos_wellness_entries_observations_check
  check (
    observations <@ array[
      'skin_changes', 'hair_growth_changes', 'weight_changes', 'appetite_changes',
      'sleep_changes', 'digestive_changes', 'fatigue', 'none_noted'
    ]::text[]
  );

alter table public.pcos_wellness_entries drop constraint if exists pcos_wellness_entries_note_length_check;
alter table public.pcos_wellness_entries
  add constraint pcos_wellness_entries_note_length_check
  check (note is null or char_length(note) <= 500);

-- No "not in the future" check constraint — database timezone and the
-- user's local date can differ; enforced client-side only via the
-- project's existing local-date pattern.
--
-- No uniqueness constraint on (user_id, entry_date) — multiple entries per
-- day are allowed, matching the journal's flexibility rather than the
-- one-per-day rule used by daily_checkins/period_records, since nothing in
-- this feature's requirements calls for a single-entry-per-day rule.

create index if not exists pcos_wellness_entries_user_id_entry_date_idx
  on public.pcos_wellness_entries (user_id, entry_date desc, created_at desc);

alter table public.pcos_wellness_entries enable row level security;

drop policy if exists "Users can read own pcos wellness entries" on public.pcos_wellness_entries;
create policy "Users can read own pcos wellness entries"
  on public.pcos_wellness_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own pcos wellness entries" on public.pcos_wellness_entries;
create policy "Users can insert own pcos wellness entries"
  on public.pcos_wellness_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pcos wellness entries" on public.pcos_wellness_entries;
create policy "Users can update own pcos wellness entries"
  on public.pcos_wellness_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pcos wellness entries" on public.pcos_wellness_entries;
create policy "Users can delete own pcos wellness entries"
  on public.pcos_wellness_entries for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists pcos_wellness_entries_set_updated_at on public.pcos_wellness_entries;
create trigger pcos_wellness_entries_set_updated_at
  before update on public.pcos_wellness_entries
  for each row
  execute function public.set_profiles_updated_at();
