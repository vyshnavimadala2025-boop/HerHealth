-- HerHealth — Baby Growth: kick counter sessions
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Replaces the local-state-only KickCounterPlaceholder with real,
-- per-user persisted movement-count sessions. Follows the same
-- one-table-per-concern pattern as every other pregnancy table
-- (pregnancy_entries, pregnancy_appointments, pregnancy_milestones,
-- pregnancy_checklist_items): a session is only written once the user
-- finishes and saves it (started_at/ended_at/movement_count are all
-- known at that point) — an in-progress count is transient client
-- state, same as any other unsaved form, not a fake-persistence shim.
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout.
-- Does not modify any existing table.

create table if not exists public.pregnancy_kick_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  movement_count integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pregnancy_kick_sessions drop constraint if exists pregnancy_kick_sessions_movement_count_check;
alter table public.pregnancy_kick_sessions
  add constraint pregnancy_kick_sessions_movement_count_check
  check (movement_count >= 0 and movement_count <= 500);

alter table public.pregnancy_kick_sessions drop constraint if exists pregnancy_kick_sessions_ended_after_started_check;
alter table public.pregnancy_kick_sessions
  add constraint pregnancy_kick_sessions_ended_after_started_check
  check (ended_at >= started_at);

alter table public.pregnancy_kick_sessions drop constraint if exists pregnancy_kick_sessions_note_length_check;
alter table public.pregnancy_kick_sessions
  add constraint pregnancy_kick_sessions_note_length_check
  check (note is null or char_length(note) <= 500);

create index if not exists pregnancy_kick_sessions_user_id_started_at_idx
  on public.pregnancy_kick_sessions (user_id, started_at desc);

alter table public.pregnancy_kick_sessions enable row level security;

drop policy if exists "Users can read own kick sessions" on public.pregnancy_kick_sessions;
create policy "Users can read own kick sessions"
  on public.pregnancy_kick_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own kick sessions" on public.pregnancy_kick_sessions;
create policy "Users can insert own kick sessions"
  on public.pregnancy_kick_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own kick sessions" on public.pregnancy_kick_sessions;
create policy "Users can update own kick sessions"
  on public.pregnancy_kick_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own kick sessions" on public.pregnancy_kick_sessions;
create policy "Users can delete own kick sessions"
  on public.pregnancy_kick_sessions for delete
  using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists pregnancy_kick_sessions_set_updated_at on public.pregnancy_kick_sessions;
create trigger pregnancy_kick_sessions_set_updated_at
  before update on public.pregnancy_kick_sessions
  for each row
  execute function public.set_profiles_updated_at();
