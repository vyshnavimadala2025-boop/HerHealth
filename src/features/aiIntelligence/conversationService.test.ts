import { readFileSync } from 'node:fs'
import { describe, expect, it, vi, beforeEach } from 'vitest'

/**
 * Tests for conversationService.sendMessage() — specifically its handling
 * of the ai_send_message() RPC contract (0029_ai_send_message.sql),
 * including the emergency-tier override. Scope, deliberately:
 *
 * COVERED here (client-layer contract handling, supabase.rpc() mocked so
 * no network/database call is ever made — same pattern as
 * visualInsight/provider/mockProvider.test.ts):
 *   - the emergency-tier response the RPC returns is surfaced to the
 *     caller UNCHANGED, even when the client had drafted different
 *     content — proving sendMessage() cannot silently discard or
 *     override what the server decided
 *   - non-emergency tiers pass the RPC's returned content through as-is
 *   - rate-limit / generic error mapping
 *   - abort-signal forwarding
 *   - source-scan proof that assistantMessage.content is built from the
 *     RPC RESPONSE, never from the local assistantContent parameter
 *
 * NOT covered here (cannot be, in this environment): the actual SQL
 * classification logic inside ai_classify_safety_tier() / the override
 * branch inside ai_send_message() itself — those are plain Postgres
 * functions with no local runtime in this project (no Postgres available
 * to the test suite). This file tests how the CLIENT handles whatever
 * that function returns, not the function's own internal correctness.
 *
 * The emergency placeholder text below is copied verbatim from
 * 0029_ai_send_message.sql as it exists TODAY, per explicit instruction
 * not to invent or alter emergency wording. If that migration's text ever
 * changes (e.g. once clinically/legally approved wording replaces it),
 * this constant must be updated to match — it is intentionally NOT
 * imported from anywhere, since the source of truth is SQL, not
 * TypeScript, and no shared constant exists between them today.
 */

const CURRENT_EMERGENCY_PLACEHOLDER =
  '[Placeholder — pending clinical/legal sign-off, not approved emergency ' +
  'guidance] SIRILA noticed something in your message that may need urgent ' +
  'attention. Please contact local emergency services or a healthcare ' +
  'professional right away if you believe this is an emergency. This ' +
  'placeholder message must be replaced with reviewed, approved wording ' +
  'before real users see it.'

const singleMock = vi.fn()
const abortSignalMock = vi.fn(() => ({ single: singleMock }))
const rpcMock = vi.fn((..._args: unknown[]) => ({ single: singleMock, abortSignal: abortSignalMock }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { rpc: (...args: unknown[]) => rpcMock(...args) },
}))

const { sendMessage } = await import('@/features/aiIntelligence/conversationService')

beforeEach(() => {
  rpcMock.mockClear()
  abortSignalMock.mockClear()
  singleMock.mockReset()
})

describe('sendMessage — emergency-tier override handling', () => {
  it('surfaces the RPC-returned emergency placeholder verbatim, even when the client drafted different content', async () => {
    singleMock.mockResolvedValue({
      data: {
        user_message_id: 'user-msg-1',
        assistant_message_id: 'assistant-msg-1',
        assistant_content: CURRENT_EMERGENCY_PLACEHOLDER,
        safety_tier: 'emergency',
        emergency_override: true,
      },
      error: null,
    })

    const clientDraftedContent = 'This is a normal mock reply that must NEVER be shown for emergency-tier input.'

    const result = await sendMessage('conv-1', 'chest pain right now', clientDraftedContent, 'mock-v1')

    expect(result.assistantMessage.content).toBe(CURRENT_EMERGENCY_PLACEHOLDER)
    expect(result.assistantMessage.content).not.toBe(clientDraftedContent)
    expect(result.safetyTier).toBe('emergency')
    expect(result.emergencyOverride).toBe(true)
  })

  it('marks the persisted assistant message safetyTier as emergency, so the UI emergency treatment survives a reload', async () => {
    singleMock.mockResolvedValue({
      data: {
        user_message_id: 'user-msg-2',
        assistant_message_id: 'assistant-msg-2',
        assistant_content: CURRENT_EMERGENCY_PLACEHOLDER,
        safety_tier: 'emergency',
        emergency_override: true,
      },
      error: null,
    })

    const result = await sendMessage('conv-1', 'suicidal thoughts', 'draft', 'mock-v1')

    expect(result.assistantMessage.safetyTier).toBe('emergency')
    expect(result.userMessage.safetyTier).toBe('emergency')
  })
})

