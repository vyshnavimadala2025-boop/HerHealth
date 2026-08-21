import { Crown } from 'lucide-react'
import NextStepTile from '@/components/shared/NextStepTile'
import { useSubscription } from '@/features/subscription/useSubscription'

/**
 * Dashboard "Continue your journey" entry point for /subscription — same
 * pattern as InteractionIntelligenceDashboardTile: reads real state (here,
 * the actual subscriptions row via useSubscription) rather than always
 * showing static copy.
 */
function SubscriptionDashboardTile() {
  const { status, planId, subscription, hasActiveAccess } = useSubscription()

  const description = (() => {
    if (planId === 'premium' && hasActiveAccess) {
      return subscription?.cancelAtPeriodEnd ? 'Ending soon — manage your plan' : 'Premium — manage your plan'
    }
    if (planId === 'premium' && !hasActiveAccess) {
      return subscription?.status === 'past_due' ? 'Payment issue — reactivate' : 'Subscription ended — reactivate'
    }
    return 'Unlock deeper SIRILA intelligence'
  })()

  return (
    <NextStepTile
      icon={Crown}
      label="Subscription"
      description={description}
      href="/subscription"
      isLoading={status === 'loading'}
      accentClassName="bg-blush text-blush-foreground"
    />
  )
}

export default SubscriptionDashboardTile
