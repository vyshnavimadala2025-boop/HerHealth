-- HerHealth — Symptom Explorer: general, non-diagnostic symptom logging
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Distinct from pcos_wellness_entries (0006)'s "observations" and
-- pregnancy_entries (0010)'s "symptoms" column — those are scoped to their
-- own features (PCOS/PCOD opt-in tracking, pregnancy log). This is the
-- general-purpose symptom log available to every user regardless of those
-- opt-ins, so it deliberately does not reuse either table. Multiple
-- entries per day are allowed (no unique(user_id, entry_date) constraint),
-- matching journal_entries' pattern rather than the one-row-per-day upsert
-- pattern used by daily_checkins/fertility_entries — a person may notice
-- and log more than one symptom in a day.
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout.
-- Does not modify any existing table.

create table if not exists public.symptom_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  symptoms text[] not null default '{}',
  severity text,
  timing text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.symptom_entries drop constraint if exists symptom_entries_symptoms_check;
alter table public.symptom_entries add constraint symptom_entries_symptoms_check
  check (
    symptoms <@ array[
      'fatigue',
      'headache',
      'bloating',
      'cramping',
      'nausea',
      'mood_changes',
      'breast_tenderness',
      'joint_pain',
      'skin_changes',
      'sleep_disturbance',
      'appetite_changes',
      'hot_flashes',
      'dizziness',
      'back_pain',
      'other'
    ]::text[]
  );

alter table public.symptom_entries drop constraint if exists symptom_entries_symptoms_nonempty_check;
alter table public.symptom_entries add constraint symptom_entries_symptoms_nonempty_check
  check (array_length(symptoms, 1) is not null and array_length(symptoms, 1) > 0);

alter table public.symptom_entries drop constraint if exists symptom_entries_severity_check;
alter table public.symptom_entries add constraint symptom_entries_severity_check
  check (severity is null or severity in ('mild', 'moderate', 'significant'));

alter table public.symptom_entries drop constraint if exists symptom_entries_timing_check;
alter table public.symptom_entries add constraint symptom_entries_timing_check
  check (timing is null or timing in ('morning', 'afternoon', 'evening', 'night', 'all_day'));

alter table public.symptom_entries drop constraint if exists symptom_entries_note_length_check;
alter table public.symptom_entries add constraint symptom_entries_note_length_check
  check (note is null or char_length(note) <= 500);

alter table public.symptom_entries drop constraint if exists symptom_entries_entry_date_check;
alter table public.symptom_entries add constraint symptom_entries_entry_date_check
  check (entry_date <= current_date);

create index if not exists symptom_entries_user_id_date_idx
  on public.symptom_entries (user_id, entry_date desc);

alter table public.symptom_entries enable row level security;

drop policy if exists "Users can read own symptom entries" on public.symptom_entries;
create policy "Users can read own symptom entries"
  on public.symptom_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own symptom entries" on public.symptom_entries;
create policy "Users can insert own symptom entries"
  on public.symptom_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own symptom entries" on public.symptom_entries;
create policy "Users can update own symptom entries"
  on public.symptom_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own symptom entries" on public.symptom_entries;
create policy "Users can delete own symptom entries"
  on public.symptom_entries for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists symptom_entries_set_updated_at on public.symptom_entries;
create trigger symptom_entries_set_updated_at
  before update on public.symptom_entries
  for each row
  execute function public.set_profiles_updated_at();
