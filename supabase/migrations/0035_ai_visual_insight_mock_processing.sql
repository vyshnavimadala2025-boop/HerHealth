-- SIRILA Visual Insight — Phase 3A.2: mock processing pipeline ONLY
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Scope: a single new column, a second configurable rate limit, and one
-- new SECURITY DEFINER RPC that returns a FIXED, deterministic mock
-- result. No AI provider is called, no image content is read or
-- interpreted in any way, no emergency/clinical logic exists. Every
-- "processing" this migration enables is the same neutral development
-- response, unconditionally, regardless of what the image actually shows.
--
-- Depends on 0034_ai_visual_insight_foundation.sql. Does not modify 0034
-- or any earlier migration — only adds new, additive DDL.
--
-- =========================================================================
-- 1. ai_visual_insight_images — one new column
-- =========================================================================
--
-- processed_at is the timestamp basis for the processing-specific daily
-- rate limit (section 2) — distinct from created_at (upload time), since
-- upload and "processing" are conceptually different actions with
-- independently configurable limits, per the Phase 3A.2 spec.

alter table public.ai_visual_insight_images add column if not exists processed_at timestamptz;

comment on column public.ai_visual_insight_images.processed_at is
  'Set once by ai_process_visual_insight_image() (0035) when this image''s '
  'single mock processing pass completes. Null until then. Used as the '
  'basis for the visual_insight_daily_processing_limit rate limit.';

-- =========================================================================
-- 2. A second, independently configurable rate limit
-- =========================================================================

insert into public.ai_rate_limit_config (key, value)
values ('visual_insight_daily_processing_limit', 5)
on conflict (key) do nothing;

-- =========================================================================
-- 3. ai_process_visual_insight_image — the mock processing RPC
-- =========================================================================
--
-- Pipeline this function represents (Phase 3A.0/3A.2 architecture):
--   Input → ownership verification → image-eligibility check → rate limit
--   → [PRE-PROCESSING SAFETY STAGE: not implemented, mock passthrough]
--   → [MULTIMODAL PROVIDER: not implemented, fixed mock result]
--   → [INDEPENDENT SAFETY VERIFICATION: not implemented, mock passthrough]
--   → structured response
--
-- Every bracketed stage above is a real, named seam in this function's
-- structure (see the comments inline) but currently does nothing beyond
-- returning the fixed mock payload — there is no clinical rule, no
-- emergency detection, no red-flag logic, and no path by which this
-- function's output could ever claim to have identified anything about
-- the image's actual content. safety_tier is hardcoded to 'routine' —
-- not computed, not inferred, a fixed placeholder value.
--
-- Each image may be processed once; processing_status transitions
-- not_processed -> completed directly (no real async job queue exists,
-- so there is no genuine intermediate "processing" state to persist
-- server-side — the client hook represents queued/validating/processing
-- as UI-only states around this one fast, synchronous call, matching how
-- "Stop" already works for text messages in useConversation.ts).
-- Re-processing an already-processed image is allowed (idempotent-ish —
-- it simply re-runs the same fixed mock and updates processed_at), still
-- subject to the same rate limit as any other call.

create or replace function public.ai_process_visual_insight_image(
  p_image_id uuid,
  p_conversation_id uuid default null,
  p_user_description text default null
)
returns table (
  image_id uuid,
  status text,
  visual_observations text[],
  uncertainty text,
  requires_follow_up boolean,
  safety_tier text,
  message text,
  processed_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_image record;
  v_recent_count integer;
  v_daily_limit integer;
  v_processed_at timestamptz;
begin
  -- Ownership verification: the image must exist and belong to the caller.
  -- A missing image and someone else's image are deliberately
  -- indistinguishable to the caller (same exception, same message) so
  -- this can never be used to probe whether a given image id exists.
  select * into v_image
  from public.ai_visual_insight_images
  where id = p_image_id and user_id = auth.uid();

  if not found then
    raise exception 'image not found or not owned by caller' using errcode = '42501';
  end if;

  -- Image-processing eligibility: must be a completed upload. (upload_status
  -- can only ever be 'complete' under the current 3A.1 upload flow, but this
  -- check is here for the 'pending'/'failed' states 0034 reserved for a
  -- future upload flow, so this function stays correct if that changes.)
  if v_image.upload_status <> 'complete' then
    raise exception 'image upload is not complete' using errcode = '42501', hint = 'invalid_image';
  end if;

  if p_conversation_id is not null then
    if not exists (
      select 1 from public.ai_conversations c
      where c.id = p_conversation_id and c.user_id = auth.uid()
    ) then
      raise exception 'conversation not found or not owned by caller' using errcode = '42501';
    end if;
  end if;

  select coalesce(
    (select rc.value from public.ai_rate_limit_config rc where rc.key = 'visual_insight_daily_processing_limit'),
    5
  ) into v_daily_limit;

  select count(*) into v_recent_count
  from public.ai_visual_insight_images i
  where i.user_id = auth.uid() and i.processed_at is not null and i.processed_at > now() - interval '24 hours';

  if v_recent_count >= v_daily_limit then
    raise exception 'SIRILA Visual Insight daily processing limit reached, please try again tomorrow'
      using errcode = 'P0001', hint = 'rate_limit';
  end if;

  -- [PRE-PROCESSING SAFETY STAGE] — mock passthrough, no real check exists yet.
  -- [MULTIMODAL PROVIDER] — mock: fixed result, image content is never read.
  -- [INDEPENDENT SAFETY VERIFICATION] — mock passthrough, no real check exists yet.

  v_processed_at := now();

  update public.ai_visual_insight_images
  set processing_status = 'completed', processed_at = v_processed_at
  where id = p_image_id;

  return query
  select
    p_image_id,
    'mock'::text,
    array[]::text[],
    'high'::text,
    true,
    'routine'::text,
    'Visual analysis is not enabled in this development build.'::text,
    v_processed_at;
end;
$$;

revoke all on function public.ai_process_visual_insight_image(uuid, uuid, text) from public;
revoke execute on function public.ai_process_visual_insight_image(uuid, uuid, text) from anon;
grant execute on function public.ai_process_visual_insight_image(uuid, uuid, text) to authenticated;

comment on function public.ai_process_visual_insight_image(uuid, uuid, text) is
  'MOCK ONLY — no AI provider is called and no image content is read. '
  'Verifies image and (when supplied) conversation ownership, enforces '
  'the configurable visual_insight_daily_processing_limit server-side, '
  'then returns a fixed structured mock result. safety_tier is hardcoded '
  '''routine'' — never computed from the image. EXECUTE is restricted to '
  'authenticated only. p_user_description is accepted for future context '
  'assembly (Phase 3A.3+) but is not used, stored, or echoed by this '
  'mock — logging nothing beyond what ai_visual_insight_images already '
  'records.';

-- =========================================================================
-- Documentation only — NOT created in this migration
-- =========================================================================
--
-- Planned future additions, explicitly out of scope for Phase 3A.2:
--   - Any function that reads image bytes and calls a real AI provider
--     (Phase 3A.3, requires a selected provider and real Edge Function
--     deployment)
--   - Real pre-processing image moderation (Phase 3A.3/3A.4)
--   - Real independent post-generation safety verification, including any
--     dual-call cross-check (Phase 3A.4 — the product decision from the
--     Phase 3A.0 spec to use dual-call verification at launch)
--   - Any emergency-tier detection or wording specific to images
--   - Admin aggregate RPCs for processing metrics (Phase 3A.8)
-- None of these are created here. No broad admin-read policy has been
-- created anywhere in this migration.
