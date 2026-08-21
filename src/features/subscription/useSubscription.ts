import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getSubscription } from '@/features/subscription/subscriptionService'
import { getPlan, getPlanLimit, planHasFeature } from '@/features/subscription/subscriptionPlans'
import type { FeatureId } from '@/features/subscription/entitlements'
import type { Subscription } from '@/features/subscription/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * The single place components should read subscription state from,
 * rather than importing subscriptionService directly. A missing row
 * (see getSubscription's doc comment) is treated as the free plan here,
 * once, instead of every caller having to remember that fallback.
 */
export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const result = await getSubscription(user.id)
      setSubscription(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const planId = subscription?.planId ?? 'free'
  // Defensive: mapRow() casts the DB's plan_id to PlanId without runtime
  // validation, so an unexpected value (e.g. a future plan added to the
  // DB check constraint before this array is updated) would otherwise
  // throw inside render. Fall back to the free plan rather than crashing
  // the page over a display-config lookup.
  let plan
  try {
    plan = getPlan(planId)
  } catch {
    plan = getPlan('free')
  }

  /**
   * The single source of truth for "does this account currently have
   * working access to its plan's features" — free always does (nothing
   * to lapse), premium only when status is genuinely active or trialing.
   * A premium plan_id with status 'past_due'/'expired'/'cancelled' must
   * NOT read as active access anywhere in the UI. Centralized here so
   * SubscriptionPage and SubscriptionDashboardTile don't each re-derive
   * (and risk diverging on) the same check.
   */
  const hasActiveAccess =
    planId === 'free' ? true : subscription?.status === 'active' || subscription?.status === 'trial'

  return {
    subscription,
    status,
    planId,
    plan,
    hasActiveAccess,
    hasFeature: (feature: FeatureId) => planHasFeature(planId, feature),
    getLimit: (limitKey: string) => getPlanLimit(planId, limitKey),
    refresh: load,
  }
}
