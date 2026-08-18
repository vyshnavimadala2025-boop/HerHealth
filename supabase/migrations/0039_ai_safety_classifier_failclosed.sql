-- SIRILA Intelligence — Classifier fail-closed hardening
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: closes the "classifier fail-open" finding from the SIRILA
-- launch safety verification. Does NOT touch ai_classify_safety_tier()'s
-- keyword lists or its `else 'routine'` default — that is a detection-
-- COVERAGE question (what phrasing should be recognized as an emergency),
-- a clinical/product policy decision, not something this migration
-- decides. What this migration fixes is a separate, purely structural
-- issue in ai_send_message(): the emergency-override check was an
-- ALLOWLIST of one value ("if v_tier = 'emergency' then override, else
-- pass the client's content through"). If the classifier ever returned
-- anything other than the four known literals — NULL, an empty string,
-- an unrecognized value, or raised an exception — the ELSE branch would
-- silently show that content to the user as if it were a normal, safe
-- reply. Today's classifier is a deterministic SQL CASE with an
-- unconditional `else 'routine'`, so it cannot actually produce such a
-- value under real input — this hardens the code path anyway, as a
-- forward-looking safety net (e.g. if the classifier is ever swapped for
-- a real-provider-backed implementation later).
--
-- Two changes to ai_send_message(), both minimal:
--   1. The classifier call is wrapped in its own BEGIN/EXCEPTION block —
--      any raised exception is caught and treated as a missing
--      classification, never allowed to either crash the whole message
--      send OR silently fall through.
--   2. The override check is inverted from an allowlist-of-emergency to
--      an allowlist-of-known-safe-tiers ('routine'/'urgent'/'sensitive').
--      Anything else — including the caught-exception case above —
--      normalizes to the EXISTING 'emergency' tier and gets the EXISTING
--      override response. No new safety_tier value is introduced: this
--      reuses 'emergency' as the "equivalent existing project-safe
--      state" rather than adding a new one, so ZERO schema or CHECK
--      constraint changes are needed anywhere. The tradeoff — a
--      classifier-malfunction event is indistinguishable from a real
--      emergency in safety_tier/severity — is accepted deliberately for
--      minimal footprint; event_type still distinguishes them (see
--      below), and the normalization path is not reachable by any input
--      today given the classifier's current deterministic implementation.
--
-- Also extracts the emergency response text into its own function
-- (public.ai_emergency_response_text()) so approved wording, once it
-- exists, is a one-function `create or replace` — ai_send_message()'s
-- routing logic never needs to change again for a wording update. The
-- STRING ITSELF IS UNCHANGED — still the exact same unapproved placeholder
-- from 0029, copied verbatim, not modified, not approved, not replaced.
--
-- Depends on 0029_ai_send_message.sql. Does not touch ai_classify_safety_tier(),
-- any table, any RLS policy, or any CHECK constraint.

-- 1. ai_emergency_response_text ------------------------------------------
--
-- Centralized emergency-response content. Internal-only (matches
-- ai_classify_safety_tier()'s post-0030 lockdown pattern) — never called
-- directly by a client, only from within ai_send_message().

create or replace function public.ai_emergency_response_text()
returns text
language sql
immutable
as $$
  select
    '[Placeholder — pending clinical/legal sign-off, not approved emergency ' ||
    'guidance] SIRILA noticed something in your message that may need urgent ' ||
    'attention. Please contact local emergency services or a healthcare ' ||
    'professional right away if you believe this is an emergency. This ' ||
    'placeholder message must be replaced with reviewed, approved wording ' ||
    'before real users see it.';
$$;

revoke all on function public.ai_emergency_response_text() from public;
revoke execute on function public.ai_emergency_response_text() from anon;
revoke execute on function public.ai_emergency_response_text() from authenticated;
grant execute on function public.ai_emergency_response_text() to postgres;

comment on function public.ai_emergency_response_text() is
  'Single source of truth for the emergency-tier response shown to users. '
  'Callable ONLY internally, from within ai_send_message() — EXECUTE is '
  'revoked from anon and authenticated, matching ai_classify_safety_tier()''s '
  'post-0030 lockdown; a SECURITY DEFINER caller retains implicit EXECUTE '
  'on functions sharing its owner regardless of these revokes. STILL THE '
  'SAME UNAPPROVED PLACEHOLDER as 0029 — this migration only relocates it '
  'so a future wording update is a one-function change, never touching '
  'ai_send_message()''s routing logic. Do not replace this text without '
  'clinical/legal sign-off.';

-- 2. ai_send_message — fail-closed classifier handling --------------------

create or replace function public.ai_send_message(
  p_conversation_id uuid,
  p_user_content text,
  p_assistant_content text,
  p_model_used text default 'mock-v1'
)
returns table (
  user_message_id uuid,
  assistant_message_id uuid,
  assistant_content text,
  safety_tier text,
  emergency_override boolean
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_tier text;
  v_classifier_error boolean := false;
  v_final_assistant_content text;
  v_user_message_id uuid;
  v_assistant_message_id uuid;
  v_recent_count integer;
  v_emergency_override boolean := false;
  v_daily_limit constant integer := 50; -- MVP placeholder; see report for how to change this
begin
  if not exists (
    select 1 from public.ai_conversations
    where id = p_conversation_id and user_id = auth.uid()
  ) then
    raise exception 'conversation not found or not owned by caller' using errcode = '42501';
  end if;

  select count(*) into v_recent_count
  from public.ai_messages
  where user_id = auth.uid() and role = 'user' and created_at > now() - interval '24 hours';

  if v_recent_count >= v_daily_limit then
    raise exception 'SIRILA Intelligence daily message limit reached, please try again tomorrow'
      using errcode = 'P0001', hint = 'rate_limit';
  end if;

  -- FAIL-CLOSED CLASSIFICATION: a raised exception from the classifier
  -- itself (not reachable with today's pure-SQL implementation, but a
  -- real possibility for any future replacement) is caught here rather
  -- than propagating — v_tier stays NULL, which the normalization check
  -- immediately below treats identically to any other unrecognized value.
  begin
    v_tier := public.ai_classify_safety_tier(p_user_content);
  exception when others then
    v_tier := null;
  end;

  -- Anything other than an affirmatively-known safe tier is treated as
  -- needing the emergency-safe path — an allowlist of what's PERMITTED to
  -- reach normal AI content, not a denylist of the one thing that's
  -- blocked. Reuses the existing 'emergency' state (see this migration's
  -- header for why no new state was introduced). v_classifier_error is
  -- tracked separately purely so the audit log (event_type below) can
  -- still distinguish "the classifier actually matched an emergency
  -- phrase" from "the classifier didn't return a recognized value" —
  -- severity/safety_tier intentionally do not distinguish them, since
  -- both must be treated with equal caution.
  if v_tier is null or v_tier not in ('routine', 'urgent', 'sensitive') then
    v_classifier_error := (v_tier is distinct from 'emergency');
    v_tier := 'emergency';
  end if;

  insert into public.ai_messages (conversation_id, user_id, role, content, safety_tier)
  values (p_conversation_id, auth.uid(), 'user', p_user_content, v_tier)
  returning id into v_user_message_id;

  if v_tier in ('urgent', 'emergency', 'sensitive') then
    perform public.ai_log_safety_event(
      p_conversation_id,
      v_tier,
      case
        when v_classifier_error then 'other'
        when v_tier = 'emergency' then 'emergency_physical'
        when v_tier = 'urgent' then 'urgent_symptom'
        else 'sensitive_disclosure'
      end,
      case when v_tier = 'emergency' then 'blocked' else 'escalated' end
    );
  end if;

  if v_tier = 'emergency' then
    v_emergency_override := true;
    v_final_assistant_content := public.ai_emergency_response_text();
  else
    v_final_assistant_content := p_assistant_content;
  end if;

  insert into public.ai_messages (conversation_id, user_id, role, content, model_used, safety_tier)
  values (p_conversation_id, auth.uid(), 'assistant', v_final_assistant_content, p_model_used, v_tier)
  returning id into v_assistant_message_id;

  update public.ai_conversations set updated_at = now() where id = p_conversation_id;

  return query
  select v_user_message_id, v_assistant_message_id, v_final_assistant_content, v_tier, v_emergency_override;
end;
$$;

revoke all on function public.ai_send_message(uuid, text, text, text) from public;
revoke execute on function public.ai_send_message(uuid, text, text, text) from anon;
grant execute on function public.ai_send_message(uuid, text, text, text) to authenticated;

comment on function public.ai_send_message(uuid, text, text, text) is
  'The only write path for a conversation turn. Verifies conversation '
  'ownership and enforces a server-side daily rate limit (50 user messages '
  '/ 24h). Classifies safety tier server-side via ai_classify_safety_tier(), '
  'wrapped in its own exception handler. FAIL-CLOSED (0039): the override '
  'check is an allowlist of the three known-safe tiers (routine/urgent/'
  'sensitive) — anything else, including a NULL/exception from the '
  'classifier, normalizes to the emergency tier and gets the emergency '
  'response from ai_emergency_response_text(), discarding the '
  'client-supplied content. This cannot be bypassed by a modified client: '
  'the classification and the override decision both happen entirely '
  'server-side from the user''s own submitted text, never from a '
  'client-supplied tier or flag. Logs a safety event via '
  'ai_log_safety_event() for any non-routine tier, distinguishing a real '
  'keyword match from a classifier-malfunction normalization via '
  'event_type. EXECUTE is restricted to authenticated only.';
