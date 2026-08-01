import type {
  EnergyTrendResult,
  Insight,
  MoodTrendResult,
  WeeklyCheckInSummary,
} from '@/features/insights/types'

export interface CycleSummaryInput {
  cycleLength: number | null
  estimatedNextPeriod: string | null
  periodRecordCount: number
}

export interface GenerateInsightsInput {
  weeklySummary: WeeklyCheckInSummary
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
  cycle: CycleSummaryInput
}

/**
 * Rule-based, deterministic insight generator. Every message is built from
 * a fixed set of supportive, non-diagnostic phrasings and only ever
 * describes the user's own recorded data — no medical claims, predictions,
 * or risk scoring.
 */
export function generateInsights(input: GenerateInsightsInput): Insight[] {
  const { weeklySummary, moodTrend, energyTrend, cycle } = input
  const insights: Insight[] = []

  if (weeklySummary.count > 0) {
    insights.push({
      id: 'weekly-consistency',
      title: 'Check-in consistency',
      message: `Your recorded entries show ${weeklySummary.count} check-in${
        weeklySummary.count === 1 ? '' : 's'
      } in the last 7 days, a ${weeklySummary.consistencyPercent}% check-in consistency. This is based only on your recorded information.`,
      category: 'checkin',
      priority: 'info',
    })
  }

  if (moodTrend !== 'Limited data') {
    const message =
      moodTrend === 'Improving'
        ? 'Your recent check-ins suggest an improving mood pattern. You may want to continue observing this pattern.'
        : moodTrend === 'Stable'
          ? 'Your recent check-ins suggest a stable mood pattern, based on the information you entered.'
          : 'Your recent check-ins show a mixed mood pattern. You may want to continue observing this pattern.'

    insights.push({
      id: 'mood-trend',
      title: 'Mood pattern',
      message,
      category: 'mood',
      priority: moodTrend === 'Improving' ? 'encouragement' : 'info',
    })
  }

  if (energyTrend !== 'Limited data') {
    const message =
      energyTrend === 'Improving'
        ? 'Your recent check-ins suggest an improving energy pattern, based on the information you entered.'
        : energyTrend === 'Decreasing'
          ? 'Your recent check-ins show a decreasing energy pattern. You may want to continue observing this pattern.'
          : energyTrend === 'Stable'
            ? 'Your recent check-ins suggest a stable energy pattern, based on the information you entered.'
            : 'Your recent check-ins show a mixed energy pattern. You may want to continue observing this pattern.'

    insights.push({
      id: 'energy-trend',
      title: 'Energy pattern',
      message,
      category: 'energy',
      priority: energyTrend === 'Decreasing' ? 'attention' : energyTrend === 'Improving' ? 'encouragement' : 'info',
    })
  }

  if (cycle.cycleLength && cycle.estimatedNextPeriod) {
    insights.push({
      id: 'cycle-estimate',
      title: 'Cycle pattern',
      message: `Based on the information you entered, your estimated cycle length is ${cycle.cycleLength} days. This is based only on your recorded dates and is not a medical prediction.`,
      category: 'cycle',
      priority: 'info',
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: 'general-encouragement',
      title: 'Getting started',
      message:
        'Recording daily check-ins and period dates helps HerHealth build a personal picture over time. This is based only on the information you choose to record.',
      category: 'general',
      priority: 'encouragement',
    })
  }

  return insights
}
