import { describe, expect, it, vi, beforeEach } from 'vitest'

/**
 * Tests for the client layer of public.admin_ai_safety_metrics() (0038).
 * Scope, deliberately (same boundary as every other RPC-calling service
 * test in this codebase — see conversationService.test.ts):
 *
 * COVERED here: the frontend correctly calls the RPC, correctly maps a
 * successful aggregate response, and does NOT swallow an RPC error (which
 * is how a non-admin/unauthenticated caller's 42501 rejection actually
 * surfaces — see below for why that specific enforcement can't be
 * exercised live in this environment).
 *
 * NOT covered here, and NOT independently live-tested in this change: the
 * actual is_admin() enforcement inside the SQL function. This project has
 * no Supabase CLI, no service-role key, and no local Postgres available to
 * this test environment (an established limitation throughout this
 * project) — migrations are applied manually via the Supabase SQL Editor,
 * and this migration has NOT been applied. There is therefore no live RPC
 * to call "as an admin" or "as a non-admin" yet. Confidence that
 * enforcement works comes from two things instead: (1) this function's
 * body is structurally identical to admin_feedback_kpis() and
 * admin_overview_metrics(), both of which WERE live-verified working
 * correctly earlier in this project; (2) the migration-source-scan test
 * in this same directory's sibling file
 * (../../../../supabase/migrations/0038_admin_ai_safety_metrics.test.ts)
 * proves the is_admin() check exists and runs before any data is touched.
 */

const singleMock = vi.fn()
const rpcMock = vi.fn((..._args: unknown[]) => ({ single: singleMock }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { rpc: (...args: unknown[]) => rpcMock(...args) },
}))

const { getAdminAiSafetyMetrics } = await import('@/features/admin/aiSafety/adminAiSafetyService')

beforeEach(() => {
  rpcMock.mockClear()
  singleMock.mockReset()
})

describe('getAdminAiSafetyMetrics', () => {
  it('calls admin_ai_safety_metrics with no parameters', async () => {
    singleMock.mockResolvedValue({
      data: {
        total_events: 3,
        urgent_count: 1,
        sensitive_count: 1,
        emergency_count: 1,
        blocked_count: 1,
        escalated_count: 2,
        logged_only_count: 0,
        events_last_24h: 2,
        events_last_7d: 3,
      },
      error: null,
    })

    await getAdminAiSafetyMetrics()

    expect(rpcMock).toHaveBeenCalledWith('admin_ai_safety_metrics')
  })

  it('maps a successful aggregate response correctly', async () => {
    singleMock.mockResolvedValue({
      data: {
        total_events: 10,
        urgent_count: 4,
        sensitive_count: 3,
        emergency_count: 3,
        blocked_count: 3,
        escalated_count: 7,
        logged_only_count: 0,
        events_last_24h: 5,
        events_last_7d: 10,
      },
      error: null,
    })

    const result = await getAdminAiSafetyMetrics()

    expect(result).toEqual({
      totalEvents: 10,
      urgentCount: 4,
      sensitiveCount: 3,
      emergencyCount: 3,
      blockedCount: 3,
      escalatedCount: 7,
      loggedOnlyCount: 0,
      eventsLast24h: 5,
      eventsLast7d: 10,
    })
  })

  it('the mapped result never carries an id, userId, conversationId, or content-shaped field', async () => {
    singleMock.mockResolvedValue({
      data: {
        total_events: 1,
        urgent_count: 0,
        sensitive_count: 0,
        emergency_count: 1,
        blocked_count: 1,
        escalated_count: 0,
        logged_only_count: 0,
        events_last_24h: 1,
        events_last_7d: 1,
      },
      error: null,
    })

    const result = await getAdminAiSafetyMetrics()

    const forbiddenKeys = ['id', 'userId', 'user_id', 'conversationId', 'conversation_id', 'content', 'message']
    for (const key of forbiddenKeys) {
      expect(Object.keys(result)).not.toContain(key)
    }
  })

  it('propagates an RPC error (e.g. a non-admin/unauthenticated 42501 rejection) rather than swallowing it', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'admin access required' },
    })

    await expect(getAdminAiSafetyMetrics()).rejects.toMatchObject({ code: '42501' })
  })
})
