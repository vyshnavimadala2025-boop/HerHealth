-- HerHealth — Admin Phase 3B: Feature Usage analytics
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: aggregate, privacy-safe feature-adoption analytics for
-- /admin/feature-usage. Every number here is a COUNT (or an average of
-- counts) over existing tables — no health content is ever selected, only
-- user_id + a date column, per table, per feature.
--
-- WHICH FEATURES ARE TRACKED, AND WHY ONLY THESE NINE
-- -----------------------------------------------------------------------
-- HerHealth's product surface has ~20 named "features" in the UI, but only
-- 9 of them have a dedicated table that genuinely reflects usage. The rest
-- (Dashboard, Women's Health, Hormone Balance, Wellness Score, Health
-- Trends, AI Health Insights, Weekly Summary, Monthly Overview, Reports,
-- Lifestyle Intelligence, Knowledge Hub) are either static content pages or
-- are computed client-side from OTHER features' tables (confirmed by
-- reading their hooks — e.g. useHormoneBalanceData.ts and
-- useHealthTrendsData.ts both explicitly reuse daily_checkins/
-- period_records/journal_entries/wellness_goals with no table of their
-- own). Counting "usage" for those would either fabricate a number from
-- nothing or double-count another feature's real activity under a second
-- name. The frontend renders those 11 as "Not available" rather than
-- omitting them, so the gap is visible rather than hidden. This was
-- confirmed by inspection, not assumption, before writing this migration.
--
-- The 9 tracked features and their backing table:
--   cycle_tracker         -> period_records          (date: start_date)
--   sleep_intelligence    -> sleep_entries            (date: entry_date)
--   nutrition_companion   -> nutrition_entries        (date: entry_date)
--   stress_recovery       -> stress_recovery_entries  (date: entry_date)
--   goals                 -> wellness_goals, all categories (date: created_at)
--   recovery_planner      -> wellness_goals WHERE category = 'recovery'
--                             (date: created_at) — an intentional SUBSET of
--                             "goals" (Recovery Planner reuses the Goals
--                             table via a dedicated category, per
--                             0015_recovery_goal_category.sql), so a user
--                             can legitimately appear in both rows. Noted
--                             here and in the UI rather than hidden.
--   preventive_screening  -> screening_items          (date: created_at)
--   baby_growth           -> pregnancy_entries        (date: entry_date)
--                             (the daily-log table for this feature; the
--                             4 related pregnancy_* tables exist but are
--                             not folded in, to keep "Baby Growth usage"
--                             meaning one consistent thing)
--   preventive_reminders  -> reminder_preferences WHERE enabled = true
--                             (date: created_at) — this one measures
--                             "opted in to a reminder", a settings choice,
--                             NOT a repeated activity. It is included in
--                             the per-feature breakdown/summary below, but
--                             deliberately EXCLUDED from the daily activity
--                             trend (admin_feature_usage_trend), since a
--                             one-time settings toggle isn't "activity" in
--                             the same sense as a daily entry.
--
-- Depends on 0019_admin_roles.sql (public.is_admin()).

-- 1. admin_feature_usage_breakdown -----------------------------------
--
-- One row per tracked feature: all-time adoption, this-period vs.
-- previous-period distinct-user counts (for the trend arrow), total record
-- count, and an adoption percentage against the current total user count.

