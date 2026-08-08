import { generateLifestyleInsights, generateHabitRecommendations } from '@/features/lifestyleIntelligence/lifestyleInsightEngine'
import type { EnergyTrendResult, MoodTrendResult } from '@/features/insights/types'

export interface MonthlyReflectionParts {
  whatWentWell: string
  patternsWorthNoticing: string
  areasToObserve: string
  suggestedNextFocus: string
  supportiveGuidance: string
}

export interface MonthlyReflectionInput {
  consistencyPercent: number
  checkInCount: number
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
  journalCountInRange: number
  goalsCompletedInRange: number | null
  streak: number
}

/**
 * Composes the 5-part "AI Monthly Reflection" from the same rule-based
 * engine already built for Lifestyle Intelligence — generateLifestyleInsights()
 * is called with weeklySummary.count pinned to 0 so its "last 7 days"
 * check-in-consistency message (written for a 7-day window) never fires
 * here; only its window-agnostic mood/energy pattern lines and its
 * 'monthly-engagement' line (already written for a 30-day consistency
 * score) are reused. generateHabitRecommendations() supplies "Suggested
 * next focus" rather than a new habit list. No AI model is involved
 * anywhere — same deterministic, rule-based pattern as Weekly Summary.
 */
export function buildMonthlyReflection(input: MonthlyReflectionInput): MonthlyReflectionParts {
  const { consistencyPercent, checkInCount, moodTrend, energyTrend, journalCountInRange, goalsCompletedInRange, streak } = input

  if (checkInCount === 0) {
    return {
      whatWentWell: 'You haven’t recorded any check-ins this month yet — that’s alright. Starting is the only step that matters.',
      patternsWorthNoticing: 'Once you begin checking in, HerHealth will start reflecting your own patterns back to you here.',
      areasToObserve: 'There isn’t enough recorded data yet to describe an area to observe.',
      suggestedNextFocus: 'Complete your first check-in this month to begin building your monthly picture.',
      supportiveGuidance: 'Whenever you’re ready to begin, HerHealth will be here.',
    }
  }

  const insights = generateLifestyleInsights({
    weeklySummary: { count: 0, consistencyPercent: 0, mostCommonMood: null, mostCommonEnergyLevel: null, mostCommonWellbeing: null },
    moodTrend,
    energyTrend,
    consistencyScore: consistencyPercent,
  })

  const wentWellInsight =
    insights.find((insight) => insight.id === 'monthly-engagement') ??
    insights.find((insight) => insight.id === 'mood-improving' || insight.id === 'energy-improving')
  const whatWentWell =
    wentWellInsight?.message ??
    (checkInCount >= 10
      ? `You recorded ${checkInCount} check-ins this month — a real, consistent record of how you’ve been feeling.`
      : `You recorded ${checkInCount} check-in${checkInCount === 1 ? '' : 's'} this month — every one adds to your picture over time.`)

  const patternNotes: string[] = []
  if (moodTrend === 'Improving') patternNotes.push('your recorded mood has trended upward over the month')
  if (energyTrend === 'Improving') patternNotes.push('your recorded energy has trended upward over the month')
  if (moodTrend === 'Stable' && energyTrend === 'Stable') patternNotes.push('both your mood and energy have stayed fairly steady all month')
  if (streak >= 7) patternNotes.push(`you’re on a ${streak}-day check-in streak`)
  const patternsWorthNoticing =
    patternNotes.length > 0
      ? `Looking back over the month, ${patternNotes.join(', and ')}.`
      : 'Nothing especially strong stands out yet in this month’s pattern — that’s worth noticing too, and more history will make patterns clearer.'

  const observeNotes: string[] = []
  if (energyTrend === 'Decreasing') observeNotes.push('your recorded energy has dipped recently')
  if (moodTrend === 'Mixed') observeNotes.push('your mood check-ins showed some variation this month')
  if (consistencyPercent < 40) observeNotes.push('check-ins were less frequent than usual this month')
  if (journalCountInRange === 0) observeNotes.push('you didn’t write a journal entry this month')
  if (!goalsCompletedInRange) observeNotes.push('no wellness goals were marked complete this month')
  const areasToObserve =
    observeNotes.length > 0
      ? `You might gently notice that ${observeNotes.join(', and ')}.`
      : 'Nothing in particular stands out to watch this month — a calm, steady month is worth noticing on its own.'

  const habitRecommendations = generateHabitRecommendations({ moodTrend, energyTrend })
  const suggestedNextFocus =
    habitRecommendations[0]?.message ?? 'Keep checking in regularly — small, steady habits add up over a month.'

  const supportiveGuidance =
    goalsCompletedInRange && goalsCompletedInRange > 0
      ? `Completing ${goalsCompletedInRange} goal${goalsCompletedInRange === 1 ? '' : 's'} this month is real, tangible progress — well done.`
      : consistencyPercent >= 70
        ? 'Showing up for yourself this consistently across a whole month is genuinely worth acknowledging.'
        : checkInCount > 0
          ? 'Every recorded check-in — however often — adds to a clearer picture of your own patterns. There’s no rush.'
          : 'Whenever you’re ready to begin, HerHealth will be here.'

  return { whatWentWell, patternsWorthNoticing, areasToObserve, suggestedNextFocus, supportiveGuidance }
}
