import { beforeEach, describe, expect, it, vi } from 'vitest'

const maybeSingleMock = vi.fn()
const eqSelectMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }))
const selectMock = vi.fn(() => ({ eq: eqSelectMock }))

const singleMock = vi.fn()
const selectAfterUpdateMock = vi.fn(() => ({ single: singleMock }))
const updateEqMock = vi.fn(() => ({ select: selectAfterUpdateMock }))
const updateMock = vi.fn((_payload: Record<string, unknown>) => ({ eq: updateEqMock }))

const fromMock = vi.fn((..._args: unknown[]) => ({ select: selectMock, update: updateMock }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: (...args: unknown[]) => fromMock(...args) },
}))

const { getSubscription, activatePlan, cancelSubscription } = await import(
  '@/features/subscription/subscriptionService'
)

const ROW = {
  user_id: 'user-1',
  plan_id: 'free',
  status: 'free',
  billing_interval: null,
  current_period_end: null,
  cancel_at_period_end: false,
}

beforeEach(() => {
  fromMock.mockClear()
  selectMock.mockClear()
  eqSelectMock.mockClear()
  maybeSingleMock.mockReset()
  updateMock.mockClear()
  updateEqMock.mockClear()
  selectAfterUpdateMock.mockClear()
  singleMock.mockReset()
})

describe('getSubscription', () => {
  it('maps a found row to the camelCase Subscription shape', async () => {
    maybeSingleMock.mockResolvedValue({ data: ROW, error: null })
    const result = await getSubscription('user-1')
    expect(fromMock).toHaveBeenCalledWith('subscriptions')
    expect(eqSelectMock).toHaveBeenCalledWith('user_id', 'user-1')
    expect(result).toEqual({
      userId: 'user-1',
      planId: 'free',
      status: 'free',
      billingInterval: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    })
  })

  it('returns null when no row exists yet (not an error)', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null })
    const result = await getSubscription('user-1')
    expect(result).toBeNull()
  })

  it('throws a friendly error when the query fails', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: 'boom' } })
    await expect(getSubscription('user-1')).rejects.toThrow('Unable to load your subscription')
  })
})

describe('activatePlan', () => {
  it('activating premium sets status active and passes the billing interval through', async () => {
    singleMock.mockResolvedValue({ data: { ...ROW, plan_id: 'premium', status: 'active', billing_interval: 'yearly' }, error: null })
    const result = await activatePlan('user-1', 'premium', 'yearly')
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ plan_id: 'premium', status: 'active', billing_interval: 'yearly', cancel_at_period_end: false }),
    )
    expect(result.planId).toBe('premium')
    expect(result.status).toBe('active')
  })

  it('activating free forces status free and billing_interval null regardless of what was passed', async () => {
    singleMock.mockResolvedValue({ data: ROW, error: null })
    await activatePlan('user-1', 'free', 'yearly')
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ plan_id: 'free', status: 'free', billing_interval: null, current_period_end: null }),
    )
  })

  it('activating premium sets a real current_period_end roughly one interval out, not null', async () => {
    singleMock.mockResolvedValue({ data: { ...ROW, plan_id: 'premium', status: 'active' }, error: null })
    const before = Date.now()
    await activatePlan('user-1', 'premium', 'monthly')
    const payload = updateMock.mock.calls[0][0] as { current_period_end: string }
    expect(payload.current_period_end).not.toBeNull()
    const endMs = new Date(payload.current_period_end).getTime()
    // Roughly 30 days out (28-31 depending on the current month) — not exact, just proving it's a real future date, not a placeholder.
    const daysOut = (endMs - before) / (1000 * 60 * 60 * 24)
    expect(daysOut).toBeGreaterThan(27)
    expect(daysOut).toBeLessThan(32)
  })

  it('throws a friendly error when the update fails', async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: 'boom' } })
    await expect(activatePlan('user-1', 'premium', 'monthly')).rejects.toThrow('We could not update your plan')
  })
})

describe('cancelSubscription', () => {
  it('sets cancel_at_period_end true and status cancelled', async () => {
    singleMock.mockResolvedValue({ data: { ...ROW, status: 'cancelled', cancel_at_period_end: true }, error: null })
    const result = await cancelSubscription('user-1')
    expect(updateMock).toHaveBeenCalledWith({ cancel_at_period_end: true, status: 'cancelled' })
    expect(result.cancelAtPeriodEnd).toBe(true)
  })
})
