import { Brain, Gauge, Moon, Salad, Target } from 'lucide-react'
import NextStepTile from '@/components/shared/NextStepTile'
import { useSleepData } from '@/features/sleepIntelligence/useSleepData'
import { calculateSleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import { useNutritionData } from '@/features/nutritionCompanion/useNutritionData'
import { calculateNutritionSummary } from '@/features/nutritionCompanion/nutritionCalculations'
import { useStressRecoveryData } from '@/features/stressRecovery/useStressRecoveryData'
import { calculateStressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'
import { useHealthTrendsData } from '@/features/insights/useHealthTrendsData'
import { useGoalsData } from '@/features/goals/useGoalsData'
import { describeTrackedFactor } from '@/components/shared/dataStateText'
import { getLocalDateString } from '@/features/periods/dateUtils'

/**
 * "Your Wellness Journey" — the Dashboard's one real-data preview of the
 * five product areas that previously had zero presence on this page:
 * Sleep, Nutrition, Stress & Recovery, Wellness Score, and Goals. Every
 * value below is composed from an already-existing hook and calculation
 * function (Stage 3/4C2/2 respectively) — no new calculation engine, no
 * new Supabase query shape. Reuses NextStepTile (already the Dashboard's
 * compact preview-tile primitive) and describeTrackedFactor() (Phase 1's
 * shared loading/unavailable/insufficient-data/ready text helper) so each
 * tile honestly distinguishes those four states instead of ever showing a
 * fabricated zero.
 */
function WellnessJourneySnapshot() {
  const today = getLocalDateString()

  const sleepData = useSleepData()
  const sleepSummary = calculateSleepSummary(sleepData.entries, today)
  const sleep = describeTrackedFactor(
    sleepData.status,
    sleepSummary.hasSufficientData && sleepSummary.qualityTrend !== 'Limited data',
    `Quality trend: ${sleepSummary.qualityTrend}`,
    'Sleep Intelligence',
  )

  const nutritionData = useNutritionData()
  const nutritionSummary = calculateNutritionSummary(nutritionData.entries, today)
  const nutrition = describeTrackedFactor(
    nutritionData.status,
    nutritionSummary.hasSufficientData,
    `${nutritionSummary.totalMealsLogged} meals logged this month`,
    'Nutrition Companion',
  )

  const stressRecoveryData = useStressRecoveryData()
  const stressRecoverySummary = calculateStressRecoverySummary(stressRecoveryData.entries, today)
  const stressRecovery = describeTrackedFactor(
    stressRecoveryData.status,
    stressRecoverySummary.hasSufficientData && stressRecoverySummary.stressTrend !== 'Limited data',
    `Stress trend: ${stressRecoverySummary.stressTrend}`,
    'Stress & Recovery',
  )

  const trends = useHealthTrendsData('30d')
  const scoredBuckets = trends.buckets.filter((bucket) => bucket.wellnessScore !== null)
  const currentBucket = scoredBuckets[scoredBuckets.length - 1] ?? trends.buckets[trends.buckets.length - 1]
  const wellnessScore = describeTrackedFactor(
    trends.status,
    currentBucket?.wellnessScore !== null && currentBucket?.wellnessScore !== undefined,
    `Current score: ${currentBucket?.wellnessScore ?? ''}/100`,
    'Wellness Score',
  )

  const goalsData = useGoalsData()
  const activeGoalCount = goalsData.goals.filter((goal) => goal.status === 'active').length
  const goalsDescription =
    goalsData.status === 'loading'
      ? 'Loading…'
      : goalsData.status === 'error'
        ? 'Goal information is temporarily unavailable'
        : activeGoalCount > 0
          ? `${activeGoalCount} active goal${activeGoalCount === 1 ? '' : 's'}`
          : 'No goals yet — create one'

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg text-foreground">Your Wellness Journey</h2>
        <p className="text-caption text-muted-foreground">
          A snapshot of what you&apos;ve recorded across HerHealth this month.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <NextStepTile
          icon={Moon}
          label="Sleep"
          description={sleep.statusText}
          href="/sleep-intelligence"
          isLoading={sleepData.status === 'loading'}
          accentClassName="bg-lavender text-lavender-foreground"
        />
        <NextStepTile
          icon={Salad}
          label="Nutrition"
          description={nutrition.statusText}
          href="/nutrition-companion"
          isLoading={nutritionData.status === 'loading'}
          accentClassName="bg-support text-support-foreground"
        />
        <NextStepTile
          icon={Brain}
          label="Stress & Recovery"
          description={stressRecovery.statusText}
          href="/stress-recovery"
          isLoading={stressRecoveryData.status === 'loading'}
          accentClassName="bg-blush text-blush-foreground"
        />
        <NextStepTile
          icon={Gauge}
          label="Wellness Score"
          description={wellnessScore.statusText}
          href="/wellness-score"
          isLoading={trends.status === 'loading'}
          accentClassName="bg-accent text-accent-foreground"
        />
        <NextStepTile
          icon={Target}
          label="Goals"
          description={goalsDescription}
          href="/goals"
          isLoading={goalsData.status === 'loading'}
          accentClassName="bg-primary/10 text-primary"
        />
      </div>
    </section>
  )
}

export default WellnessJourneySnapshot
