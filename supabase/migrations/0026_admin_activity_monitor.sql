-- HerHealth — Admin Phase 3D: Activity Monitor
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: three narrow, admin-gated RPCs backing /admin/activity. NO new
-- instrumentation of any kind is introduced — every event here is derived
-- from a row that already exists for a reason unrelated to analytics (a
-- user saved something, registered, or finished onboarding).
--
-- CONFIRMED vs. INFERRED vs. UNTRACKED (read before extending this file)
-- -----------------------------------------------------------------------
-- CONFIRMED — directly proven by a persisted row: a new profiles row
-- (registration), profiles.onboarding_completed_at being set (onboarding
-- finished), or a row existing in one of the 8 entry tables below (the
-- user saved that specific piece of data). This is the only category this
-- migration surfaces as a named "event".
--
-- INFERRED — a pattern derived from confirmed data, not a single event:
-- "returning users" (0025, already shipped) and "features used" (0024,
-- already shipped) are both inferred patterns, not raw events, and are
-- deliberately NOT re-derived here — the Activity page reads them from
-- the existing Phase 3B/3C service functions.
--
-- UNTRACKED — not recorded anywhere, and NOT invented here: which page a
-- user opened, how long they stayed, whether they viewed (vs. saved)
-- anything, Knowledge Hub interactions (a static catalog with no user
-- table), AI Health Insights or Wellness Score views (computed
-- client-side, never persisted). A saved sleep_entries row proves the
-- user SAVED sleep data — it does not prove they "opened Sleep
-- Intelligence" as a page-view, and this migration never labels it that
-- way (event names below say "saved", never "opened" or "viewed").
--
-- DATE COLUMN CHOICE — created_at, not each table's domain date
-- -----------------------------------------------------------------------
-- 0024 (Feature Usage) buckets by each table's own domain date (e.g.
-- period_records.start_date — "which day does this cycle record
-- describe?"). This migration asks a different question — "when did the
-- user interact with the platform?" — so every source here uses
-- created_at (when the row was saved) uniformly, even where 0024 uses a
-- different column for the same table. This is an intentional difference
-- in what's being measured, not an inconsistency.
--
-- THE 11 TRACKED EVENT SOURCES (used by all three functions below)
-- -----------------------------------------------------------------------
--   user_registered            -> profiles.created_at
--   onboarding_completed       -> profiles.onboarding_completed_at
--   daily_checkin_saved        -> daily_checkins.created_at
--   cycle_tracker_saved        -> period_records.created_at
--   sleep_activity_saved       -> sleep_entries.created_at
--   nutrition_activity_saved   -> nutrition_entries.created_at
--   stress_recovery_saved      -> stress_recovery_entries.created_at
--   baby_growth_activity_saved -> pregnancy_entries.created_at
--   goal_created                -> wellness_goals.created_at
--   screening_item_created      -> screening_items.created_at
--   reminder_enabled            -> reminder_preferences.created_at WHERE enabled
--
-- KNOWN, ACKNOWLEDGED OVERLAP WITH 0025 — not hidden, not accidental
-- -----------------------------------------------------------------------
-- admin_recent_activity_feed below includes user_registered/
-- onboarding_completed, the same two event types 0025's
-- admin_recent_activity_preview() already returns. That earlier function
-- was built for a small, capped Overview preview (max 10 rows) and isn't
-- fit for an accurate period total or a unified 11-type feed — merging
-- its output with a second RPC call client-side would avoid two lines of
-- SQL overlap at the cost of materially more complexity for no accuracy
-- benefit. The 2-line overlap is accepted deliberately; nothing else in
-- this file re-derives 0024's or 0025's own metrics (adoption %, trend
-- arrows, returning users, wellness-record totals) — the Activity page
-- reads those directly from the existing Phase 3B/3C service functions.
--
-- Depends on 0019_admin_roles.sql (public.is_admin()).

-- 1. admin_activity_by_type -------------------------------------------
--
-- Accurate (uncapped) event counts per category for the selected period.
-- The "Activity Events" KPI on the page is the client-side sum of these
-- rows — no separate RPC for that total.

