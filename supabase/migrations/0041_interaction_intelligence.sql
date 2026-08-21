-- SIRILA — Interaction Intelligence backend schema
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
-- NOT APPLIED — written and structurally tested only, per this project's
-- standing constraint (no local Postgres, no Supabase CLI/service-role
-- access in this environment).
--
-- DATA FIREWALL, ENFORCED BY SCHEMA SHAPE: neither table below has a text/
-- content column of any kind. Every column is a number, a timestamp, or a
-- constrained status string. There is no column this schema could put raw
-- keystrokes or typed text into even if a future caller tried — the
-- boundary described in the client (timingMath.ts: only ever emits
-- {dwellMs, flightMs} numbers, never characters) is mirrored here at the
-- storage layer.
--
-- interaction_session_summary is an append-only log (one row per session
-- flush from useInteractionCapture.ts) — insert + select only, no update/
-- delete policy, matching the daily_checkins precedent of "RLS denies by
-- default when no policy matches" for anything not explicitly allowed.
-- interaction_baseline is the current rollup for the signed-in user —
-- one row per user, upserted as new sessions arrive.

create table if not exists public.interaction_session_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  median_dwell_ms numeric,
  dwell_variability numeric,
  median_flight_ms numeric,
  flight_variability numeric,
  consistency_score smallint,
  event_count integer not null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint interaction_session_summary_event_count_check
    check (event_count > 0),

  constraint interaction_session_summary_consistency_check
    check (consistency_score is null or consistency_score between 0 and 100),

  constraint interaction_session_summary_dwell_nonneg_check
    check (median_dwell_ms is null or median_dwell_ms >= 0),

  constraint interaction_session_summary_flight_nonneg_check
    check (median_flight_ms is null or median_flight_ms >= 0)
);

alter table public.interaction_session_summary enable row level security;

create policy "Users can read own interaction session summaries"
  on public.interaction_session_summary for select
  using (auth.uid() = user_id);

create policy "Users can insert own interaction session summaries"
  on public.interaction_session_summary for insert
  with check (auth.uid() = user_id);

-- No update/delete policy: an append-only log, matching 0003's precedent.

create table if not exists public.interaction_baseline (
  user_id uuid primary key references auth.users (id) on delete cascade,
  baseline_version integer not null default 1,
  median_dwell_ms numeric,
  dwell_variability numeric,
  median_flight_ms numeric,
  flight_variability numeric,
  session_count integer not null default 0,
  baseline_status text not null default 'building',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint interaction_baseline_status_check
    check (baseline_status in ('building', 'established')),

  constraint interaction_baseline_session_count_check
    check (session_count >= 0)
);

alter table public.interaction_baseline enable row level security;

create policy "Users can read own interaction baseline"
  on public.interaction_baseline for select
  using (auth.uid() = user_id);

create policy "Users can insert own interaction baseline"
  on public.interaction_baseline for insert
  with check (auth.uid() = user_id);

create policy "Users can update own interaction baseline"
  on public.interaction_baseline for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own interaction baseline"
  on public.interaction_baseline for delete
  using (auth.uid() = user_id);

-- Delete IS allowed here (unlike the session log) — "fully disableable"
-- (Section 15/16 of the Interaction Intelligence spec) means a user who
-- disables the feature can also clear their rolled-up baseline, not just
-- stop future collection. Deleting a baseline row does not delete the
-- historical session_summary log rows; that mirrors the rest of this
-- project's existing per-category deletion pattern (DataPrivacySection),
-- and is a product decision for a future "delete my interaction history
-- entirely" control, not something this migration should decide silently.

-- Reuses the existing generic trigger function from 0001_profiles.sql —
-- verified live there before being reused by 0003_daily_checkins.sql and
-- every table since; not duplicated here.
drop trigger if exists interaction_baseline_set_updated_at on public.interaction_baseline;

create trigger interaction_baseline_set_updated_at
  before update on public.interaction_baseline
  for each row
  execute function public.set_profiles_updated_at();
