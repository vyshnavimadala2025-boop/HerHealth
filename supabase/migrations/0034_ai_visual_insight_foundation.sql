-- SIRILA Visual Insight — Phase 3A.1: secure image infrastructure ONLY
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Scope: storage + metadata + ownership + a configurable rate limit. NO AI
-- processing of any kind happens anywhere in this migration — there is no
-- model call, no image analysis, no emergency detection. Every row this
-- migration lets a user create just describes "a private image this user
-- uploaded," nothing more. Real Visual Insight AI processing is explicitly
-- out of scope for Phase 3A.1 (see the Phase 3A.0 specification).
--
-- Depends on 0028_ai_intelligence_foundation.sql (ai_conversations).
-- Does not modify 0028-0033 or any other existing table.
--
-- =========================================================================
-- 1. ai_rate_limit_config — a small, generic, admin-only configuration table
-- =========================================================================
--
-- Exists so the Visual Insight daily image limit (and any future similar
-- limit) can be changed with a single UPDATE statement in the SQL Editor,
-- not a new migration each time a business decision changes the number.
-- Zero client-facing RLS policies — mirrors public.admin_roles' (0019)
-- design exactly: readable only from inside a SECURITY DEFINER function,
-- changed only via direct SQL Editor access.

create table if not exists public.ai_rate_limit_config (
  key text primary key,
  value integer not null,
  updated_at timestamptz not null default now()
);

alter table public.ai_rate_limit_config enable row level security;

-- No policies created for any role, on purpose — see comment above.
revoke all on public.ai_rate_limit_config from anon, authenticated;

insert into public.ai_rate_limit_config (key, value)
values ('visual_insight_daily_image_limit', 5)
on conflict (key) do nothing;

