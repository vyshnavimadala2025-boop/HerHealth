-- SIRILA Intelligence — Admin AI Safety Metrics
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: the smallest possible addition to let an authorized admin see
-- AGGREGATE public.ai_safety_events counts, so the "logged but nobody
-- currently reads it" gap identified in the SIRILA launch safety audit has
-- a minimal, safe read path — without weakening ai_safety_events' existing
-- zero-client-policy RLS design (0028_ai_intelligence_foundation.sql) in
-- any way. This migration creates exactly one function. It does not create
-- a table, does not touch RLS, does not add or change any policy, and does
-- not modify ai_send_message() or ai_classify_safety_tier().
--
-- SCHEMA MISMATCH FLAGGED, NOT GUESSED AROUND (per explicit instruction):
-- ai_safety_events.severity has a CHECK constraint of
-- ('urgent', 'emergency', 'sensitive') only (0028) — 'routine' is not a
-- valid value and can never appear as a row in this table, because
-- ai_send_message() (0029) only calls ai_log_safety_event() for
-- non-routine tiers. A caller asking "how many routine events are in
-- ai_safety_events" is asking a question this table cannot answer by
-- design; this function therefore does NOT return a routine_count field.
-- Deriving a routine count would require querying public.ai_messages
-- instead (its safety_tier column does allow 'routine') — a different
-- table, a different security surface, and out of scope for "the
-- smallest possible migration" for this specific ai_safety_events
-- metrics request. See the implementation report for how the admin UI
-- surfaces this rather than silently omitting it.
--
-- Depends on 0019_admin_roles.sql (public.is_admin()) and
-- 0028_ai_intelligence_foundation.sql (public.ai_safety_events).

create or replace function public.admin_ai_safety_metrics()
returns table (
  total_events bigint,
  urgent_count bigint,
  sensitive_count bigint,
  emergency_count bigint,
  blocked_count bigint,
  escalated_count bigint,
  logged_only_count bigint,
  events_last_24h bigint,
  events_last_7d bigint
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
    count(*) as total_events,
    count(*) filter (where severity = 'urgent') as urgent_count,
    count(*) filter (where severity = 'sensitive') as sensitive_count,
    count(*) filter (where severity = 'emergency') as emergency_count,
    count(*) filter (where action = 'blocked') as blocked_count,
    count(*) filter (where action = 'escalated') as escalated_count,
    count(*) filter (where action = 'logged_only') as logged_only_count,
    count(*) filter (where created_at > now() - interval '24 hours') as events_last_24h,
    count(*) filter (where created_at > now() - interval '7 days') as events_last_7d
  from public.ai_safety_events;
end;
$$;

revoke all on function public.admin_ai_safety_metrics() from public;
revoke execute on function public.admin_ai_safety_metrics() from anon;
grant execute on function public.admin_ai_safety_metrics() to authenticated;

comment on function public.admin_ai_safety_metrics() is
  'Admin-only aggregate counts from public.ai_safety_events. Checks '
  'public.is_admin() first and raises 42501 (fail closed) before ever '
  'touching ai_safety_events if the caller is not an admin — identical '
  'pattern to admin_feedback_kpis() (0027) and admin_overview_metrics() '
  '(0020). Counts only: never selects id, user_id, conversation_id, or '
  'any content column — ai_safety_events itself never stores raw message '
  'or conversation content (0028), and this function does not change '
  'that. Individual event timestamps are never exposed, only two '
  'rolling-window counts (24h/7d). Does not return a routine_count — '
  'ai_safety_events cannot contain routine-severity rows by design (see '
  'this migration''s header comment). Does not create, modify, or bypass '
  'any RLS policy; ai_safety_events'' existing zero-client-policy RLS is '
  'untouched — this function reads it only because SECURITY DEFINER runs '
  'as the table owner, the same mechanism every other admin RPC in this '
  'project already relies on.';
