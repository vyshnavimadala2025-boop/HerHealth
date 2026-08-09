-- HerHealth — Stress & Recovery: general stress/recovery check-in log
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Mood and energy are deliberately NOT duplicated here — daily_checkins
-- (0003) already stores both, and the Stress & Recovery page reuses that
-- data directly (via the existing useInsightsData()/moodTrend.ts/
-- energyTrend.ts pipeline) rather than asking the user to re-enter it.
-- This table only stores what nothing else in HerHealth captures: a
-- general-purpose stress level and recovery level/actions. fertility_entries
-- (0009) has its own stress_level, but it's scoped to fertility tracking;
-- reusing it here would misattribute a general wellness check-in to an
-- unrelated, opt-in-gated feature. "Recovery" has no existing tracked
-- field anywhere in HerHealth.
--
-- stress_level reuses the exact 'low'/'moderate'/'high'/'very_high'
-- vocabulary already established by fertility_entries.stress_level, for
-- consistency rather than inventing a new scale; recovery_level reuses
-- the same vocabulary applied to a new dimension.
--
-- One row per calendar day (unique(user_id, entry_date), upserted by
-- date — same pattern as sleep_entries/nutrition_entries).
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout.
-- Does not modify any existing table (including daily_checkins).

create table if not exists public.stress_recovery_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  stress_level text,
  recovery_level text,
  recovery_actions text[] not null default '{}',
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stress_recovery_entries drop constraint if exists stress_recovery_entries_user_entry_date_unique;
alter table public.stress_recovery_entries
  add constraint stress_recovery_entries_user_entry_date_unique unique (user_id, entry_date);

alter table public.stress_recovery_entries drop constraint if exists stress_recovery_entries_stress_level_check;
alter table public.stress_recovery_entries add constraint stress_recovery_entries_stress_level_check
  check (stress_level is null or stress_level in ('low', 'moderate', 'high', 'very_high'));

alter table public.stress_recovery_entries drop constraint if exists stress_recovery_entries_recovery_level_check;
alter table public.stress_recovery_entries add constraint stress_recovery_entries_recovery_level_check
  check (recovery_level is null or recovery_level in ('low', 'moderate', 'high', 'very_high'));

alter table public.stress_recovery_entries drop constraint if exists stress_recovery_entries_recovery_actions_check;
alter table public.stress_recovery_entries add constraint stress_recovery_entries_recovery_actions_check
  check (
    recovery_actions <@ array[
      'rest',
      'movement',
      'breathing',
      'social_support',
      'nature',
      'hobby',
      'other'
    ]::text[]
  );

alter table public.stress_recovery_entries drop constraint if exists stress_recovery_entries_reflection_length_check;
alter table public.stress_recovery_entries add constraint stress_recovery_entries_reflection_length_check
  check (reflection is null or char_length(reflection) <= 500);

alter table public.stress_recovery_entries drop constraint if exists stress_recovery_entries_entry_date_check;
alter table public.stress_recovery_entries add constraint stress_recovery_entries_entry_date_check
  check (entry_date <= current_date);

create index if not exists stress_recovery_entries_user_id_date_idx
  on public.stress_recovery_entries (user_id, entry_date desc);

alter table public.stress_recovery_entries enable row level security;

drop policy if exists "Users can read own stress recovery entries" on public.stress_recovery_entries;
create policy "Users can read own stress recovery entries"
  on public.stress_recovery_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own stress recovery entries" on public.stress_recovery_entries;
create policy "Users can insert own stress recovery entries"
  on public.stress_recovery_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own stress recovery entries" on public.stress_recovery_entries;
create policy "Users can update own stress recovery entries"
  on public.stress_recovery_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own stress recovery entries" on public.stress_recovery_entries;
create policy "Users can delete own stress recovery entries"
  on public.stress_recovery_entries for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists stress_recovery_entries_set_updated_at on public.stress_recovery_entries;
create trigger stress_recovery_entries_set_updated_at
  before update on public.stress_recovery_entries
  for each row
  execute function public.set_profiles_updated_at();
