-- HerHealth — Admin Phase 1: secure admin authorization foundation
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: the smallest possible foundation for a role-based admin authorization
-- model (user -> role -> admin authorization), so future admin features can check
-- "is the calling user an admin?" without ever trusting the frontend and without
-- introducing a service-role key or broad "admin can read everything" policies.
--
-- This migration creates ONLY:
--   1. public.admin_roles  — a locked-down table recording who is an admin.
--   2. public.is_admin()   — a SECURITY DEFINER function any future admin-only
--                            RLS policy or RPC can call to check the CURRENT
--                            caller's admin status.
--
-- No admin UI, routes, or data-access RPCs are introduced here — see later
-- Admin Phase migrations for those.

-- 1. admin_roles --------------------------------------------------------
--
-- One row per admin user. Deliberately minimal: a single 'admin' role value
-- for V1 (the check constraint can be widened later, e.g. to add 'support',
-- without changing the table shape).
--
-- There are NO client-facing RLS policies on this table — none at all, for
-- any operation, for any role. Row Level Security is enabled with zero
-- policies, which means every request from the `anon` or `authenticated`
-- Postgres roles is denied by default, for SELECT as well as INSERT/UPDATE/
-- DELETE. Nobody can read this table from the app, and nobody can write to
-- it from the app — including admins themselves. This is intentional: it is
-- the only way to guarantee "never grant users the ability to make
-- themselves admin."
--
-- The ONLY way to grant or revoke admin access is for the project owner to
-- run INSERT/DELETE statements directly in the Supabase SQL Editor, e.g.:
--   insert into public.admin_roles (user_id, role) values ('<uuid>', 'admin');
--   delete from public.admin_roles where user_id = '<uuid>';
--
-- The table is readable internally only by public.is_admin() below, which
-- runs as the table owner (SECURITY DEFINER) and therefore bypasses RLS —
-- this is the standard, documented Supabase pattern for a roles table that
-- must remain otherwise unreadable to every client role.

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.admin_roles enable row level security;

-- Defense in depth: explicitly revoke the table-level grants Supabase applies
-- by default to anon/authenticated, on top of RLS having zero policies. Two
-- independent layers must both fail for this table to ever be misread.
revoke all on public.admin_roles from anon, authenticated;

comment on table public.admin_roles is
  'Admin role assignments. No client-facing RLS policies exist by design — '
  'this table is only ever queried via the SECURITY DEFINER public.is_admin() '
  'function. Grant/revoke admin access only via the Supabase SQL Editor.';

-- 2. is_admin() -----------------------------------------------------------
--
-- Returns whether the CURRENTLY AUTHENTICATED caller (auth.uid()) is an
-- admin. Takes no arguments deliberately, so it can only ever answer for
-- the caller themselves — it cannot be used to probe another user's admin
-- status.
--
-- SECURITY DEFINER + a pinned search_path (matching the one existing
-- precedent in this schema, public.handle_new_user() in 0001_profiles.sql)
-- so the function always resolves public.admin_roles regardless of the
-- caller's own search_path, and cannot be hijacked by a caller-controlled
-- schema earlier in the path.
--
-- STABLE (not VOLATILE) because it only reads data and does not modify
-- anything — safe and efficient to call repeatedly within a single query,
-- including from inside a future RLS policy's USING clause.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_roles where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

comment on function public.is_admin() is
  'Returns true if the currently authenticated caller (auth.uid()) has an '
  'admin_roles row. SECURITY DEFINER so it can read admin_roles despite that '
  'table having no client-facing RLS policies. Takes no arguments — can only '
  'answer for the caller, never for another user.';
