import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import type { MoodTrendResult, EnergyTrendResult } from '@/features/insights/types'
import type { SourceStatus } from '@/components/shared/dataStateText'
import { describeTrackedFactor, capitalize } from '@/components/shared/dataStateText'
import type { SleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import type { NutritionSummary } from '@/features/nutritionCompanion/nutritionCalculations'
import type { StressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'
import { cn } from '@/lib/utils'

const RADIUS = 70
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface LifestyleScoreProps {
  status: 'loading' | 'ready' | 'error'
  consistencyScore: number
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
  sleepStatus: SourceStatus
  sleepSummary: SleepSummary
  nutritionStatus: SourceStatus
  nutritionSummary: NutritionSummary
  stressRecoveryStatus: SourceStatus
  stressRecoverySummary: StressRecoverySummary
}

/**
 * "Lifestyle Balance" is still the one genuinely real, whole-of-lifestyle
 * number HerHealth reports — the share of the last 30 days with a
 * recorded check-in, via the unmodified calculateConsistencyScore(). The
 * dimensions legend below it now reflects real Sleep/Nutrition/Stress &
 * Recovery data where it exists (Stage 4C2) instead of a blanket "not yet
 * tracked" — but the score itself is untouched: no new scoring model, no
 * blending of these dimensions into the number or ring.
 */
function LifestyleScore({
  status,
  consistencyScore,
  moodTrend,
  energyTrend,
  sleepStatus,
  sleepSummary,
  nutritionStatus,
  nutritionSummary,
  stressRecoveryStatus,
  stressRecoverySummary,
}: LifestyleScoreProps) {
  const offset = CIRCUMFERENCE - (consistencyScore / 100) * CIRCUMFERENCE

  const sleepConsistency = describeTrackedFactor(
    sleepStatus,
    sleepSummary.hasSufficientData,
    `${sleepSummary.consistencyPercent}% of nights logged`,
    '',
  )
  const hydration = describeTrackedFactor(
    nutritionStatus,
    nutritionSummary.hasSufficientData && nutritionSummary.avgHydrationGlasses !== null,
    `Avg ${nutritionSummary.avgHydrationGlasses} glasses/day`,
    '',
  )
  const stressBalance = describeTrackedFactor(
    stressRecoveryStatus,
    stressRecoverySummary.hasSufficientData,
    `Trending ${stressRecoverySummary.stressTrend.toLowerCase()}`,
    '',
  )
  const recovery = describeTrackedFactor(
    stressRecoveryStatus,
    stressRecoverySummary.hasSufficientData && stressRecoverySummary.recentRecoveryLevel !== null,
    `${capitalize(stressRecoverySummary.recentRecoveryLevel ?? '')}, trending ${stressRecoverySummary.recoveryTrend.toLowerCase()}`,
    '',
  )

  const dimensions = [
    { key: 'sleep-consistency', label: 'Sleep Consistency', tracked: true, valueText: sleepConsistency.statusText },
    { key: 'recovery', label: 'Recovery', tracked: true, valueText: recovery.statusText },
    { key: 'movement', label: 'Movement', tracked: false, valueText: 'Not yet tracked' },
    { key: 'hydration', label: 'Hydration', tracked: true, valueText: hydration.statusText },
    { key: 'stress-balance', label: 'Stress Balance', tracked: true, valueText: stressBalance.statusText },
    { key: 'environmental-comfort', label: 'Environmental Comfort', tracked: false, valueText: 'Not yet tracked' },
  ]

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
                days. The factors below are shown for awareness and aren&apos;t blended into this
                score.
              </p>
              <div className="flex flex-wrap gap-2 text-caption text-muted-foreground">
                <span className="rounded-full bg-muted/50 px-2.5 py-1">Mood trend: {moodTrend}</span>
                <span className="rounded-full bg-muted/50 px-2.5 py-1">Energy trend: {energyTrend}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {dimensions.map((dimension) => (
                  <li key={dimension.key} className="flex items-center justify-between text-caption">
                    <span className="text-foreground">{dimension.label}</span>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5',
                        dimension.tracked
                          ? 'border-transparent bg-accent/40 text-foreground'
                          : 'border-dashed border-border text-muted-foreground',
                      )}
                    >
                      {dimension.valueText}
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
