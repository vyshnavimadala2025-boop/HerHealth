-- HerHealth — Preventive Screening Planner: reuse Preventive Reminders
-- Run this manually in the Supabase SQL Editor for your project.
-- This repo does not run migrations automatically and never uses the service-role key.
--
-- Preventive Screening Planner (Stage 3F) reuses the EXISTING
-- reminder_preferences table and reminderService.ts/ReminderPreferencesForm.tsx
-- entirely as-is — no new reminder table, no new reminder service. The
-- only change needed is widening reminder_preferences' existing
-- activity_type check constraint to also allow 'screening', the same
-- technique already used for wellness_goals_category_check (0015).
--
-- Purely additive: every existing activity_type value (checkins,
-- journaling, cycle_tracking, goals) remains valid, so no existing row or
-- existing Preventive Reminders functionality is affected.
--
-- Safe to run more than once: drop-and-recreate constraint pattern,
-- consistent with every other migration in this project.

alter table public.reminder_preferences drop constraint if exists reminder_preferences_activity_type_check;
alter table public.reminder_preferences add constraint reminder_preferences_activity_type_check
  check (activity_type in ('checkins', 'journaling', 'cycle_tracking', 'goals', 'screening'));
