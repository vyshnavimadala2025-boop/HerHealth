-- HerHealth — Nutrition Companion: daily nutrition/hydration awareness log
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- No existing table supports general nutrition tracking. fertility_entries
-- (0009) has nutrition_quality + water_intake_glasses, and pregnancy_entries
-- (0010) has nutrition_habits + water_intake_glasses, but both are scoped
-- to their own opt-in features — reusing either would misattribute general
-- nutrition tracking to an unrelated feature. This is the general-purpose
-- log available to every user.
--
-- One row per calendar day (unique(user_id, entry_date), upserted by date —
-- same pattern as sleep_entries/daily_checkins/fertility_entries), matching
-- how this feature is scoped: a daily nutrition/hydration awareness
-- summary, not a per-meal food diary with calorie/nutrient calculation
-- (no approved data source exists for that — see Stage 3C's report).
--
-- hydration_glasses reuses the exact column name, type, and
-- 0-30 range-check convention already established by
-- fertility_entries.water_intake_glasses / pregnancy_entries.water_intake_glasses.
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout.
-- Does not modify any existing table.

create table if not exists public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  meals_logged text[] not null default '{}',
  food_categories text[] not null default '{}',
  hydration_glasses smallint,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nutrition_entries drop constraint if exists nutrition_entries_user_entry_date_unique;
alter table public.nutrition_entries
  add constraint nutrition_entries_user_entry_date_unique unique (user_id, entry_date);

alter table public.nutrition_entries drop constraint if exists nutrition_entries_meals_logged_check;
alter table public.nutrition_entries add constraint nutrition_entries_meals_logged_check
  check (meals_logged <@ array['breakfast', 'lunch', 'dinner', 'snack']::text[]);

alter table public.nutrition_entries drop constraint if exists nutrition_entries_food_categories_check;
alter table public.nutrition_entries add constraint nutrition_entries_food_categories_check
  check (
    food_categories <@ array[
      'vegetables',
      'fruits',
      'whole_grains',
      'protein',
      'dairy',
      'processed_food'
    ]::text[]
  );

alter table public.nutrition_entries drop constraint if exists nutrition_entries_hydration_range_check;
alter table public.nutrition_entries add constraint nutrition_entries_hydration_range_check
  check (hydration_glasses is null or (hydration_glasses >= 0 and hydration_glasses <= 30));

alter table public.nutrition_entries drop constraint if exists nutrition_entries_note_length_check;
alter table public.nutrition_entries add constraint nutrition_entries_note_length_check
  check (note is null or char_length(note) <= 500);

alter table public.nutrition_entries drop constraint if exists nutrition_entries_entry_date_check;
alter table public.nutrition_entries add constraint nutrition_entries_entry_date_check
  check (entry_date <= current_date);

create index if not exists nutrition_entries_user_id_date_idx
  on public.nutrition_entries (user_id, entry_date desc);

alter table public.nutrition_entries enable row level security;

drop policy if exists "Users can read own nutrition entries" on public.nutrition_entries;
create policy "Users can read own nutrition entries"
  on public.nutrition_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own nutrition entries" on public.nutrition_entries;
create policy "Users can insert own nutrition entries"
  on public.nutrition_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own nutrition entries" on public.nutrition_entries;
create policy "Users can update own nutrition entries"
  on public.nutrition_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own nutrition entries" on public.nutrition_entries;
create policy "Users can delete own nutrition entries"
  on public.nutrition_entries for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists nutrition_entries_set_updated_at on public.nutrition_entries;
create trigger nutrition_entries_set_updated_at
  before update on public.nutrition_entries
  for each row
  execute function public.set_profiles_updated_at();
