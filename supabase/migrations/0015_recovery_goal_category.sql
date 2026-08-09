-- HerHealth — Recovery Planner: reuse Wellness Goals via a new category
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Recovery Planner (Stage 3E) is built entirely as a focused view over the
-- EXISTING wellness_goals/goal_progress_entries tables and goalService.ts —
-- no new table, no new service, no duplicate goal system. The only schema
-- change needed is widening wellness_goals' existing category check
-- constraint to also allow 'recovery', exactly the same technique already
-- used for every other controlled-vocabulary column in this project.
--
-- Purely additive: every existing category value (checkins, journaling,
-- cycle_tracking, custom) remains valid, so no existing row or existing
-- Wellness Goals functionality is affected. goal_progress_entries is
-- unchanged — 'recovery' goals log progress through the exact same table
-- 'custom' goals already use.
--
-- Safe to run more than once: drop-and-recreate constraint pattern,
-- consistent with every other migration in this project.

alter table public.wellness_goals drop constraint if exists wellness_goals_category_check;
alter table public.wellness_goals add constraint wellness_goals_category_check
  check (category in ('checkins', 'journaling', 'cycle_tracking', 'custom', 'recovery'));