comment on table public.ai_rate_limit_config is
  'Small admin-only config table (no client-facing RLS policies, mirrors '
  'admin_roles'' zero-policy design). Change a limit with: '
  'update public.ai_rate_limit_config set value = <n> where key = '
  '''visual_insight_daily_image_limit''; — no migration required.';

-- =========================================================================
-- 2. ai_visual_insight_images — image metadata (never the binary itself)
-- =========================================================================
--
-- The actual image bytes live in Supabase Storage (private bucket, section
-- 4 below), never in Postgres. This table is metadata + ownership only.
--
-- conversation_id and message_id are both nullable: Phase 3A.1 only builds
-- upload infrastructure, not conversation integration (that's 3A.5) — an
-- image can exist attached to nothing yet. When 3A.5 wires this into the
-- real conversation flow, it will set these on an existing row via a
-- future ownership-checked function, not a direct client UPDATE (no
-- UPDATE policy is created on this table at all, on purpose).
--
-- No deleted_at / soft-delete column: every other table in this schema
-- (ai_conversations, ai_messages, ai_memory, ai_symptom_journal_entries)
-- uses real, permanent DELETE, matching the Privacy Page's existing
-- "deletion is permanent and cannot be undone" commitment. Introducing
-- soft-delete here would be inconsistent with that commitment and with
-- every other table's convention — deliberately not done.
--
-- upload_status exists for forward compatibility (a future flow where a
-- row is reserved before the upload completes) but Phase 3A.1's own flow
-- only ever inserts a row after Storage confirms the object exists, so
-- every row created by this phase has upload_status = 'complete' from the
-- moment it exists.
--
-- processing_status will remain 'not_processed' for the entire duration of
-- Phase 3A.1 — no code path in this phase ever sets it to anything else.
-- It exists now so later phases (3A.3+) don't need a schema change to add
-- it under real usage.

create table if not exists public.ai_visual_insight_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid references public.ai_conversations (id) on delete cascade,
  message_id uuid references public.ai_messages (id) on delete set null,
  storage_path text not null,
  original_filename text,
  mime_type text not null,
  size_bytes integer not null,
  width_px integer,
  height_px integer,
  upload_status text not null default 'complete',
  processing_status text not null default 'not_processed',
  created_at timestamptz not null default now()
);

alter table public.ai_visual_insight_images drop constraint if exists ai_visual_insight_images_mime_type_check;
alter table public.ai_visual_insight_images add constraint ai_visual_insight_images_mime_type_check
  check (mime_type in ('image/jpeg', 'image/png', 'image/webp'));

alter table public.ai_visual_insight_images drop constraint if exists ai_visual_insight_images_size_check;
alter table public.ai_visual_insight_images add constraint ai_visual_insight_images_size_check
  check (size_bytes > 0 and size_bytes <= 10485760); -- 10 MB, matches the storage bucket's own limit (section 4)

alter table public.ai_visual_insight_images drop constraint if exists ai_visual_insight_images_dimensions_check;
alter table public.ai_visual_insight_images add constraint ai_visual_insight_images_dimensions_check
  check (
    (width_px is null and height_px is null)
    or (width_px > 0 and width_px <= 8000 and height_px > 0 and height_px <= 8000)
  );

alter table public.ai_visual_insight_images drop constraint if exists ai_visual_insight_images_filename_length_check;
alter table public.ai_visual_insight_images add constraint ai_visual_insight_images_filename_length_check
  check (original_filename is null or char_length(original_filename) <= 255);

alter table public.ai_visual_insight_images drop constraint if exists ai_visual_insight_images_upload_status_check;
alter table public.ai_visual_insight_images add constraint ai_visual_insight_images_upload_status_check
  check (upload_status in ('pending', 'complete', 'failed'));

alter table public.ai_visual_insight_images drop constraint if exists ai_visual_insight_images_processing_status_check;
alter table public.ai_visual_insight_images add constraint ai_visual_insight_images_processing_status_check
  check (processing_status in ('not_processed', 'processing', 'complete', 'failed'));

alter table public.ai_visual_insight_images drop constraint if exists ai_visual_insight_images_storage_path_check;
alter table public.ai_visual_insight_images add constraint ai_visual_insight_images_storage_path_check
  check (char_length(storage_path) > 0 and char_length(storage_path) <= 500);

create index if not exists ai_visual_insight_images_user_id_created_at_idx
  on public.ai_visual_insight_images (user_id, created_at desc);

create index if not exists ai_visual_insight_images_conversation_id_idx
  on public.ai_visual_insight_images (conversation_id);

alter table public.ai_visual_insight_images enable row level security;

drop policy if exists "Users can read own visual insight images" on public.ai_visual_insight_images;
create policy "Users can read own visual insight images"
  on public.ai_visual_insight_images for select
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own visual insight images" on public.ai_visual_insight_images;
create policy "Users can delete own visual insight images"
  on public.ai_visual_insight_images for delete
  using (auth.uid() = user_id);

-- No INSERT policy and no UPDATE policy, on purpose — matching the
-- hardened pattern this project settled on after the Phase 2 ownership
-- findings (0030/0031): the only way a row is ever created is
-- ai_register_visual_insight_image() below, which verifies conversation
-- ownership (when a conversation_id is supplied) and enforces the rate
-- limit before inserting. There is no direct client-facing write path.

comment on table public.ai_visual_insight_images is
  'Metadata for a private, user-owned image uploaded for SIRILA Visual '
  'Insight. Never the image binary itself (that lives in the private '
  'ai-visual-insight-images Storage bucket). Self-scoped SELECT/DELETE. '
  'No client-facing INSERT/UPDATE policy — the only write path is '
  'ai_register_visual_insight_image(). processing_status stays '
  '''not_processed'' for the entirety of Phase 3A.1 — no AI processing '
  'exists yet.';

-- =========================================================================
-- 3. ai_register_visual_insight_image — the only write path
-- =========================================================================
--
-- Called AFTER the client has already uploaded the object to Storage
-- (Storage's own RLS, section 4, is what actually protects the upload
-- itself — a SECURITY DEFINER function can't reasonably accept binary
-- data). This function's job is the parts a client can never be trusted
-- to self-report: that the storage_path genuinely belongs to the caller,
-- that a supplied conversation_id genuinely belongs to the caller, and
-- that the caller hasn't exceeded the configurable daily rate limit.
--
-- user_id is always auth.uid() — never a parameter.

