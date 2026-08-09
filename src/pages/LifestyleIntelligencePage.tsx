import { useState } from 'react'
import { useLifestyleIntelligenceData } from '@/features/lifestyleIntelligence/useLifestyleIntelligenceData'
import {
  generateLifestyleInsights,
  generateHabitRecommendations,
  generateWeeklyReflection,
} from '@/features/lifestyleIntelligence/lifestyleInsightEngine'
import type { TimelineRange } from '@/features/lifestyleIntelligence/lifestyleCalculations'
import { useSleepData } from '@/features/sleepIntelligence/useSleepData'
import { calculateSleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import { useNutritionData } from '@/features/nutritionCompanion/useNutritionData'
import { calculateNutritionSummary } from '@/features/nutritionCompanion/nutritionCalculations'
import { useStressRecoveryData } from '@/features/stressRecovery/useStressRecoveryData'
import { calculateStressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'
import { getLocalDateString } from '@/features/periods/dateUtils'
import LifestyleIntelligenceHero from '@/features/lifestyleIntelligence/LifestyleIntelligenceHero'
import TodaySnapshot from '@/features/lifestyleIntelligence/TodaySnapshot'
import EnvironmentalWellness from '@/features/lifestyleIntelligence/EnvironmentalWellness'
import LifestyleFactorsSection from '@/features/lifestyleIntelligence/LifestyleFactorsSection'
import LifestyleInsights from '@/features/lifestyleIntelligence/LifestyleInsights'
import EnvironmentalTimeline from '@/features/lifestyleIntelligence/EnvironmentalTimeline'
import HabitRecommendations from '@/features/lifestyleIntelligence/HabitRecommendations'
import LifestyleScore from '@/features/lifestyleIntelligence/LifestyleScore'
import LifestyleLearningCenter from '@/features/lifestyleIntelligence/LifestyleLearningCenter'
import WeeklyReflection from '@/features/lifestyleIntelligence/WeeklyReflection'
import PrivacyBadge from '@/components/shared/PrivacyBadge'

/**
 * Lifestyle Intelligence is a presentation-layer feature per its spec: no
 * new tables, services, or backend logic. Daily check-ins (mood, energy,
 * wellbeing, consistency) power the score/insights/reflection sections
 * exactly as before (Stage 4C2 leaves that untouched). Sleep, Nutrition,
 * and Stress & Recovery are Stage 3 additions this page didn't know about
 * when it was first built — it now composes their existing hooks and
 * calculate*Summary() functions directly (the same pattern
 * RecoveryPlannerPage.tsx already established) purely to display real
 * data honestly instead of a stale "not yet tracked" placeholder. No new
 * calculation, no new table, no new service. Everything still genuinely
 * untracked (movement, mindfulness, social connection, work-life balance,
 * weather, air quality, and the rest of Environmental Wellness) stays
 * labeled that way — never filled with invented numbers.
 */
function LifestyleIntelligencePage() {
  const [timelineRange, setTimelineRange] = useState<TimelineRange>('week')
  const { status, weeklySummary, moodTrend, energyTrend, consistencyScore, timeline } =
    useLifestyleIntelligenceData(timelineRange)

  const sleepData = useSleepData()
  const nutritionData = useNutritionData()
  const stressRecoveryData = useStressRecoveryData()
  const today = getLocalDateString()
  const sleepSummary = calculateSleepSummary(sleepData.entries, today)
  const nutritionSummary = calculateNutritionSummary(nutritionData.entries, today)
  const stressRecoverySummary = calculateStressRecoverySummary(stressRecoveryData.entries, today)

  const insights = generateLifestyleInsights({ weeklySummary, moodTrend, energyTrend, consistencyScore })
  const recommendations = generateHabitRecommendations({ moodTrend, energyTrend })
  const reflection = generateWeeklyReflection({ weeklySummary, moodTrend, energyTrend })

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <LifestyleIntelligenceHero />

      <PrivacyBadge label="Your wellness information is private to your account" />

      <TodaySnapshot
        status={status}
        sleepStatus={sleepData.status}
        sleepSummary={sleepSummary}
        nutritionStatus={nutritionData.status}
        nutritionSummary={nutritionSummary}
        stressRecoveryStatus={stressRecoveryData.status}
        stressRecoverySummary={stressRecoverySummary}
      />

      <EnvironmentalWellness status={status} />

      <LifestyleFactorsSection
        sleepStatus={sleepData.status}
        sleepSummary={sleepSummary}
        nutritionStatus={nutritionData.status}
        nutritionSummary={nutritionSummary}
        stressRecoveryStatus={stressRecoveryData.status}
        stressRecoverySummary={stressRecoverySummary}
      />

      <LifestyleInsights status={status} insights={insights} />

      <EnvironmentalTimeline status={status} range={timelineRange} onRangeChange={setTimelineRange} points={timeline} />

      <HabitRecommendations status={status} recommendations={recommendations} />

      <LifestyleScore
        status={status}
        consistencyScore={consistencyScore}
        moodTrend={moodTrend}
        energyTrend={energyTrend}
        sleepStatus={sleepData.status}
        sleepSummary={sleepSummary}
        nutritionStatus={nutritionData.status}
        nutritionSummary={nutritionSummary}
        stressRecoveryStatus={stressRecoveryData.status}
        stressRecoverySummary={stressRecoverySummary}
      />

      <LifestyleLearningCenter />

      <WeeklyReflection status={status} reflection={reflection} />

      <p className="text-center text-caption text-muted-foreground">
        Lifestyle Intelligence is an educational wellness companion. It never diagnoses illness,
        provides medical advice, or predicts disease.
      </p>
    </main>
  )
}

export default LifestyleIntelligencePage
