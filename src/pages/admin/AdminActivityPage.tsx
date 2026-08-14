import {
  Activity,
  ClipboardList,
  Grid2x2,
  Info,
  Repeat,
  UserPlus,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import MiniTrendChart from '@/components/shared/MiniTrendChart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminActivity } from '@/features/admin/activity/useAdminActivity'
import {
  ACTIVITY_CATEGORIES,
  UNTRACKED_ACTIVITY_TYPES,
  describeActivityEvent,
  type ActivityCategory,
} from '@/features/admin/activity/types'
import { USAGE_PERIODS, TRACKED_FEATURE_COUNT, type UsagePeriod } from '@/features/admin/featureUsage/types'

interface KpiCard {
  key: string
  icon: LucideIcon
  label: string
  value: string | null
  caption: string
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function PeriodSelector({ value, onChange }: { value: UsagePeriod; onChange: (value: UsagePeriod) => void }) {
  return (
    <div role="group" aria-label="Activity period" className="flex flex-wrap gap-1.5">
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

/**
 * Admin Phase 3D — Activity Monitor. This is an observability page, not a
 * health-record viewer: every event shown proves only that a user SAVED
 * something (or registered / finished onboarding), never what page they
 * opened or how long they stayed — the app records neither. See
 * supabase/migrations/0026_admin_activity_monitor.sql for the exact
 * confirmed/inferred/untracked breakdown this page is built on.
 *
 * Active Users and Features Used are read from Phase 3B's
 * admin_feature_usage_summary(); Returning Users from Phase 3C's
 * admin_overview_extended_metrics(); New Users is the client-side sum of
 * Phase 3C's admin_user_growth_trend() series; Activity by Feature reuses
 * Phase 3B's admin_feature_usage_breakdown() as-is. None of these are
 * re-derived in this phase's own migration.
 */
function AdminActivityPage() {
  const { period, setPeriod, status, byType, trend, feed, featureSummary, featureBreakdown, extended, newUsersPeriod, refresh } =
    useAdminActivity()

  const totalActivityEvents = byType.reduce((sum, row) => sum + row.eventCount, 0)
  const byTypeMap = new Map(byType.map((row) => [row.category, row.eventCount]))

  const kpiCards: KpiCard[] = [
    {
      key: 'active-users',
      icon: Activity,
      label: 'Active Users',
      value: status === 'ready' && featureSummary ? featureSummary.activeUsersPeriod.toLocaleString() : status === 'error' ? 'Unavailable' : null,
      caption: 'At least one daily check-in in the selected period.',
    },
    {
      key: 'activity-events',
      icon: Zap,
      label: 'Activity Events',
      value: status === 'ready' ? totalActivityEvents.toLocaleString() : status === 'error' ? 'Unavailable' : null,
      caption: 'Confirmed platform events across all tracked sources.',
    },
    {
      key: 'new-users',
      icon: UserPlus,
      label: 'New Users',
      value: status === 'ready' && newUsersPeriod !== null ? newUsersPeriod.toLocaleString() : status === 'error' ? 'Unavailable' : null,
      caption: 'Registered in the selected period.',
    },
    {
      key: 'returning-users',
      icon: Repeat,
      label: 'Returning Users',
      value: status === 'ready' && extended ? extended.returningUsersPeriod.toLocaleString() : status === 'error' ? 'Unavailable' : null,
      caption: 'Active in this period and the equal-length period before it.',
    },
    {
      key: 'features-used',
      icon: Grid2x2,
      label: 'Features Used',
      value: status === 'ready' && featureSummary ? `${featureSummary.featuresWithAdoption} of ${TRACKED_FEATURE_COUNT}` : status === 'error' ? 'Unavailable' : null,
      caption: 'Tracked features with at least one user, all-time.',
    },
  ]

  const maxTrendValue = Math.max(1, ...trend.map((point) => point.activityCount))
  const trendPoints = trend.map((point) => ({ label: formatDate(point.bucketDate), value: point.activityCount }))
  const hasTrendActivity = trend.some((point) => point.activityCount > 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Activity"
        description="What's happening on the SIRILA platform, in aggregate."
        captions={[
          'An operational observability view, not a health-record viewer — every event here proves a save, a registration, or an onboarding completion, never what a user viewed or how long they stayed.',
        ]}
      />

      <PeriodSelector value={period} onChange={setPeriod} />

      {status === 'error' && (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-start gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p role="alert" className="text-sm text-foreground">
              We couldn&rsquo;t load platform activity.
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
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        {status === 'loading' && <span className="sr-only">Loading activity…</span>}
        {kpiCards.map((card) => (
          <Card key={card.key} className="gap-4 py-5">
            <CardContent className="flex flex-col gap-3 px-5">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <card.icon className="size-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{card.label}</p>
                {card.value === null ? <Skeleton className="h-8 w-20" /> : <p className="text-heading font-display text-foreground">{card.value}</p>}
              </div>
              <p className="text-caption text-muted-foreground">{card.caption}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div role="status">
              <span className="sr-only">Loading activity trend…</span>
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          )}
          {status === 'ready' && !hasTrendActivity && <p className="text-sm text-muted-foreground">Not enough activity data yet for this period.</p>}
          {status === 'ready' && hasTrendActivity && (
            <MiniTrendChart points={trendPoints} maxValue={maxTrendValue} ariaLabel={`Daily platform activity over the last ${period} days`} />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'loading' && <Skeleton className="h-56 w-full rounded-xl" />}
            {status === 'ready' && feed.length === 0 && (
              <EmptyState icon={ClipboardList} title="No activity recorded" description="No platform activity recorded for this period." />
            )}
            {status === 'ready' && feed.length > 0 && (
              <ul className="flex flex-col gap-2">
                {feed.map((event, index) => (
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Activity by Feature</CardTitle>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link to="/admin/feature-usage">View Feature Usage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {status === 'loading' && <Skeleton className="h-56 w-full rounded-xl" />}
            {status === 'ready' && featureBreakdown.length === 0 && (
              <EmptyState icon={Grid2x2} title="No feature activity" description="No tracked feature has any recorded activity yet." />
            )}
            {status === 'ready' && featureBreakdown.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-caption font-medium tracking-wide text-muted-foreground uppercase">
                      <th scope="col" className="py-2 pr-3">
                        Feature
                      </th>
                      <th scope="col" className="py-2 pr-3">
                        Activity
                      </th>
                      <th scope="col" className="py-2">
                        Users
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureBreakdown.map((row) => (
                      <tr key={row.featureKey} className="border-b border-border last:border-b-0">
                        <td className="py-2 pr-3 font-medium text-foreground">{row.featureLabel}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{row.totalRecords.toLocaleString()} all-time</td>
                        <td className="py-2 text-muted-foreground">{row.usersThisPeriod.toLocaleString()} this period</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity by Type</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'loading' && <Skeleton className="h-32 w-full rounded-xl" />}
          {status === 'ready' && (
            <>
              <ul className="flex flex-col gap-2">
                {ACTIVITY_CATEGORIES.map((category: ActivityCategory) => (
                  <li key={category} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{category}</span>
                    <Badge variant="outline" className="text-muted-foreground">
                      {(byTypeMap.get(category) ?? 0).toLocaleString()} events
                    </Badge>
                  </li>
                ))}
              </ul>

              <details className="rounded-xl border border-dashed border-border p-4 text-caption text-muted-foreground">
                <summary className="cursor-pointer font-medium text-foreground">{UNTRACKED_ACTIVITY_TYPES.length} activity types not currently tracked</summary>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {UNTRACKED_ACTIVITY_TYPES.map((item) => (
                    <li key={item.label} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                      <span className="font-medium text-foreground">{item.label}:</span>
                      <span>{item.reason}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-caption text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Activity reflects platform usage only — it is not a measure of health, wellbeing, or medical compliance,
          and no individual user is identified anywhere on this page.
        </p>
      </div>
    </div>
  )
}

export default AdminActivityPage
