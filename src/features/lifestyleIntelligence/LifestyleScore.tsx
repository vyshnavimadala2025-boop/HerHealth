import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import type { MoodTrendResult, EnergyTrendResult } from '@/features/insights/types'
import type { ScoreDimension } from '@/features/lifestyleIntelligence/types'

const SCORE_DIMENSIONS: ScoreDimension[] = [
  { key: 'sleep-consistency', label: 'Sleep Consistency', tracked: false },
  { key: 'recovery', label: 'Recovery', tracked: false },
  { key: 'movement', label: 'Movement', tracked: false },
  { key: 'hydration', label: 'Hydration', tracked: false },
  { key: 'stress-balance', label: 'Stress Balance', tracked: false },
  { key: 'environmental-comfort', label: 'Environmental Comfort', tracked: false },
]

const RADIUS = 70
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface LifestyleScoreProps {
  status: 'loading' | 'ready' | 'error'
  consistencyScore: number
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
}

/**
 * "Lifestyle Balance" is the one genuinely real, whole-of-lifestyle
 * number HerHealth can honestly report today: the share of the last 30
 * days with a recorded check-in. The six requested sub-dimensions (sleep
 * consistency, recovery, movement, hydration, stress balance,
 * environmental comfort) have no tracked field yet, so they're shown as a
 * legend of what this score will incorporate as more tracking becomes
 * available — never blended in as if they were already measured.
 */
function LifestyleScore({ status, consistencyScore, moodTrend, energyTrend }: LifestyleScoreProps) {
  const offset = CIRCUMFERENCE - (consistencyScore / 100) * CIRCUMFERENCE

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifestyle Score</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div role="status" className="flex justify-center">
            <Skeleton className="size-44 rounded-full" />
          </div>
        )}

        {status !== 'loading' && (
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-around">
            <div className="relative flex size-44 shrink-0 items-center justify-center">
              <svg viewBox="0 0 160 160" className="size-44 -rotate-90">
                <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={offset}
                  className="transition-all duration-700 motion-reduce:transition-none"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display text-3xl text-foreground">{consistencyScore}%</span>
                <span className="text-caption text-muted-foreground">Check-In Consistency</span>
              </div>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-2.5">
              <p className="text-caption text-muted-foreground">
                Lifestyle Balance currently reflects your check-in consistency over the last 30
                days. It will incorporate the factors below as HerHealth adds tracking for them.
              </p>
              <div className="flex flex-wrap gap-2 text-caption text-muted-foreground">
                <span className="rounded-full bg-muted/50 px-2.5 py-1">Mood trend: {moodTrend}</span>
                <span className="rounded-full bg-muted/50 px-2.5 py-1">Energy trend: {energyTrend}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {SCORE_DIMENSIONS.map((dimension) => (
                  <li key={dimension.key} className="flex items-center justify-between text-caption">
                    <span className="text-foreground">{dimension.label}</span>
                    <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-muted-foreground">
                      Not yet tracked
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LifestyleScore
