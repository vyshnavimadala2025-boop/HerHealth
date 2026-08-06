import type { FertilityEntry } from '@/features/fertility/types'
import type { FertilityWindow } from '@/features/fertility/fertilityCalculations'

export interface FertilityInsight {
  id: string
  title: string
  message: string
}

/**
 * Rule-based, deterministic — same approach as
 * src/features/insights/insightEngine.ts elsewhere in this app. Every
 * message is built from a fixed set of supportive, non-diagnostic
 * phrasings and only ever describes the user's own recorded data. Never
 * predicts pregnancy, never diagnoses, never presents an estimate as
 * certain.
 */
export function generateFertilityInsights(
  entriesThisWeek: FertilityEntry[],
  habitConsistencyPercent: number | null,
  fertilityWindow: FertilityWindow,
  hasCycleData: boolean,
): FertilityInsight[] {
  const insights: FertilityInsight[] = []

  if (entriesThisWeek.length > 0) {
    insights.push({
      id: 'weekly-tracking',
      title: 'Your tracking this week',
      message: `You've recorded ${entriesThisWeek.length} fertility entr${
        entriesThisWeek.length === 1 ? 'y' : 'ies'
      } in the last 7 days. Consistent tracking may help gentle patterns become easier to notice over time.`,
    })
  }

  if (habitConsistencyPercent !== null) {
    const message =
      habitConsistencyPercent >= 70
        ? "You've been keeping up with your wellness habits consistently this week — a supportive rhythm to continue."
        : habitConsistencyPercent >= 30
          ? 'You may notice it helps to pick one or two habits to focus on this week rather than all of them at once.'
          : "There's no pressure here — even one small habit, done gently, is a meaningful step."
    insights.push({
      id: 'habit-consistency',
      title: 'Habit consistency',
      message,
    })
  }

  if (hasCycleData && fertilityWindow.isInFertileWindow) {
    insights.push({
      id: 'fertile-window',
      title: 'Fertile window',
      message:
        "Based on your recorded cycle dates, you're currently in your estimated fertile window. This is a general estimate from your own data, not a guarantee.",
      })
  } else if (hasCycleData && fertilityWindow.daysUntilOvulation !== null && fertilityWindow.daysUntilOvulation > 0 && fertilityWindow.daysUntilOvulation <= 7) {
    insights.push({
      id: 'ovulation-approaching',
      title: 'Ovulation preparation',
      message: `Your estimated ovulation day is approaching. Some women find it helpful to begin tracking cervical mucus or ovulation tests a few days ahead of time.`,
    })
  }

  const bbtCount = entriesThisWeek.filter((entry) => entry.bbtCelsius !== null).length
  if (bbtCount >= 3) {
    insights.push({
      id: 'bbt-tracking',
      title: 'Temperature tracking',
      message: `You've logged your temperature ${bbtCount} times this week. A pattern may become easier to notice with continued daily tracking, ideally at a similar time each morning.`,
    })
  }

  return insights
}
