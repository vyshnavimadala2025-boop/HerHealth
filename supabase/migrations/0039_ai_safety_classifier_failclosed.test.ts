import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * Structural / source-scan tests for the fail-closed migration. Same
 * boundary as 0038's sibling test file: no local Postgres is available to
 * this test environment, so the SQL body cannot be executed here — what
 * CAN be verified without a database is that the fail-closed logic is
 * actually present in the function body, in the right order, and that
 * nothing outside its stated scope was touched.
 */

const source = readFileSync(new URL('./0039_ai_safety_classifier_failclosed.sql', import.meta.url), 'utf-8')
const sendMessageBody = source.slice(
  source.indexOf('create or replace function public.ai_send_message'),
  source.indexOf("revoke all on function public.ai_send_message"),
)

describe('0039 — classifier exception is caught, never propagates', () => {
  it('wraps the classifier call in its own begin/exception block', () => {
    const classifierCallIndex = sendMessageBody.indexOf('v_tier := public.ai_classify_safety_tier(p_user_content);')
    expect(classifierCallIndex).toBeGreaterThan(-1)

    const precedingBlock = sendMessageBody.slice(0, classifierCallIndex)
    const followingBlock = sendMessageBody.slice(classifierCallIndex)

    expect(precedingBlock.trimEnd().endsWith('begin')).toBe(true)
    expect(followingBlock).toMatch(/exception when others then\s+v_tier := null;/)
  })
})

describe('0039 — fail-closed normalization: allowlist of safe tiers, not a denylist of one', () => {
  it('treats anything other than routine/urgent/sensitive as needing the override', () => {
    expect(sendMessageBody).toMatch(
      /if v_tier is null or v_tier not in \('routine', 'urgent', 'sensitive'\) then/,
    )
  })

  it('the normalization runs BEFORE the user message is inserted, so the stored tier is always already-safe', () => {
    const normalizeIndex = sendMessageBody.indexOf("v_tier not in ('routine', 'urgent', 'sensitive')")
    const insertIndex = sendMessageBody.indexOf('insert into public.ai_messages')
    expect(normalizeIndex).toBeGreaterThan(-1)
    expect(insertIndex).toBeGreaterThan(-1)
    expect(normalizeIndex).toBeLessThan(insertIndex)
  })

  it('normalizes to the existing emergency tier — no new safety_tier value is introduced', () => {
    // Property-declaration-style check: the assignment itself, not prose
    // discussing it (this file's own header comment explains the "why" in
    // words, which must not trip this check).
    expect(sendMessageBody).toMatch(/v_classifier_error := \(v_tier is distinct from 'emergency'\);\s*\n\s*v_tier := 'emergency';/)
  })

  it('does not declare or reference any safety_tier value outside the four already-existing literals', () => {
    const tierLiterals = sendMessageBody.match(/v_tier\s*:?=\s*'[a-z_]+'/g) ?? []
    for (const literal of tierLiterals) {
      expect(['routine', 'urgent', 'emergency', 'sensitive'].some((known) => literal.includes(`'${known}'`))).toBe(
        true,
      )
    }
  })
})

describe('0039 — emergency override still fires for the normalized case', () => {
  it('the override check (v_tier = emergency) runs after normalization, so a classifier failure still gets the safe response', () => {
    const normalizeIndex = sendMessageBody.indexOf("v_tier not in ('routine', 'urgent', 'sensitive')")
    const overrideIndex = sendMessageBody.indexOf("if v_tier = 'emergency' then")
    expect(overrideIndex).toBeGreaterThan(normalizeIndex)
  })

  it('the client-supplied assistant content is only ever used for the three known-safe tiers', () => {
    expect(sendMessageBody).toMatch(/v_final_assistant_content := p_assistant_content;/)
    // It must be inside the ELSE branch of the emergency-override if
    // statement specifically — scoped to the override block itself, not
    // just "else appears somewhere in the function," since an unrelated
    // CASE expression earlier in the function (the event_type lookup
    // inside the ai_log_safety_event() call) also legitimately contains
    // its own "else" keyword and must not satisfy this check.
    const overrideBlockIndex = sendMessageBody.indexOf("if v_tier = 'emergency' then")
    const overrideBlock = sendMessageBody.slice(overrideBlockIndex)
    const elseIndexWithinOverrideBlock = overrideBlock.indexOf('else')
    const clientContentIndexWithinOverrideBlock = overrideBlock.indexOf(
      'v_final_assistant_content := p_assistant_content;',
    )
    expect(elseIndexWithinOverrideBlock).toBeGreaterThan(-1)
    expect(clientContentIndexWithinOverrideBlock).toBeGreaterThan(elseIndexWithinOverrideBlock)
  })
})