describe('sendMessage — non-emergency tiers pass the RPC response through unchanged', () => {
  it.each(['routine', 'urgent', 'sensitive'] as const)('tier=%s: uses the RPC-returned assistant_content as-is', async (tier) => {
    const normalDraft = 'A normal mock wellness reply.'
    singleMock.mockResolvedValue({
      data: {
        user_message_id: 'u',
        assistant_message_id: 'a',
        assistant_content: normalDraft,
        safety_tier: tier,
        emergency_override: false,
      },
      error: null,
    })

    const result = await sendMessage('conv-1', 'some message', normalDraft, 'mock-v1')

    expect(result.assistantMessage.content).toBe(normalDraft)
    expect(result.safetyTier).toBe(tier)
    expect(result.emergencyOverride).toBe(false)
  })
})

describe('sendMessage — error handling', () => {
  it('maps a rate_limit hint to a user-facing daily-limit message', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { hint: 'rate_limit', message: 'SIRILA Intelligence daily message limit reached' },
    })

    await expect(sendMessage('conv-1', 'hello', 'draft', 'mock-v1')).rejects.toThrow(/message limit/)
  })

  it('maps any other error to a generic retry message, never leaking the raw error', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { hint: null, message: 'conversation not found or not owned by caller' },
    })

    await expect(sendMessage('conv-1', 'hello', 'draft', 'mock-v1')).rejects.toThrow(/could not send your message/)
  })
})

describe('sendMessage — cancellation plumbing', () => {
  it('forwards an AbortSignal to the RPC builder when provided', async () => {
    singleMock.mockResolvedValue({
      data: {
        user_message_id: 'u',
        assistant_message_id: 'a',
        assistant_content: 'ok',
        safety_tier: 'routine',
        emergency_override: false,
      },
      error: null,
    })
    const controller = new AbortController()

    await sendMessage('conv-1', 'hello', 'draft', 'mock-v1', controller.signal)

    expect(abortSignalMock).toHaveBeenCalledWith(controller.signal)
  })

  it('does not call abortSignal when no signal is provided', async () => {
    singleMock.mockResolvedValue({
      data: {
        user_message_id: 'u',
        assistant_message_id: 'a',
        assistant_content: 'ok',
        safety_tier: 'routine',
        emergency_override: false,
      },
      error: null,
    })

    await sendMessage('conv-1', 'hello', 'draft', 'mock-v1')

    expect(abortSignalMock).not.toHaveBeenCalled()
  })
})

describe('sendMessage — structural guarantee against an accidental client-side bypass', () => {
  it('builds assistantMessage.content from the RPC response field, never from the local assistantContent parameter', () => {
    const source = readFileSync(new URL('./conversationService.ts', import.meta.url), 'utf-8')
    const sendMessageBody = source.slice(source.indexOf('export async function sendMessage'))
    expect(sendMessageBody).toMatch(/content:\s*data\.assistant_content/)
  })

  it('every call to the RPC passes only the current message text — never a prior message, a client-supplied tier, or conversation history', () => {
    const source = readFileSync(new URL('./conversationService.ts', import.meta.url), 'utf-8')
    const rpcCallBody = source.slice(source.indexOf("supabase.rpc('ai_send_message'"), source.indexOf('if (signal) query'))
    expect(rpcCallBody).toMatch(/p_user_content:\s*userContent/)
    // Structural guarantee: no history/tier/safety-related parameter is
    // ever sent — the server has no way to be told "trust this tier" or
    // "here's what happened earlier," so conversation history cannot
    // influence THIS message's classification (SIRILA launch safety
    // remediation, Phase 8).
    expect(rpcCallBody).not.toMatch(/p_safety_tier/)
    expect(rpcCallBody).not.toMatch(/p_history/)
    expect(rpcCallBody).not.toMatch(/p_previous/)
  })

  it('is a plain, unmemoized async function — no caching wrapper exists that could let a retry or continuation skip a fresh RPC call/classification', () => {
    const source = readFileSync(new URL('./conversationService.ts', import.meta.url), 'utf-8')
    const sendMessageBody = source.slice(
      source.indexOf('export async function sendMessage'),
      source.indexOf('export async function sendMessage') + 2000,
    )
    expect(sendMessageBody).not.toMatch(/memoize|useMemo|cache\.(get|set)/i)
  })
})

