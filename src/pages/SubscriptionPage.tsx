import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FullScreenLoader from '@/components/shared/FullScreenLoader'
import ScrollReveal from '@/components/shared/ScrollReveal'
import AmbientOrb from '@/components/shared/AmbientOrb'
import PlanCard from '@/features/subscription/PlanCard'
import { useSubscription } from '@/features/subscription/useSubscription'
import { SUBSCRIPTION_PLANS } from '@/features/subscription/subscriptionPlans'
import { activatePlan, cancelSubscription } from '@/features/subscription/subscriptionService'
import { useAuth } from '@/features/auth/useAuth'
import type { BillingInterval, PlanId } from '@/features/subscription/types'
import { cn } from '@/lib/utils'

const BILLING_INTERVALS: { value: BillingInterval; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const SORTED_PLANS = [...SUBSCRIPTION_PLANS].sort((a, b) => a.displayOrder - b.displayOrder)

/**
 * Self-service plan management — see subscriptionService.ts's doc comments
 * for the honest scope note: no real payment processor is wired up yet,
 * so "Start Premium" writes the subscription row directly rather than
 * starting a checkout. Everything else here (the entitlement gating, the
 * plan config, the subscription state model) is the real, durable
 * architecture a future checkout integration would plug into.
 */
function SubscriptionPage() {
  const { user } = useAuth()
  const { subscription, status, planId, hasActiveAccess, refresh } = useSubscription()
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly')
  const [processingPlanId, setProcessingPlanId] = useState<PlanId | null>(null)

  const handleSelectPlan = async (targetPlanId: PlanId) => {
    if (!user) return
    setProcessingPlanId(targetPlanId)
    try {
      await activatePlan(user.id, targetPlanId, targetPlanId === 'free' ? null : billingInterval)
      await refresh()
      toast.success(targetPlanId === 'free' ? "You're on the Free plan." : 'Welcome to SIRILA Premium.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setProcessingPlanId(null)
    }
  }

  const handleCancel = async () => {
    if (!user) return
    setProcessingPlanId(planId)
    try {
      await cancelSubscription(user.id)
      await refresh()
      toast.success('Your subscription will end at the close of the current billing period.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setProcessingPlanId(null)
    }
  }

  if (status === 'loading') return <FullScreenLoader />

  if (status === 'error') {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-hero-panel px-4 py-16 text-center">
        <AlertTriangle className="size-8 text-attention" aria-hidden="true" />
        <p className="max-w-sm text-body text-hero-panel-foreground/80">
          We couldn&apos;t load your subscription. Please check your connection and try again.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => refresh()}
          className="border-hero-panel-foreground/25 bg-transparent text-hero-panel-foreground hover:bg-hero-panel-foreground/10"
        >
          Try again
        </Button>
      </main>
    )
  }

  // A premium plan_id whose status has lapsed (past_due/expired/cancelled
  // with the period already over) must never render as an active "Current
  // plan" — hasActiveAccess (useSubscription.ts) is the single check for
  // this, reused here and in SubscriptionDashboardTile so the two can't
  // disagree with each other about whether access is actually live.
  const isLapsedPremium = planId === 'premium' && !hasActiveAccess
  const isPremiumActive = planId === 'premium' && hasActiveAccess && !subscription?.cancelAtPeriodEnd

  return (
    <main className="relative flex-1 overflow-hidden bg-hero-panel">
      <AmbientOrb color="var(--primary)" size={520} top="-160px" left="8%" opacity={0.16} />
      <AmbientOrb color="var(--lavender)" size={420} top="30%" right="-120px" opacity={0.14} />
      <AmbientOrb color="var(--peach)" size={380} bottom="-140px" left="30%" opacity={0.1} />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 pt-16 pb-8 text-center sm:px-6 lg:pt-24">
        <ScrollReveal>
          <p className="flex items-center justify-center gap-1.5 text-caption font-medium tracking-[0.16em] text-peach uppercase">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            SIRILA Subscription
          </p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <h1 className="max-w-2xl text-title font-display text-hero-panel-foreground sm:text-display">
            Choose the level of support that&apos;s right for you.
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={140}>
          <p className="max-w-xl text-body-lg text-hero-panel-foreground/75">
            Start with SIRILA&apos;s essential wellness experience and unlock deeper intelligence when
            you&apos;re ready.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative flex justify-center pb-8">
        <div
          aria-label="Billing interval"
          className="inline-flex items-center gap-1 rounded-full border border-hero-panel-foreground/15 bg-hero-panel-foreground/5 p-1"
        >
          {BILLING_INTERVALS.map((interval) => (
            <button
              key={interval.value}
              type="button"
              aria-pressed={billingInterval === interval.value}
              onClick={() => setBillingInterval(interval.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach/60',
                billingInterval === interval.value
                  ? 'bg-hero-panel-foreground text-hero-panel'
                  : 'text-hero-panel-foreground/65 hover:text-hero-panel-foreground',
              )}
            >
              {interval.label}
            </button>
          ))}
        </div>
      </div>

      {isLapsedPremium && (
        <div className="relative mx-auto flex w-full max-w-4xl items-start gap-3 px-4 pb-6 sm:px-6">
          <div className="flex w-full items-start gap-3 rounded-2xl border border-attention/30 bg-attention/10 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-attention" aria-hidden="true" />
            <p className="text-body text-hero-panel-foreground/85">
              {subscription?.status === 'past_due'
                ? "There was a problem with your last payment. Reactivate Premium below to restore access."
                : "Your Premium subscription has ended. Reactivate below whenever you're ready."}
            </p>
          </div>
        </div>
      )}

      <div className="relative mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-2">
        {SORTED_PLANS.map((plan, index) => (
          <ScrollReveal key={plan.id} delay={index * 100}>
            <PlanCard
              plan={plan}
              billingInterval={billingInterval}
              isCurrentPlan={plan.id === planId && (plan.id === 'free' || hasActiveAccess)}
              isProcessing={processingPlanId === plan.id}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          </ScrollReveal>
        ))}
      </div>

      {isPremiumActive && (
        <div className="relative mx-auto flex w-full max-w-4xl justify-center px-4 pb-4 sm:px-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={processingPlanId === 'premium'}
            className="text-caption text-hero-panel-foreground/50 underline-offset-2 hover:text-hero-panel-foreground/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach/60 rounded"
          >
            Cancel subscription
          </button>
        </div>
      )}

      {subscription?.cancelAtPeriodEnd && (
        <p className="relative mx-auto max-w-md px-4 pb-4 text-center text-caption text-attention">
          Your Premium access continues
          {subscription.currentPeriodEnd
            ? ` until ${new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`
            : ' until the end of your current billing period'}
          , then moves to Free.
        </p>
      )}

      <div className="relative mx-auto max-w-2xl px-4 pb-20 text-center sm:px-6">
        <p className="text-caption text-hero-panel-foreground/45">
          You can change or cancel your plan at any time. SIRILA never shares or sells your personal
          wellness data, regardless of plan.
        </p>
      </div>
    </main>
  )
}

export default SubscriptionPage
