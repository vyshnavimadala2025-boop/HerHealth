-- HerHealth — Admin Phase 3E: Feedback & Support Management
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Purpose: the first Admin phase to introduce a genuinely new table and
-- the first to introduce an admin WRITE path (every prior admin RPC —
-- 0020/0022/0023/0024/0025/0026 — was read-only). No mechanism for
-- collecting user feedback existed anywhere before this migration (the
-- previous "Feedback" entry in src/components/layout/supportCatalog.ts
-- was a mailto: link, by its own code comment, only because "this project
-- has no backend for a contact form" — this migration is what changes
-- that).
--
-- Architecture:
--   1. public.feedback_submissions — a normal user-data table following
--      the exact same RLS convention as every other table in this schema
--      (auth.uid() = user_id, self-scoped insert/select). Users can create
--      and read their own feedback; they can NEVER update or delete it —
--      no UPDATE/DELETE policy exists at all, the same "no policy = no
--      access" pattern already established for goal_progress_entries
--      (0007) — so status/priority/category/admin_notes can only ever
--      change through the admin RPC below, never directly by the user.
--   2. Four admin-gated RPCs, following the exact same hardened pattern as
--      every prior admin RPC (is_admin() checked first, SECURITY DEFINER,
--      pinned search_path, EXECUTE revoked from anon by name, granted only
--      to authenticated): a KPI summary, a paginated/filterable/
--      searchable list, a single-record detail lookup (with submitter
--      email/name — admin operational identity, never health data), and
--      the one mutation RPC, which only ever writes to
--      status/priority/category/admin_notes — it structurally cannot
--      touch user_id, type, description, or created_at, since those
--      columns never appear in its UPDATE statement.
--
-- No broad admin SELECT policy is created on this table. Admin reads go
-- exclusively through the RPCs below (SECURITY DEFINER, bypassing RLS as
-- the table owner) — identical in spirit to every prior admin data path
-- in this project.
--
-- Depends on 0019_admin_roles.sql (public.is_admin()).

-- 1. feedback_submissions ------------------------------------------------

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  description text not null,
  category text,
  status text not null default 'new',
  priority text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feedback_submissions
  add constraint feedback_submissions_type_check
  check (type in ('bug', 'feature_request', 'general_feedback', 'usability'));

alter table public.feedback_submissions
  add constraint feedback_submissions_description_check
  check (char_length(btrim(description)) > 0 and char_length(description) <= 2000);

alter table public.feedback_submissions
  add constraint feedback_submissions_category_check
  check (
    category is null or category in (
      'dashboard', 'cycle_tracker', 'baby_growth', 'sleep_intelligence',
      'nutrition_companion', 'stress_recovery', 'goals', 'wellness_score',
      'insights', 'reports', 'lifestyle_intelligence', 'preventive_screening',
      'knowledge_hub', 'authentication', 'onboarding', 'other'
    )
  );

alter table public.feedback_submissions
  add constraint feedback_submissions_status_check
  check (status in ('new', 'open', 'in_progress', 'resolved', 'closed'));

alter table public.feedback_submissions
  add constraint feedback_submissions_priority_check
  check (priority is null or priority in ('low', 'medium', 'high', 'critical'));

alter table public.feedback_submissions
  add constraint feedback_submissions_admin_notes_check
  check (admin_notes is null or char_length(admin_notes) <= 2000);

create index if not exists feedback_submissions_user_id_idx on public.feedback_submissions (user_id);
create index if not exists feedback_submissions_status_idx on public.feedback_submissions (status);
create index if not exists feedback_submissions_created_at_idx on public.feedback_submissions (created_at desc);

alter table public.feedback_submissions enable row level security;

create policy "Users can create own feedback"
  on public.feedback_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can read own feedback"
  on public.feedback_submissions for select
  using (auth.uid() = user_id);

-- Deliberately no UPDATE or DELETE policy: RLS denies both by default with
-- no policy present, for every role including the submitting user. Status,
-- priority, category, and admin_notes can only change via
-- admin_update_feedback() below, which runs as the table owner.

comment on table public.feedback_submissions is
  'User-submitted feedback (bug/feature request/general feedback/usability). '
  'Users can insert and read only their own rows and can never update or '
  'delete them. Admin reads/writes happen exclusively through '
  'admin_list_feedback()/admin_get_feedback_detail()/admin_update_feedback() '
  '— there is no admin-facing RLS policy on this table.';

drop trigger if exists feedback_submissions_set_updated_at on public.feedback_submissions;

create trigger feedback_submissions_set_updated_at
  before update on public.feedback_submissions
  for each row
  execute function public.set_profiles_updated_at();

-- 2. admin_feedback_kpis --------------------------------------------------

create or replace function public.admin_feedback_kpis()
returns table (
  total bigint,
  new_count bigint,
  open_count bigint,
  in_progress_count bigint,
  resolved_count bigint,
  closed_count bigint,
  bugs_count bigint,
  feature_requests_count bigint,
  critical_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    count(*) as total,
    count(*) filter (where status = 'new') as new_count,
    count(*) filter (where status = 'open') as open_count,
    count(*) filter (where status = 'in_progress') as in_progress_count,
    count(*) filter (where status = 'resolved') as resolved_count,
    count(*) filter (where status = 'closed') as closed_count,
    count(*) filter (where type = 'bug') as bugs_count,
    count(*) filter (where type = 'feature_request') as feature_requests_count,
    count(*) filter (where priority = 'critical') as critical_count
  from public.feedback_submissions;
end;
$$;

revoke all on function public.admin_feedback_kpis() from public;
revoke execute on function public.admin_feedback_kpis() from anon;
grant execute on function public.admin_feedback_kpis() to authenticated;

comment on function public.admin_feedback_kpis() is
  'Admin-only aggregate feedback counts for the Feedback page header. '
  'Checks public.is_admin() internally. Counts only.';

-- 3. admin_list_feedback ---------------------------------------------

create or replace function public.admin_list_feedback(
  p_search text default null,
  p_status text default 'all',
  p_type text default 'all',
  p_priority text default 'all',
  p_category text default 'all',
  p_page integer default 1,
  p_page_size integer default 25
)
returns table (
  id uuid,
  type text,
  description text,
  category text,
  status text,
  priority text,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 25), 1), 100);
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    f.id,
    f.type,
    f.description,
    f.category,
    f.status,
    f.priority,
    f.created_at,
    f.updated_at,
    count(*) over() as total_count
  from public.feedback_submissions f
  where
    (v_search is null or f.description ilike '%' || v_search || '%')
    and (p_status is null or p_status = 'all' or f.status = p_status)
    and (p_type is null or p_type = 'all' or f.type = p_type)
    and (p_priority is null or p_priority = 'all' or f.priority = p_priority)
    and (p_category is null or p_category = 'all' or f.category = p_category)
  order by f.created_at desc
  limit v_page_size
  offset (v_page - 1) * v_page_size;
end;
$$;

revoke all on function public.admin_list_feedback(text, text, text, text, text, integer, integer) from public;
revoke execute on function public.admin_list_feedback(text, text, text, text, text, integer, integer) from anon;
grant execute on function public.admin_list_feedback(text, text, text, text, text, integer, integer) to authenticated;

comment on function public.admin_list_feedback(text, text, text, text, text, integer, integer) is
  'Admin-only paginated, searchable, filterable feedback list. Checks '
  'public.is_admin() internally. Deliberately does NOT return user_id or '
  'submitter identity — matches the minimum-information list-item shape '
  'from the Phase 3E spec; identity is available only via '
  'admin_get_feedback_detail() for a specific item.';

-- 4. admin_get_feedback_detail --------------------------------------

create or replace function public.admin_get_feedback_detail(p_feedback_id uuid)
returns table (
  id uuid,
  user_id uuid,
  submitter_email text,
  submitter_name text,
  type text,
  description text,
  category text,
  status text,
  priority text,
  admin_notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    f.id,
    f.user_id,
    p.email as submitter_email,
    p.full_name as submitter_name,
    f.type,
    f.description,
    f.category,
    f.status,
    f.priority,
    f.admin_notes,
    f.created_at,
    f.updated_at
  from public.feedback_submissions f
  join public.profiles p on p.id = f.user_id
  where f.id = p_feedback_id;
end;
$$;

revoke all on function public.admin_get_feedback_detail(uuid) from public;
revoke execute on function public.admin_get_feedback_detail(uuid) from anon;
grant execute on function public.admin_get_feedback_detail(uuid) to authenticated;

comment on function public.admin_get_feedback_detail(uuid) is
  'Admin-only single-feedback detail lookup, including submitter email/name '
  '(account identity, for operational follow-up) and admin_notes (private '
  'to admins). Checks public.is_admin() before ever using p_feedback_id, so '
  'a non-admin cannot use an arbitrary id to bypass authorization. Never '
  'touches any health-content table.';

-- 5. admin_update_feedback -------------------------------------------
--
-- The one write path in the entire admin architecture so far. Full-replace
-- semantics for the four admin-controlled columns (the caller always sends
-- the complete intended state, not a sparse patch) — this avoids any
-- ambiguity between "leave unchanged" and "clear to null" for the nullable
-- columns. p_status is required (the column is NOT NULL); p_priority/
-- p_category/p_admin_notes may be null, meaning "clear this field".
-- Structurally cannot modify user_id, type, description, or created_at —
-- those columns do not appear in the UPDATE statement at all.

create or replace function public.admin_update_feedback(
  p_feedback_id uuid,
  p_status text,
  p_priority text default null,
  p_category text default null,
  p_admin_notes text default null
)
returns table (
  id uuid,
  status text,
  priority text,
  category text,
  admin_notes text,
  updated_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  update public.feedback_submissions f
  set
    status = p_status,
    priority = p_priority,
    category = p_category,
    admin_notes = p_admin_notes
  where f.id = p_feedback_id
  returning f.id, f.status, f.priority, f.category, f.admin_notes, f.updated_at;
end;
$$;

revoke all on function public.admin_update_feedback(uuid, text, text, text, text) from public;
revoke execute on function public.admin_update_feedback(uuid, text, text, text, text) from anon;
grant execute on function public.admin_update_feedback(uuid, text, text, text, text) to authenticated;

comment on function public.admin_update_feedback(uuid, text, text, text, text) is
  'Admin-only feedback mutation — the only write path in the admin '
  'architecture. Checks public.is_admin() before ever using p_feedback_id. '
  'Full-replace semantics for status/priority/category/admin_notes; '
  'structurally cannot modify user_id, type, description, or created_at '
  '(those columns never appear in the UPDATE statement). The table''s own '
  'CHECK constraints validate status/priority/category values.';
