import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Structural / source-scan tests for this migration — same constraint as
 * every other migration test in this project (no local Postgres
 * available, so the SQL body cannot be executed here). What's verified:
 * RLS is enabled and user-scoped on both tables, and — the property that
 * matters most for this specific feature — neither table's column list
 * contains anything that could hold free text/message content.
 */

const source = readFileSync(new URL('./0041_interaction_intelligence.sql', import.meta.url), 'utf-8')

const FORBIDDEN_COLUMN_PATTERNS = [/\btyped_?text\b/i, /\bmessage\b/i, /\bcontent\b/i, /\bkeystrokes?\b/i, /\bpassword\b/i]

const sessionTable = source.slice(
  source.indexOf('create table if not exists public.interaction_session_summary'),
  source.indexOf('alter table public.interaction_session_summary'),
)
const baselineTable = source.slice(
  source.indexOf('create table if not exists public.interaction_baseline'),
  source.indexOf('alter table public.interaction_baseline'),
)

describe('0041_interaction_intelligence.sql — data firewall', () => {
  it('never declares a column that could hold typed content, a message, or a password', () => {
    // Scoped to the actual `create table (...)` column lists, not the
    // whole file — this migration's own explanatory comments legitimately
    // discuss "message content" in prose while explaining why no such
    // column exists; scanning comments would false-positive on that.
    for (const pattern of FORBIDDEN_COLUMN_PATTERNS) {
      expect(sessionTable).not.toMatch(pattern)
      expect(baselineTable).not.toMatch(pattern)
    }
  })

  it('every declared column in both tables is numeric, timestamp, uuid, or a constrained status/id string', () => {
    // No `text` type appears anywhere except baseline_status, which is
    // immediately constrained to an enum in the same statement.
    const textOccurrencesInSession = (sessionTable.match(/\btext\b/g) ?? []).length
    expect(textOccurrencesInSession).toBe(0)

    const textOccurrencesInBaseline = (baselineTable.match(/\btext\b/g) ?? []).length
    expect(textOccurrencesInBaseline).toBe(1)
    expect(baselineTable).toMatch(/baseline_status text not null default 'building'/)
  })
})

describe('0041_interaction_intelligence.sql — row level security', () => {
  it('enables RLS on both tables', () => {
    expect(source).toMatch(/alter table public\.interaction_session_summary enable row level security/)
    expect(source).toMatch(/alter table public\.interaction_baseline enable row level security/)
  })

  it('every policy on both tables scopes to auth.uid() = user_id', () => {
    const policyBlocks = source.match(/create policy[\s\S]*?(?=create policy|drop trigger|$)/g) ?? []
    expect(policyBlocks.length).toBeGreaterThan(0)
    for (const block of policyBlocks) {
      expect(block).toMatch(/auth\.uid\(\) = user_id/)
    }
  })

  it('interaction_session_summary has no update or delete policy (append-only log)', () => {
    const sessionPolicies = source.slice(
      source.indexOf('create policy "Users can read own interaction session summaries"'),
      source.indexOf('create table if not exists public.interaction_baseline'),
    )
    expect(sessionPolicies).not.toMatch(/for update/)
    expect(sessionPolicies).not.toMatch(/for delete/)
  })

  it('interaction_baseline allows delete (feature must be fully disableable)', () => {
    const baselinePolicies = source.slice(source.indexOf('create table if not exists public.interaction_baseline'))
    expect(baselinePolicies).toMatch(/for delete/)
  })
})

describe('0041_interaction_intelligence.sql — reuses existing infrastructure', () => {
  it('reuses the existing set_profiles_updated_at trigger function rather than defining a new one', () => {
    expect(source).toMatch(/execute function public\.set_profiles_updated_at\(\)/)
    expect(source).not.toMatch(/create (or replace )?function/)
  })

  it('every user_id column references auth.users with cascade delete, matching the rest of the schema', () => {
    const matches = source.match(/user_id uuid (not null )?(primary key )?references auth\.users \(id\) on delete cascade/g) ?? []
    expect(matches.length).toBe(2)
  })
})
