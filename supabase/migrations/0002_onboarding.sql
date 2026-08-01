-- HerHealth — Phase 4: onboarding fields on profiles
-- Run this manually in the Supabase SQL Editor for your project.
--
-- IMPORTANT: this migration assumes 0001_profiles.sql has already been run
-- (it creates the public.profiles table itself). A live check against this
-- project's REST API returned "Could not find the table 'public.profiles' in
-- the schema cache", which means the profiles table does not exist yet.
-- If you haven't already, run supabase/migrations/0001_profiles.sql FIRST,
-- then run this file.

-- Extend the existing table — no new table is created.
alter table public.profiles
  add column if not exists age_range text,
  add column if not exists tracking_preferences text[] not null default '{}',
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

-- Restrict age_range to the five values the app offers.
alter table public.profiles drop constraint if exists profiles_age_range_check;
alter table public.profiles
  add constraint profiles_age_range_check
  check (age_range is null or age_range in ('under_18', '18_24', '25_34', '35_44', '45_plus'));

-- Restrict tracking_preferences to the six categories the app offers.
alter table public.profiles drop constraint if exists profiles_tracking_preferences_check;
alter table public.profiles
  add constraint profiles_tracking_preferences_check
  check (
    tracking_preferences <@ array[
      'menstrual_cycle',
      'period_symptoms',
      'mood_wellbeing',
      'lifestyle_habits',
      'pcos_tracking',
      'general_notes'
    ]::text[]
  );

-- Defensive re-assertion of Phase 3's RLS setup. Safe to run even if it's
-- already correct — this does not disable RLS or grant any new access.
alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at is already kept current by the profiles_set_updated_at trigger
-- from 0001_profiles.sql — it applies to all columns on this table, so no
-- changes are needed here for the new columns.
