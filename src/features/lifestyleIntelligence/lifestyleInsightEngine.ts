import type { EnergyTrendResult, MoodTrendResult, WeeklyCheckInSummary } from '@/features/insights/types'

const EDUCATIONAL_ONLY = 'Educational observation only.'

export interface LifestyleInsight {
  id: string
  title: string
  message: string
}

export interface GenerateLifestyleInsightsInput {
  weeklySummary: WeeklyCheckInSummary
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
  consistencyScore: number
}

/**
 * "AI Lifestyle Insights" per the feature spec — the same deterministic,
 * rule-based pattern used everywhere else in SIRILA. Every message
 * describes only the user's own recorded check-ins; nothing here comes
 * from a model, and each insight says so plainly rather than implying a
 * real AI system.
 */
export function generateLifestyleInsights(input: GenerateLifestyleInsightsInput): LifestyleInsight[] {
  const { weeklySummary, moodTrend, energyTrend, consistencyScore } = input
  const insights: LifestyleInsight[] = []

  if (energyTrend === 'Improving') {
    insights.push({
      id: 'energy-improving',
      title: 'Energy pattern',
      message: `Your recorded check-ins suggest your energy has been trending upward recently. ${EDUCATIONAL_ONLY}`,
    })
  } else if (energyTrend === 'Decreasing') {
    insights.push({
      id: 'energy-decreasing',
      title: 'Energy pattern',
      message: `Your recorded check-ins show lower energy recently. Daily habits like rest and movement can relate to how energy feels day to day. ${EDUCATIONAL_ONLY}`,
    })
  }

  if (moodTrend === 'Improving') {
    insights.push({
      id: 'mood-improving',
      title: 'Mood pattern',
      message: `Your recent check-ins suggest an improving mood pattern. ${EDUCATIONAL_ONLY}`,
    })
  } else if (moodTrend === 'Mixed' || energyTrend === 'Mixed') {
    insights.push({
      id: 'mood-energy-mixed',
      title: 'Mood and energy',
      message: `Your recent entries show some variation in mood and energy. Everyday routine changes can relate to this. ${EDUCATIONAL_ONLY}`,
    })
  }

  if (weeklySummary.count > 0 && weeklySummary.consistencyPercent >= 70) {
    insights.push({
      id: 'weekly-consistency',
      title: 'Check-in consistency',
      message: `You've checked in on ${weeklySummary.consistencyPercent}% of the last 7 days. Consistent tracking like this builds a clearer picture of your own patterns over time. ${EDUCATIONAL_ONLY}`,
    })
  }

  if (consistencyScore >= 50) {
    insights.push({
      id: 'monthly-engagement',
      title: 'Monthly engagement',
      message: `Over the last 30 days, you've recorded a check-in on about ${consistencyScore}% of days. ${EDUCATIONAL_ONLY}`,
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: 'getting-started',
      title: 'Getting started',
      message: `Keep recording daily check-ins, and SIRILA will surface gentle observations about your own patterns here. ${EDUCATIONAL_ONLY}`,
    })
  }

  return insights
}

export interface HabitRecommendation {
  id: string
  message: string
}

/**
 * Gentle, generic lifestyle nudges only — never medical, never tied to a
 * diagnosis. Lightly informed by the user's own recent trend where one
 * exists, otherwise a fixed, supportive rotation.
 */
export function generateHabitRecommendations(input: {
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
}): HabitRecommendation[] {
  const recommendations: HabitRecommendation[] = []

  if (input.energyTrend === 'Decreasing') {
    recommendations.push({ id: 'walk', message: 'Take a short walk — gentle movement can be a nice reset.' })
  }
  if (input.moodTrend === 'Mixed') {
    recommendations.push({ id: 'breathing', message: 'Practice a few minutes of mindful breathing.' })
  }

  recommendations.push(
    { id: 'hydration', message: 'Increase hydration throughout the day.' },
    { id: 'sitting', message: 'Reduce continuous sitting — try standing or stretching every hour.' },
    { id: 'sleep', message: 'Improve sleep consistency with a steady wind-down routine.' },
    { id: 'outdoors', message: 'Spend a few minutes outdoors, even briefly.' },
    { id: 'stretch', message: 'Stretch every hour if you’ve been at a desk for a while.' },
  )

  return recommendations
}

/**
 * The "Weekly Reflection" — one paragraph, composed only from the user's
 * own real weekly summary and trend data. No line references anything
 * SIRILA doesn't actually track (sleep, hydration, outdoor time), to
 * avoid claiming data the app doesn't have.
 */
export function generateWeeklyReflection(input: {
  weeklySummary: WeeklyCheckInSummary
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
}): string {
  const { weeklySummary, moodTrend, energyTrend } = input

  if (weeklySummary.count === 0) {
    return 'You haven’t recorded any check-ins in the last 7 days. Starting a daily check-in habit is a gentle way to begin building your own personal picture over time.'
  }

  const consistencyClause = `you checked in on ${weeklySummary.count} of the last 7 days (${weeklySummary.consistencyPercent}% consistency)`

  const moodClause =
    moodTrend === 'Improving'
      ? 'your mood check-ins have trended upward'
      : moodTrend === 'Mixed'
        ? 'your mood check-ins have shown some variation'
        : moodTrend === 'Limited data'
          ? null
          : 'your mood check-ins have stayed fairly stable'

  const energyClause =
    energyTrend === 'Improving'
      ? 'energy trending upward'
      : energyTrend === 'Decreasing'
        ? 'energy trending lower'
        : energyTrend === 'Mixed'
          ? 'energy showing some variation'
          : energyTrend === 'Limited data'
            ? null
            : 'energy staying fairly stable'

  const clauses = [consistencyClause]
  if (moodClause) clauses.push(moodClause)
  if (energyClause) clauses.push(energyClause)

  return `This week, ${clauses.join(', with ')}. Continuing to check in regularly can help SIRILA reflect your own patterns back to you more clearly over time.`
}
