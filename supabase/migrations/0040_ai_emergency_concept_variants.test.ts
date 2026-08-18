import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Structural / source-scan tests for the emergency-detection coverage
 * expansion. Same boundary as 0038/0039's sibling test files: no local
 * Postgres is available to this test environment, so the SQL body cannot
 * be executed here. The actual matching-logic behavior (normalization,
 * concept coverage, false-positive/negative characteristics) is instead
 * verified against the client-side mirror in redFlagScreen.test.ts, which
 * implements the identical substring/normalization semantics and CAN run
 * in this test environment. This file verifies the SQL source itself: the
 * normalization step exists, the concept grouping is present and
 * commented, nothing outside the stated scope was touched, and the
 * deliberately-excluded items are in fact absent.
 */

const source = readFileSync(new URL('./0040_ai_emergency_concept_variants.sql', import.meta.url), 'utf-8')
const functionBody = source.slice(
  source.indexOf('create or replace function public.ai_classify_safety_tier'),
  source.indexOf('revoke all on function public.ai_classify_safety_tier'),
)

describe('0040 — normalization is applied before matching', () => {
  it('lowercases, collapses hyphens/underscores to spaces, and collapses repeated whitespace', () => {
    expect(functionBody).toMatch(/regexp_replace\(regexp_replace\(lower\(p_content\), '\[-_\]\+', ' ', 'g'\), '\\s\+', ' ', 'g'\)/)
  })

  it('applies the same normalization to all three tiers (emergency, urgent, sensitive), not just emergency', () => {
    const normalizationCalls = functionBody.match(/regexp_replace\(regexp_replace\(lower\(p_content\)/g) ?? []
    expect(normalizationCalls.length).toBe(3)
  })
})

describe('0040 — concept coverage: all seven existing concepts represented', () => {
  it.each([
    ['Concept 1', 'chest pain', 'heart attack'],
    ['Concept 2', "can''t breathe", 'trouble breathing'],
    ['Concept 3', 'severe bleeding', 'hemorrhaging'],
    ['Concept 4', 'suicidal', 'thinking about suicide'],
    ['Concept 5', 'signs of stroke', 'slurred speech'],
    ['Concept 6', 'severe allergic reaction', 'anaphylaxis'],
    ['Concept 7', 'loss of consciousness', 'blacked out'],
  ])('%s retains its original canonical phrase and has at least one new variant', (_label, canonical, variant) => {
    expect(functionBody).toContain(`'%${canonical}%'`)
    expect(functionBody).toContain(`'%${variant}%'`)
  })

  it('every original 14 emergency phrases from 0029 is still present, unremoved', () => {
    const original14 = [
      'chest pain', "can''t breathe", 'cannot breathe', 'severe bleeding', 'heavy bleeding', 'suicidal',
      'kill myself', 'end my life', 'want to die', 'signs of stroke', 'face drooping',
      'severe allergic reaction', 'loss of consciousness', 'passed out',
    ]
    for (const phrase of original14) {
      expect(functionBody).toContain(`'%${phrase}%'`)
    }
  })
})

describe('0040 — deliberately excluded items are in fact absent', () => {
  it('does not add any new clinical category (poisoning/overdose, serious injury, pregnancy-specific)', () => {
    expect(functionBody).not.toMatch(/overdose|poison|fracture|broken (leg|arm|bone)|miscarriage|fetal/i)
  })

  it('does not add the excluded ambiguous suicidal-ideation phrase', () => {
    expect(functionBody).not.toContain("don't want to be here anymore")
    expect(functionBody).not.toContain('dont want to be here anymore')
  })

  it('does not add any bare single generic word as its own pattern (e.g. lone "heart" or "chest")', () => {
    // Every array literal must be a multi-word phrase (contains a space)
    // or a recognized single-word clinical term already accepted
    // elsewhere (suicidal, anaphylaxis, anaphylactic, hemorrhaging,
    // fainted, collapsed, abuse, binge, purge — all pre-existing or
    // direct clinical synonyms, not generic body-part words).
    const literals = [...functionBody.matchAll(/'%([^%]+)%'/g)].map((m) => m[1])
    const genericSingleWords = literals.filter(
      (l) => !l.includes(' ') && ['heart', 'chest', 'breath', 'blood', 'face'].includes(l),
    )
    expect(genericSingleWords).toEqual([])
  })
})

describe('0040 — scope discipline', () => {
  it('does not touch ai_emergency_response_text (emergency wording unchanged)', () => {
    expect(source).not.toMatch(/create or replace function public\.ai_emergency_response_text/)
  })

  it('does not touch ai_send_message (0039 fail-closed logic unchanged)', () => {
    expect(source).not.toMatch(/create or replace function public\.ai_send_message/)
  })

  it('does not create, alter, or drop any table, and does not touch RLS', () => {
    expect(source).not.toMatch(/create table/i)
    expect(source).not.toMatch(/alter table/i)
    expect(source).not.toMatch(/create policy/i)
    expect(source).not.toMatch(/drop policy/i)
  })

  it('does not add or change any CHECK constraint', () => {
    expect(source).not.toMatch(/add constraint/i)
    expect(source).not.toMatch(/drop constraint/i)
  })

  it('preserves the function signature exactly (single text parameter, returns text)', () => {
    expect(functionBody).toMatch(/create or replace function public\.ai_classify_safety_tier\(p_content text\)\s*\nreturns text/)
  })

  it('EXECUTE remains revoked from anon and authenticated — still internal-only, matching 0030', () => {
    const grants = source.slice(source.indexOf('revoke all on function public.ai_classify_safety_tier'))
    expect(grants).toMatch(/revoke execute on function public\.ai_classify_safety_tier\(text\) from anon/)
    expect(grants).toMatch(/revoke execute on function public\.ai_classify_safety_tier\(text\) from authenticated/)
  })
})
