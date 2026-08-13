-- HerHealth — Admin Phase 3C: Overview dashboard upgrade
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: three narrow, admin-gated RPCs supplying the NEW sections of the
-- upgraded /admin Overview (User Growth, platform data volume, active
-- pregnancy journeys, returning users, and a small recent-activity
-- preview). Everything else the upgraded Overview shows (Total Users, New
-- Users, Onboarding Completion, Active Users, Features Used, Overall
-- Engagement, Top/Lowest-Adoption Features) is READ from the existing
-- public.admin_overview_metrics() (0020) and public.admin_feature_usage_*()
-- (0024) functions — nothing here re-derives them.
--
-- Depends on 0019_admin_roles.sql (public.is_admin()).

-- 1. admin_overview_extended_metrics -------------------------------------
--
-- total_wellness_records: a pure row-count sum across every user-entry
-- table in the schema (not just the 9 tables Feature Usage tracks — this
-- is a broader "how much data exists on the platform" volume metric, not
-- an adoption metric). Counts only; no column from any of these tables is
-- ever read.
--
-- active_pregnancy_journeys: pregnancy_profiles rows with a due_date that
-- hasn't passed yet — the same "a future date means still ongoing" style
-- of honest derivation already used for "active users" elsewhere.
--
-- returning_users_period: distinct users with a daily_checkins row in BOTH
-- the current p_period_days window AND the equal-length window immediately
-- before it — i.e. users who showed up in two consecutive periods, not
-- just once. Same daily_checkins-based "active" building block as
-- admin_overview_metrics() (0020) and admin_feature_usage_summary()
-- (0024), just compared across two windows instead of one.

create or replace function public.admin_overview_extended_metrics(p_period_days integer default 30)
returns table (
  total_wellness_records bigint,
  active_pregnancy_journeys bigint,
  returning_users_period bigint
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
  select
    (
      (select count(*) from public.daily_checkins) +
      (select count(*) from public.period_records) +
      (select count(*) from public.journal_entries) +
      (select count(*) from public.pcos_wellness_entries) +
      (select count(*) from public.wellness_goals) +
      (select count(*) from public.goal_progress_entries) +
      (select count(*) from public.fertility_entries) +
      (select count(*) from public.pregnancy_entries) +
      (select count(*) from public.pregnancy_appointments) +
      (select count(*) from public.pregnancy_milestones) +
      (select count(*) from public.pregnancy_checklist_items) +
      (select count(*) from public.pregnancy_kick_sessions) +
      (select count(*) from public.symptom_entries) +
      (select count(*) from public.sleep_entries) +
      (select count(*) from public.nutrition_entries) +
      (select count(*) from public.stress_recovery_entries) +
      (select count(*) from public.screening_items)
    ) as total_wellness_records,
    (
      select count(*) from public.pregnancy_profiles where due_date >= current_date
    ) as active_pregnancy_journeys,
    (
      select count(distinct dc1.user_id)
      from public.daily_checkins dc1
      where dc1.checkin_date >= current_date - v_days
        and exists (
          select 1 from public.daily_checkins dc2
          where dc2.user_id = dc1.user_id
            and dc2.checkin_date >= current_date - (2 * v_days)
            and dc2.checkin_date < current_date - v_days
        )
    ) as returning_users_period;
end;
$$;

revoke all on function public.admin_overview_extended_metrics(integer) from public;
revoke execute on function public.admin_overview_extended_metrics(integer) from anon;
grant execute on function public.admin_overview_extended_metrics(integer) to authenticated;

comment on function public.admin_overview_extended_metrics(integer) is
  'Admin-only extended platform metrics for the Overview upgrade (Phase 3C). '
  'Checks public.is_admin() internally. total_wellness_records and '
  'active_pregnancy_journeys are point-in-time snapshots (not period-scoped); '
  'returning_users_period is the only field that uses p_period_days. Counts '
  'and a due-date comparison only — no health-content column is ever read.';

-- 2. admin_user_growth_trend ----------------------------------------------
--
-- Daily new-registration counts for the User Growth chart. One row per
-- calendar day in range, including zero-registration days, so the frontend
-- never has to fabricate a gap.

create or replace function public.admin_user_growth_trend(p_period_days integer default 30)
returns table (
  bucket_date date,
  new_users bigint
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
  with bucket_series as (
    select generate_series(current_date - (v_days - 1), current_date, interval '1 day')::date as bucket_date
  )
  select
    bs.bucket_date,
    count(p.id) as new_users
  from bucket_series bs
  left join public.profiles p on p.created_at::date = bs.bucket_date
  group by bs.bucket_date
  order by bs.bucket_date asc;
end;
$$;

revoke all on function public.admin_user_growth_trend(integer) from public;
revoke execute on function public.admin_user_growth_trend(integer) from anon;
grant execute on function public.admin_user_growth_trend(integer) to authenticated;

comment on function public.admin_user_growth_trend(integer) is
  'Admin-only daily new-registration time series for the Overview User '
  'Growth chart. Checks public.is_admin() internally. Counts profiles rows '
  'by created_at date only — no other column is read.';

-- 3. admin_recent_activity_preview -----------------------------------------
--
-- A SMALL (capped, max 50), privacy-safe activity preview for the Overview
-- page only — deliberately NOT the full Activity Monitor (that is Phase
-- 3D). Two honest event types, both derived from timestamps already on
-- public.profiles: a new registration, and an onboarding completion.
-- Neither the event's user_id nor any other identifying detail is
-- returned — only which kind of event happened and when — so this preview
-- is safe even at the "anonymous aggregate" end of the privacy spectrum,
-- not just "no health content".

create or replace function public.admin_recent_activity_preview(p_limit integer default 10)
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
  v_limit integer := least(greatest(coalesce(p_limit, 10), 1), 50);
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select events.event_type, events.occurred_at
  from (
    select 'user_registered' as event_type, created_at as occurred_at
    from public.profiles
    union all
    select 'onboarding_completed', onboarding_completed_at
    from public.profiles
    where onboarding_completed_at is not null
  ) events
  order by events.occurred_at desc
  limit v_limit;
end;
$$;

revoke all on function public.admin_recent_activity_preview(integer) from public;
revoke execute on function public.admin_recent_activity_preview(integer) from anon;
grant execute on function public.admin_recent_activity_preview(integer) to authenticated;

comment on function public.admin_recent_activity_preview(integer) is
  'Admin-only small recent-activity preview for the Overview page (max 50 '
  'rows) — not the full Activity Monitor (Phase 3D). Checks '
  'public.is_admin() internally. Returns only an event type and a '
  'timestamp — never a user_id, name, or any other identifying detail, so '
  'no individual user is named even indirectly.';
