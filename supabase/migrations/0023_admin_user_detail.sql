-- HerHealth — Admin Phase 3A: single-user operational detail lookup
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: backs the /admin/users/:userId detail view. Returns the same
-- narrow operational allowlist as admin_list_users (0022) for exactly one
-- user, plus whether that user is themselves an admin. Never touches any
-- health-content table.
--
-- Security note: p_user_id is caller-supplied (it has to be — that's the
-- point of a detail lookup), so the is_admin() check happens FIRST, before
-- p_user_id is used anywhere. A non-admin caller is rejected regardless of
-- what id they pass; an admin caller can look up any user's operational
-- fields (by design — that's the feature), but never any health content,
-- since no health-content table is referenced here at all.
--
-- Depends on 0019_admin_roles.sql (public.is_admin()).

create or replace function public.admin_user_detail(p_user_id uuid)
returns table (
  id uuid,
  full_name text,
  email text,
  created_at timestamptz,
  onboarding_completed boolean,
  onboarding_completed_at timestamptz,
  last_active_at date,
  is_admin boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.email,
    p.created_at,
    p.onboarding_completed,
    p.onboarding_completed_at,
    (
      select max(dc.checkin_date)
      from public.daily_checkins dc
      where dc.user_id = p.id
    ) as last_active_at,
    (
      exists (select 1 from public.admin_roles ar where ar.user_id = p.id)
    ) as is_admin
  from public.profiles p
  where p.id = p_user_id;
end;
$$;

revoke all on function public.admin_user_detail(uuid) from public;
revoke execute on function public.admin_user_detail(uuid) from anon;
grant execute on function public.admin_user_detail(uuid) to authenticated;

comment on function public.admin_user_detail(uuid) is
  'Admin-only single-user operational detail lookup for /admin/users/:userId. '
  'Checks public.is_admin() before ever using p_user_id, so a non-admin '
  'cannot use an arbitrary id to bypass authorization. Returns the same '
  'narrow allowlist as admin_list_users (0022) plus whether the target user '
  'is themselves an admin. Returns zero rows (not an error) if no profile '
  'matches p_user_id. Never touches any health-content table.';
