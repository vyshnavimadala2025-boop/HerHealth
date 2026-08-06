import { useState } from 'react'
import { useLifestyleIntelligenceData } from '@/features/lifestyleIntelligence/useLifestyleIntelligenceData'
import {
  generateLifestyleInsights,
  generateHabitRecommendations,
  generateWeeklyReflection,
} from '@/features/lifestyleIntelligence/lifestyleInsightEngine'
import type { TimelineRange } from '@/features/lifestyleIntelligence/lifestyleCalculations'
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
 * new tables, services, or backend logic. Only daily check-ins (mood,
 * energy, wellbeing, consistency) are real, already-tracked HerHealth
 * data — everything the schema doesn't yet capture (sleep quality,
 * hydration, movement, weather, air quality, screen time, and so on) is
 * labeled honestly as not yet tracked rather than filled with invented
 * numbers. "AI" sections use the same deterministic, rule-based pattern
 * as the rest of HerHealth — never a real model call.
 */
function LifestyleIntelligencePage() {
  const [timelineRange, setTimelineRange] = useState<TimelineRange>('week')
  const { status, weeklySummary, moodTrend, energyTrend, consistencyScore, timeline } =
    useLifestyleIntelligenceData(timelineRange)

  const insights = generateLifestyleInsights({ weeklySummary, moodTrend, energyTrend, consistencyScore })
  const recommendations = generateHabitRecommendations({ moodTrend, energyTrend })
  const reflection = generateWeeklyReflection({ weeklySummary, moodTrend, energyTrend })

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <LifestyleIntelligenceHero />

      <PrivacyBadge label="Your wellness information is private to your account" />

      <TodaySnapshot status={status} />

      <EnvironmentalWellness status={status} />

      <LifestyleFactorsSection />

      <LifestyleInsights status={status} insights={insights} />

      <EnvironmentalTimeline status={status} range={timelineRange} onRangeChange={setTimelineRange} points={timeline} />

      <HabitRecommendations status={status} recommendations={recommendations} />

      <LifestyleScore status={status} consistencyScore={consistencyScore} moodTrend={moodTrend} energyTrend={energyTrend} />

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
