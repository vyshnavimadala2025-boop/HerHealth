-- HerHealth — Fertility Journey: daily fertility & habit tracking
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Fertile-window/ovulation estimates are computed client-side (see
-- src/features/fertility/fertilityCalculations.ts) from the *existing*
-- public.period_records table (0004_period_records.sql) — no cycle data is
-- duplicated here. This migration only adds the daily fertility/habit log.
--
-- Written to be safe to run more than once: table creation, constraints,
-- policies, and the trigger are all dropped-and-recreated (or use
-- IF NOT EXISTS / IF EXISTS) so re-running it does not error on duplicates.

create table if not exists public.fertility_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  cervical_mucus text,
  bbt_celsius numeric(4,2),
  ovulation_test text,
  mood text,
  energy_level text,
  sleep_quality text,
  stress_level text,
  nutrition_quality text,
  water_intake_glasses smallint,
  exercise_minutes smallint,
  intimacy boolean not null default false,
  habits text[] not null default '{}',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fertility_entries drop constraint if exists fertility_entries_user_entry_date_unique;
alter table public.fertility_entries
  add constraint fertility_entries_user_entry_date_unique unique (user_id, entry_date);

alter table public.fertility_entries drop constraint if exists fertility_entries_cervical_mucus_check;
alter table public.fertility_entries
  add constraint fertility_entries_cervical_mucus_check
  check (cervical_mucus is null or cervical_mucus in ('dry', 'sticky', 'creamy', 'watery', 'egg_white'));

alter table public.fertility_entries drop constraint if exists fertility_entries_ovulation_test_check;
alter table public.fertility_entries
  add constraint fertility_entries_ovulation_test_check
  check (ovulation_test is null or ovulation_test in ('not_tested', 'negative', 'positive'));

alter table public.fertility_entries drop constraint if exists fertility_entries_mood_check;
alter table public.fertility_entries
  add constraint fertility_entries_mood_check
  check (mood is null or mood in ('great', 'good', 'okay', 'low', 'difficult'));

alter table public.fertility_entries drop constraint if exists fertility_entries_energy_level_check;
alter table public.fertility_entries
  add constraint fertility_entries_energy_level_check
  check (energy_level is null or energy_level in ('very_low', 'low', 'moderate', 'high', 'very_high'));

alter table public.fertility_entries drop constraint if exists fertility_entries_sleep_quality_check;
alter table public.fertility_entries
  add constraint fertility_entries_sleep_quality_check
  check (sleep_quality is null or sleep_quality in ('poor', 'fair', 'good', 'excellent'));

alter table public.fertility_entries drop constraint if exists fertility_entries_stress_level_check;
alter table public.fertility_entries
  add constraint fertility_entries_stress_level_check
  check (stress_level is null or stress_level in ('low', 'moderate', 'high', 'very_high'));

alter table public.fertility_entries drop constraint if exists fertility_entries_nutrition_quality_check;
alter table public.fertility_entries
  add constraint fertility_entries_nutrition_quality_check
  check (nutrition_quality is null or nutrition_quality in ('poor', 'fair', 'good', 'excellent'));

alter table public.fertility_entries drop constraint if exists fertility_entries_bbt_range_check;
alter table public.fertility_entries
  add constraint fertility_entries_bbt_range_check
  check (bbt_celsius is null or (bbt_celsius >= 34.0 and bbt_celsius <= 42.0));

alter table public.fertility_entries drop constraint if exists fertility_entries_water_range_check;
alter table public.fertility_entries
  add constraint fertility_entries_water_range_check
  check (water_intake_glasses is null or (water_intake_glasses >= 0 and water_intake_glasses <= 30));

alter table public.fertility_entries drop constraint if exists fertility_entries_exercise_range_check;
alter table public.fertility_entries
  add constraint fertility_entries_exercise_range_check
  check (exercise_minutes is null or (exercise_minutes >= 0 and exercise_minutes <= 600));

alter table public.fertility_entries drop constraint if exists fertility_entries_habits_check;
alter table public.fertility_entries
  add constraint fertility_entries_habits_check
  check (
    habits <@ array[
      'prenatal_vitamins',
      'water_goal',
      'exercise',
      'meditation',
      'healthy_meals',
      'reduced_caffeine',
      'reduced_alcohol',
      'sleep_goal'
    ]::text[]
  );

alter table public.fertility_entries drop constraint if exists fertility_entries_note_length_check;
alter table public.fertility_entries
  add constraint fertility_entries_note_length_check
  check (note is null or char_length(note) <= 500);

alter table public.fertility_entries enable row level security;

drop policy if exists "Users can read own fertility entries" on public.fertility_entries;
create policy "Users can read own fertility entries"
  on public.fertility_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own fertility entries" on public.fertility_entries;
create policy "Users can insert own fertility entries"
  on public.fertility_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own fertility entries" on public.fertility_entries;
create policy "Users can update own fertility entries"
  on public.fertility_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own fertility entries" on public.fertility_entries;
create policy "Users can delete own fertility entries"
  on public.fertility_entries for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists fertility_entries_set_updated_at on public.fertility_entries;
create trigger fertility_entries_set_updated_at
  before update on public.fertility_entries
  for each row
  execute function public.set_profiles_updated_at();
