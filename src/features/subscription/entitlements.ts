/**
 * Central catalog of feature identifiers a subscription plan can grant.
 * Components should check `hasFeature(FEATURE_X)` (see useSubscription.ts)
 * rather than comparing `planId === 'premium'` directly, so a feature's
 * plan requirement is defined once, here, instead of scattered across
 * every component that gates on it.
 *
 * There was no existing plan-based feature-gating system in this codebase
 * to inspect and reuse — the only prior art is FEATURE_SIRILA_CHAT /
 * FEATURE_VISUAL_INSIGHT in aiIntelligence/constants.ts, which are global
 * rollout kill-switches (is this feature launched at all, for everyone),
 * a different concern from per-user plan entitlements (which users get
 * this feature). The two are independent and compose: a route can require
 * BOTH the global flag to be on AND the viewer's plan to include the
 * feature. FEATURE_AI_CHAT below is deliberately granted to both plans —
 * chat itself already works for every authenticated user today regardless
 * of plan, so this models it as a shared feature with a plan-dependent
 * usage limit (see subscriptionPlans.ts's `limits.aiConversationsPerMonth`)
 * rather than inventing a new hard block that doesn't exist yet.
 */

export const FEATURE_CORE_TRACKING = 'core_tracking'
export const FEATURE_BASIC_INSIGHTS = 'basic_insights'
export const FEATURE_BASIC_PERSONALIZATION = 'basic_personalization'
export const FEATURE_AI_CHAT = 'ai_chat'
export const FEATURE_ADVANCED_INSIGHTS = 'advanced_insights'
export const FEATURE_PERSONALIZED_INSIGHTS = 'personalized_insights'
export const FEATURE_INTERACTION_INTELLIGENCE = 'interaction_intelligence'
export const FEATURE_ADVANCED_REPORTS = 'advanced_reports'

export const FEATURE_IDS = [
  FEATURE_CORE_TRACKING,
  FEATURE_BASIC_INSIGHTS,
  FEATURE_BASIC_PERSONALIZATION,
  FEATURE_AI_CHAT,
  FEATURE_ADVANCED_INSIGHTS,
  FEATURE_PERSONALIZED_INSIGHTS,
  FEATURE_INTERACTION_INTELLIGENCE,
  FEATURE_ADVANCED_REPORTS,
] as const

export type FeatureId = (typeof FEATURE_IDS)[number]

/** Short, user-facing description of each feature — reused by plan cards and any future "why is this locked" upsell copy. */
export const FEATURE_LABELS: Record<FeatureId, string> = {
  [FEATURE_CORE_TRACKING]: 'Core health tracking',
  [FEATURE_BASIC_INSIGHTS]: 'Basic wellness insights',
  [FEATURE_BASIC_PERSONALIZATION]: 'Basic personalization',
  [FEATURE_AI_CHAT]: 'SIRILA AI chat',
  [FEATURE_ADVANCED_INSIGHTS]: 'Advanced AI insights',
  [FEATURE_PERSONALIZED_INSIGHTS]: 'Deeper personalization',
  [FEATURE_INTERACTION_INTELLIGENCE]: 'Interaction Intelligence',
  [FEATURE_ADVANCED_REPORTS]: 'Advanced wellness reports',
}
