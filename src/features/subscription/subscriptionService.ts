import { supabase } from '@/lib/supabaseClient'
import type { BillingInterval, PlanId, Subscription, SubscriptionStatus } from '@/features/subscription/types'

interface SubscriptionRow {
  user_id: string
  plan_id: string
  status: string
  billing_interval: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

const SUBSCRIPTION_COLUMNS =
  'user_id, plan_id, status, billing_interval, current_period_end, cancel_at_period_end'

function mapRow(row: SubscriptionRow): Subscription {
  return {
    userId: row.user_id,
    planId: row.plan_id as PlanId,
    status: row.status as SubscriptionStatus,
    billingInterval: row.billing_interval as BillingInterval | null,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  }
}

/**
 * Every authenticated user has a subscriptions row from the moment their
 * account is created (see 0042_subscriptions.sql's auto-provisioning
 * trigger), so `null` here means the row hasn't been created yet — e.g. a
 * brand new signup racing this read — not "no subscription exists."
 * Callers should treat `null` the same as the free plan.
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(SUBSCRIPTION_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error('Unable to load your subscription. Please try again.')
  return data ? mapRow(data) : null
}

/** now + 1 calendar month/year, matching whichever interval was chosen. */
function computePeriodEnd(interval: BillingInterval): string {
  const end = new Date()
  if (interval === 'monthly') end.setMonth(end.getMonth() + 1)
  else end.setFullYear(end.getFullYear() + 1)
  return end.toISOString()
}

/**
 * Self-service plan activation — see the migration's scope note: there is
 * no real payment processor in this codebase yet, so this directly writes
 * the requested plan/status rather than initiating a checkout. It is the
 * exact function a future "on successful Stripe checkout" handler would
 * replace or wrap.
 */
export async function activatePlan(
  userId: string,
  planId: PlanId,
  billingInterval: BillingInterval | null,
): Promise<Subscription> {
  const resolvedInterval = billingInterval ?? 'monthly'
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      plan_id: planId,
      status: planId === 'free' ? 'free' : 'active',
      billing_interval: planId === 'free' ? null : billingInterval,
      current_period_end: planId === 'free' ? null : computePeriodEnd(resolvedInterval),
      cancel_at_period_end: false,
    })
    .eq('user_id', userId)
    .select(SUBSCRIPTION_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your plan. Please try again.')
  return mapRow(data)
}

/**
 * Marks the subscription to end at the current period's close rather than
 * downgrading immediately — the plan and its features stay active until
 * then, matching how real billing providers handle cancellation.
 */
export async function cancelSubscription(userId: string): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ cancel_at_period_end: true, status: 'cancelled' })
    .eq('user_id', userId)
    .select(SUBSCRIPTION_COLUMNS)
    .single()

  if (error) throw new Error('We could not cancel your subscription. Please try again.')
  return mapRow(data)
}
