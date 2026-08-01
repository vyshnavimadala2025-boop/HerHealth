-- HerHealth — Phase 5: daily wellness check-ins
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- The updated-at trigger function public.set_profiles_updated_at() (from
-- 0001_profiles.sql) was verified live before writing this migration: a
-- profiles row was updated and its updated_at timestamp changed accordingly,
-- confirming the function exists and correctly sets NEW.updated_at = now().
-- It is generic (not profiles-specific), so it's reused here rather than
-- duplicated.

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  checkin_date date not null,
  mood text not null,
  energy_level text not null,
  wellbeing text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint daily_checkins_user_date_unique unique (user_id, checkin_date),

  constraint daily_checkins_mood_check
    check (mood in ('great', 'good', 'okay', 'low', 'difficult')),

  constraint daily_checkins_energy_level_check
    check (energy_level in ('very_low', 'low', 'moderate', 'high', 'very_high')),

  constraint daily_checkins_wellbeing_check
    check (wellbeing in (
      'feeling_well',
      'slightly_uncomfortable',
      'not_feeling_best',
      'need_to_take_it_easy'
    )),

  constraint daily_checkins_note_length_check
    check (note is null or char_length(note) <= 500)
);

alter table public.daily_checkins enable row level security;

create policy "Users can read own checkins"
  on public.daily_checkins for select
  using (auth.uid() = user_id);

create policy "Users can insert own checkins"
  on public.daily_checkins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own checkins"
  on public.daily_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No delete policy: deletion is not required in this phase, and RLS denies
-- by default when no policy matches, so deletes are blocked entirely.

drop trigger if exists daily_checkins_set_updated_at on public.daily_checkins;

create trigger daily_checkins_set_updated_at
  before update on public.daily_checkins
  for each row
  execute function public.set_profiles_updated_at();
