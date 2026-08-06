import type { PregnancyEntry } from '@/features/pregnancy/types'

export interface PregnancyInsight {
  id: string
  title: string
  message: string
}

/**
 * Rule-based, deterministic — same approach as insightEngine.ts and
 * fertilityInsightEngine.ts elsewhere in this app. Every message is built
 * from a fixed set of supportive, non-diagnostic phrasings and only ever
 * describes the user's own recorded data. Never diagnoses, never predicts
 * complications, never recommends medication, never replaces professional
 * care.
 */
export function generatePregnancyInsights(
  entriesThisWeek: PregnancyEntry[],
  wellnessScore: number | null,
  currentWeek: number,
): PregnancyInsight[] {
  const insights: PregnancyInsight[] = []

  if (entriesThisWeek.length > 0) {
    insights.push({
      id: 'weekly-tracking',
      title: 'Your wellness routine is becoming stronger',
      message: `You've recorded ${entriesThisWeek.length} entr${entriesThisWeek.length === 1 ? 'y' : 'ies'} this week. Keep taking time for yourself.`,
    })
  }

  const waterDays = entriesThisWeek.filter((entry) => entry.nutritionHabits.includes('water_goal')).length
  if (waterDays >= 3) {
    insights.push({
      id: 'hydration',
      title: 'Hydration',
      message: `Your hydration has been consistent on ${waterDays} of the days you've logged this week.`,
    })
  }

  const goodSleepDays = entriesThisWeek.filter(
    (entry) => entry.sleepQuality === 'good' || entry.sleepQuality === 'excellent',
  ).length
  if (goodSleepDays >= 3) {
    insights.push({
      id: 'sleep',
      title: 'Sleep',
      message: 'Sleep has been more consistent this week, based on what you\'ve recorded.',
    })
  }

  if (wellnessScore !== null && wellnessScore < 40) {
    insights.push({
      id: 'gentle-focus',
      title: 'This week\'s focus',
      message: 'Consider a gentle focus this week — perhaps a short walk, some stretching, or a few extra minutes of rest.',
    })
  }

  if (currentWeek >= 28) {
    insights.push({
      id: 'third-trimester',
      title: 'As your due date nears',
      message: 'Pacing yourself and resting when you can may feel especially supportive during this stretch.',
    })
  }

  return insights
}
