-- SIRILA Intelligence — Phase 2 hardening: close ai_messages direct-insert gap
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- ORDERING: apply after 0028, 0029, and 0030 (fully committed, in that
-- order). This file does not modify any of them — it only drops one
-- policy 0028 created and updates one table comment. No new function is
-- needed: public.ai_send_message() (0029) already verifies conversation
-- ownership and already hardcodes auth.uid() for both the user- and
-- assistant-role rows it inserts, which is exactly the "smallest secure
-- solution consistent with the existing architecture" this closes with.
--
-- Finding closed: 0028's "Users can insert own AI user messages" policy
-- allowed a client to INSERT a role='user' ai_messages row with
-- user_id = auth.uid() (correctly enforced) but ANY conversation_id
-- (not verified to belong to that user) — a client could attach a
-- message to another user's conversation by calling the table directly,
-- bypassing ai_send_message()'s ownership check entirely. Confirmed via
-- grep that no code in this repo ever uses this direct-insert path — the
-- only place src/ writes to ai_messages is through the RPC
-- (conversationService.ts's sendMessage(), which calls ai_send_message()) —
-- so dropping it removes only a latent, app-unreachable database-layer
-- gap, not a legitimate flow. This mirrors 0030's fix for ai_feedback,
-- ai_memory, and ai_symptom_journal_entries exactly.
--
-- After this migration, ai_messages has NO client-facing INSERT policy
-- for either role — 'assistant' already had none (0028), 'user' now has
-- none either. The only way any row is ever created is
-- ai_send_message(), which:
--   1. verifies auth.uid() owns p_conversation_id before inserting anything
--   2. hardcodes auth.uid() as user_id in both INSERT statements — never
--      a parameter, so no value the client sends can become another
--      user's id
--   3. is the one and only Phase 2 message-creation flow — there is no
--      other intended path to create a row in this table
--
-- Does not touch SELECT/UPDATE/DELETE policies, any table schema, index,
-- constraint, or any function body. RLS is not weakened — only narrowed
-- further, identically to 0030.

drop policy if exists "Users can insert own AI user messages" on public.ai_messages;

comment on table public.ai_messages is
  'Turns within an ai_conversations thread. Self-scoped RLS. No '
  'client-facing INSERT policy exists for any role — the only way a row '
  'is ever created is public.ai_send_message() (0029), which verifies '
  'conversation ownership via auth.uid() before inserting and hardcodes '
  'auth.uid() as user_id for both the user- and assistant-role rows it '
  'writes. No update or delete policy either — a message is only ever '
  'removed via cascading delete of its parent conversation.';
