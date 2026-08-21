import { describe, expect, it } from 'vitest'
import { FEATURE_IDS } from '@/features/subscription/entitlements'
import { getPlan, getPlanLimit, planHasFeature, SUBSCRIPTION_PLANS } from '@/features/subscription/subscriptionPlans'

describe('SUBSCRIPTION_PLANS — config shape', () => {
  it('defines free and premium, and nothing else', () => {
    expect(SUBSCRIPTION_PLANS.map((p) => p.id).sort()).toEqual(['free', 'premium'])
  })

  it('every plan references only known feature identifiers', () => {
    for (const plan of SUBSCRIPTION_PLANS) {
      for (const feature of plan.features) {
        expect(FEATURE_IDS).toContain(feature)
      }
    }
  })

  it('free is priced at 0 and premium has a positive price', () => {
    const free = getPlan('free')
    const premium = getPlan('premium')
    expect(free.monthlyPrice).toBe(0)
    expect(free.yearlyPrice).toBe(0)
    expect(premium.monthlyPrice).toBeGreaterThan(0)
    expect(premium.yearlyPrice).toBeGreaterThan(0)
  })

  it('premium is a strict superset of free features (upgrading never removes access)', () => {
    const free = getPlan('free')
    const premium = getPlan('premium')
    for (const feature of free.features) {
      expect(premium.features).toContain(feature)
    }
  })

  it('exactly one plan is highlighted', () => {
    expect(SUBSCRIPTION_PLANS.filter((p) => p.highlighted)).toHaveLength(1)
  })

  it('displayOrder is unique across plans', () => {
    const orders = SUBSCRIPTION_PLANS.map((p) => p.displayOrder)
    expect(new Set(orders).size).toBe(orders.length)
  })
})

describe('getPlan', () => {
  it('throws for an unknown plan id', () => {
    // @ts-expect-error deliberately invalid input
    expect(() => getPlan('enterprise')).toThrow()
  })
})

describe('planHasFeature', () => {
  it('free does not include interaction_intelligence or advanced_insights', () => {
    expect(planHasFeature('free', 'interaction_intelligence')).toBe(false)
    expect(planHasFeature('free', 'advanced_insights')).toBe(false)
  })

  it('premium includes interaction_intelligence and advanced_insights', () => {
    expect(planHasFeature('premium', 'interaction_intelligence')).toBe(true)
    expect(planHasFeature('premium', 'advanced_insights')).toBe(true)
  })

  it('both plans include core_tracking and ai_chat', () => {
    expect(planHasFeature('free', 'core_tracking')).toBe(true)
    expect(planHasFeature('premium', 'core_tracking')).toBe(true)
    expect(planHasFeature('free', 'ai_chat')).toBe(true)
    expect(planHasFeature('premium', 'ai_chat')).toBe(true)
  })
})

describe('getPlanLimit', () => {
  it('free has a finite aiConversationsPerMonth limit', () => {
    expect(getPlanLimit('free', 'aiConversationsPerMonth')).toBeGreaterThan(0)
  })

  it('premium has no aiConversationsPerMonth limit (unlimited)', () => {
    expect(getPlanLimit('premium', 'aiConversationsPerMonth')).toBeUndefined()
  })
})