create or replace function public.admin_feature_usage_breakdown(p_period_days integer default 30)
returns table (
  feature_key text,
  feature_label text,
  total_users bigint,
  users_ever bigint,
  users_this_period bigint,
  users_previous_period bigint,
  total_records bigint,
  adoption_percentage numeric,
  trend text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_days integer := greatest(coalesce(p_period_days, 30), 1);
  v_total_users bigint;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  select count(*) into v_total_users from public.profiles;

  return query
  with features as (
    select
      'cycle_tracker' as feature_key, 'Cycle Tracker' as feature_label,
      count(distinct user_id) as users_ever,
      count(distinct user_id) filter (where start_date >= current_date - v_days) as users_this_period,
      count(distinct user_id) filter (
        where start_date >= current_date - (2 * v_days) and start_date < current_date - v_days
      ) as users_previous_period,
      count(*) as total_records
    from public.period_records

    union all

    select
      'sleep_intelligence', 'Sleep Intelligence',
      count(distinct user_id),
      count(distinct user_id) filter (where entry_date >= current_date - v_days),
      count(distinct user_id) filter (
        where entry_date >= current_date - (2 * v_days) and entry_date < current_date - v_days
      ),
      count(*)
    from public.sleep_entries

    union all

    select
      'nutrition_companion', 'Nutrition Companion',
      count(distinct user_id),
      count(distinct user_id) filter (where entry_date >= current_date - v_days),
      count(distinct user_id) filter (
        where entry_date >= current_date - (2 * v_days) and entry_date < current_date - v_days
      ),
      count(*)
    from public.nutrition_entries

    union all

    select
      'stress_recovery', 'Stress & Recovery',
      count(distinct user_id),
      count(distinct user_id) filter (where entry_date >= current_date - v_days),
      count(distinct user_id) filter (
        where entry_date >= current_date - (2 * v_days) and entry_date < current_date - v_days
      ),
      count(*)
    from public.stress_recovery_entries

    union all

    select
      'goals', 'Goals',
      count(distinct user_id),
      count(distinct user_id) filter (where created_at::date >= current_date - v_days),
      count(distinct user_id) filter (
        where created_at::date >= current_date - (2 * v_days) and created_at::date < current_date - v_days
      ),
      count(*)
    from public.wellness_goals

    union all

    select
      'recovery_planner', 'Recovery Planner',
      count(distinct user_id),
      count(distinct user_id) filter (where created_at::date >= current_date - v_days),
      count(distinct user_id) filter (
        where created_at::date >= current_date - (2 * v_days) and created_at::date < current_date - v_days
      ),
      count(*)
    from public.wellness_goals
    where category = 'recovery'

    union all

    select
      'preventive_screening', 'Preventive Screening Planner',
      count(distinct user_id),
      count(distinct user_id) filter (where created_at::date >= current_date - v_days),
      count(distinct user_id) filter (
        where created_at::date >= current_date - (2 * v_days) and created_at::date < current_date - v_days
      ),
      count(*)
    from public.screening_items

    union all

    select
      'baby_growth', 'Baby Growth',
      count(distinct user_id),
      count(distinct user_id) filter (where entry_date >= current_date - v_days),
      count(distinct user_id) filter (
        where entry_date >= current_date - (2 * v_days) and entry_date < current_date - v_days
      ),
      count(*)
    from public.pregnancy_entries

    union all

    select
      'preventive_reminders', 'Preventive Reminders',
      count(distinct user_id),
      count(distinct user_id) filter (where created_at::date >= current_date - v_days),
      count(distinct user_id) filter (
        where created_at::date >= current_date - (2 * v_days) and created_at::date < current_date - v_days
      ),
      count(*)
    from public.reminder_preferences
    where enabled = true
  )
  select
    f.feature_key,
    f.feature_label,
    v_total_users as total_users,
    f.users_ever,
    f.users_this_period,
    f.users_previous_period,
    f.total_records,
    round(100.0 * f.users_ever / nullif(v_total_users, 0), 1) as adoption_percentage,
    case
      when f.users_this_period > f.users_previous_period then 'up'
      when f.users_this_period < f.users_previous_period then 'down'
      else 'flat'
    end as trend
  from features f
  order by f.users_ever desc, f.feature_label asc;
end;
$$;

revoke all on function public.admin_feature_usage_breakdown(integer) from public;
revoke execute on function public.admin_feature_usage_breakdown(integer) from anon;
grant execute on function public.admin_feature_usage_breakdown(integer) to authenticated;

comment on function public.admin_feature_usage_breakdown(integer) is
  'Admin-only per-feature adoption breakdown for the 9 features with a real '
  'backing table (see migration header). Checks public.is_admin() '
  'internally. Aggregate counts only — never an individual user row or any '
  'health-content column.';

-- 2. admin_feature_usage_summary ---------------------------------------
--
-- Top-line KPIs for the Feature Usage page header. Reuses
-- admin_feature_usage_breakdown() internally (same 9-feature definition,
-- computed once) rather than re-deriving it, and reuses the exact same
-- daily_checkins-based "active users" definition already established in
-- admin_overview_metrics() (0020) — just parameterized by period — so this
-- page's "Active Users" figure is never a second, differently-defined
-- number from the Overview page's.

create or replace function public.admin_feature_usage_summary(p_period_days integer default 30)
returns table (
  total_users bigint,
  active_users_period bigint,
  features_with_adoption bigint,
  most_used_feature_key text,
  most_used_feature_label text,
  most_used_feature_users bigint,
  avg_features_per_engaged_user numeric
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
  with breakdown as (
    select * from public.admin_feature_usage_breakdown(v_days)
  ),
  engaged_users as (
    -- One (user_id, feature_key) pair per user who touched that feature in
    -- the period — used only to compute the average distinct tracked
    -- features per engaged user. UNION (not UNION ALL) so duplicate rows
    -- within a feature (a user with several entries) collapse correctly.
    select user_id, 'cycle_tracker' as feature_key
      from public.period_records where start_date >= current_date - v_days
    union
    select user_id, 'sleep_intelligence'
      from public.sleep_entries where entry_date >= current_date - v_days
    union
    select user_id, 'nutrition_companion'
      from public.nutrition_entries where entry_date >= current_date - v_days
    union
    select user_id, 'stress_recovery'
      from public.stress_recovery_entries where entry_date >= current_date - v_days
    union
    select user_id, 'goals'
      from public.wellness_goals where created_at::date >= current_date - v_days
    union
    select user_id, 'recovery_planner'
      from public.wellness_goals where category = 'recovery' and created_at::date >= current_date - v_days
    union
    select user_id, 'preventive_screening'
      from public.screening_items where created_at::date >= current_date - v_days
    union
    select user_id, 'baby_growth'
      from public.pregnancy_entries where entry_date >= current_date - v_days
    union
    select user_id, 'preventive_reminders'
      from public.reminder_preferences where enabled = true and created_at::date >= current_date - v_days
  ),
  per_user_counts as (
    select user_id, count(distinct feature_key) as feature_count
    from engaged_users
    group by user_id
  ),
  top_feature as (
    select feature_key, feature_label, users_ever
    from breakdown
    order by users_ever desc, feature_label asc
    limit 1
  )
  select
    (select count(*) from public.profiles) as total_users,
    (
      select count(distinct dc.user_id)
      from public.daily_checkins dc
      where dc.checkin_date >= current_date - v_days
    ) as active_users_period,
    (select count(*) from breakdown where users_ever > 0) as features_with_adoption,
    tf.feature_key as most_used_feature_key,
    tf.feature_label as most_used_feature_label,
    tf.users_ever as most_used_feature_users,
    (select round(avg(feature_count), 2) from per_user_counts) as avg_features_per_engaged_user
  from top_feature tf;
end;
$$;

revoke all on function public.admin_feature_usage_summary(integer) from public;
revoke execute on function public.admin_feature_usage_summary(integer) from anon;
grant execute on function public.admin_feature_usage_summary(integer) to authenticated;

comment on function public.admin_feature_usage_summary(integer) is
  'Admin-only top-KPI summary for the Feature Usage page. Checks '
  'public.is_admin() internally. "Active Users" reuses the identical '
  'daily_checkins-based definition from admin_overview_metrics() (0020), '
  'parameterized by period, so it is never a second definition of the same '
  'term. "Average tracked features per engaged user" is scoped to users who '
  'touched at least one of the 9 tracked features in the period — a '
  'different, and differently-named, population than "Active Users".';

-- 3. admin_feature_usage_trend -------------------------------------------
--
-- A daily activity time series for the "Usage Trend" chart: total records
-- saved per day across 7 of the 9 tracked tables (goals, not
-- goals-filtered-to-recovery, to avoid double-counting the same rows twice
-- in one aggregate total; preventive_reminders excluded entirely, since an
-- enable-a-reminder toggle is not a repeated daily activity).

create or replace function public.admin_feature_usage_trend(p_period_days integer default 30)
returns table (
  bucket_date date,
  records_count bigint
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
    select start_date as activity_date from public.period_records where start_date >= current_date - v_days
    union all
    select entry_date from public.sleep_entries where entry_date >= current_date - v_days
    union all
    select entry_date from public.nutrition_entries where entry_date >= current_date - v_days
    union all
    select entry_date from public.stress_recovery_entries where entry_date >= current_date - v_days
    union all
    select created_at::date from public.wellness_goals where created_at::date >= current_date - v_days
    union all
    select created_at::date from public.screening_items where created_at::date >= current_date - v_days
    union all
    select entry_date from public.pregnancy_entries where entry_date >= current_date - v_days
  ),
  bucket_series as (
    select generate_series(current_date - (v_days - 1), current_date, interval '1 day')::date as bucket_date
  )
  select
    bs.bucket_date,
    count(ad.activity_date) as records_count
  from bucket_series bs
  left join activity_dates ad on ad.activity_date = bs.bucket_date
  group by bs.bucket_date
  order by bs.bucket_date asc;
end;
$$;

revoke all on function public.admin_feature_usage_trend(integer) from public;
revoke execute on function public.admin_feature_usage_trend(integer) from anon;
grant execute on function public.admin_feature_usage_trend(integer) to authenticated;

comment on function public.admin_feature_usage_trend(integer) is
  'Admin-only daily activity trend across 7 of the 9 tracked features '
  '(excludes recovery_planner, a subset of goals, to avoid double-counting; '
  'excludes preventive_reminders, a settings toggle rather than a repeated '
  'activity). Checks public.is_admin() internally. Returns one row per '
  'calendar day in range with a record count, even for zero-activity days, '
  'so the frontend never has to fabricate a gap.';