create or replace function public.ai_register_visual_insight_image(
  p_id uuid,
  p_storage_path text,
  p_mime_type text,
  p_size_bytes integer,
  p_conversation_id uuid default null,
  p_original_filename text default null,
  p_width_px integer default null,
  p_height_px integer default null
)
returns table (
  id uuid,
  storage_path text,
  mime_type text,
  size_bytes integer,
  width_px integer,
  height_px integer,
  upload_status text,
  processing_status text,
  created_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_recent_count integer;
  v_daily_limit integer;
begin
  -- The storage path must genuinely be this caller's own path. Storage RLS
  -- (section 4) already prevents uploading to another user's path, but
  -- this is defense in depth against a client that supplies a path it
  -- never actually uploaded to.
  if left(p_storage_path, char_length(auth.uid()::text) + 1) <> auth.uid()::text || '/' then
    raise exception 'storage path does not belong to caller' using errcode = '42501';
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
    (select rc.value from public.ai_rate_limit_config rc where rc.key = 'visual_insight_daily_image_limit'),
    5
  ) into v_daily_limit;

  select count(*) into v_recent_count
  from public.ai_visual_insight_images i
  where i.user_id = auth.uid() and i.created_at > now() - interval '24 hours';

  if v_recent_count >= v_daily_limit then
    raise exception 'SIRILA Visual Insight daily image limit reached, please try again tomorrow'
      using errcode = 'P0001', hint = 'rate_limit';
  end if;

  return query
  insert into public.ai_visual_insight_images as img (
    id, user_id, conversation_id, storage_path, original_filename,
    mime_type, size_bytes, width_px, height_px
  )
  values (
    p_id, auth.uid(), p_conversation_id, p_storage_path, p_original_filename,
    p_mime_type, p_size_bytes, p_width_px, p_height_px
  )
  returning img.id, img.storage_path, img.mime_type, img.size_bytes,
            img.width_px, img.height_px, img.upload_status, img.processing_status, img.created_at;
end;
$$;

revoke all on function public.ai_register_visual_insight_image(uuid, text, text, integer, uuid, text, integer, integer) from public;
revoke execute on function public.ai_register_visual_insight_image(uuid, text, text, integer, uuid, text, integer, integer) from anon;
grant execute on function public.ai_register_visual_insight_image(uuid, text, text, integer, uuid, text, integer, integer) to authenticated;

comment on function public.ai_register_visual_insight_image(uuid, text, text, integer, uuid, text, integer, integer) is
  'The only write path into ai_visual_insight_images. Verifies the '
  'storage_path belongs to the caller and (when supplied) that '
  'conversation_id does too, and enforces the configurable daily rate '
  'limit from ai_rate_limit_config server-side — a modified client cannot '
  'bypass either check. user_id is always auth.uid(). EXECUTE is '
  'restricted to authenticated only. Performs no AI processing of any '
  'kind.';

-- =========================================================================
-- 4. Private Storage bucket + path-scoped RLS
-- =========================================================================
--
-- file_size_limit and allowed_mime_types are enforced by Storage itself —
-- a second, independent validation layer beyond both the client and the
-- table's own CHECK constraints, so client-supplied MIME types are never
-- trusted alone anywhere in this pipeline.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-visual-insight-images',
  'ai-visual-insight-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: {user_id}/{image_id}.{ext} — ownership is structurally
-- encoded in the path, matching every other private-data convention in
-- this schema. storage.foldername(name) splits the object path into
-- folder segments; segment 1 must equal the caller's own auth.uid().

drop policy if exists "Users can upload own visual insight images" on storage.objects;
create policy "Users can upload own visual insight images"
  on storage.objects for insert
  with check (
    bucket_id = 'ai-visual-insight-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can read own visual insight images" on storage.objects;
create policy "Users can read own visual insight images"
  on storage.objects for select
  using (
    bucket_id = 'ai-visual-insight-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own visual insight images" on storage.objects;
create policy "Users can delete own visual insight images"
  on storage.objects for delete
  using (
    bucket_id = 'ai-visual-insight-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- No UPDATE policy on storage.objects for this bucket — an image is
-- replaced by deleting and re-uploading, never edited in place.

-- =========================================================================
-- Documentation only — NOT created in this migration
-- =========================================================================
--
-- Planned future additions, explicitly out of scope for Phase 3A.1:
--   - Any function that reads image bytes and calls an AI provider
--     (Phase 3A.3+, requires a selected provider and a real Edge Function
--     boundary, per the Phase 3A.0 specification)
--   - Any UPDATE path for processing_status (would arrive with the above)
--   - Admin aggregate RPCs for Visual Insight metrics (Phase 3A.8)
-- None of these are created here. No broad admin-read policy has been
-- created anywhere in this migration, and none should ever be created for
-- this table — admin visibility must always go through a narrow,
-- aggregate-only RPC, exactly like every other admin surface in this
-- project.
