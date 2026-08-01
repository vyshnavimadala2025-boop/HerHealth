import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { EnergyTrendResult, MoodTrendResult } from '@/features/insights/types'

function trendDescription(kind: 'mood' | 'energy', trend: MoodTrendResult | EnergyTrendResult) {
  if (trend !== 'Limited data') return null
  return kind === 'mood'
    ? 'Complete more check-ins to understand your personal mood pattern.'
    : 'Complete more check-ins to understand your personal energy pattern.'
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
        <CardTitle>Your Trends</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your trends…
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your trends.</p>
        )}

        {status === 'ready' && (
          <div className="flex flex-col gap-3">
            <div>
              <p>
                Mood trend: <span className="font-medium">{moodTrend}</span>
              </p>
              {moodNote && <p className="text-caption text-muted-foreground">{moodNote}</p>}
            </div>
            <div>
              <p>
                Energy trend: <span className="font-medium">{energyTrend}</span>
              </p>
              {energyNote && <p className="text-caption text-muted-foreground">{energyNote}</p>}
            </div>
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
