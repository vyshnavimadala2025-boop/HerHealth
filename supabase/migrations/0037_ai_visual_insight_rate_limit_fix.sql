-- SIRILA Visual Insight — Phase 3A.2 bug fix: processing rate limit bypass
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- ORDERING: apply after 0028-0036, fully committed, in that order.
--
-- Confirmed live bug (Phase 3A.2 verification): the processing rate limit
-- (visual_insight_daily_processing_limit, default 5) counts ROWS in
-- ai_visual_insight_images where processed_at is set within the last 24
-- hours. But 0035/0036's RPC allowed reprocessing an already-processed
-- image, and reprocessing UPDATEs the same row's processed_at rather than
-- creating a new one — so calling the RPC on the SAME image 6 times in a
-- row live-tested as 6 successes, not 5 successes + 1 denial, because the
-- row-count-based check only ever saw 1 row (itself) the entire time,
-- regardless of how many times it was reprocessed. Confirmed directly:
-- after 6 successful calls against one image, exactly 1 row existed with
-- processed_at set for that user.
--
-- Fix: disallow reprocessing an already-processed image outright — once
-- ai_visual_insight_images.processed_at is set, a further call for that
-- same image_id is rejected with a distinct error, before the rate-limit
-- check even runs. This makes the row-count-based limit correct again
-- (each image can only ever contribute 1 successful processing event,
-- permanently), and costs nothing functionally: this is still a MOCK
-- phase where the result never varies, so "reprocessing" never had any
-- value in the first place, and no UI in this codebase exposes a
-- re-analyze action (confirmed by inspection of VisualInsightPage.tsx —
-- there is only ever one "Analyze (mock)" action per uploaded image,
-- shown once, before any result exists).
--
-- If genuine re-analysis becomes a real feature later (e.g. a real
-- provider whose result could meaningfully change), the correct design
-- at that point is a dedicated processing-events log table counted
-- independently of the image row itself — not attempted here, since
-- nothing today needs it and inventing it now would be speculative,
-- unused schema.

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

  -- Fixed in 0037: an already-processed image cannot be reprocessed. This
  -- is what makes the rate-limit count below trustworthy — see header.
  if v_image.processed_at is not null then
    raise exception 'this image has already been processed' using errcode = '42501', hint = 'already_processed';
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
  'Verifies image and (when supplied) conversation ownership, rejects '
  'reprocessing an already-processed image (0037 — this is what keeps '
  'the daily rate limit accurate), enforces '
  'visual_insight_daily_processing_limit server-side, then returns a '
  'fixed structured mock result. safety_tier is hardcoded ''routine'' — '
  'never computed from the image. EXECUTE is restricted to authenticated '
  'only.';
