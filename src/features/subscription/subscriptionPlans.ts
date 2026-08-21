import {
  FEATURE_ADVANCED_INSIGHTS,
  FEATURE_ADVANCED_REPORTS,
  FEATURE_AI_CHAT,
  FEATURE_BASIC_INSIGHTS,
  FEATURE_BASIC_PERSONALIZATION,
  FEATURE_CORE_TRACKING,
  FEATURE_INTERACTION_INTELLIGENCE,
  FEATURE_PERSONALIZED_INSIGHTS,
  type FeatureId,
} from '@/features/subscription/entitlements'
import type { PlanId } from '@/features/subscription/types'

export interface SubscriptionPlan {
  id: PlanId
  name: string
  tagline: string
  description: string
  /** null = not applicable (the plan has no price at this interval). */
  monthlyPrice: number | null
  yearlyPrice: number | null
  currency: string
  features: FeatureId[]
  /**
   * Plan-specific numeric caps, e.g. `{ aiConversationsPerMonth: 10 }`.
   * A key that's absent for a plan means unlimited for that plan — kept
   * sparse rather than using `Infinity` so this stays plain, easily
   * serializable config data.
   */
  limits: Record<string, number>
  highlighted: boolean
  ctaLabel: string
  displayOrder: number
}

/**
 * PLACEHOLDER PRICING — not a final business decision. $9.99/mo and
 * $89/yr are round, obviously-provisional numbers so the UI has something
 * real to render; update them here (and nowhere else — no component
 * should ever hardcode a price) once pricing is actually decided.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Essential wellness',
    description: "Start with SIRILA's core wellness experience — no cost, no time limit.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'USD',
    features: [FEATURE_CORE_TRACKING, FEATURE_BASIC_INSIGHTS, FEATURE_BASIC_PERSONALIZATION, FEATURE_AI_CHAT],
    limits: { aiConversationsPerMonth: 10 },
    highlighted: false,
    ctaLabel: 'Continue Free',
    displayOrder: 0,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Deeper SIRILA intelligence',
    description: 'Unlock advanced insights, deeper personalization, and Interaction Intelligence.',
    monthlyPrice: 9.99,
    yearlyPrice: 89,
    currency: 'USD',
    features: [
      FEATURE_CORE_TRACKING,
      FEATURE_BASIC_INSIGHTS,
      FEATURE_BASIC_PERSONALIZATION,
      FEATURE_AI_CHAT,
      FEATURE_ADVANCED_INSIGHTS,
      FEATURE_PERSONALIZED_INSIGHTS,
      FEATURE_INTERACTION_INTELLIGENCE,
      FEATURE_ADVANCED_REPORTS,
    ],
    limits: {},
    highlighted: true,
    ctaLabel: 'Start Premium',
    displayOrder: 1,
  },
]

export function getPlan(planId: PlanId): SubscriptionPlan {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) throw new Error(`Unknown subscription plan: ${planId}`)
  return plan
}

export function planHasFeature(planId: PlanId, feature: FeatureId): boolean {
  return getPlan(planId).features.includes(feature)
}

/** undefined = unlimited for this plan. */
export function getPlanLimit(planId: PlanId, limitKey: string): number | undefined {
  return getPlan(planId).limits[limitKey]
}