/**
 * SIRILA launch safety remediation — Phase 7/8: retry and conversation
 * continuation must not bypass classification. There is no dedicated
 * "resend a failed message" code path anywhere in this project —
 * AiConversationPage's Retry button is bound to useConversation's `retry`,
 * which is literally `load` (re-fetches the conversation from the
 * database), never a re-send of message content. Every message a user
 * ever sends — the first one, a follow-up, or one typed right after an
 * emergency-tier response — goes through this exact same sendMessage()
 * function, which always calls the RPC fresh. These tests prove that by
 * calling sendMessage() multiple times in sequence, as a real
 * conversation-continuation or "type again after Retry" flow would, and
 * confirming each call is independently classified by the (mocked)
 * server response rather than by anything cached from the previous call.
 */
describe('sendMessage — retry and continuation safety (Phase 7/8)', () => {
  it('an emergency-tier response on one call does not leak into or affect the next, independent call', async () => {
    singleMock.mockResolvedValueOnce({
      data: {
        user_message_id: 'u1',
        assistant_message_id: 'a1',
        assistant_content: CURRENT_EMERGENCY_PLACEHOLDER,
        safety_tier: 'emergency',
        emergency_override: true,
      },
      error: null,
    })
    const first = await sendMessage('conv-1', 'chest pain', 'draft', 'mock-v1')
    expect(first.safetyTier).toBe('emergency')

    singleMock.mockResolvedValueOnce({
      data: {
        user_message_id: 'u2',
        assistant_message_id: 'a2',
        assistant_content: 'a normal follow-up reply',
        safety_tier: 'routine',
        emergency_override: false,
      },
      error: null,
    })
    const second = await sendMessage('conv-1', 'just checking in', 'draft', 'mock-v1')

    expect(second.safetyTier).toBe('routine')
    expect(second.emergencyOverride).toBe(false)
    expect(second.assistantMessage.content).toBe('a normal follow-up reply')
    // Confirms the RPC was actually invoked twice — not skipped or reused
    // from a cache on the second, "continuation" call.
    expect(rpcMock).toHaveBeenCalledTimes(2)
  })

  it('calling sendMessage again after a failed call still performs a fresh classification (no stale state carried over)', async () => {
    singleMock.mockResolvedValueOnce({
      data: null,
      error: { hint: null, message: 'conversation not found or not owned by caller' },
    })
    await expect(sendMessage('conv-1', 'first attempt', 'draft', 'mock-v1')).rejects.toThrow()

    singleMock.mockResolvedValueOnce({
      data: {
        user_message_id: 'u3',
        assistant_message_id: 'a3',
        assistant_content: CURRENT_EMERGENCY_PLACEHOLDER,
        safety_tier: 'emergency',
        emergency_override: true,
      },
      error: null,
    })
    const retryResult = await sendMessage('conv-1', 'severe chest pain', 'draft', 'mock-v1')

    expect(retryResult.safetyTier).toBe('emergency')
    expect(retryResult.assistantMessage.content).toBe(CURRENT_EMERGENCY_PLACEHOLDER)
  })
})

describe('sendMessage — graceful handling of an unexpected safety_tier value (defense in depth)', () => {
  it('does not crash if the server ever returns a safety_tier outside the four known literals', async () => {
    singleMock.mockResolvedValue({
      data: {
        user_message_id: 'u',
        assistant_message_id: 'a',
        assistant_content: 'some content',
        safety_tier: 'unexpected_future_value',
        emergency_override: false,
      },
      error: null,
    })

    await expect(sendMessage('conv-1', 'hello', 'draft', 'mock-v1')).resolves.toMatchObject({
      safetyTier: 'unexpected_future_value',
    })
  })
})
