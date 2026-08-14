-- SIRILA Intelligence — Phase 2 bug fix (round 2): second ambiguous "id"
-- in ai_remember() / ai_save_symptom_journal_entry()'s OWNERSHIP CHECK
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- ORDERING: apply after 0028–0032 (fully committed, in that order).
--
-- 0032 fixed ONE of two unqualified `id` references in each function —
-- the `insert ... returning id into v_id` line — but missed a SECOND,
-- separate one inside the ownership-check subquery:
--   select 1 from public.ai_conversations where id = p_source_conversation_id ...
-- That bare `id` is ALSO ambiguous against the same implicit variable
-- RETURNS TABLE(id uuid, ...) creates in each function's namespace — the
-- exact same class of bug 0032 diagnosed, just a second instance of it
-- that inspection missed the first time.
--
-- This was confirmed live, precisely, after 0032 was applied: calling
-- ai_remember()/ai_save_symptom_journal_entry() WITHOUT a conversation id
-- (so the ownership-check branch is skipped entirely) succeeded; calling
-- either WITH a conversation id (so the ownership check actually runs)
-- reproduced the identical 42702 "column reference \"id\" is ambiguous"
-- error 0032 was supposed to have already fixed. That isolated the second
-- occurrence exactly.
--
-- Fix: alias public.ai_conversations as `c` in both ownership-check
-- subqueries and qualify every column reference inside them
-- (`c.id`, `c.user_id`). Nothing else changes — ownership semantics,
-- SECURITY DEFINER, search_path, parameters, and the RETURNS TABLE
-- contract are unchanged from 0030/0032. Re-scanned both function bodies
-- fully this time for any other unqualified reference to a name that
-- collides with either function's own RETURNS TABLE output columns
-- (id, memory_text, source_conversation_id, created_at, updated_at for
-- ai_remember; id, conversation_id, symptom, severity, notes, created_at,
-- updated_at for ai_save_symptom_journal_entry) — the INSERT target
-- column lists are not subject to this ambiguity (column identifiers
-- there resolve directly against the target table, not through
-- PL/pgSQL's variable/column resolution), and the final `return query
-- select ...` blocks were already fully alias-qualified in 0032. This
-- ownership-check subquery was the only remaining instance in either
-- function.

-- 1. ai_remember — ownership check now fully qualified ----------------

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
      select 1 from public.ai_conversations c
      where c.id = p_source_conversation_id and c.user_id = auth.uid()
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
  'EXECUTE is restricted to authenticated only. Fixed in 0032 and 0033: '
  'every reference to the ai_conversations/ai_memory "id" column is now '
  'qualified with a table alias, avoiding collision with the implicit '
  'variable RETURNS TABLE(id, ...) creates in this function''s namespace.';

-- 2. ai_save_symptom_journal_entry — ownership check now fully qualified

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
      select 1 from public.ai_conversations c
      where c.id = p_conversation_id and c.user_id = auth.uid()
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
  'EXECUTE is restricted to authenticated only. Fixed in 0032 and 0033: '
  'every reference to the ai_conversations/ai_symptom_journal_entries '
  '"id" column is now qualified with a table alias, avoiding collision '
  'with the implicit variable RETURNS TABLE(id, ...) creates in this '
  'function''s namespace.';