describe('0039 — emergency wording centralized, not inlined, not changed', () => {
  it('ai_send_message calls ai_emergency_response_text() rather than a hardcoded string', () => {
    expect(sendMessageBody).toMatch(/v_final_assistant_content := public\.ai_emergency_response_text\(\);/)
    // No inline placeholder string literal remains in ai_send_message's body.
    expect(sendMessageBody).not.toMatch(/pending clinical\/legal sign-off/)
  })

  it('ai_emergency_response_text returns the exact unmodified placeholder text', () => {
    const fnBody = source.slice(
      source.indexOf('create or replace function public.ai_emergency_response_text'),
      source.indexOf('revoke all on function public.ai_emergency_response_text'),
    )
    expect(fnBody).toContain('[Placeholder — pending clinical/legal sign-off, not approved emergency')
    expect(fnBody).toContain('SIRILA noticed something in your message that may need urgent')
  })

  it('ai_emergency_response_text is locked down to internal-use-only (no EXECUTE for anon or authenticated)', () => {
    const grants = source.slice(
      source.indexOf('revoke all on function public.ai_emergency_response_text'),
      source.indexOf('comment on function public.ai_emergency_response_text'),
    )
    expect(grants).toMatch(/revoke execute on function public\.ai_emergency_response_text\(\) from anon/)
    expect(grants).toMatch(/revoke execute on function public\.ai_emergency_response_text\(\) from authenticated/)
    expect(grants).not.toMatch(/grant execute on function public\.ai_emergency_response_text\(\) to authenticated/)
  })
})

describe('0039 — audit trail still distinguishes a real match from a classifier malfunction', () => {
  it("uses event_type='other' specifically for the classifier-error-normalized case", () => {
    expect(sendMessageBody).toMatch(/when v_classifier_error then 'other'/)
  })
})

describe('0039 — scope discipline: does not touch what it says it does not touch', () => {
  it('does not modify ai_classify_safety_tier (no create-or-replace of that function)', () => {
    expect(source).not.toMatch(/create or replace function public\.ai_classify_safety_tier/)
  })

  it('does not create, alter, or drop any table, and does not touch RLS', () => {
    expect(source).not.toMatch(/create table/i)
    expect(source).not.toMatch(/alter table/i)
    expect(source).not.toMatch(/create policy/i)
    expect(source).not.toMatch(/drop policy/i)
    expect(source).not.toMatch(/disable row level security/i)
  })

  it('does not add or change any CHECK constraint', () => {
    expect(source).not.toMatch(/add constraint/i)
    expect(source).not.toMatch(/drop constraint/i)
  })

  it('preserves the exact same function signature (same parameters, same return shape) as 0029', () => {
    expect(sendMessageBody).toMatch(
      /p_conversation_id uuid,\s*\n\s*p_user_content text,\s*\n\s*p_assistant_content text,\s*\n\s*p_model_used text default 'mock-v1'/,
    )
    expect(sendMessageBody).toMatch(
      /returns table \(\s*\n\s*user_message_id uuid,\s*\n\s*assistant_message_id uuid,\s*\n\s*assistant_content text,\s*\n\s*safety_tier text,\s*\n\s*emergency_override boolean\s*\n\)/,
    )
  })

  it('preserves the existing daily rate limit and ownership checks unchanged', () => {
    expect(sendMessageBody).toContain('v_daily_limit constant integer := 50')
    expect(sendMessageBody).toContain("raise exception 'conversation not found or not owned by caller' using errcode = '42501'")
  })
})
