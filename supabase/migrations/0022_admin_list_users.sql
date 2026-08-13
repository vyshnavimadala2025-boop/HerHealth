-- HerHealth — Admin Phase 3: paginated user directory for Users Management
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: a single, narrow, allowlisted, paginated admin RPC backing the
-- /admin/users table. It returns ONLY operational/account fields — name,
-- email, join date, onboarding status, and a derived "last active" date —
-- never health content of any kind. No table other than public.profiles
-- and public.daily_checkins is touched, and only two columns are read from
-- daily_checkins (user_id, checkin_date) — never mood/energy/wellbeing/note.
--
-- Depends on 0019_admin_roles.sql (public.is_admin()).
--
-- "Last active" uses the same definition established in
-- 0020_admin_overview_metrics.sql: the most recent daily_checkins.checkin_date
-- for that user. A null value means "no check-in has ever been recorded for
-- this user" — it does NOT mean the account is disabled or that the user is
-- inactive via other features; the frontend must render this as "Unknown",
-- never as "Inactive".

create or replace function public.admin_list_users(
  p_search text default null,
  p_onboarding text default 'all',
  p_activity text default 'all',
  p_sort text default 'newest',
  p_page integer default 1,
  p_page_size integer default 25
)
returns table (
  id uuid,
  full_name text,
  email text,
  created_at timestamptz,
  onboarding_completed boolean,
  onboarding_completed_at timestamptz,
  last_active_at date,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 25), 1), 100);
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  with activity as (
    select dc.user_id, max(dc.checkin_date) as last_active_at
    from public.daily_checkins dc
    group by dc.user_id
  ),
  filtered as (
    select
      p.id,
      p.full_name,
      p.email,
      p.created_at,
      p.onboarding_completed,
      p.onboarding_completed_at,
      a.last_active_at
    from public.profiles p
    left join activity a on a.user_id = p.id
    where
      (
        v_search is null
        or p.full_name ilike '%' || v_search || '%'
        or p.email ilike '%' || v_search || '%'
        or p.id::text = v_search
      )
      and (
        p_onboarding is null or p_onboarding = 'all'
        or (p_onboarding = 'completed' and p.onboarding_completed)
        or (p_onboarding = 'incomplete' and not p.onboarding_completed)
      )
      and (
        p_activity is null or p_activity = 'all'
        or (p_activity = 'active' and a.last_active_at is not null and a.last_active_at >= current_date - 7)
        or (p_activity = 'inactive' and a.last_active_at is not null and a.last_active_at < current_date - 7)
        or (p_activity = 'unknown' and a.last_active_at is null)
      )
  )
  select
    f.id,
    f.full_name,
    f.email,
    f.created_at,
    f.onboarding_completed,
    f.onboarding_completed_at,
    f.last_active_at,
    count(*) over() as total_count
  from filtered f
  order by
    case when p_sort = 'oldest' then f.created_at end asc,
    case when p_sort = 'newest' or p_sort is null then f.created_at end desc,
    case when p_sort = 'recently_active' then f.last_active_at end desc nulls last,
    case when p_sort = 'least_active' then f.last_active_at end asc nulls last,
    case when p_sort = 'name_asc' then f.full_name end asc,
    f.created_at desc
  limit v_page_size
  offset (v_page - 1) * v_page_size;
end;
$$;

-- Explicit, named revokes — not just "from public". A prior migration
-- (0019/0020) revoked only from `public` and assumed that removed anon's
-- access; live verification found this project grants EXECUTE on new
-- public-schema functions directly to `anon`/`authenticated`, and a revoke
-- from `public` does not remove a grant made directly to a named role
-- (0021_admin_rpc_execute_hardening.sql fixed this for the two earlier
-- functions). This migration applies the corrected pattern from the start.
revoke all on function public.admin_list_users(text, text, text, text, integer, integer) from public;
revoke execute on function public.admin_list_users(text, text, text, text, integer, integer) from anon;
grant execute on function public.admin_list_users(text, text, text, text, integer, integer) to authenticated;

comment on function public.admin_list_users(text, text, text, text, integer, integer) is
  'Admin-only, paginated, searchable/filterable/sortable user directory for '
  'the /admin/users page. Checks public.is_admin() internally and raises an '
  'exception for any non-admin caller; EXECUTE is explicitly revoked from '
  'anon and granted only to authenticated. Returns id, full_name, email, '
  'created_at, onboarding_completed, onboarding_completed_at, a derived '
  'last_active_at (max daily_checkins.checkin_date, null = no recorded '
  'activity, not "inactive"), and a total_count window for pagination. '
  'Never returns health content, tracking preferences, age range, or any '
  'column beyond this explicit allowlist. p_search/p_onboarding/p_activity/'
  'p_sort/p_page/p_page_size are ordinary bound function parameters, not '
  'concatenated SQL, so there is no injection surface. p_search also '
  'matches an exact user id (as text) so an admin can jump straight to a '
  'known account.';
