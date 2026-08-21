import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SirilaGlassCard from '@/components/shared/SirilaGlassCard'
import { FEATURE_LABELS } from '@/features/subscription/entitlements'
import type { SubscriptionPlan } from '@/features/subscription/subscriptionPlans'
import type { BillingInterval } from '@/features/subscription/types'

interface PlanCardProps {
  plan: SubscriptionPlan
  billingInterval: BillingInterval
  isCurrentPlan: boolean
  isProcessing: boolean
  onSelect: () => void
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount)
}

function PlanCard({ plan, billingInterval, isCurrentPlan, isProcessing, onSelect }: PlanCardProps) {
  const price = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
  const isFree = plan.id === 'free'

  return (
    <SirilaGlassCard
      tone="dark"
      interactive={!isCurrentPlan}
      className={`relative flex h-full flex-col gap-6 p-6 sm:p-8 ${plan.highlighted ? 'border-peach/30 shadow-[0_0_40px_-12px_color-mix(in_oklch,var(--peach),transparent_45%)]' : ''}`}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-6 rounded-full bg-peach px-3 py-1 text-caption font-medium text-peach-foreground">
          Recommended
        </span>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-caption font-medium tracking-[0.14em] text-peach uppercase">{plan.name}</p>
        <h3 className="font-display text-heading text-hero-panel-foreground">{plan.tagline}</h3>
        <p className="text-body text-hero-panel-foreground/70">{plan.description}</p>
      </div>

      <div className="flex items-baseline gap-1.5">
        {price === 0 ? (
          <span className="font-display text-title text-hero-panel-foreground">Free</span>
        ) : (
          <>
            <span className="font-display text-title text-hero-panel-foreground">
              {formatPrice(price ?? 0, plan.currency)}
            </span>
            <span className="text-body text-hero-panel-foreground/55">
              /{billingInterval === 'yearly' ? 'year' : 'month'}
            </span>
          </>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-hero-panel-foreground/85">
            <Check className="mt-0.5 size-4 shrink-0 text-support" aria-hidden="true" />
            {FEATURE_LABELS[feature]}
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <Button type="button" variant="outline" disabled className="border-hero-panel-foreground/25 bg-transparent text-hero-panel-foreground/70">
          Current plan
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSelect}
          disabled={isProcessing}
          className={
            isFree
              ? 'border border-hero-panel-foreground/25 bg-transparent text-hero-panel-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/10'
              : 'bg-hero-panel-foreground text-hero-panel transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/90'
          }
        >
          {isProcessing && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {plan.ctaLabel}
          {!isFree && <ArrowRight className="size-4" aria-hidden="true" />}
        </Button>
      )}
    </SirilaGlassCard>
  )
}

export default PlanCard
