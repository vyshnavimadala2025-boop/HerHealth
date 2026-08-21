export const SUBSCRIPTION_STATUSES = [
  { value: 'free', label: 'Free' },
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'past_due', label: 'Past due' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
] as const

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]['value']

export type PlanId = 'free' | 'premium'

export type BillingInterval = 'monthly' | 'yearly'

/**
 * `planId` (which plan the account is on) and `status` (its lifecycle
 * state) are deliberately separate fields, not one combined enum — a real
 * payment integration can have a `premium` plan with `status: 'past_due'`
 * during a grace period, which is a meaningfully different UI state than
 * `free`/`status: 'free'`.
 */
export interface Subscription {
  userId: string
  planId: PlanId
  status: SubscriptionStatus
  billingInterval: BillingInterval | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}
