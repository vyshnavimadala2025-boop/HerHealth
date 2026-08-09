-- HerHealth — Preventive Screening Planner: personal screening tracking
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Not built on wellness_goals: a screening item is a single, dated
-- healthcare record (a planned/completed check-up) rather than a
-- recurring personal behavior to build (which is what wellness_goals'
-- target_count/target_period/goal_progress_entries model represents, and
-- what Recovery Planner — Stage 3E — genuinely is). Forcing screenings
-- into that shape would misrepresent both. This table is deliberately
-- minimal: no invented screening schedule, no age/frequency rule — every
-- date is user-entered, `category` is an organizational tag only (not a
-- clinical rule), and `status` is a plain two-state model the user sets
-- explicitly (never inferred from a date).
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout.
-- Does not modify any existing table.

create table if not exists public.screening_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text,
  planned_date date,
  completed_date date,
  status text not null default 'planned',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.screening_items drop constraint if exists screening_items_title_check;
alter table public.screening_items add constraint screening_items_title_check
  check (char_length(btrim(title)) > 0 and char_length(title) <= 120);

alter table public.screening_items drop constraint if exists screening_items_category_check;
alter table public.screening_items add constraint screening_items_category_check
  check (
    category is null or category in (
      'general_health',
      'reproductive_health',
      'breast_health',
      'skin_health',
      'dental',
      'vision',
      'mental_health',
      'other'
    )
  );

alter table public.screening_items drop constraint if exists screening_items_status_check;
alter table public.screening_items add constraint screening_items_status_check
  check (status in ('planned', 'completed'));

alter table public.screening_items drop constraint if exists screening_items_note_length_check;
alter table public.screening_items add constraint screening_items_note_length_check
  check (note is null or char_length(note) <= 500);

create index if not exists screening_items_user_id_status_idx
  on public.screening_items (user_id, status);

alter table public.screening_items enable row level security;

drop policy if exists "Users can read own screening items" on public.screening_items;
create policy "Users can read own screening items"
  on public.screening_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own screening items" on public.screening_items;
create policy "Users can insert own screening items"
  on public.screening_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own screening items" on public.screening_items;
create policy "Users can update own screening items"
  on public.screening_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own screening items" on public.screening_items;
create policy "Users can delete own screening items"
  on public.screening_items for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists screening_items_set_updated_at on public.screening_items;
create trigger screening_items_set_updated_at
  before update on public.screening_items
  for each row
  execute function public.set_profiles_updated_at();
