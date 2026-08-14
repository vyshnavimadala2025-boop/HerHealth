import { generateWeeklyReflection, generateHabitRecommendations } from '@/features/lifestyleIntelligence/lifestyleInsightEngine'
import type { EnergyTrendResult, MoodTrendResult, WeeklyCheckInSummary } from '@/features/insights/types'

export interface WeeklyReflectionParts {
  whatWentWell: string
  areasToObserve: string
  suggestedNextHabit: string
  positiveEncouragement: string
}

export interface WeeklyReflectionInput {
  weeklySummary: WeeklyCheckInSummary
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
  journalCountInRange: number
  goalsCompletedInRange: number | null
}

/**
 * Composes the 4-part "AI Weekly Reflection" from the same real, existing
 * rule-based engine already built for Lifestyle Intelligence —
 * generateWeeklyReflection() supplies "What went well" verbatim rather
 * than a second summary calculation. "Areas to observe" and "Positive
 * encouragement" are simple, honest text selection over signals already
 * computed elsewhere (moodTrend/energyTrend/weeklySummary); "Suggested
 * next habit" reuses generateHabitRecommendations() rather than a new
 * habit list.
 */
export function buildWeeklyReflection(input: WeeklyReflectionInput): WeeklyReflectionParts {
  const { weeklySummary, moodTrend, energyTrend, journalCountInRange, goalsCompletedInRange } = input

  const whatWentWell = generateWeeklyReflection({ weeklySummary, moodTrend, energyTrend })

  const observeNotes: string[] = []
  if (energyTrend === 'Decreasing') {
    observeNotes.push('your recorded energy has dipped a little this week')
  }
  if (moodTrend === 'Mixed') {
    observeNotes.push('your mood check-ins showed some variation')
  }
  if (weeklySummary.count > 0 && weeklySummary.consistencyPercent < 50) {
    observeNotes.push('check-ins were less frequent than usual')
  }
  if (journalCountInRange === 0) {
    observeNotes.push('you didn’t write a journal entry this week')
  }
  const areasToObserve =
    observeNotes.length > 0
      ? `You might gently notice that ${observeNotes.join(', and ')}.`
      : 'Nothing in particular stands out to observe this week — that’s worth noticing too.'

  const [firstHabit] = generateHabitRecommendations({ moodTrend, energyTrend })
  const suggestedNextHabit = firstHabit?.message ?? 'Keep checking in regularly — small, steady habits add up.'

  const positiveEncouragement =
    goalsCompletedInRange && goalsCompletedInRange > 0
      ? `Completing a goal this week is real progress — well done.`
      : weeklySummary.count >= 5
        ? 'Showing up for yourself this consistently is worth acknowledging.'
        : weeklySummary.count > 0
          ? 'Every recorded check-in adds to a clearer picture of you — no rush.'
          : 'Whenever you’re ready to begin, SIRILA will be here.'

  return { whatWentWell, areasToObserve, suggestedNextHabit, positiveEncouragement }
}
