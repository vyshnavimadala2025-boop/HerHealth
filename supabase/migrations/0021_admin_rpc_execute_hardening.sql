-- HerHealth — Admin Phase 2 hardening: explicit anon EXECUTE revoke
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: close a defense-in-depth gap found during live verification of
-- Admin Phase 2. 0019_admin_roles.sql and 0020_admin_overview_metrics.sql
-- both ran:
--   revoke all on function ... from public;
--   grant execute on function ... to authenticated;
-- intending EXECUTE to be authenticated-only. In this project, however,
-- newly created public-schema functions receive a direct EXECUTE grant to
-- `anon` (and `authenticated`) from this project's default privileges —
-- and revoking from the `public` pseudo-role does NOT remove a grant made
-- directly to a named role like `anon`. Live testing confirmed `anon`
-- could still invoke both functions (safely rejected by the internal
-- public.is_admin() check every time — no data or admin status of any
-- real account was ever exposed — but the ACL boundary was looser than
-- documented).
--
-- This migration does not change either function's body, does not touch
-- public.admin_roles, and does not touch any RLS policy anywhere. It only
-- explicitly revokes EXECUTE from `anon` by name — the same pattern that
-- already worked correctly for public.admin_roles (0019), which revoked
-- from `anon, authenticated` by name rather than from `public`.

revoke execute on function public.is_admin() from anon;
revoke execute on function public.admin_overview_metrics() from anon;

-- Defensive re-assertion: authenticated access must remain intact. Safe to
-- run even though it's already granted — this does not change behavior for
-- authenticated callers, admin or not (public.is_admin() remains the real
-- authorization gate for both).
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_overview_metrics() to authenticated;

comment on function public.is_admin() is
  'Returns true if the currently authenticated caller (auth.uid()) has an '
  'admin_roles row. SECURITY DEFINER so it can read admin_roles despite that '
  'table having no client-facing RLS policies. Takes no arguments — can only '
  'answer for the caller, never for another user. EXECUTE is restricted to '
  '`authenticated` only — `anon` was explicitly revoked in '
  '0021_admin_rpc_execute_hardening.sql after live verification found the '
  'default project privileges had granted it directly to anon.';

comment on function public.admin_overview_metrics() is
  'Admin-only aggregate platform metrics for the Admin Overview dashboard. '
  'Checks public.is_admin() internally and raises an exception for any '
  'non-admin caller. Returns counts only — never individual user rows, '
  'emails, or health content. "New users" = profiles created in the last 7 '
  'days. "Active users" = distinct users with at least one daily_checkins '
  'row in the last 7 days. EXECUTE is restricted to `authenticated` only — '
  '`anon` was explicitly revoked in 0021_admin_rpc_execute_hardening.sql '
  'after live verification found the default project privileges had '
  'granted it directly to anon.';
