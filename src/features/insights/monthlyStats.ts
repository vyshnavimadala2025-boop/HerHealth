import { addDays, diffInCalendarDays } from '@/features/periods/dateUtils'
import type { Achievement } from '@/features/insights/weeklyStats'
import type { ValueBreakdown } from '@/features/reports/types'
import type { TimelineEntry } from '@/features/reports/types'

/**
 * Turns an already-computed mood/energy breakdown (counts per option, as
 * calculated once by reportCalculations.ts's calculateMoodEnergyWellbeingBreakdown)
 * into a single weighted average score — no second pass over raw check-ins,
 * just a re-reading of data already fetched for the report summary.
 */
export function weightedAverageScore<T extends string>(
  breakdown: ValueBreakdown<T>[],
  scores: Record<T, number>,
): number | null {
  const totalCount = breakdown.reduce((sum, item) => sum + item.count, 0)
  if (totalCount === 0) return null
  const weightedSum = breakdown.reduce((sum, item) => sum + scores[item.value] * item.count, 0)
  return Math.round((weightedSum / totalCount) * 10) / 10
}

/**
 * Consecutive-day check-in streak counted backward from today, using the
 * already-built personal timeline (buildTimeline()'s 'checkin' entries)
 * rather than a second check-in query. Naturally bounded by however far
 * back the supplied timeline entries go (30 days for the Monthly Summary
 * page), so this is an honest "streak within the last 30 days", not a
 * claim about streaks longer than the fetched window.
 */
