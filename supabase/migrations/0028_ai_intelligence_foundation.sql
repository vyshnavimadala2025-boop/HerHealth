-- SIRILA Intelligence — Phase 1: database + security foundation
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Scope: ONLY the tables and security primitives required to give SIRILA
-- Intelligence a safe place to store data. This migration does NOT wire up
-- an AI provider, does NOT create any admin-facing RPC, does NOT implement
-- the safety pipeline itself, and does NOT touch any existing table. Those
-- are later, separately-approved phases (see SIRILA INTELLIGENCE — PHASE 0
-- DELIVERY SPECIFICATION for the full architecture this schema implements).
--
-- Tables in this migration:
--   1. public.ai_conversations           — one row per AI conversation thread
--   2. public.ai_messages                — turns within a conversation
--   3. public.ai_memory                  — user-approved persistent memory items
--   4. public.ai_symptom_journal_entries — structured symptom journal
--   5. public.ai_feedback                — helpful/not-helpful feedback on responses
--   6. public.ai_safety_events           — safety/audit metadata (zero client RLS)
--   7. public.ai_log_safety_event()      — the one write path into #6
--
-- Deliberately NOT created here (see report for reasoning):
--   - ai_insights — no MVP feature persists a standalone insight object;
--     Pattern Intelligence is explicitly deferred past MVP. Nothing to store yet.
--   - a separate provider/request-metadata table — per-message model/latency/
--     token fields are folded directly into ai_messages instead (a 1:1
--     relationship, not a distinct lifecycle), avoiding an unnecessary join.
--   - any admin_* RPC — narrow admin RPCs are documented at the bottom of
--     this file as future work for the eventual Admin AI Monitoring phase,
--     not implemented now. No broad admin-read policy exists on any table
--     below, matching the existing admin architecture exactly.
--
-- Security conventions followed, matching the existing schema exactly:
--   - auth.uid() = user_id self-scoped RLS (profiles, symptom_entries, etc.)
--   - zero-policy RLS + explicit revoke for a table that must never be
--     client-readable at all (public.admin_roles, 0019)
--   - SECURITY DEFINER + set search_path = public + is_admin()-style
--     caller-derived identity (never a caller-supplied user_id) for any
--     function that must bypass RLS (public.is_admin(), 0019)
--   - explicit `revoke execute ... from anon` BY NAME, not just `from
--     public` — this project's default privileges grant EXECUTE directly to
--     anon/authenticated on new functions, so revoking from `public` alone
--     is insufficient (discovered and fixed in 0021_admin_rpc_execute_hardening.sql)
--   - reuse public.set_profiles_updated_at() for updated_at triggers rather
--     than duplicating it (already reused by symptom_entries, wellness_goals,
--     and every other table with an updated_at column)
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout.

-- =========================================================================
-- 1. ai_conversations
-- =========================================================================
--
-- One row per SIRILA Intelligence conversation thread. capability is
-- constrained to the two MVP entry points only (Section 23 of the product
-- spec — Visual Insight, Pattern Lens, etc. are deferred). memory_enabled
-- defaults to false, matching the Phase 0 consent model's default-off
-- Category C (AI memory) — it is a snapshot of the user's memory consent
-- at the time the thread was created, not a live-joined consent flag.

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  capability text not null,
  status text not null default 'active',
  memory_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations drop constraint if exists ai_conversations_capability_check;
alter table public.ai_conversations add constraint ai_conversations_capability_check
  check (capability in ('ask_sirila', 'symptom_insight'));

alter table public.ai_conversations drop constraint if exists ai_conversations_status_check;
alter table public.ai_conversations add constraint ai_conversations_status_check
  check (status in ('active', 'archived'));

alter table public.ai_conversations drop constraint if exists ai_conversations_title_length_check;
alter table public.ai_conversations add constraint ai_conversations_title_length_check
  check (title is null or char_length(title) <= 200);

