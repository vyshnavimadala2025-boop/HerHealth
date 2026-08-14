-- SIRILA Intelligence — Phase 2: conversation send-message foundation
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: 0028_ai_intelligence_foundation.sql deliberately left
-- ai_messages with NO insert path for role = 'assistant' rows, noting
-- "a future SECURITY DEFINER function once the AI pipeline exists." This
-- migration is that function. It does not create any table, does not
-- change any RLS policy, and does not touch anything outside the two
-- objects below.
--
-- IMPORTANT — Phase 2 is a MOCK-MODEL phase. No AI provider has been
-- selected (Phase 0/1 explicitly deferred that decision) and no server-side
-- function infrastructure (Supabase Edge Functions) exists in this project
-- yet. p_assistant_content is therefore supplied by the CLIENT, generated
-- by a clearly-labeled mock generator (see src/features/aiIntelligence/
-- aiProviderAbstraction.ts) — it is NOT a real model response. This
-- function's job is only the secure, server-enforced parts that a client
-- can never be trusted to self-report:
--   1. conversation ownership (a user can only post into their own thread)
--   2. rate limiting (a modified client cannot bypass this)
--   3. safety-tier classification of the user's OWN input, computed here,
--      server-side, from the raw text — not trusted from the client
--   4. the emergency-tier override: if this function's own classification
--      finds an emergency-tier pattern, it DISCARDS whatever assistant
--      content the client sent and substitutes a fixed placeholder,
--      regardless of what the client claims the "safe" response is
--
-- ai_classify_safety_tier() is intentionally coarse (keyword matching) —
-- this is explicitly a mock-grade classifier, not the real moderation/
-- classification system Phase 0 specified. A real provider integration
-- must replace or substantially harden this before real users are exposed
-- to real model output (see the KNOWN LIMITATION note in the Phase 2
-- checkpoint report for the parallel, not-yet-closed gap on the
-- CLIENT-SIDE pre-generation screen used to decide mock response content).
--
-- The emergency placeholder text below is explicitly NOT approved,
-- reviewed, or final wording — Phase 0/1 were explicit that emergency-tier
-- language requires a separate clinical/legal sign-off process, which has
-- not happened. It exists only so the STRUCTURAL override (never show a
-- normal generated reply for emergency-tier input) can be built and tested
-- now. It must be replaced with reviewed copy before this reaches real
-- users — see the dev-only preview gate in the frontend for how this is
-- being kept out of production reach until that happens.
--
-- Depends on 0028_ai_intelligence_foundation.sql (ai_conversations,
-- ai_messages, ai_log_safety_event()).

-- 1. ai_classify_safety_tier ----------------------------------------------

create or replace function public.ai_classify_safety_tier(p_content text)
returns text
language sql
stable
as $$
  select case
    when p_content ilike any (array[
      '%chest pain%', '%can''t breathe%', '%cannot breathe%', '%severe bleeding%',
      '%heavy bleeding%', '%suicidal%', '%kill myself%', '%end my life%',
      '%want to die%', '%signs of stroke%', '%face drooping%', '%severe allergic reaction%',
      '%loss of consciousness%', '%passed out%'
    ]) then 'emergency'
    when p_content ilike any (array[
      '%persistent fever%', '%high fever%', '%severe pain%', '%getting worse%',
      '%won''t stop%', '%worried it''s serious%'
    ]) then 'urgent'
    when p_content ilike any (array[
      '%abuse%', '%self-harm%', '%self harm%', '%hurting myself%',
      '%eating disorder%', '%binge%', '%purge%'
    ]) then 'sensitive'
    else 'routine'
  end;
$$;

revoke all on function public.ai_classify_safety_tier(text) from public;
revoke execute on function public.ai_classify_safety_tier(text) from anon;
grant execute on function public.ai_classify_safety_tier(text) to authenticated;

comment on function public.ai_classify_safety_tier(text) is
  'Coarse, mock-grade, keyword-based safety-tier classifier. Deliberately '
  'simple — a real provider integration must replace or substantially '
  'harden this. Used server-side inside ai_send_message() so a modified '
  'client cannot bypass the emergency-tier override or safety-event '
  'logging by lying about the tier of its own input.';

-- 2. ai_send_message --------------------------------------------------

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

  v_tier := public.ai_classify_safety_tier(p_user_content);

  insert into public.ai_messages (conversation_id, user_id, role, content, safety_tier)
  values (p_conversation_id, auth.uid(), 'user', p_user_content, v_tier)
  returning id into v_user_message_id;

  if v_tier in ('urgent', 'emergency', 'sensitive') then
    perform public.ai_log_safety_event(
      p_conversation_id,
      v_tier,
      case
        when v_tier = 'emergency' then 'emergency_physical'
        when v_tier = 'urgent' then 'urgent_symptom'
        else 'sensitive_disclosure'
      end,
      case when v_tier = 'emergency' then 'blocked' else 'escalated' end
    );
  end if;

  if v_tier = 'emergency' then
    v_emergency_override := true;
    v_final_assistant_content :=
      '[Placeholder — pending clinical/legal sign-off, not approved emergency '
      'guidance] SIRILA noticed something in your message that may need urgent '
      'attention. Please contact local emergency services or a healthcare '
      'professional right away if you believe this is an emergency. This '
      'placeholder message must be replaced with reviewed, approved wording '
      'before real users see it.';
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
  '/ 24h, a placeholder MVP value — change v_daily_limit in this function '
  'and re-run to adjust). Classifies safety tier server-side from the '
  'user''s own text via ai_classify_safety_tier() and, if that '
  'classification is emergency-tier, DISCARDS the client-supplied '
  'assistant content and substitutes a fixed (not yet clinically/legally '
  'approved) placeholder — this override cannot be bypassed by a modified '
  'client. Logs a safety event via ai_log_safety_event() for any '
  'non-routine tier. EXECUTE is restricted to authenticated only.';
