-- HerHealth — Sleep Intelligence: real sleep tracking
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- No existing table stores sleep duration, bedtime, or wake time anywhere
-- in HerHealth. fertility_entries (0009) and pregnancy_entries (0010) each
-- carry a single sleep_quality rating, but both are scoped to their own
-- features (fertility tracking, pregnancy log) and neither captures
-- duration/bedtime/wake time — reusing either table would misattribute
-- general sleep tracking to an unrelated, opt-in-gated feature. This is
-- the general-purpose sleep log available to every user.
--
-- One row per calendar night (unique(user_id, entry_date), upserted by
-- date — same pattern as daily_checkins and fertility_entries), not
-- multiple-per-day like journal_entries/symptom_entries, since a person
-- has one night's sleep per date.
--
-- quality reuses the exact 'poor'/'fair'/'good'/'excellent' vocabulary
-- already established by fertility_entries.sleep_quality and
-- pregnancy_entries.sleep_quality, for consistency across the app rather
-- than inventing a new scale. bedtime/wake_time are plain `time` columns,
-- matching reminder_preferences.reminder_time's existing convention.
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout.
-- Does not modify any existing table.

create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  bedtime time,
  wake_time time,
  duration_minutes integer,
  quality text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sleep_entries drop constraint if exists sleep_entries_user_entry_date_unique;
alter table public.sleep_entries
  add constraint sleep_entries_user_entry_date_unique unique (user_id, entry_date);

alter table public.sleep_entries drop constraint if exists sleep_entries_quality_check;
alter table public.sleep_entries add constraint sleep_entries_quality_check
  check (quality is null or quality in ('poor', 'fair', 'good', 'excellent'));

alter table public.sleep_entries drop constraint if exists sleep_entries_duration_range_check;
alter table public.sleep_entries add constraint sleep_entries_duration_range_check
  check (duration_minutes is null or (duration_minutes >= 0 and duration_minutes <= 1440));

alter table public.sleep_entries drop constraint if exists sleep_entries_note_length_check;
alter table public.sleep_entries add constraint sleep_entries_note_length_check
  check (note is null or char_length(note) <= 500);

alter table public.sleep_entries drop constraint if exists sleep_entries_entry_date_check;
alter table public.sleep_entries add constraint sleep_entries_entry_date_check
  check (entry_date <= current_date);

create index if not exists sleep_entries_user_id_date_idx
  on public.sleep_entries (user_id, entry_date desc);

alter table public.sleep_entries enable row level security;

drop policy if exists "Users can read own sleep entries" on public.sleep_entries;
create policy "Users can read own sleep entries"
  on public.sleep_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own sleep entries" on public.sleep_entries;
create policy "Users can insert own sleep entries"
  on public.sleep_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own sleep entries" on public.sleep_entries;
create policy "Users can update own sleep entries"
  on public.sleep_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own sleep entries" on public.sleep_entries;
create policy "Users can delete own sleep entries"
  on public.sleep_entries for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists sleep_entries_set_updated_at on public.sleep_entries;
create trigger sleep_entries_set_updated_at
  before update on public.sleep_entries
  for each row
  execute function public.set_profiles_updated_at();