export function calculateMonthlyStreak(entries: TimelineEntry[], today: string): number {
  const checkinDates = new Set(entries.filter((entry) => entry.type === 'checkin').map((entry) => entry.date))
  let streak = 0
  let cursor = today
  while (checkinDates.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export interface MonthlyAchievementsInput {
  streak: number
  consistencyPercent: number
  checkInCount: number
  journalCountInRange: number
  goalsCompletedInRange: number | null
}

/** Monthly-scaled equivalent of buildWeeklyAchievements — only ever includes an achievement the real data supports. */
export function buildMonthlyAchievements(input: MonthlyAchievementsInput): Achievement[] {
  const achievements: Achievement[] = []

  if (input.streak >= 30) {
    achievements.push({ key: 'streak-30', label: '30-day check-in streak' })
  } else if (input.streak >= 14) {
    achievements.push({ key: 'streak-14', label: `${input.streak}-day check-in streak` })
  } else if (input.streak >= 7) {
    achievements.push({ key: 'streak-7', label: `${input.streak}-day check-in streak` })
  }

  if (input.consistencyPercent >= 80) {
    achievements.push({ key: 'highly-consistent', label: 'Highly consistent month' })
  } else if (input.consistencyPercent >= 50) {
    achievements.push({ key: 'consistent-checkins', label: 'Consistent check-ins this month' })
  }

  if (input.checkInCount >= 20) {
    achievements.push({ key: 'checkin-milestone', label: `${input.checkInCount} check-ins this month` })
  }

  if (input.journalCountInRange >= 4) {
    achievements.push({ key: 'journaled-often', label: `Journaled ${input.journalCountInRange} times this month` })
  } else if (input.journalCountInRange >= 1) {
    achievements.push({ key: 'journaled', label: 'Journaled this month' })
  }

  if (input.goalsCompletedInRange && input.goalsCompletedInRange >= 3) {
    achievements.push({ key: 'goals-completed-multiple', label: `Completed ${input.goalsCompletedInRange} wellness goals` })
  } else if (input.goalsCompletedInRange && input.goalsCompletedInRange > 0) {
    achievements.push({ key: 'goal-completed', label: 'Completed a wellness goal' })
  }

  return achievements
}

export interface WellnessScoreFactor {
  key: string
  label: string
  valueLabel: string
  weightPercent: number
  tracked: boolean
}

export interface WellnessScoreResult {
  score: number | null
  factors: WellnessScoreFactor[]
}

export interface WellnessScoreInput {
  consistencyPercent: number
  checkInCount: number
  avgMood: number | null
  avgEnergy: number | null
  journalCountInRange: number
  goalsCompletedInRange: number | null
  progressEntriesInRange: number | null
}

/**
 * "Monthly Wellness Score" — an honest, rule-based composite of only the
 * signals HerHealth genuinely tracks this month (check-in consistency,
 * mood, energy, and journal/goal engagement). Untracked factors (mood/
 * energy with no data yet) are excluded and their weight is redistributed
 * across the remaining tracked factors, rather than silently counted as
 * zero — the same restraint LifestyleScore.tsx applies to dimensions it
 * can't measure. Educational only, never a medical or diagnostic score.
 */
export function calculateWellnessScore(input: WellnessScoreInput): WellnessScoreResult {
  if (input.checkInCount === 0) {
    return {
      score: null,
      factors: [
        { key: 'consistency', label: 'Check-in consistency', valueLabel: 'No check-ins yet', weightPercent: 40, tracked: false },
        { key: 'mood', label: 'Mood', valueLabel: 'Not enough data', weightPercent: 20, tracked: false },
        { key: 'energy', label: 'Energy', valueLabel: 'Not enough data', weightPercent: 20, tracked: false },
        { key: 'engagement', label: 'Journal & goal engagement', valueLabel: 'No activity yet', weightPercent: 20, tracked: false },
      ],
    }
  }

  const engagementRaw =
    input.journalCountInRange * 10 + (input.goalsCompletedInRange ?? 0) * 15 + (input.progressEntriesInRange ?? 0) * 5
  const engagementScore = Math.min(100, engagementRaw)

  const rawFactors = [
    { key: 'consistency', label: 'Check-in consistency', score: input.consistencyPercent, baseWeight: 40, tracked: true, valueLabel: `${input.consistencyPercent}%` },
    {
      key: 'mood',
      label: 'Mood',
      score: input.avgMood !== null ? ((input.avgMood - 1) / 4) * 100 : null,
      baseWeight: 20,
      tracked: input.avgMood !== null,
      valueLabel: input.avgMood !== null ? `${input.avgMood}/5 average` : 'Not enough data',
    },
    {
      key: 'energy',
      label: 'Energy',
      score: input.avgEnergy !== null ? ((input.avgEnergy - 1) / 4) * 100 : null,
      baseWeight: 20,
      tracked: input.avgEnergy !== null,
      valueLabel: input.avgEnergy !== null ? `${input.avgEnergy}/5 average` : 'Not enough data',
    },
    {
      key: 'engagement',
      label: 'Journal & goal engagement',
      score: engagementScore,
      baseWeight: 20,
      tracked: true,
      valueLabel: `${input.journalCountInRange} journal entr${input.journalCountInRange === 1 ? 'y' : 'ies'}, ${input.goalsCompletedInRange ?? 0} goal${(input.goalsCompletedInRange ?? 0) === 1 ? '' : 's'} completed`,
    },
  ]

  const trackedWeightTotal = rawFactors.filter((factor) => factor.tracked).reduce((sum, factor) => sum + factor.baseWeight, 0)

  const factors: WellnessScoreFactor[] = rawFactors.map((factor) => ({
    key: factor.key,
    label: factor.label,
    valueLabel: factor.valueLabel,
    weightPercent:
      trackedWeightTotal > 0 && factor.tracked ? Math.round((factor.baseWeight / trackedWeightTotal) * 100) : factor.baseWeight,
    tracked: factor.tracked,
  }))

  if (trackedWeightTotal === 0) {
    return { score: null, factors }
  }

  const weightedSum = rawFactors
    .filter((factor) => factor.tracked && factor.score !== null)
    .reduce((sum, factor) => sum + (factor.score as number) * (factor.baseWeight / trackedWeightTotal), 0)

  return { score: Math.round(weightedSum), factors }
}

export interface WeeklyActivityBucket {
  label: string
  checkInCount: number
  goalActivityCount: number
}

/**
 * Buckets the already-built monthly timeline into four 7-day windows
 * (matching buildLifestyleTimeline's own week-bucketing math for the
 * 'month' range), counting real check-in and goal-activity timeline
 * entries per week — no new Supabase query, just a different read of the
 * same `timeline` array already fetched for this page.
 */
export function buildWeeklyActivityBuckets(entries: TimelineEntry[], today: string): WeeklyActivityBucket[] {
  const bucketCount = 4
  const buckets: WeeklyActivityBucket[] = Array.from({ length: bucketCount }, (_, index) => ({
    label: index === 0 ? 'This week' : `${index + 1}w ago`,
    checkInCount: 0,
    goalActivityCount: 0,
  }))

  for (const entry of entries) {
    const daysAgo = diffInCalendarDays(today, entry.date)
    if (daysAgo < 0) continue
    const bucketIndex = Math.floor(daysAgo / 7)
    if (bucketIndex >= bucketCount) continue
    if (entry.type === 'checkin') {
      buckets[bucketIndex].checkInCount += 1
    } else if (entry.type === 'goal_created' || entry.type === 'goal_completed' || entry.type === 'goal_progress') {
      buckets[bucketIndex].goalActivityCount += 1
    }
  }

  return buckets.reverse()
}

export interface PeriodComparisonMetric {
  key: string
  label: string
  currentValue: number | null
  previousValue: number | null
  unit: 'percent' | 'count' | 'score'
  direction: 'up' | 'down' | 'flat' | 'unavailable'
}

function directionFor(current: number | null, previous: number | null): PeriodComparisonMetric['direction'] {
  if (current === null || previous === null) return 'unavailable'
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'flat'
}

export interface PeriodComparisonInput {
  consistencyPercent: number
  avgMood: number | null
  avgEnergy: number | null
  journalCount: number
  goalsCompletedInRange: number
}

/** Builds this-month-vs-last-month deltas for the headline metrics — purely arithmetic over already-computed summaries. */
export function buildPeriodComparison(
  current: PeriodComparisonInput,
  previous: PeriodComparisonInput,
): PeriodComparisonMetric[] {
  return [
    {
      key: 'consistency',
      label: 'Check-in consistency',
      currentValue: current.consistencyPercent,
      previousValue: previous.consistencyPercent,
      unit: 'percent',
      direction: directionFor(current.consistencyPercent, previous.consistencyPercent),
    },
    {
      key: 'mood',
      label: 'Average mood',
      currentValue: current.avgMood,
      previousValue: previous.avgMood,
      unit: 'score',
      direction: directionFor(current.avgMood, previous.avgMood),
    },
    {
      key: 'energy',
      label: 'Average energy',
      currentValue: current.avgEnergy,
      previousValue: previous.avgEnergy,
      unit: 'score',
      direction: directionFor(current.avgEnergy, previous.avgEnergy),
    },
    {
      key: 'journal',
      label: 'Journal entries',
      currentValue: current.journalCount,
      previousValue: previous.journalCount,
      unit: 'count',
      direction: directionFor(current.journalCount, previous.journalCount),
    },
    {
      key: 'goals',
      label: 'Goals completed',
      currentValue: current.goalsCompletedInRange,
      previousValue: previous.goalsCompletedInRange,
      unit: 'count',
      direction: directionFor(current.goalsCompletedInRange, previous.goalsCompletedInRange),
    },
  ]
}
