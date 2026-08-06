-- HerHealth — Baby Growth: pregnancy wellness companion
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Five tables, matching this app's existing one-table-per-concern pattern
-- (period_records, daily_checkins, pcos_wellness_entries, wellness_goals,
-- journal_entries): a settings/profile record (incl. birth-plan fields,
-- since it's a single free-form record per user, not a list), a daily
-- wellness+nutrition log, appointments, milestones, and a shopping
-- checklist. No kick-counter table — the spec explicitly allows a
-- future-ready placeholder with no backend yet. No pregnancy-specific
-- journal table either — the existing journal_entries table (generic
-- title/content/date) is reused directly rather than duplicated.
--
-- Written to be safe to run more than once: table creation, constraints,
-- policies, and triggers are all dropped-and-recreated (or use
-- IF NOT EXISTS / IF EXISTS) so re-running it does not error on duplicates.

-- ---------------------------------------------------------------------
-- pregnancy_profiles — one row per user: due date + birth-plan fields
-- ---------------------------------------------------------------------
create table if not exists public.pregnancy_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  due_date date not null,
  preferred_hospital text,
  emergency_contact text,
  support_person text,
  pain_management_preference text,
  birth_plan_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pregnancy_profiles drop constraint if exists pregnancy_profiles_user_id_unique;
alter table public.pregnancy_profiles add constraint pregnancy_profiles_user_id_unique unique (user_id);

alter table public.pregnancy_profiles drop constraint if exists pregnancy_profiles_notes_length_check;
alter table public.pregnancy_profiles
  add constraint pregnancy_profiles_notes_length_check
  check (birth_plan_notes is null or char_length(birth_plan_notes) <= 1000);

alter table public.pregnancy_profiles enable row level security;

drop policy if exists "Users can read own pregnancy profile" on public.pregnancy_profiles;
create policy "Users can read own pregnancy profile"
  on public.pregnancy_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own pregnancy profile" on public.pregnancy_profiles;
create policy "Users can insert own pregnancy profile"
  on public.pregnancy_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pregnancy profile" on public.pregnancy_profiles;
create policy "Users can update own pregnancy profile"
  on public.pregnancy_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pregnancy profile" on public.pregnancy_profiles;
create policy "Users can delete own pregnancy profile"
  on public.pregnancy_profiles for delete
  using (auth.uid() = user_id);

drop trigger if exists pregnancy_profiles_set_updated_at on public.pregnancy_profiles;
create trigger pregnancy_profiles_set_updated_at
  before update on public.pregnancy_profiles
  for each row
  execute function public.set_profiles_updated_at();

-- ---------------------------------------------------------------------
-- pregnancy_entries — daily wellness + nutrition log
-- ---------------------------------------------------------------------
create table if not exists public.pregnancy_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  mood text,
  energy_level text,
  sleep_quality text,
  water_intake_glasses smallint,
  exercise_minutes smallint,
  weight_kg numeric(5,2),
  blood_pressure_systolic smallint,
  blood_pressure_diastolic smallint,
  baby_movement_note text,
  symptoms text[] not null default '{}',
  nutrition_habits text[] not null default '{}',
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_user_entry_date_unique;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_user_entry_date_unique unique (user_id, entry_date);

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_mood_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_mood_check
  check (mood is null or mood in ('great', 'good', 'okay', 'low', 'difficult'));

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_energy_level_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_energy_level_check
  check (energy_level is null or energy_level in ('very_low', 'low', 'moderate', 'high', 'very_high'));

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_sleep_quality_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_sleep_quality_check
  check (sleep_quality is null or sleep_quality in ('poor', 'fair', 'good', 'excellent'));

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_water_range_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_water_range_check
  check (water_intake_glasses is null or (water_intake_glasses >= 0 and water_intake_glasses <= 30));

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_exercise_range_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_exercise_range_check
  check (exercise_minutes is null or (exercise_minutes >= 0 and exercise_minutes <= 600));

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_weight_range_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_weight_range_check
  check (weight_kg is null or (weight_kg >= 20 and weight_kg <= 300));

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_bp_systolic_range_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_bp_systolic_range_check
  check (blood_pressure_systolic is null or (blood_pressure_systolic >= 60 and blood_pressure_systolic <= 250));

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_bp_diastolic_range_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_bp_diastolic_range_check
  check (blood_pressure_diastolic is null or (blood_pressure_diastolic >= 40 and blood_pressure_diastolic <= 150));

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_symptoms_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_symptoms_check
  check (
    symptoms <@ array[
      'nausea', 'fatigue', 'backache', 'swelling', 'heartburn', 'cramping', 'headache', 'none'
    ]::text[]
  );

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_nutrition_habits_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_nutrition_habits_check
  check (
    nutrition_habits <@ array[
      'water_goal', 'fruits', 'vegetables', 'protein', 'iron', 'calcium', 'folic_acid', 'prenatal_vitamins'
    ]::text[]
  );

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_movement_note_length_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_movement_note_length_check
  check (baby_movement_note is null or char_length(baby_movement_note) <= 500);

alter table public.pregnancy_entries drop constraint if exists pregnancy_entries_reflection_length_check;
alter table public.pregnancy_entries
  add constraint pregnancy_entries_reflection_length_check
  check (reflection is null or char_length(reflection) <= 500);

alter table public.pregnancy_entries enable row level security;

drop policy if exists "Users can read own pregnancy entries" on public.pregnancy_entries;
create policy "Users can read own pregnancy entries"
  on public.pregnancy_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own pregnancy entries" on public.pregnancy_entries;
create policy "Users can insert own pregnancy entries"
  on public.pregnancy_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pregnancy entries" on public.pregnancy_entries;
create policy "Users can update own pregnancy entries"
  on public.pregnancy_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pregnancy entries" on public.pregnancy_entries;
create policy "Users can delete own pregnancy entries"
  on public.pregnancy_entries for delete
  using (auth.uid() = user_id);

drop trigger if exists pregnancy_entries_set_updated_at on public.pregnancy_entries;
create trigger pregnancy_entries_set_updated_at
  before update on public.pregnancy_entries
  for each row
  execute function public.set_profiles_updated_at();

-- ---------------------------------------------------------------------
-- pregnancy_appointments
-- ---------------------------------------------------------------------
create table if not exists public.pregnancy_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  appointment_type text not null,
  title text not null,
  appointment_date date not null,
  appointment_time time,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pregnancy_appointments drop constraint if exists pregnancy_appointments_type_check;
alter table public.pregnancy_appointments
  add constraint pregnancy_appointments_type_check
  check (appointment_type in ('doctor_visit', 'ultrasound', 'blood_test', 'vaccination', 'hospital_visit', 'other'));

alter table public.pregnancy_appointments drop constraint if exists pregnancy_appointments_title_length_check;
alter table public.pregnancy_appointments
  add constraint pregnancy_appointments_title_length_check
  check (char_length(title) <= 120);

alter table public.pregnancy_appointments drop constraint if exists pregnancy_appointments_note_length_check;
alter table public.pregnancy_appointments
  add constraint pregnancy_appointments_note_length_check
  check (note is null or char_length(note) <= 500);

alter table public.pregnancy_appointments enable row level security;

drop policy if exists "Users can read own pregnancy appointments" on public.pregnancy_appointments;
create policy "Users can read own pregnancy appointments"
  on public.pregnancy_appointments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own pregnancy appointments" on public.pregnancy_appointments;
create policy "Users can insert own pregnancy appointments"
  on public.pregnancy_appointments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pregnancy appointments" on public.pregnancy_appointments;
create policy "Users can update own pregnancy appointments"
  on public.pregnancy_appointments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pregnancy appointments" on public.pregnancy_appointments;
create policy "Users can delete own pregnancy appointments"
  on public.pregnancy_appointments for delete
  using (auth.uid() = user_id);

drop trigger if exists pregnancy_appointments_set_updated_at on public.pregnancy_appointments;
create trigger pregnancy_appointments_set_updated_at
  before update on public.pregnancy_appointments
  for each row
  execute function public.set_profiles_updated_at();

-- ---------------------------------------------------------------------
-- pregnancy_milestones
-- ---------------------------------------------------------------------
create table if not exists public.pregnancy_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  milestone_type text not null,
  title text not null,
  milestone_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pregnancy_milestones drop constraint if exists pregnancy_milestones_type_check;
alter table public.pregnancy_milestones
  add constraint pregnancy_milestones_type_check
  check (
    milestone_type in (
      'first_trimester', 'second_trimester', 'third_trimester', 'first_kick',
      'baby_shower', 'hospital_bag_ready', 'birth_plan_complete', 'custom'
    )
  );

alter table public.pregnancy_milestones drop constraint if exists pregnancy_milestones_title_length_check;
alter table public.pregnancy_milestones
  add constraint pregnancy_milestones_title_length_check
  check (char_length(title) <= 120);

alter table public.pregnancy_milestones drop constraint if exists pregnancy_milestones_note_length_check;
alter table public.pregnancy_milestones
  add constraint pregnancy_milestones_note_length_check
  check (note is null or char_length(note) <= 500);

alter table public.pregnancy_milestones enable row level security;

drop policy if exists "Users can read own pregnancy milestones" on public.pregnancy_milestones;
create policy "Users can read own pregnancy milestones"
  on public.pregnancy_milestones for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own pregnancy milestones" on public.pregnancy_milestones;
create policy "Users can insert own pregnancy milestones"
  on public.pregnancy_milestones for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pregnancy milestones" on public.pregnancy_milestones;
create policy "Users can update own pregnancy milestones"
  on public.pregnancy_milestones for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own pregnancy milestones" on public.pregnancy_milestones;
create policy "Users can delete own pregnancy milestones"
  on public.pregnancy_milestones for delete
  using (auth.uid() = user_id);

drop trigger if exists pregnancy_milestones_set_updated_at on public.pregnancy_milestones;
create trigger pregnancy_milestones_set_updated_at
  before update on public.pregnancy_milestones
  for each row
  execute function public.set_profiles_updated_at();

-- ---------------------------------------------------------------------
-- pregnancy_checklist_items — baby shopping checklist
-- ---------------------------------------------------------------------
create table if not exists public.pregnancy_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_name text not null,
  category text not null default 'other',
  is_checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pregnancy_checklist_items drop constraint if exists pregnancy_checklist_items_category_check;
alter table public.pregnancy_checklist_items
  add constraint pregnancy_checklist_items_category_check
  check (category in ('nursery', 'clothing', 'feeding', 'travel', 'hospital_bag', 'other'));

alter table public.pregnancy_checklist_items drop constraint if exists pregnancy_checklist_items_name_length_check;
alter table public.pregnancy_checklist_items
  add constraint pregnancy_checklist_items_name_length_check
  check (char_length(item_name) <= 120);

alter table public.pregnancy_checklist_items enable row level security;

drop policy if exists "Users can read own checklist items" on public.pregnancy_checklist_items;
create policy "Users can read own checklist items"
  on public.pregnancy_checklist_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own checklist items" on public.pregnancy_checklist_items;
create policy "Users can insert own checklist items"
  on public.pregnancy_checklist_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own checklist items" on public.pregnancy_checklist_items;
create policy "Users can update own checklist items"
  on public.pregnancy_checklist_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own checklist items" on public.pregnancy_checklist_items;
create policy "Users can delete own checklist items"
  on public.pregnancy_checklist_items for delete
  using (auth.uid() = user_id);

drop trigger if exists pregnancy_checklist_items_set_updated_at on public.pregnancy_checklist_items;
create trigger pregnancy_checklist_items_set_updated_at
  before update on public.pregnancy_checklist_items
  for each row
  execute function public.set_profiles_updated_at();

-- No public/true policies exist or are created above — every policy on
-- every table here is scoped to auth.uid() = user_id.
