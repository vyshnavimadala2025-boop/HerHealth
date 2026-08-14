-- SIRILA Intelligence — Phase 2 hardening: related-row ownership + grant tightening
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- IMPORTANT — ORDERING: this migration must be applied AFTER
-- 0029_ai_send_message.sql, not before. Section 2 below revokes an
-- EXECUTE grant on public.ai_classify_safety_tier(text), a function 0029
-- creates — this statement will fail with "function does not exist" if
-- run first. Neither 0028 nor 0029 is modified by this file, per
-- instruction — everything here is new, additive DDL.
--
-- Purpose: closes the finding from the Phase 2 security checkpoint that
-- ai_feedback.conversation_id/message_id, ai_memory.source_conversation_id,
-- and ai_symptom_journal_entries.conversation_id were plain foreign keys
-- with no check that the referenced parent actually belongs to the
-- inserting user (auth.uid()). Not an exploitable data leak — no read-back
-- of another user's content was possible — but a user could attach their
-- own record to another user's conversation/message if they already knew
-- its UUID. This migration removes the direct client INSERT path on all
-- three tables and replaces it with a SECURITY DEFINER RPC per table that
-- verifies ownership of the referenced parent before inserting, exactly
-- mirroring the pattern already used by ai_send_message() for ai_messages.
--
-- Also tightens ai_classify_safety_tier's EXECUTE grant (Finding 4): it
-- does not need to be directly callable by authenticated clients — when
-- ai_send_message() (SECURITY DEFINER) calls it internally, that call runs
-- under the effective privileges of the function's owner (both functions
-- share the same owner, the role that ran these migrations), not the
-- original caller's, and a function owner always has implicit EXECUTE on
-- its own functions regardless of grants to other roles. Revoking from
-- authenticated therefore cannot break ai_send_message's internal call.
--
-- Does NOT touch: table schemas, columns, constraints, indexes, SELECT/
-- UPDATE/DELETE policies, or any other function. RLS is not weakened
-- anywhere — this migration only narrows how a row can be created.
--
-- Residual, accepted scope limitation: ai_memory's existing UPDATE policy
-- (0028) still permits changing source_conversation_id after creation
-- without an ownership re-check. No UI in this codebase exposes an
-- "edit a memory item's linked conversation" action, so this is not
-- currently reachable — but if that capability is ever built, it must
-- route through an ownership-checked function too, not a direct update.

-- =========================================================================
-- 1. Remove the direct-insert paths this migration replaces
-- =========================================================================

drop policy if exists "Users can create own AI feedback" on public.ai_feedback;
drop policy if exists "Users can create own AI memory" on public.ai_memory;
drop policy if exists "Users can insert own AI symptom journal entries" on public.ai_symptom_journal_entries;

-- =========================================================================
-- 2. Tighten ai_classify_safety_tier's EXECUTE grant (Finding 4)
-- =========================================================================

revoke execute on function public.ai_classify_safety_tier(text) from authenticated;

comment on function public.ai_classify_safety_tier(text) is
  'Coarse, mock-grade, keyword-based safety-tier classifier. Deliberately '
  'simple — a real provider integration must replace or substantially '
  'harden this. Callable ONLY internally, from within ai_send_message() — '
  'EXECUTE is revoked from anon, authenticated, and public. A SECURITY '
  'DEFINER caller retains implicit EXECUTE on functions sharing its owner '
  'regardless of these revokes, so the internal call still works.';

-- =========================================================================
-- 3. ai_submit_feedback — ownership-checked write path for ai_feedback
-- =========================================================================

create or replace function public.ai_submit_feedback(
  p_conversation_id uuid,
  p_message_id uuid,
  p_rating text,
  p_reason text default null
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_feedback_id uuid;
begin
  if not exists (
    select 1 from public.ai_conversations
    where id = p_conversation_id and user_id = auth.uid()
  ) then
    raise exception 'conversation not found or not owned by caller' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.ai_messages
    where id = p_message_id and conversation_id = p_conversation_id and user_id = auth.uid()
  ) then
    raise exception 'message not found or not owned by caller' using errcode = '42501';
  end if;

  insert into public.ai_feedback (user_id, conversation_id, message_id, rating, reason)
  values (auth.uid(), p_conversation_id, p_message_id, p_rating, p_reason)
  returning id into v_feedback_id;

  return v_feedback_id;
