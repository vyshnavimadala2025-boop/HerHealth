import {
  Activity,
  Grid2x2,
  Lightbulb,
  Minus,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import MiniTrendChart from '@/components/shared/MiniTrendChart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAdminFeatureUsage } from '@/features/admin/featureUsage/useAdminFeatureUsage'
import {
  LOWER_ADOPTION_THRESHOLD,
  MIN_USERS_FOR_OPPORTUNITIES,
  TRACKED_FEATURE_COUNT,
  UNTRACKED_FEATURES,
  USAGE_PERIODS,
  type FeatureUsageBreakdownRow,
  type TrendDirection,
  type UsagePeriod,
} from '@/features/admin/featureUsage/types'

function PeriodSelector({ value, onChange }: { value: UsagePeriod; onChange: (value: UsagePeriod) => void }) {
  return (
    <div role="group" aria-label="Usage period" className="flex flex-wrap gap-1.5">
      {USAGE_PERIODS.map((option) => (
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

interface KpiCard {
  key: string
  icon: LucideIcon
  label: string
  value: string | null
  caption: string
}

function TrendBadge({ trend }: { trend: TrendDirection }) {
  if (trend === 'up') {
    return (
      <Badge className="gap-1 bg-support text-support-foreground">
        <TrendingUp className="size-3" aria-hidden="true" />
        Growing
      </Badge>
    )
  }
  if (trend === 'down') {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <TrendingDown className="size-3" aria-hidden="true" />
        Declining
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground/70">
      <Minus className="size-3" aria-hidden="true" />
      Steady
    </Badge>
  )
}

/**
 * Admin Phase 3B. Built on public.admin_feature_usage_summary(),
 * admin_feature_usage_breakdown(), and admin_feature_usage_trend()
 * (0024_admin_feature_usage.sql) — aggregate counts only, for the 9
 * HerHealth features that have a genuine backing table. The other 11
 * named features in the product surface are shown honestly as "Not
 * available" (see UNTRACKED_FEATURES) rather than fabricated.
 */
function AdminFeatureUsagePage() {
  const { period, setPeriod, status, summary, breakdown, trend, refresh } = useAdminFeatureUsage()

  const kpiCards: KpiCard[] = [
    {
      key: 'total-users',
      icon: Users,
      label: 'Total Users',
      value: summary ? summary.totalUsers.toLocaleString() : null,
      caption: 'Registered accounts.',
    },
    {
      key: 'active-users',
      icon: Activity,
      label: 'Active Users',
      value: summary ? summary.activeUsersPeriod.toLocaleString() : null,
      caption: `Users with at least one daily check-in in the selected period.`,
    },
    {
      key: 'features-used',
      icon: Grid2x2,
      label: 'Features Used',
      value: summary ? `${summary.featuresWithAdoption} of ${TRACKED_FEATURE_COUNT}` : null,
      caption: 'Tracked features with at least one user, all-time.',
    },
    {
      key: 'most-used',
      icon: Star,
      label: 'Most Used Feature',
      value: summary?.mostUsedFeatureLabel ?? null,
      caption: summary?.mostUsedFeatureUsers != null ? `${summary.mostUsedFeatureUsers.toLocaleString()} users, all-time.` : 'Highest all-time adoption.',
    },
    {
      key: 'avg-features',
      icon: Sparkles,
      label: 'Avg. Features per Engaged User',
      value: summary?.avgFeaturesPerEngagedUser != null ? summary.avgFeaturesPerEngagedUser.toFixed(1) : null,
      caption: 'Among users who touched at least one tracked feature this period.',
    },
  ]

  const maxTrendValue = Math.max(1, ...trend.map((point) => point.recordsCount))
  const trendPoints = trend.map((point) => ({
    label: new Date(point.bucketDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    value: point.recordsCount,
  }))
  const hasTrendActivity = trend.some((point) => point.recordsCount > 0)

  const lowerAdoption: FeatureUsageBreakdownRow[] =
    summary && summary.totalUsers >= MIN_USERS_FOR_OPPORTUNITIES
      ? breakdown.filter((row) => (row.adoptionPercentage ?? 0) < LOWER_ADOPTION_THRESHOLD)
      : []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Feature Usage"
        description="See which HerHealth features users are actually engaging with."
        captions={[
          'Aggregate statistics only — no individual health records, cycle dates, symptoms, or journal content are ever shown here.',
        ]}
      />

      <PeriodSelector value={period} onChange={setPeriod} />

      {status === 'error' && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="text-sm text-foreground">
            We couldn&rsquo;t load feature usage.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            Try again
          </Button>
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        aria-busy={status === 'loading'}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        {status === 'loading' && <span className="sr-only">Loading feature usage…</span>}
        {kpiCards.map((card) => (
          <Card key={card.key} className="gap-4 py-5">
            <CardContent className="flex flex-col gap-3 px-5">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <card.icon className="size-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{card.label}</p>
                {status === 'loading' ? (
                  <Skeleton className="h-8 w-20" />
                ) : status === 'error' ? (
                  <p className="text-sm font-medium text-muted-foreground">Unavailable</p>
                ) : (
                  <p className="text-heading font-display text-foreground">{card.value ?? 'Not available'}</p>
                )}
              </div>
              <p className="text-caption text-muted-foreground">{card.caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium text-foreground">Feature Adoption</h2>

        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <span className="sr-only">Loading feature adoption…</span>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        )}

        {status === 'ready' && breakdown.length === 0 && (
          <EmptyState icon={Grid2x2} title="No feature usage recorded" description="No tracked feature has any recorded activity yet." />
        )}

        {status === 'ready' && breakdown.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-caption font-medium tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="px-4 py-3">
                    Feature
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Users
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Adoption
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row) => (
                  <tr key={row.featureKey} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">{row.featureLabel}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.usersEver.toLocaleString()} users</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.adoptionPercentage != null ? `${row.adoptionPercentage}%` : 'Not available'}
                    </td>
                    <td className="px-4 py-3">
                      <TrendBadge trend={row.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <details className="rounded-xl border border-dashed border-border p-4 text-caption text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            {UNTRACKED_FEATURES.length} features not currently tracked
          </summary>
          <ul className="mt-3 flex flex-col gap-1.5">
            {UNTRACKED_FEATURES.map((feature) => (
              <li key={feature.key} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <span className="font-medium text-foreground">{feature.label}:</span>
                <span>{feature.reason}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium text-foreground">Usage Trend</h2>
        <Card>
          <CardContent className="py-5">
            {status === 'loading' && (
              <div role="status">
                <span className="sr-only">Loading usage trend…</span>
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            )}
            {status === 'ready' && !hasTrendActivity && (
              <p className="text-sm text-muted-foreground">Not enough usage data yet for this period.</p>
            )}
            {status === 'ready' && hasTrendActivity && (
              <MiniTrendChart
                points={trendPoints}
                maxValue={maxTrendValue}
                ariaLabel={`Daily feature activity over the last ${period} days`}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium text-foreground">Opportunities</h2>
        <Card>
          <CardContent className="flex flex-col gap-3 py-5">
            {!summary || summary.totalUsers < MIN_USERS_FOR_OPPORTUNITIES ? (
              <p className="text-sm text-muted-foreground">
                Not enough platform data yet to identify adoption opportunities.
              </p>
            ) : lowerAdoption.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tracked feature currently falls below {LOWER_ADOPTION_THRESHOLD}% adoption.
              </p>
            ) : (
              <>
                <div className="flex items-start gap-2 text-caption text-muted-foreground">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <p>Features below {LOWER_ADOPTION_THRESHOLD}% adoption — lower platform adoption, not a judgment on the feature.</p>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {lowerAdoption.map((row) => (
                    <li key={row.featureKey} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span className="font-medium text-foreground">{row.featureLabel}</span>
                      <span className="text-muted-foreground">{row.adoptionPercentage}% adoption</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default AdminFeatureUsagePage