create index if not exists ai_conversations_user_id_updated_at_idx
  on public.ai_conversations (user_id, updated_at desc);

alter table public.ai_conversations enable row level security;

drop policy if exists "Users can read own AI conversations" on public.ai_conversations;
create policy "Users can read own AI conversations"
  on public.ai_conversations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own AI conversations" on public.ai_conversations;
create policy "Users can create own AI conversations"
  on public.ai_conversations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own AI conversations" on public.ai_conversations;
create policy "Users can update own AI conversations"
  on public.ai_conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own AI conversations" on public.ai_conversations;
create policy "Users can delete own AI conversations"
  on public.ai_conversations for delete
  using (auth.uid() = user_id);

drop trigger if exists ai_conversations_set_updated_at on public.ai_conversations;
create trigger ai_conversations_set_updated_at
  before update on public.ai_conversations
  for each row
  execute function public.set_profiles_updated_at();

comment on table public.ai_conversations is
  'One row per SIRILA Intelligence conversation thread. Self-scoped RLS '
  '(auth.uid() = user_id), full user CRUD including hard delete, matching '
  'the "deletion is permanent" convention already stated on the Privacy '
  'page. Deleting a conversation cascades to its ai_messages and '
  'ai_feedback rows; ai_symptom_journal_entries and ai_safety_events rows '
  'created from it are preserved (see those tables'' comments).';

-- =========================================================================
-- 2. ai_messages
-- =========================================================================
--
-- Turns within a conversation. user_id is denormalized (not derived via a
-- join to ai_conversations) to keep RLS a direct auth.uid() = user_id
-- check, matching this schema's general preference for direct columns in
-- RLS-checked tables over join-dependent policies.
--
-- INSERT is intentionally restricted to role = 'user': a client may write
-- its own input, but can never insert a fabricated 'assistant' row. There
-- is no client-facing UPDATE policy (a transcript is not edited after the
-- fact) and no DELETE policy (messages are removed only by deleting their
-- parent conversation, which cascades — this keeps a thread's transcript
-- internally consistent rather than allowing partial edits).
--
-- Once the AI pipeline is implemented (a later phase), assistant-role rows
-- will be written by a SECURITY DEFINER function that bypasses this INSERT
-- policy as the table owner — the same pattern already used for
-- ai_safety_events below. No such function exists yet in this migration.
--
-- safety_tier, model_used, latency_ms, and token_count are nullable
-- because they only apply once the (not-yet-built) safety pipeline and
-- model integration exist; they are columns on ai_messages rather than a
-- separate metadata table because each only ever describes exactly one
-- message row (a 1:1 relationship, not a distinct lifecycle worth a join).

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null,
  content text not null,
  safety_tier text,
  model_used text,
  latency_ms integer,
  token_count integer,
  created_at timestamptz not null default now()
);

alter table public.ai_messages drop constraint if exists ai_messages_role_check;
alter table public.ai_messages add constraint ai_messages_role_check
  check (role in ('user', 'assistant'));

alter table public.ai_messages drop constraint if exists ai_messages_content_length_check;
alter table public.ai_messages add constraint ai_messages_content_length_check
  check (char_length(btrim(content)) > 0 and char_length(content) <= 8000);

alter table public.ai_messages drop constraint if exists ai_messages_safety_tier_check;
alter table public.ai_messages add constraint ai_messages_safety_tier_check
  check (safety_tier is null or safety_tier in ('routine', 'urgent', 'emergency', 'sensitive'));

alter table public.ai_messages drop constraint if exists ai_messages_latency_ms_check;
alter table public.ai_messages add constraint ai_messages_latency_ms_check
  check (latency_ms is null or latency_ms >= 0);

alter table public.ai_messages drop constraint if exists ai_messages_token_count_check;
alter table public.ai_messages add constraint ai_messages_token_count_check
  check (token_count is null or token_count >= 0);

create index if not exists ai_messages_conversation_id_created_at_idx
  on public.ai_messages (conversation_id, created_at);

create index if not exists ai_messages_user_id_idx
  on public.ai_messages (user_id);

alter table public.ai_messages enable row level security;

drop policy if exists "Users can read own AI messages" on public.ai_messages;
create policy "Users can read own AI messages"
  on public.ai_messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own AI user messages" on public.ai_messages;
create policy "Users can insert own AI user messages"
  on public.ai_messages for insert
  with check (auth.uid() = user_id and role = 'user');

-- No UPDATE policy and no DELETE policy: RLS denies both by default with
-- no policy present, for every role. See table comment above.

comment on table public.ai_messages is
  'Turns within an ai_conversations thread. Self-scoped RLS. Clients may '
  'insert only their own role = ''user'' rows; role = ''assistant'' rows have '
  'no client-facing insert path in this migration and will be written by a '
  'future SECURITY DEFINER function once the AI pipeline exists. No update '
  'or delete policy — a message is only ever removed via cascading delete '
  'of its parent conversation.';

-- =========================================================================
-- 3. ai_memory
-- =========================================================================
--
-- Only explicitly user-approved "remember this" items — never an automatic
-- summary or inferred profile (Phase 0 Section 8: "no silent medical
-- profiling"). source_conversation_id is ON DELETE SET NULL, not CASCADE:
-- deleting the conversation a memory item came from must not delete the
-- memory item itself (explicit Phase 1 instruction) — only its backlink.

create table if not exists public.ai_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  memory_text text not null,
  source_conversation_id uuid references public.ai_conversations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_memory drop constraint if exists ai_memory_text_length_check;
alter table public.ai_memory add constraint ai_memory_text_length_check
  check (char_length(btrim(memory_text)) > 0 and char_length(memory_text) <= 500);

create index if not exists ai_memory_user_id_idx
  on public.ai_memory (user_id);

alter table public.ai_memory enable row level security;

drop policy if exists "Users can read own AI memory" on public.ai_memory;
create policy "Users can read own AI memory"
  on public.ai_memory for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own AI memory" on public.ai_memory;
create policy "Users can create own AI memory"
  on public.ai_memory for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own AI memory" on public.ai_memory;
create policy "Users can update own AI memory"
  on public.ai_memory for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own AI memory" on public.ai_memory;
create policy "Users can delete own AI memory"
  on public.ai_memory for delete
  using (auth.uid() = user_id);

drop trigger if exists ai_memory_set_updated_at on public.ai_memory;
create trigger ai_memory_set_updated_at
  before update on public.ai_memory
  for each row
  execute function public.set_profiles_updated_at();

comment on table public.ai_memory is
  'User-approved persistent memory items ("remember this"), self-scoped '
  'RLS, full user CRUD. source_conversation_id is ON DELETE SET NULL — '
  'deleting the conversation a memory item was created from preserves the '
  'memory item and only clears the backlink, per the product requirement '
  'that conversation deletion must never silently delete approved memory.';

-- =========================================================================
-- 4. ai_symptom_journal_entries
-- =========================================================================
--
-- Deliberately named ai_symptom_journal_entries, NOT symptom_entries — the
-- existing public.symptom_entries table (0011_symptom_entries.sql) already
-- owns that concept for the general-purpose Symptom Explorer feature, which
-- has its own fixed symptom taxonomy, severity scale, and timing field. This
-- is a distinct, free-text-capable table for SIRILA Intelligence's richer
-- journal, and must not collide with or be confused for that one.
--
-- conversation_id is nullable (entries may be created standalone, not only
-- from within a conversation) and ON DELETE SET NULL, matching ai_memory's
-- reasoning: deleting the conversation a journal entry was discussed in
-- must not delete the user's own symptom history.
--
-- severity reuses the existing platform-wide mild/moderate/significant
-- scale (the same one symptom_entries and pcos_wellness_entries already
-- use) for consistency, rather than inventing a new scale.
--
-- No entry_date/start_date column: the Phase 1 field list as given did not
-- include one, and created_at already orders entries chronologically for
-- MVP. If a distinct "symptom onset date" (separate from "date logged") is
-- genuinely needed for Progress Tracking, that is a V1.1 schema addition,
-- not assumed here.

create table if not exists public.ai_symptom_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid references public.ai_conversations (id) on delete set null,
  symptom text not null,
  severity text,
  frequency text,
  duration text,
  location text,
  triggers text[] not null default '{}',
  associated_symptoms text[] not null default '{}',
  cycle_context text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_symptom_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_symptom_check
  check (char_length(btrim(symptom)) > 0 and char_length(symptom) <= 200);

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_severity_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_severity_check
  check (severity is null or severity in ('mild', 'moderate', 'significant'));

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_frequency_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_frequency_check
  check (frequency is null or char_length(frequency) <= 200);

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_duration_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_duration_check
  check (duration is null or char_length(duration) <= 200);

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_location_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_location_check
  check (location is null or char_length(location) <= 200);

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_cycle_context_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_cycle_context_check
  check (cycle_context is null or char_length(cycle_context) <= 200);

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_notes_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_notes_check
  check (notes is null or char_length(notes) <= 2000);

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_triggers_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_triggers_check
  check (array_length(triggers, 1) is null or array_length(triggers, 1) <= 20);

alter table public.ai_symptom_journal_entries drop constraint if exists ai_symptom_journal_entries_associated_symptoms_check;
alter table public.ai_symptom_journal_entries add constraint ai_symptom_journal_entries_associated_symptoms_check
  check (array_length(associated_symptoms, 1) is null or array_length(associated_symptoms, 1) <= 20);

create index if not exists ai_symptom_journal_entries_user_id_created_at_idx
  on public.ai_symptom_journal_entries (user_id, created_at desc);

alter table public.ai_symptom_journal_entries enable row level security;

drop policy if exists "Users can read own AI symptom journal entries" on public.ai_symptom_journal_entries;
create policy "Users can read own AI symptom journal entries"
  on public.ai_symptom_journal_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own AI symptom journal entries" on public.ai_symptom_journal_entries;
create policy "Users can insert own AI symptom journal entries"
  on public.ai_symptom_journal_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own AI symptom journal entries" on public.ai_symptom_journal_entries;
create policy "Users can update own AI symptom journal entries"
  on public.ai_symptom_journal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own AI symptom journal entries" on public.ai_symptom_journal_entries;
create policy "Users can delete own AI symptom journal entries"
  on public.ai_symptom_journal_entries for delete
  using (auth.uid() = user_id);

drop trigger if exists ai_symptom_journal_entries_set_updated_at on public.ai_symptom_journal_entries;
create trigger ai_symptom_journal_entries_set_updated_at
  before update on public.ai_symptom_journal_entries
  for each row
  execute function public.set_profiles_updated_at();

comment on table public.ai_symptom_journal_entries is
  'SIRILA Intelligence''s structured symptom journal. Distinct from '
  'public.symptom_entries (Symptom Explorer, 0011) by design — do not '
  'merge or confuse the two. Self-scoped RLS, full user CRUD. '
  'conversation_id is ON DELETE SET NULL: deleting the source conversation '
  'preserves the journal entry.';

-- =========================================================================
-- 5. ai_feedback
-- =========================================================================
--
-- Helpful/not-helpful feedback on a specific AI message, following the
-- exact same "insert + select only, no update, no delete" pattern already
-- established for public.feedback_submissions (0027) — this is an
-- operational record, not personal content the user edits after the fact.
-- No admin RPC is created in this migration; see the documentation block
-- at the end of this file for the planned future admin_ai_feedback_metrics().

create table if not exists public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  message_id uuid not null references public.ai_messages (id) on delete cascade,
  rating text not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.ai_feedback drop constraint if exists ai_feedback_rating_check;
alter table public.ai_feedback add constraint ai_feedback_rating_check
  check (rating in ('helpful', 'not_helpful'));

alter table public.ai_feedback drop constraint if exists ai_feedback_reason_check;
alter table public.ai_feedback add constraint ai_feedback_reason_check
  check (
    reason is null or reason in (
      'inaccurate', 'confusing', 'too_generic', 'unsafe', 'irrelevant',
      'missing_information', 'other'
    )
  );

create index if not exists ai_feedback_user_id_idx on public.ai_feedback (user_id);
create index if not exists ai_feedback_message_id_idx on public.ai_feedback (message_id);

alter table public.ai_feedback enable row level security;

drop policy if exists "Users can create own AI feedback" on public.ai_feedback;
create policy "Users can create own AI feedback"
  on public.ai_feedback for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own AI feedback" on public.ai_feedback;
create policy "Users can read own AI feedback"
  on public.ai_feedback for select
  using (auth.uid() = user_id);

-- Deliberately no UPDATE or DELETE policy, matching feedback_submissions'
-- precedent exactly: feedback is an immutable operational record once given.

comment on table public.ai_feedback is
  'Helpful/not-helpful feedback on a single ai_messages row. Self-scoped '
  'insert + select only, matching public.feedback_submissions'' pattern. '
  'Cascades from both its parent conversation and its parent message.';

-- =========================================================================
-- 6. ai_safety_events
-- =========================================================================
--
-- Internal safety/audit metadata. Deliberately mirrors public.admin_roles'
-- zero-client-policy design exactly: RLS is enabled with NO policies for
-- any operation, for any role, including the event's own subject user —
-- nobody reads this table from the app directly. The only write path is
-- ai_log_safety_event() below (SECURITY DEFINER); the only future read
-- path is an admin RPC (not created in this migration).
--
-- event_type is a closed set of coarse categories, never raw flagged text
-- or a copy of the triggering message — this table must never become a
-- second copy of sensitive conversation content.
--
-- conversation_id is ON DELETE SET NULL, not CASCADE: this is a compliance
-- audit trail and must survive the user deleting the conversation it arose
-- from (Phase 0 Section 16 / this phase's explicit instruction that
-- ai_safety_events retention is independent of conversation deletion).

create table if not exists public.ai_safety_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid references public.ai_conversations (id) on delete set null,
  severity text not null,
  event_type text not null,
  action text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_safety_events drop constraint if exists ai_safety_events_severity_check;
alter table public.ai_safety_events add constraint ai_safety_events_severity_check
  check (severity in ('urgent', 'emergency', 'sensitive'));

alter table public.ai_safety_events drop constraint if exists ai_safety_events_event_type_check;
alter table public.ai_safety_events add constraint ai_safety_events_event_type_check
  check (
    event_type in (
      'emergency_physical', 'emergency_pregnancy', 'urgent_symptom',
      'urgent_mental_health', 'sensitive_disclosure', 'moderation_flag',
      'prompt_injection_attempt', 'other'
    )
  );

alter table public.ai_safety_events drop constraint if exists ai_safety_events_action_check;
alter table public.ai_safety_events add constraint ai_safety_events_action_check
  check (action in ('blocked', 'escalated', 'logged_only'));

create index if not exists ai_safety_events_user_id_idx on public.ai_safety_events (user_id);
create index if not exists ai_safety_events_created_at_severity_idx
  on public.ai_safety_events (created_at desc, severity);

alter table public.ai_safety_events enable row level security;

-- No policies created for any role, on purpose — see table comment above.
-- Defense in depth on top of RLS, matching public.admin_roles (0019)
-- exactly: explicitly revoke the table-level grants Supabase applies by
-- default to anon/authenticated, so two independent layers must both fail
-- for this table to ever be misread or miswritten directly.
revoke all on public.ai_safety_events from anon, authenticated;

comment on table public.ai_safety_events is
  'Safety/audit metadata only — never raw conversation content. No '
  'client-facing RLS policies exist for any role, matching '
  'public.admin_roles'' zero-policy design. The only write path is '
  'public.ai_log_safety_event(); the only future read path is an '
  'admin-gated RPC (not created in this migration). conversation_id is ON '
  'DELETE SET NULL so this audit trail survives conversation deletion.';

-- =========================================================================
-- 7. ai_log_safety_event()
-- =========================================================================
--
-- The one write path into ai_safety_events. Takes no user_id parameter —
-- derives it from auth.uid() exactly like public.is_admin() derives the
-- caller's own identity — so a caller can only ever log an event
-- attributed to themselves, never to another user. If a conversation_id is
-- supplied, ownership is verified explicitly inside the function (the
-- function bypasses RLS as SECURITY DEFINER, so this check substitutes for
-- the RLS check that would otherwise apply); a non-owned or nonexistent
-- conversation_id is rejected rather than silently accepted.
--
-- This function contains no business logic about WHEN a safety event
-- should be logged — that decision belongs to the safety pipeline, which
-- is not implemented in this phase. This is purely the secure, minimal
-- insert path the pipeline will call once it exists.

create or replace function public.ai_log_safety_event(
  p_conversation_id uuid,
  p_severity text,
  p_event_type text,
  p_action text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  if p_conversation_id is not null then
    if not exists (
      select 1 from public.ai_conversations
      where id = p_conversation_id and user_id = auth.uid()
    ) then
      raise exception 'conversation not found or not owned by caller' using errcode = '42501';
    end if;
  end if;

  insert into public.ai_safety_events (user_id, conversation_id, severity, event_type, action)
  values (auth.uid(), p_conversation_id, p_severity, p_event_type, p_action)
  returning id into v_event_id;

  return v_event_id;
end;
$$;

revoke all on function public.ai_log_safety_event(uuid, text, text, text) from public;
revoke execute on function public.ai_log_safety_event(uuid, text, text, text) from anon;
grant execute on function public.ai_log_safety_event(uuid, text, text, text) to authenticated;

comment on function public.ai_log_safety_event(uuid, text, text, text) is
  'The only write path into public.ai_safety_events. Derives user_id from '
  'auth.uid() — cannot log an event attributed to another user. Verifies '
  'ownership of p_conversation_id when supplied, bypassing RLS internally '
  'as SECURITY DEFINER so the check must be explicit. EXECUTE is '
  'restricted to authenticated only (anon explicitly revoked by name, '
  'matching the pattern established in 0021_admin_rpc_execute_hardening.sql '
  'after live verification found this project''s default privileges grant '
  'EXECUTE directly to anon on new functions).';

-- =========================================================================
-- Documentation only — NOT created in this migration
-- =========================================================================
--
-- Planned narrow admin RPCs for a future Admin AI Monitoring phase
-- (mirrors the existing admin_feedback_kpis()/admin_list_feedback() shape
-- from 0027 — is_admin() checked first, SECURITY DEFINER, pinned
-- search_path, EXECUTE revoked from anon by name, granted only to
-- authenticated, aggregate-only, no raw conversation content exposed):
--
--   admin_ai_usage_metrics()    — total sessions, active users, success
--                                  rate, latency, error rate (aggregate)
--   admin_ai_feedback_metrics() — feedback counts by rating/reason,
--                                  mirroring admin_feedback_kpis()
--   admin_ai_safety_metrics()   — safety event counts by severity/
--                                  event_type from ai_safety_events,
--                                  category counts only, never per-user
--                                  drill-down into raw events
--
-- None of these are created here. No broad "admin can SELECT all
-- ai_messages" policy has been created anywhere in this migration, and
-- none should ever be created — admin visibility into AI data must always
-- go through a narrow, aggregate-only RPC like the ones above.
