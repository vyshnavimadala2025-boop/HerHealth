-- SIRILA Intelligence — Phase 2 bug fix: ambiguous "id" in ai_remember() / ai_save_symptom_journal_entry()
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- ORDERING: apply after 0028–0031 (fully committed, in that order). Does
-- NOT modify 0030, per instruction — this is a new migration that
-- replaces the bodies of two of the functions 0030 created, via
-- `create or replace function`, which is the normal, supported way to fix
-- a function without touching the file that originally created it.
--
-- Confirmed live bug (Phase 2 authenticated QA): every call to
-- public.ai_remember() and public.ai_save_symptom_journal_entry() failed
-- with:
--   42702 — column reference "id" is ambiguous: could refer to either a
--   PL/pgSQL variable or a table column
--
-- Root cause: both functions declare RETURNS TABLE(id uuid, ...). In
-- PL/pgSQL, the output-column names of a RETURNS TABLE clause become
-- implicitly-declared variables scoped to the entire function body. Both
-- functions then did `insert into <table> (...) ... returning id into
-- v_id` — an UNQUALIFIED `id`, which collides with that implicit
-- variable. This is a compile-time identifier-resolution failure, not a
-- runtime branch: it fired identically regardless of whether the
-- ownership check would have passed or failed, confirmed by testing both
-- an own-conversation call and a cross-user-conversation call and getting
-- the exact same 42702 error either way — meaning the ownership check
-- logic itself was never actually reachable in practice, even though it
-- was written correctly.
--
-- Fix: qualify the RETURNING clause with an explicit table alias
-- (`insert into public.ai_memory as m (...) returning m.id into v_id`),
-- which is standard, valid PostgreSQL syntax for exactly this
-- disambiguation. Nothing else changes: the ownership-check logic, the
-- SECURITY DEFINER + search_path, the parameter list, and the RETURNS
-- TABLE contract are all byte-for-byte identical to the 0030 versions —
-- only the ambiguous identifier is fixed. Grants are re-asserted below
-- defensively (CREATE OR REPLACE FUNCTION preserves existing grants when
-- the signature is unchanged, but this project's convention has been to
-- re-assert them explicitly in every migration that touches a function).

-- 1. ai_remember — fixed --------------------------------------------------

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

  insert into public.ai_memory as m (user_id, memory_text, source_conversation_id)
  values (auth.uid(), p_memory_text, p_source_conversation_id)
  returning m.id into v_id;

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
  'EXECUTE is restricted to authenticated only. Fixed in 0032: the '
  'INSERT''s RETURNING clause is now qualified (`returning m.id`) to '
  'avoid colliding with the implicit variable RETURNS TABLE(id, ...) '
  'creates in this function''s namespace — see 0032''s header comment.';

-- 2. ai_save_symptom_journal_entry — fixed ---------------------------

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

  insert into public.ai_symptom_journal_entries as j (user_id, conversation_id, symptom, severity, notes)
  values (auth.uid(), p_conversation_id, p_symptom, p_severity, p_notes)
  returning j.id into v_id;

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
  'EXECUTE is restricted to authenticated only. Fixed in 0032: the '
  'INSERT''s RETURNING clause is now qualified (`returning j.id`) to '
  'avoid colliding with the implicit variable RETURNS TABLE(id, ...) '
  'creates in this function''s namespace — see 0032''s header comment.';