end;
$$;

revoke all on function public.ai_submit_feedback(uuid, uuid, text, text) from public;
revoke execute on function public.ai_submit_feedback(uuid, uuid, text, text) from anon;
grant execute on function public.ai_submit_feedback(uuid, uuid, text, text) to authenticated;

comment on function public.ai_submit_feedback(uuid, uuid, text, text) is
  'The only write path into ai_feedback. Verifies the caller owns both '
  'p_conversation_id and p_message_id (and that the message belongs to '
  'that conversation) before inserting — a user cannot attach feedback to '
  'another user''s conversation or message. user_id is always auth.uid(), '
  'never a parameter. EXECUTE is restricted to authenticated only.';

-- =========================================================================
-- 4. ai_remember — ownership-checked write path for ai_memory
-- =========================================================================

create or replace function public.ai_remember(
  p_memory_text text,
  p_source_conversation_id uuid default null
)
returns table (
  id uuid,
  memory_text text,
  source_conversation_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_source_conversation_id is not null then
    if not exists (
      select 1 from public.ai_conversations
      where id = p_source_conversation_id and user_id = auth.uid()
    ) then
      raise exception 'conversation not found or not owned by caller' using errcode = '42501';
    end if;
  end if;

  insert into public.ai_memory (user_id, memory_text, source_conversation_id)
  values (auth.uid(), p_memory_text, p_source_conversation_id)
  returning id into v_id;

  return query
  select m.id, m.memory_text, m.source_conversation_id, m.created_at, m.updated_at
  from public.ai_memory m
  where m.id = v_id;
end;
$$;

revoke all on function public.ai_remember(text, uuid) from public;
revoke execute on function public.ai_remember(text, uuid) from anon;
grant execute on function public.ai_remember(text, uuid) to authenticated;

comment on function public.ai_remember(text, uuid) is
  'The only write path into ai_memory ("Remember this"). When '
  'p_source_conversation_id is supplied, verifies the caller owns it '
  'before inserting — a user cannot link a memory item to another user''s '
  'conversation. user_id is always auth.uid(), never a parameter. '
  'EXECUTE is restricted to authenticated only.';

-- =========================================================================
-- 5. ai_save_symptom_journal_entry — ownership-checked write path
-- =========================================================================
--
-- Covers the fields the current frontend actually uses (symptom, severity,
-- notes, conversation_id) — the fuller field set on
-- ai_symptom_journal_entries (frequency/duration/location/triggers/
-- associated_symptoms/cycle_context) has no write path yet in either the
-- old policy or this function, since no UI exposes them. Extend this
-- function's parameters, not the removed policy, if that UI is built.

create or replace function public.ai_save_symptom_journal_entry(
  p_symptom text,
  p_conversation_id uuid default null,
  p_severity text default null,
  p_notes text default null
)
returns table (
  id uuid,
  conversation_id uuid,
  symptom text,
  severity text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_conversation_id is not null then
    if not exists (
      select 1 from public.ai_conversations
      where id = p_conversation_id and user_id = auth.uid()
    ) then
      raise exception 'conversation not found or not owned by caller' using errcode = '42501';
    end if;
  end if;

  insert into public.ai_symptom_journal_entries (user_id, conversation_id, symptom, severity, notes)
  values (auth.uid(), p_conversation_id, p_symptom, p_severity, p_notes)
  returning id into v_id;

  return query
  select j.id, j.conversation_id, j.symptom, j.severity, j.notes, j.created_at, j.updated_at
  from public.ai_symptom_journal_entries j
  where j.id = v_id;
end;
$$;

revoke all on function public.ai_save_symptom_journal_entry(text, uuid, text, text) from public;
revoke execute on function public.ai_save_symptom_journal_entry(text, uuid, text, text) from anon;
grant execute on function public.ai_save_symptom_journal_entry(text, uuid, text, text) to authenticated;

comment on function public.ai_save_symptom_journal_entry(text, uuid, text, text) is
  'The only write path into ai_symptom_journal_entries. When '
  'p_conversation_id is supplied, verifies the caller owns it before '
  'inserting — a user cannot link a journal entry to another user''s '
  'conversation. user_id is always auth.uid(), never a parameter. '
  'EXECUTE is restricted to authenticated only.';
