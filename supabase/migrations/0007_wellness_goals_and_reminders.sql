-- HerHealth — Phase 10: wellness goals, goal progress, and reminder preferences
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- public.set_profiles_updated_at() (from 0001_profiles.sql, already reused
-- by 0003, 0004, 0005, and 0006) was re-verified live immediately before
-- writing this migration: a brand-new test profile was created and
-- updated, and its updated_at timestamp changed accordingly, confirming
-- the function still exists and correctly sets NEW.updated_at = now(). It
-- is reused here rather than duplicated.
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout.
-- Does not modify 0001-0006 or any existing data.

create table if not exists public.wellness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  note text,
  target_count integer,
  target_period text,
  status text not null default 'active',
  start_date date not null,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wellness_goals drop constraint if exists wellness_goals_title_check;
alter table public.wellness_goals add constraint wellness_goals_title_check
  check (char_length(btrim(title)) > 0 and char_length(title) <= 120);

alter table public.wellness_goals drop constraint if exists wellness_goals_category_check;
alter table public.wellness_goals add constraint wellness_goals_category_check
  check (category in ('checkins', 'journaling', 'cycle_tracking', 'custom'));

alter table public.wellness_goals drop constraint if exists wellness_goals_note_length_check;
alter table public.wellness_goals add constraint wellness_goals_note_length_check
  check (note is null or char_length(note) <= 500);

alter table public.wellness_goals drop constraint if exists wellness_goals_status_check;
alter table public.wellness_goals add constraint wellness_goals_status_check
  check (status in ('active', 'completed', 'archived'));

alter table public.wellness_goals drop constraint if exists wellness_goals_target_count_check;
alter table public.wellness_goals add constraint wellness_goals_target_count_check
  check (target_count is null or target_count > 0);

alter table public.wellness_goals drop constraint if exists wellness_goals_target_period_check;
alter table public.wellness_goals add constraint wellness_goals_target_period_check
  check (target_period is null or target_period in ('day', 'week', 'month'));

-- target_period only makes sense alongside a target_count; target_count
-- alone (no period) represents a one-time/total target rather than a
-- recurring frequency.
alter table public.wellness_goals drop constraint if exists wellness_goals_target_pairing_check;
alter table public.wellness_goals add constraint wellness_goals_target_pairing_check
  check (target_period is null or target_count is not null);

alter table public.wellness_goals drop constraint if exists wellness_goals_target_date_check;
alter table public.wellness_goals add constraint wellness_goals_target_date_check
  check (target_date is null or target_date >= start_date);

create index if not exists wellness_goals_user_id_status_idx
  on public.wellness_goals (user_id, status);

alter table public.wellness_goals enable row level security;

drop policy if exists "Users can read own wellness goals" on public.wellness_goals;
create policy "Users can read own wellness goals"
  on public.wellness_goals for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own wellness goals" on public.wellness_goals;
create policy "Users can insert own wellness goals"
  on public.wellness_goals for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own wellness goals" on public.wellness_goals;
create policy "Users can update own wellness goals"
  on public.wellness_goals for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wellness goals" on public.wellness_goals;
create policy "Users can delete own wellness goals"
  on public.wellness_goals for delete using (auth.uid() = user_id);

drop trigger if exists wellness_goals_set_updated_at on public.wellness_goals;
create trigger wellness_goals_set_updated_at
  before update on public.wellness_goals
  for each row execute function public.set_profiles_updated_at();

-- Goal progress entries: needed only because 'custom' goals have no other
-- data source to derive progress from. Category-linked goals (checkins,
-- journaling, cycle_tracking) derive progress by counting the existing
-- daily_checkins/journal_entries/period_records tables instead — no
-- separate progress row is created for those, avoiding duplicate data.
-- Append-only by design: create or delete, never edit — so there is no
-- update policy; RLS denies updates by default with no policy present,
-- which is the intended behavior here, not an omission.
create table if not exists public.goal_progress_entries (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.wellness_goals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  progress_date date not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.goal_progress_entries drop constraint if exists goal_progress_entries_note_length_check;
alter table public.goal_progress_entries add constraint goal_progress_entries_note_length_check
  check (note is null or char_length(note) <= 500);

create index if not exists goal_progress_entries_goal_id_date_idx
  on public.goal_progress_entries (goal_id, progress_date desc);

alter table public.goal_progress_entries enable row level security;

drop policy if exists "Users can read own goal progress entries" on public.goal_progress_entries;
create policy "Users can read own goal progress entries"
  on public.goal_progress_entries for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own goal progress entries" on public.goal_progress_entries;
create policy "Users can insert own goal progress entries"
  on public.goal_progress_entries for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own goal progress entries" on public.goal_progress_entries;
create policy "Users can delete own goal progress entries"
  on public.goal_progress_entries for delete using (auth.uid() = user_id);

-- Reminder preferences: one row per user per supported activity. Stores
-- preferences only — no notification is sent by this migration or by the
-- application in this phase. See the Phase 10 report for the infrastructure
-- (Edge Function / push / email provider) that real delivery would require.
create table if not exists public.reminder_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_type text not null,
  enabled boolean not null default false,
  reminder_time time not null default '09:00:00',
  reminder_days text[] not null default array['mon','tue','wed','thu','fri','sat','sun'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reminder_preferences drop constraint if exists reminder_preferences_activity_type_check;
alter table public.reminder_preferences add constraint reminder_preferences_activity_type_check
  check (activity_type in ('checkins', 'journaling', 'cycle_tracking', 'goals'));

alter table public.reminder_preferences drop constraint if exists reminder_preferences_days_check;
alter table public.reminder_preferences add constraint reminder_preferences_days_check
  check (reminder_days <@ array['mon','tue','wed','thu','fri','sat','sun']::text[]);

alter table public.reminder_preferences drop constraint if exists reminder_preferences_user_activity_unique;
alter table public.reminder_preferences add constraint reminder_preferences_user_activity_unique
  unique (user_id, activity_type);

alter table public.reminder_preferences enable row level security;

drop policy if exists "Users can read own reminder preferences" on public.reminder_preferences;
create policy "Users can read own reminder preferences"
  on public.reminder_preferences for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own reminder preferences" on public.reminder_preferences;
create policy "Users can insert own reminder preferences"
  on public.reminder_preferences for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own reminder preferences" on public.reminder_preferences;
create policy "Users can update own reminder preferences"
  on public.reminder_preferences for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own reminder preferences" on public.reminder_preferences;
create policy "Users can delete own reminder preferences"
  on public.reminder_preferences for delete using (auth.uid() = user_id);

drop trigger if exists reminder_preferences_set_updated_at on public.reminder_preferences;
create trigger reminder_preferences_set_updated_at
  before update on public.reminder_preferences
  for each row execute function public.set_profiles_updated_at();
