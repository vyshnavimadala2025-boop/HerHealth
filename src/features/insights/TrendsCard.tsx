import { TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import type { EnergyTrendResult, MoodTrendResult } from '@/features/insights/types'

function trendDescription(kind: 'mood' | 'energy', trend: MoodTrendResult | EnergyTrendResult) {
  if (trend !== 'Limited data') return null
  return kind === 'mood'
    ? 'Complete more check-ins to understand your personal mood pattern.'
    : 'Complete more check-ins to understand your personal energy pattern.'
}

function trendBadgeClassName(trend: MoodTrendResult | EnergyTrendResult) {
  if (trend === 'Improving') return 'bg-support text-support-foreground'
  if (trend === 'Stable') return 'bg-lavender text-lavender-foreground'
  if (trend === 'Mixed' || trend === 'Decreasing') return 'bg-attention text-attention-foreground'
  return 'bg-muted text-muted-foreground'
}

interface TrendsCardProps {
  status: 'loading' | 'ready' | 'error'
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
}

function TrendsCard({ status, moodTrend, energyTrend }: TrendsCardProps) {
  const moodNote = trendDescription('mood', moodTrend)
  const energyNote = trendDescription('energy', energyTrend)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-blush text-blush-foreground">
            <TrendingUp className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Your Trends</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-40" />
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your trends.</p>
        )}

        {status === 'ready' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Mood trend</span>
              <Badge className={trendBadgeClassName(moodTrend)}>{moodTrend}</Badge>
            </div>
            {moodNote && <p className="text-caption text-muted-foreground">{moodNote}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Energy trend</span>
              <Badge className={trendBadgeClassName(energyTrend)}>{energyTrend}</Badge>
            </div>
            {energyNote && <p className="text-caption text-muted-foreground">{energyNote}</p>}
            <p className="text-caption text-muted-foreground">
              This is based only on your recorded information.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TrendsCard
