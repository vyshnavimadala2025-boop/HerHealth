-- SIRILA Visual Insight — Phase 3A.2 bug fix: processing_status value mismatch
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- ORDERING: apply after 0028-0035, fully committed, in that order.
--
-- Confirmed live bug (Phase 3A.2 verification): every call to
-- ai_process_visual_insight_image() failed with:
--   23514 — new row for relation "ai_visual_insight_images" violates
--   check constraint "ai_visual_insight_images_processing_status_check"
--
-- Root cause: 0034's CHECK constraint allows processing_status to be one
-- of ('not_processed', 'processing', 'complete', 'failed') — but 0035's
-- RPC set processing_status = 'completed' (with a trailing "d"), a
-- different string the constraint never allowed. The frontend TypeScript
-- type (VisualInsightImage.processingStatus) already correctly expects
-- 'complete', matching the original 0034 constraint — this RPC's SQL
-- body was the only place using the wrong literal.
--
-- Fix: change the one literal from 'completed' to 'complete'. Nothing
-- else about this function changes — ownership checks, the rate limit,
-- the mock result shape, SECURITY DEFINER, and search_path are all
-- byte-for-byte identical to 0035's version.

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
  select * into v_image
  from public.ai_visual_insight_images
  where id = p_image_id and user_id = auth.uid();

  if not found then
    raise exception 'image not found or not owned by caller' using errcode = '42501';
  end if;

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

  -- Fixed in 0036: 'complete', not 'completed' — matches the CHECK
  -- constraint from 0034 and the frontend's VisualInsightImage type.
  update public.ai_visual_insight_images
  set processing_status = 'complete', processed_at = v_processed_at
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
  'authenticated only. Fixed in 0036: sets processing_status to '
  '''complete'' (matching the 0034 CHECK constraint), not ''completed'' '
  'as 0035 incorrectly did.';
