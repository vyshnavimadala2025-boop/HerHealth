import { Activity, ClipboardCheck, UserPlus, Users, type LucideIcon } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import Skeleton from '@/components/shared/Skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAdminOverviewMetrics } from '@/features/admin/overview/useAdminOverviewMetrics'

interface OverviewCard {
  key: string
  icon: LucideIcon
  label: string
  value: string | null
  caption: string
}

/**
 * Admin Phase 2 dashboard. Every number here comes from
 * public.admin_overview_metrics() (an admin-gated RPC) — nothing is
 * fabricated, and no individual user row or health content is ever
 * fetched by this page. See supabase/migrations/0020_admin_overview_metrics.sql
 * for exactly what each figure means and how it's computed.
 */
function AdminOverviewPage() {
  const { status, metrics, refresh } = useAdminOverviewMetrics()

  const onboardingPercent =
    metrics && metrics.onboardingTotal > 0
      ? Math.round((metrics.onboardingCompleted / metrics.onboardingTotal) * 100)
      : null

  const cards: OverviewCard[] = [
    {
      key: 'total-users',
      icon: Users,
      label: 'Total Users',
      value: metrics ? metrics.totalUsers.toLocaleString() : null,
      caption: 'Registered accounts.',
    },
    {
      key: 'new-users',
      icon: UserPlus,
      label: 'New Users',
      value: metrics ? metrics.newUsers7d.toLocaleString() : null,
      caption: 'Registered in the last 7 days.',
    },
    {
      key: 'onboarding',
      icon: ClipboardCheck,
      label: 'Onboarding Completion',
      value: onboardingPercent !== null ? `${onboardingPercent}%` : metrics ? 'Not available yet' : null,
      caption: metrics
        ? `${metrics.onboardingCompleted.toLocaleString()} of ${metrics.onboardingTotal.toLocaleString()} users completed onboarding.`
        : 'Share of users who finished onboarding.',
    },
    {
      key: 'active-users',
      icon: Activity,
      label: 'Active Users',
      value: metrics ? metrics.activeUsers7d.toLocaleString() : null,
      caption: 'Users with at least one daily check-in in the last 7 days.',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="A privacy-conscious, operational snapshot of the platform."
        captions={[
          'This is an operational dashboard, not a medical-record viewer — individual health records are never shown here.',
        ]}
      />

      {status === 'error' && (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-start gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p role="alert" className="text-sm text-foreground">
              Couldn&rsquo;t load platform metrics right now.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={refresh}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      <div
        role="status"
        aria-live="polite"
        aria-busy={status === 'loading'}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {status === 'loading' && <span className="sr-only">Loading platform metrics…</span>}
        {cards.map((card) => (
          <Card key={card.key} className="gap-4 py-5">
            <CardContent className="flex flex-col gap-3 px-5">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <card.icon className="size-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                  {card.label}
                </p>
                {status === 'loading' ? (
                  <Skeleton className="h-8 w-20" />
                ) : status === 'error' ? (
                  <p className="text-sm font-medium text-muted-foreground">Unavailable</p>
                ) : (
                  <p className="text-heading font-display text-foreground">{card.value}</p>
                )}
              </div>
              <p className="text-caption text-muted-foreground">{card.caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminOverviewPage
