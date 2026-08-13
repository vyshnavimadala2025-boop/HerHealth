-- HerHealth — Admin Phase 2: Overview dashboard aggregate metrics
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: a single, narrow, allowlisted RPC the Admin Overview dashboard
-- calls to get platform-level aggregate counts. It exposes ONLY aggregate
-- numbers — no individual user rows, no email addresses, no health content
-- of any kind. Every value returned is a count, never raw personal data.
--
-- Depends on 0019_admin_roles.sql (public.is_admin()).

create or replace function public.admin_overview_metrics()
returns table (
  total_users bigint,
  new_users_7d bigint,
  onboarding_completed bigint,
  onboarding_total bigint,
  active_users_7d bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Internal admin authorization check — the real boundary. Any non-admin
  -- caller (including an authenticated non-admin user, since EXECUTE is
  -- granted broadly to `authenticated` below) gets an exception, never
  -- partial or aggregate data.
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    p.total_users,
    p.new_users_7d,
    p.onboarding_completed,
    p.total_users as onboarding_total,
    (
      select count(distinct dc.user_id)
      from public.daily_checkins dc
      where dc.checkin_date >= current_date - 7
    ) as active_users_7d
  from (
    select
      count(*) as total_users,
      count(*) filter (where pr.created_at >= now() - interval '7 days') as new_users_7d,
      count(*) filter (where pr.onboarding_completed) as onboarding_completed
    from public.profiles pr
  ) p;
end;
$$;

revoke all on function public.admin_overview_metrics() from public;
grant execute on function public.admin_overview_metrics() to authenticated;

comment on function public.admin_overview_metrics() is
  'Admin-only aggregate platform metrics for the Admin Overview dashboard. '
  'Checks public.is_admin() internally and raises an exception for any '
  'non-admin caller (EXECUTE is granted broadly to `authenticated`, but the '
  'internal check is the real gate — the same pattern as public.is_admin() '
  'itself). Returns counts only — never individual user rows, emails, or '
  'health content. "New users" = profiles created in the last 7 days. '
  '"Active users" = distinct users with at least one daily_checkins row in '
  'the last 7 days — the only existing table that captures a clear, '
  'privacy-safe, once-per-day engagement signal without reading any health '
  'content column.';