create or replace function public.admin_activity_by_type(p_period_days integer default 30)
returns table (
  category text,
  event_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(coalesce(p_period_days, 30), 1);
  v_since timestamptz := now() - (v_days || ' days')::interval;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  with events as (
    select 'User Registration' as category from public.profiles where created_at >= v_since
    union all
    select 'Onboarding' from public.profiles
      where onboarding_completed_at is not null and onboarding_completed_at >= v_since
    union all
    select 'Feature Activity' from public.daily_checkins where created_at >= v_since
    union all
    select 'Feature Activity' from public.period_records where created_at >= v_since
    union all
    select 'Feature Activity' from public.sleep_entries where created_at >= v_since
    union all
    select 'Feature Activity' from public.nutrition_entries where created_at >= v_since
    union all
    select 'Feature Activity' from public.stress_recovery_entries where created_at >= v_since
    union all
    select 'Feature Activity' from public.pregnancy_entries where created_at >= v_since
    union all
    select 'Goal Activity' from public.wellness_goals where created_at >= v_since
    union all
    select 'Preventive Planning' from public.screening_items where created_at >= v_since
    union all
    select 'Preventive Planning' from public.reminder_preferences where enabled = true and created_at >= v_since
  )
  select e.category, count(*) as event_count
  from events e
  group by e.category
  order by event_count desc;
end;
$$;

revoke all on function public.admin_activity_by_type(integer) from public;
revoke execute on function public.admin_activity_by_type(integer) from anon;
grant execute on function public.admin_activity_by_type(integer) to authenticated;

comment on function public.admin_activity_by_type(integer) is
  'Admin-only accurate event counts per category (User Registration, '
  'Onboarding, Feature Activity, Goal Activity, Preventive Planning) for '
  'the selected period. Checks public.is_admin() internally. A category '
  'with zero events simply does not appear in the result. Counts only — '
  'never a user row or health content.';

-- 2. admin_activity_trend --------------------------------------------------
--
-- Daily bucketed activity counts across the same 11 sources, for the
-- Activity Trend chart. One row per calendar day, including zero-activity
-- days, so the frontend never has to fabricate a gap.

create or replace function public.admin_activity_trend(p_period_days integer default 30)
returns table (
  bucket_date date,
  activity_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(coalesce(p_period_days, 30), 1);
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  with activity_dates as (
    select created_at::date as activity_date from public.profiles where created_at::date >= current_date - v_days
    union all
    select onboarding_completed_at::date from public.profiles
      where onboarding_completed_at is not null and onboarding_completed_at::date >= current_date - v_days
    union all
    select created_at::date from public.daily_checkins where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.period_records where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.sleep_entries where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.nutrition_entries where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.stress_recovery_entries where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.pregnancy_entries where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.wellness_goals where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.screening_items where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.reminder_preferences
      where enabled = true and created_at::date >= current_date - v_days
  ),
  bucket_series as (
    select generate_series(current_date - (v_days - 1), current_date, interval '1 day')::date as bucket_date
  )
  select bs.bucket_date, count(ad.activity_date) as activity_count
  from bucket_series bs
  left join activity_dates ad on ad.activity_date = bs.bucket_date
  group by bs.bucket_date
  order by bs.bucket_date asc;
end;
$$;

revoke all on function public.admin_activity_trend(integer) from public;
revoke execute on function public.admin_activity_trend(integer) from anon;
grant execute on function public.admin_activity_trend(integer) to authenticated;

comment on function public.admin_activity_trend(integer) is
  'Admin-only daily activity time series across all 11 tracked event '
  'sources (a superset of 0024''s 7-source feature trend — this one also '
  'includes registrations, onboarding completions, daily check-ins, and '
  'reminder opt-ins). Checks public.is_admin() internally. Counts only.';

-- 3. admin_recent_activity_feed ---------------------------------------
--
-- A capped (max 100), privacy-safe chronological feed across all 11
-- sources for the Recent Activity list. Returns only an event type and a
-- timestamp — never a user_id, name, or any other identifying detail, and
-- never the saved content itself (e.g. a sleep entry's quality/duration).

create or replace function public.admin_recent_activity_feed(p_period_days integer default 30, p_limit integer default 20)
returns table (
  event_type text,
  occurred_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(coalesce(p_period_days, 30), 1);
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 100);
  v_since timestamptz := now() - (v_days || ' days')::interval;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select events.event_type, events.occurred_at
  from (
    select 'user_registered' as event_type, created_at as occurred_at
    from public.profiles where created_at >= v_since

    union all

    select 'onboarding_completed', onboarding_completed_at
    from public.profiles
    where onboarding_completed_at is not null and onboarding_completed_at >= v_since

    union all

    select 'daily_checkin_saved', created_at from public.daily_checkins where created_at >= v_since

    union all

    select 'cycle_tracker_saved', created_at from public.period_records where created_at >= v_since

    union all

    select 'sleep_activity_saved', created_at from public.sleep_entries where created_at >= v_since

    union all

    select 'nutrition_activity_saved', created_at from public.nutrition_entries where created_at >= v_since

    union all

    select 'stress_recovery_saved', created_at from public.stress_recovery_entries where created_at >= v_since

    union all

    select 'baby_growth_activity_saved', created_at from public.pregnancy_entries where created_at >= v_since

    union all

    select 'goal_created', created_at from public.wellness_goals where created_at >= v_since

    union all

    select 'screening_item_created', created_at from public.screening_items where created_at >= v_since

    union all

    select 'reminder_enabled', created_at
    from public.reminder_preferences
    where enabled = true and created_at >= v_since
  ) events
  order by events.occurred_at desc
  limit v_limit;
end;
$$;

revoke all on function public.admin_recent_activity_feed(integer, integer) from public;
revoke execute on function public.admin_recent_activity_feed(integer, integer) from anon;
grant execute on function public.admin_recent_activity_feed(integer, integer) to authenticated;

comment on function public.admin_recent_activity_feed(integer, integer) is
  'Admin-only capped (max 100) chronological activity feed across all 11 '
  'tracked event sources. Checks public.is_admin() internally. Returns '
  'only event_type and occurred_at — no user_id, no name, no saved '
  'content of any kind, for any event type.';
