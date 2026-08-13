import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Baby,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock,
  Database,
  Gauge,
  Grid2x2,
  Lightbulb,
  Repeat,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import MiniTrendChart from '@/components/shared/MiniTrendChart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminOverviewMetrics } from '@/features/admin/overview/useAdminOverviewMetrics'
import { useAdminOverviewExtended } from '@/features/admin/overview/useAdminOverviewExtended'
import { describeActivityEvent, OVERVIEW_PERIODS, type OverviewPeriod } from '@/features/admin/overview/overviewExtendedTypes'
import { LOWER_ADOPTION_THRESHOLD, MIN_USERS_FOR_OPPORTUNITIES, TRACKED_FEATURE_COUNT } from '@/features/admin/featureUsage/types'

interface OverviewCard {
  key: string
  icon: LucideIcon
  label: string
  value: string | null
  caption: string
  unavailable?: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function PeriodSelector({ value, onChange }: { value: OverviewPeriod; onChange: (value: OverviewPeriod) => void }) {
  return (
    <div role="group" aria-label="Overview period" className="flex flex-wrap gap-1.5">
      {OVERVIEW_PERIODS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? 'default' : 'outline'}
          size="sm"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}

function KpiGrid({ cards, status }: { cards: OverviewCard[]; status: 'loading' | 'ready' | 'error' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={status === 'loading'}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {status === 'loading' && <span className="sr-only">Loading platform metrics…</span>}
      {cards.map((card) => (
        <Card key={card.key} className="gap-4 py-5">
          <CardContent className="flex flex-col gap-3 px-5">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <card.icon className="size-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{card.label}</p>
              {card.value === null && !card.unavailable ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-heading font-display text-foreground">{card.value ?? 'Unavailable'}</p>
              )}
            </div>
            <p className="text-caption text-muted-foreground">{card.caption}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Admin Phase 3C — Overview upgrade. The original Phase 2 KPI row (Total
 * Users, New Users, Onboarding Completion, Active Users) is unchanged, both
 * in logic and in the RPC it calls (public.admin_overview_metrics(), 0020,
 * not touched this phase) — those four figures always reflect a fixed
 * 7-day window regardless of the new period selector below, since that RPC
 * isn't parameterized and this phase does not modify Phase 2's migration.
 * Every new section reuses either the new 0025 RPCs or, for feature
 * adoption/engagement, the existing Phase 3B RPCs (0024) via their already
 * -exported service functions — nothing here re-derives a number Phase
 * 2 or 3B already computes.
 */
function AdminOverviewPage() {
  const { status: metricsStatus, metrics, refresh: refreshMetrics } = useAdminOverviewMetrics()
  const {
    period,
    setPeriod,
    status: extendedStatus,
    extended,
    growth,
    activity,
    featureSummary,
    featureBreakdown,
    refresh: refreshExtended,
  } = useAdminOverviewExtended()

  const onboardingPercent =
    metrics && metrics.onboardingTotal > 0 ? Math.round((metrics.onboardingCompleted / metrics.onboardingTotal) * 100) : null

  const kpiCards: OverviewCard[] = [
    {
      key: 'total-users',
      icon: Users,
      label: 'Total Users',
      value: metricsStatus === 'ready' && metrics ? metrics.totalUsers.toLocaleString() : metricsStatus === 'error' ? 'Unavailable' : null,
      caption: 'Registered accounts.',
      unavailable: metricsStatus === 'error',
    },
    {
      key: 'new-users',
      icon: UserPlus,
      label: 'New Users',
      value: metricsStatus === 'ready' && metrics ? metrics.newUsers7d.toLocaleString() : metricsStatus === 'error' ? 'Unavailable' : null,
      caption: 'Registered in the last 7 days (fixed window).',
      unavailable: metricsStatus === 'error',
    },
    {
      key: 'active-users',
      icon: Activity,
      label: 'Active Users',
      value: metricsStatus === 'ready' && metrics ? metrics.activeUsers7d.toLocaleString() : metricsStatus === 'error' ? 'Unavailable' : null,
      caption: 'At least one daily check-in in the last 7 days (fixed window).',
      unavailable: metricsStatus === 'error',
    },
    {
      key: 'onboarding',
      icon: ClipboardCheck,
      label: 'Onboarding Completion',
      value:
        metricsStatus === 'ready'
          ? onboardingPercent !== null
            ? `${onboardingPercent}%`
            : 'Not available yet'
          : metricsStatus === 'error'
            ? 'Unavailable'
            : null,
      caption: metrics
        ? `${metrics.onboardingCompleted.toLocaleString()} of ${metrics.onboardingTotal.toLocaleString()} users completed onboarding.`
        : 'Share of users who finished onboarding.',
      unavailable: metricsStatus === 'error',
    },
    {
      key: 'features-used',
      icon: Grid2x2,
      label: 'Features Used',
      value:
        extendedStatus === 'ready' && featureSummary
          ? `${featureSummary.featuresWithAdoption} of ${TRACKED_FEATURE_COUNT}`
          : extendedStatus === 'error'
            ? 'Unavailable'
            : null,
      caption: 'Tracked features with at least one user, all-time. See Feature Usage for detail.',
      unavailable: extendedStatus === 'error',
    },
    {
      key: 'overall-engagement',
      icon: Sparkles,
      label: 'Overall Engagement',
      value:
        extendedStatus === 'ready' && featureSummary?.avgFeaturesPerEngagedUser != null
          ? featureSummary.avgFeaturesPerEngagedUser.toFixed(1)
          : extendedStatus === 'error'
            ? 'Unavailable'
            : extendedStatus === 'ready'
              ? 'Not enough data yet'
              : null,
      caption: 'Avg. tracked features per engaged user, selected period.',
      unavailable: extendedStatus === 'error',
    },
  ]

  const extendedCards: OverviewCard[] = [
    {
      key: 'wellness-records',
      icon: Database,
      label: 'Total Wellness Data Records',
      value:
        extendedStatus === 'ready' && extended ? extended.totalWellnessRecords.toLocaleString() : extendedStatus === 'error' ? 'Unavailable' : null,
      caption: 'All-time entries saved across every tracked feature.',
      unavailable: extendedStatus === 'error',
    },
    {
      key: 'pregnancy-journeys',
      icon: Baby,
      label: 'Active Pregnancy Journeys',
      value:
        extendedStatus === 'ready' && extended
          ? extended.activePregnancyJourneys.toLocaleString()
          : extendedStatus === 'error'
            ? 'Unavailable'
            : null,
      caption: 'Baby Growth profiles with a due date that hasn’t passed yet.',
      unavailable: extendedStatus === 'error',
    },
    {
      key: 'feedback',
      icon: ClipboardCheck,
      label: 'Feedback / Issues',
      value: 'Not available',
      caption: 'Feedback system not yet built (Admin Phase 3E).',
      unavailable: false,
    },
    {
      key: 'recent-activity-count',
      icon: Clock,
      label: 'Recent Activity',
      value: extendedStatus === 'ready' ? activity.length.toLocaleString() : extendedStatus === 'error' ? 'Unavailable' : null,
      caption: 'Registration and onboarding-completion events shown below.',
      unavailable: extendedStatus === 'error',
    },
  ]

  const maxGrowthValue = Math.max(1, ...growth.map((point) => point.newUsers))
  const growthPoints = growth.map((point) => ({ label: formatDate(point.bucketDate), value: point.newUsers }))
  const hasGrowthActivity = growth.some((point) => point.newUsers > 0)

  const growthTrendSummary = (() => {
    if (growth.length < 2) return null
    const midpoint = Math.floor(growth.length / 2)
    const firstHalf = growth.slice(0, midpoint).reduce((sum, point) => sum + point.newUsers, 0)
    const secondHalf = growth.slice(midpoint).reduce((sum, point) => sum + point.newUsers, 0)
    if (secondHalf > firstHalf) return { label: 'Rising', icon: TrendingUp }
    if (secondHalf < firstHalf) return { label: 'Falling', icon: TrendingDown }
    return { label: 'Steady', icon: Gauge }
  })()

  const topFeatures = featureBreakdown.slice(0, 3)
  const lowestFeatures = [...featureBreakdown].filter((row) => row.usersEver > 0).slice(-3).reverse()

  const lowOnboarding = metrics && metrics.onboardingTotal >= MIN_USERS_FOR_OPPORTUNITIES && onboardingPercent !== null && onboardingPercent < 50
  const lowAdoptionFeatures =
    extended && metrics && metrics.totalUsers >= MIN_USERS_FOR_OPPORTUNITIES
      ? featureBreakdown.filter((row) => (row.adoptionPercentage ?? 0) < LOWER_ADOPTION_THRESHOLD)
      : []
  const insufficientHistory = metrics ? metrics.totalUsers < MIN_USERS_FOR_OPPORTUNITIES : false
  const noRecentActivity = extendedStatus === 'ready' && activity.length === 0

  const opportunities = [
    lowOnboarding
      ? { key: 'onboarding', text: `Onboarding completion is below 50% (${onboardingPercent}%) — lower platform adoption of the onboarding flow.` }
      : null,
    ...lowAdoptionFeatures.map((row) => ({
      key: `feature-${row.featureKey}`,
      text: `${row.featureLabel} has lower platform adoption (${row.adoptionPercentage}%).`,
    })),
    insufficientHistory
      ? { key: 'insufficient', text: 'Not enough platform data yet to draw reliable adoption conclusions.' }
      : null,
    noRecentActivity ? { key: 'no-activity', text: 'No recent registration or onboarding activity recorded.' } : null,
  ].filter((item): item is { key: string; text: string } => item !== null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="A privacy-conscious, operational snapshot of the platform."
        captions={[
          'This is an operational dashboard, not a medical-record viewer — individual health records are never shown here.',
        ]}
      />

      {metricsStatus === 'error' && (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-start gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p role="alert" className="text-sm text-foreground">
              Couldn&rsquo;t load platform metrics right now.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={refreshMetrics}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      <KpiGrid cards={kpiCards} status={metricsStatus} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-medium text-foreground">User Growth &amp; Onboarding</h2>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {extendedStatus === 'error' && (
          <Card className="border-destructive/30">
            <CardContent className="flex flex-col items-start gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <p role="alert" className="text-sm text-foreground">
                We couldn&rsquo;t load platform activity.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={refreshExtended}>
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              {extendedStatus === 'loading' && (
                <div role="status">
                  <span className="sr-only">Loading user growth…</span>
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              )}
              {extendedStatus === 'ready' && !hasGrowthActivity && (
                <p className="text-sm text-muted-foreground">Not enough data yet for this period.</p>
              )}
              {extendedStatus === 'ready' && hasGrowthActivity && (
                <MiniTrendChart points={growthPoints} maxValue={maxGrowthValue} ariaLabel={`New registrations over the last ${period} days`} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Onboarding Health</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {metricsStatus === 'loading' && <Skeleton className="h-20 w-full rounded-xl" />}
              {metricsStatus === 'ready' && metrics && (
                <>
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                      Completed
                    </span>
                    <span className="text-muted-foreground">
                      {metrics.onboardingCompleted.toLocaleString()}
                      {onboardingPercent !== null ? ` (${onboardingPercent}%)` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <Circle className="size-4 text-muted-foreground" aria-hidden="true" />
                      Incomplete
                    </span>
                    <span className="text-muted-foreground">
                      {(metrics.onboardingTotal - metrics.onboardingCompleted).toLocaleString()}
                      {onboardingPercent !== null ? ` (${100 - onboardingPercent}%)` : ''}
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Shown as two states, not three — the schema records only whether onboarding finished, with no
                    signal to honestly separate "in progress" from "not started".
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Feature Adoption Snapshot</CardTitle>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/admin/feature-usage">View Feature Usage</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {extendedStatus === 'loading' && <Skeleton className="h-32 w-full rounded-xl" />}
            {extendedStatus === 'ready' && topFeatures.length === 0 && (
              <EmptyState icon={Grid2x2} title="No feature usage yet" description="No tracked feature has any recorded activity yet." />
            )}
            {extendedStatus === 'ready' && topFeatures.length > 0 && (
              <>
                <div className="flex flex-col gap-2">
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Top Used</p>
                  {topFeatures.map((row) => (
                    <div key={row.featureKey} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <Star className="size-3.5 text-primary" aria-hidden="true" />
                        {row.featureLabel}
                      </span>
                      <span className="text-muted-foreground">{row.adoptionPercentage != null ? `${row.adoptionPercentage}%` : 'Not available'}</span>
                    </div>
                  ))}
                </div>
                {lowestFeatures.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Lowest Adoption</p>
                    {lowestFeatures.map((row) => (
                      <div key={row.featureKey} className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-sm">
                        <span className="font-medium text-foreground">{row.featureLabel}</span>
                        <span className="text-muted-foreground">{row.adoptionPercentage != null ? `${row.adoptionPercentage}%` : 'Not available'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {extendedStatus === 'loading' && <Skeleton className="h-32 w-full rounded-xl" />}
            {extendedStatus === 'ready' && featureSummary && extended && (
              <>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Activity className="size-4 text-primary" aria-hidden="true" />
                    Active Users (selected period)
                  </span>
                  <span className="text-muted-foreground">{featureSummary.activeUsersPeriod.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Repeat className="size-4 text-primary" aria-hidden="true" />
                    Returning Users
                  </span>
                  <span className="text-muted-foreground">{extended.returningUsersPeriod.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Sparkles className="size-4 text-primary" aria-hidden="true" />
                    Avg. Features per Engaged User
                  </span>
                  <span className="text-muted-foreground">
                    {featureSummary.avgFeaturesPerEngagedUser != null ? featureSummary.avgFeaturesPerEngagedUser.toFixed(1) : 'Not enough data yet'}
                  </span>
                </div>
                {growthTrendSummary && (
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <growthTrendSummary.icon className="size-4 text-primary" aria-hidden="true" />
                      Registration Trend
                    </span>
                    <Badge variant="outline" className="text-muted-foreground">
                      {growthTrendSummary.label}
                    </Badge>
                  </div>
                )}
                <p className="text-caption text-muted-foreground">
                  &ldquo;Returning users&rdquo; means a user with a daily check-in in both the selected period and the
                  equal-length period immediately before it.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {extendedStatus === 'loading' && <Skeleton className="h-40 w-full rounded-xl" />}
            {extendedStatus === 'ready' && activity.length === 0 && (
              <EmptyState icon={Clock} title="No recent activity" description="No registration or onboarding activity recorded recently." />
            )}
            {extendedStatus === 'ready' && activity.length > 0 && (
              <ul className="flex flex-col gap-2">
                {activity.map((event, index) => (
                  <li key={`${event.eventType}-${event.occurredAt}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{describeActivityEvent(event.eventType)}</span>
                    <span className="text-caption whitespace-nowrap text-muted-foreground">{formatDateTime(event.occurredAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            {extendedStatus === 'loading' && <Skeleton className="h-40 w-full rounded-xl" />}
            {extendedStatus === 'ready' && opportunities.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing needs attention right now.</p>
            )}
            {extendedStatus === 'ready' && opportunities.length > 0 && (
              <ul className="flex flex-col gap-2">
                {opportunities.map((item) => (
                  <li key={item.key} className="flex items-start gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-attention-foreground" aria-hidden="true" />
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <KpiGrid cards={extendedCards} status={extendedStatus} />
      <div className="flex items-start gap-2 text-caption text-muted-foreground">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>All figures above are aggregate counts derived from existing platform data. None are estimated or fabricated.</p>
      </div>
    </div>
  )
}

export default AdminOverviewPage
