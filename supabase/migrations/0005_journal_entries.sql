-- HerHealth — Phase 8: private wellness journal
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- public.set_profiles_updated_at() (from 0001_profiles.sql, already reused
-- by 0003_daily_checkins.sql and 0004_period_records.sql) was re-verified
-- live immediately before writing this migration: a brand-new test profile
-- was created and updated, and its updated_at timestamp changed
-- accordingly, confirming the function still exists and correctly sets
-- NEW.updated_at = now(). It is reused here rather than duplicated.
--
-- Safe to run more than once: IF NOT EXISTS / IF EXISTS guards throughout,
-- and every alter is drop-then-add, so a second run doesn't error and
-- doesn't touch or delete any existing data.

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text not null,
  entry_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_entries
drop constraint if exists journal_entries_title_check;

alter table public.journal_entries
add constraint journal_entries_title_check
check (
  char_length(btrim(title)) > 0
  and char_length(title) <= 120
);

alter table public.journal_entries
drop constraint if exists journal_entries_content_check;

alter table public.journal_entries
add constraint journal_entries_content_check
check (
  char_length(btrim(content)) > 0
  and char_length(content) <= 5000
);

-- No "entry_date not in the future" check constraint — same reasoning as
-- Phase 6's period dates: Postgres current_date evaluates in the database's
-- own timezone, while "future" is the user's local browser date. Enforcing
-- this server-side risks spuriously rejecting a valid local date for users
-- in positive UTC-offset timezones near midnight. Enforced client-side only.
--
-- No uniqueness constraint on (user_id, entry_date) — a user can have
-- multiple journal entries on the same day.

create index if not exists journal_entries_user_id_entry_date_idx
on public.journal_entries (
  user_id,
  entry_date desc,
  created_at desc
);

alter table public.journal_entries enable row level security;

drop policy if exists
"Users can read own journal entries"
on public.journal_entries;

create policy
"Users can read own journal entries"
on public.journal_entries
for select
using (auth.uid() = user_id);

drop policy if exists
"Users can insert own journal entries"
on public.journal_entries;

create policy
"Users can insert own journal entries"
on public.journal_entries
for insert
with check (auth.uid() = user_id);

drop policy if exists
"Users can update own journal entries"
on public.journal_entries;

create policy
"Users can update own journal entries"
on public.journal_entries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists
"Users can delete own journal entries"
on public.journal_entries;

create policy
"Users can delete own journal entries"
on public.journal_entries
for delete
using (auth.uid() = user_id);

-- No public/true policies exist or are created above — every policy is
-- scoped to auth.uid() = user_id.

drop trigger if exists
journal_entries_set_updated_at
on public.journal_entries;

create trigger
journal_entries_set_updated_at
before update
on public.journal_entries
for each row
execute function public.set_profiles_updated_at();
