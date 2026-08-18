import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Structural / source-scan tests for the migration itself. This project
 * has no local Postgres available to the test environment (established
 * limitation throughout the whole project — see this file's sibling
 * service test for the full explanation), so the SQL body cannot be
 * executed here. What CAN be verified without a database is that the
 * text of the migration matches the security pattern every other admin
 * RPC in this codebase already uses successfully (admin_feedback_kpis,
 * admin_overview_metrics, admin_list_feedback, etc.) — is_admin() checked
 * first, fail-closed, EXECUTE locked down, and no forbidden column ever
 * appears in the SELECT list.
 */

const source = readFileSync(new URL('./0038_admin_ai_safety_metrics.sql', import.meta.url), 'utf-8')

describe('0038_admin_ai_safety_metrics.sql — fail-closed authorization', () => {
  it('checks public.is_admin() and raises before returning any data', () => {
    const functionBody = source.slice(source.indexOf('create or replace function public.admin_ai_safety_metrics'))
    const checkIndex = functionBody.indexOf('if not public.is_admin() then')
    const raiseIndex = functionBody.indexOf('raise exception')
    const returnQueryIndex = functionBody.indexOf('return query')

    expect(checkIndex).toBeGreaterThan(-1)
    expect(raiseIndex).toBeGreaterThan(-1)
    expect(returnQueryIndex).toBeGreaterThan(-1)
    // The admin check and its raise must appear BEFORE the query that
    // actually reads ai_safety_events — proves the function fails closed
    // rather than reading data first and filtering after.
    expect(checkIndex).toBeLessThan(returnQueryIndex)
    expect(raiseIndex).toBeLessThan(returnQueryIndex)
  })

  it('raises the same 42501 errcode used by every other admin RPC in this codebase', () => {
    expect(source).toMatch(/raise exception 'admin access required' using errcode = '42501'/)
  })

  it('is security definer with a pinned search_path, matching every other admin RPC', () => {
    expect(source).toMatch(/security definer/)
    expect(source).toMatch(/set search_path = public/)
  })

  it('EXECUTE is revoked from anon and public, granted only to authenticated', () => {
    expect(source).toMatch(/revoke all on function public\.admin_ai_safety_metrics\(\) from public/)
    expect(source).toMatch(/revoke execute on function public\.admin_ai_safety_metrics\(\) from anon/)
    expect(source).toMatch(/grant execute on function public\.admin_ai_safety_metrics\(\) to authenticated/)
  })
})

describe('0038_admin_ai_safety_metrics.sql — no sensitive content ever selected', () => {
  const functionBody = source.slice(
    source.indexOf('create or replace function public.admin_ai_safety_metrics'),
    source.indexOf('revoke all on function public.admin_ai_safety_metrics'),
  )
  const selectListSection = functionBody.slice(functionBody.indexOf('return query'), functionBody.indexOf('from public.ai_safety_events'))

  it('never selects individual event id, user_id, or conversation_id', () => {
    // Every column pulled out of ai_safety_events in the SELECT list must be
    // wrapped in count(...) — a bare column reference (id, user_id,
    // conversation_id) appearing outside of a count()/filter() expression
    // would mean an individual row value leaking through.
    expect(selectListSection).not.toMatch(/select\s+id\b/i)
    expect(selectListSection).not.toMatch(/,\s*id\s*,/i)
    expect(selectListSection).not.toMatch(/\buser_id\b/)
    expect(selectListSection).not.toMatch(/\bconversation_id\b/)
  })

  it('only ever aggregates via count(...) — no raw column projection from ai_safety_events', () => {
    // event_type is deliberately excluded too: it's a coarse category, but
    // this RPC's contract (types.ts) doesn't expose it — this test locks
    // that in so a future edit can't silently widen the surface.
    expect(selectListSection).not.toMatch(/\bevent_type\b/)
    expect(selectListSection).not.toMatch(/\bcreated_at\s*,/) // raw created_at column, not wrapped in a filter
  })

  it('never references content, message, or image-shaped column names anywhere in the function', () => {
    expect(functionBody).not.toMatch(/\b(content|message_text|image_url|image_data)\b/i)
  })
})

describe('0038_admin_ai_safety_metrics.sql — RLS untouched', () => {
  it('does not create, alter, drop, or disable any policy on ai_safety_events', () => {
    expect(source).not.toMatch(/create policy/i)
    expect(source).not.toMatch(/drop policy/i)
    expect(source).not.toMatch(/disable row level security/i)
    expect(source).not.toMatch(/force row level security/i)
  })

  it('does not create or alter any table', () => {
    expect(source).not.toMatch(/create table/i)
    expect(source).not.toMatch(/alter table/i)
  })

  it('does not touch ai_send_message or ai_classify_safety_tier', () => {
    expect(source).not.toMatch(/create or replace function public\.ai_send_message/)
    expect(source).not.toMatch(/create or replace function public\.ai_classify_safety_tier/)
  })
})

describe('0038_admin_ai_safety_metrics.sql — no routine count fabricated', () => {
  it('does not declare a routine_count field in the function signature, since ai_safety_events cannot contain routine rows', () => {
    const signature = source.slice(
      source.indexOf('returns table ('),
      source.indexOf('language plpgsql'),
    )
    // Field-declaration syntax only (name followed by a type) — the
    // migration's own header/comment prose discusses "routine_count" by
    // name to explain why it's absent, which must not trip this check;
    // an actual declared column would match `routine_count  bigint,`.
    expect(signature).not.toMatch(/routine_count\s+bigint/)
  })

  it('does not query public.ai_messages as a workaround', () => {
    expect(source).not.toMatch(/from public\.ai_messages/)
  })
})
