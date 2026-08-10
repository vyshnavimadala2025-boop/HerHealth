import { addDays } from '@/features/periods/dateUtils'
import { getCustomRange, isDateInRange } from '@/features/reports/dateRangePresets'
import {
  calculateCheckInConsistency,
  calculateGoalProgressSummary,
  calculateMoodEnergyWellbeingBreakdown,
} from '@/features/reports/reportCalculations'
import { classifyTrend } from '@/features/insights/trendMath'
import { MOOD_SCORES } from '@/features/insights/moodTrend'
import { ENERGY_SCORES } from '@/features/insights/energyTrend'
import { weightedAverageScore, calculateWellnessScore } from '@/features/insights/monthlyStats'
import type { WellnessScoreFactor } from '@/features/insights/monthlyStats'
import type { CheckIn } from '@/features/checkins/types'
import type { JournalEntry } from '@/features/journal/types'
import type { WellnessGoal, GoalProgressEntry } from '@/features/goals/types'
import type { EnergyTrendResult, MoodTrendResult, TrendDirection } from '@/features/insights/types'

export type HealthTrendRangeKey = '7d' | '30d' | '90d' | '6m' | '1y'

export interface HealthTrendRangeConfig {
  key: HealthTrendRangeKey
  label: string
  days: number
}

export const HEALTH_TREND_RANGES: HealthTrendRangeConfig[] = [
  { key: '7d', label: '7 Days', days: 7 },
  { key: '30d', label: '30 Days', days: 30 },
  { key: '90d', label: '90 Days', days: 90 },
  { key: '6m', label: '6 Months', days: 182 },
  { key: '1y', label: '1 Year', days: 365 },
]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function monthLabel(dateString: string): string {
  const [year, month] = dateString.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short' })
}

/** First calendar day of the month `monthOffset` months before/after the month containing `dateString`. */
function firstOfMonthOffset(dateString: string, monthOffset: number): string {
  const [year, month] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1 + monthOffset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

export interface TrendBucketRange {
  label: string
  startDate: string
  endDate: string
}

/**
 * Bucket boundaries for the selected range — daily for 7 days, weekly for
 * 30/90 days (matching the same day-window math used elsewhere, e.g.
 * monthlyStats.ts's buildWeeklyActivityBuckets), calendar-monthly for 6
 * months/1 year (new — no existing range in HerHealth goes beyond ~90
 * days). This is the only genuinely new logic in this file; every stat
 * *inside* each bucket below is computed by the existing reportCalculations
 * functions, just run against a shorter window.
 */
export function buildTrendBucketRanges(today: string, rangeKey: HealthTrendRangeKey): TrendBucketRange[] {
  if (rangeKey === '7d') {
    const buckets: TrendBucketRange[] = []
    for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
      const date = addDays(today, -daysAgo)
      buckets.push({
        label: daysAgo === 0 ? 'Today' : WEEKDAY_LABELS[new Date(date).getDay()],
        startDate: date,
        endDate: date,
      })
    }
    return buckets
  }

  if (rangeKey === '30d' || rangeKey === '90d') {
    const bucketCount = rangeKey === '30d' ? 4 : 12
    const buckets: TrendBucketRange[] = []
    for (let index = 0; index < bucketCount; index += 1) {
      const endDate = addDays(today, -(index * 7))
      const startDate = addDays(endDate, -6)
      buckets.push({ label: index === 0 ? 'This week' : `${index + 1}w ago`, startDate, endDate })
    }
    return buckets.reverse()
  }

  const bucketCount = rangeKey === '6m' ? 6 : 12
  const buckets: TrendBucketRange[] = []
  for (let index = 0; index < bucketCount; index += 1) {
    const monthStart = firstOfMonthOffset(today, -index)
    const nextMonthStart = firstOfMonthOffset(today, -index + 1)
    const endDate = index === 0 ? today : addDays(nextMonthStart, -1)
    buckets.push({ label: monthLabel(monthStart), startDate: monthStart, endDate })
  }
  return buckets.reverse()
}

export interface HealthTrendBucket {
  label: string
  startDate: string
  endDate: string
  checkInCount: number
  consistencyPercent: number
  avgMood: number | null
  avgEnergy: number | null
  journalCount: number
  goalsCompletedInRange: number
  progressEntriesInRange: number
  wellnessScore: number | null
  wellnessFactors: WellnessScoreFactor[]
}

export interface ComputeHealthTrendBucketsInput {
  buckets: TrendBucketRange[]
  checkIns: CheckIn[]
  journalEntries: JournalEntry[]
  goals: WellnessGoal[]
  goalProgressEntries: GoalProgressEntry[]
}

/**
 * Computes every per-bucket stat by running the existing, already-tested
 * report calculations (calculateCheckInConsistency,
 * calculateMoodEnergyWellbeingBreakdown, calculateGoalProgressSummary)
 * against each bucket's own date range, plus the Monthly Summary's
 * calculateWellnessScore() for the Wellness Score trend and the standalone
 * Wellness Score page (Stage 2) — the same function, just evaluated once
 * per bucket instead of once for a single 30-day window. Both the score
 * and its factor breakdown are kept per bucket so a caller can show
 * "what contributed" for any period, not just the most recent one.
 */
export function computeHealthTrendBuckets(input: ComputeHealthTrendBucketsInput): HealthTrendBucket[] {
  return input.buckets.map((bucket) => {
    const range = getCustomRange(bucket.startDate, bucket.endDate)
    const consistency = calculateCheckInConsistency(input.checkIns, range)
    const breakdown = calculateMoodEnergyWellbeingBreakdown(input.checkIns, range)
    const goalSummary = calculateGoalProgressSummary(input.goals, input.goalProgressEntries, range)
    const journalCount = input.journalEntries.filter((entry) => isDateInRange(entry.entryDate, range)).length
    const avgMood = weightedAverageScore(breakdown.mood, MOOD_SCORES)
    const avgEnergy = weightedAverageScore(breakdown.energyLevel, ENERGY_SCORES)

    const { score, factors } = calculateWellnessScore({
      consistencyPercent: consistency.consistencyPercent,
      checkInCount: consistency.count,
      avgMood,
      avgEnergy,
      journalCountInRange: journalCount,
      goalsCompletedInRange: goalSummary.goalsCompletedInRange,
      progressEntriesInRange: goalSummary.progressEntriesInRange,
    })

    return {
      label: bucket.label,
      startDate: bucket.startDate,
      endDate: bucket.endDate,
      checkInCount: consistency.count,
      consistencyPercent: consistency.consistencyPercent,
      avgMood,
      avgEnergy,
      journalCount,
      goalsCompletedInRange: goalSummary.goalsCompletedInRange,
      progressEntriesInRange: goalSummary.progressEntriesInRange,
      wellnessScore: score,
      wellnessFactors: factors,
    }
  })
}

export type PatternTone = 'positive' | 'neutral' | 'attention' | 'insufficient'

export interface PatternIndicator {
  key: string
  label: string
  value: string
  tone: PatternTone
}

function directionIndicator(key: string, label: string, direction: TrendDirection, hasData: boolean): PatternIndicator {
  if (!hasData) return { key, label, value: 'Not enough data yet', tone: 'insufficient' }
  if (direction === 'increasing') return { key, label, value: 'Trending up', tone: 'positive' }
  if (direction === 'decreasing') return { key, label, value: 'Trending down', tone: 'attention' }
  if (direction === 'mixed') return { key, label, value: 'Mixed', tone: 'attention' }
  return { key, label, value: 'Stable', tone: 'neutral' }
}

export interface BuildPatternIndicatorsInput {
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
  buckets: HealthTrendBucket[]
}

/**
 * Positive/negative pattern indicators. Mood and Energy reuse the exact
 * trend labels already computed by calculateMoodTrend/calculateEnergyTrend
 * (never re-derived here), preserving the app-wide medical-safety rule
 * that mood is never described as "declining" — only Energy's own result
 * type allows "Decreasing". The other four indicators reuse classifyTrend()
 * (trendMath.ts), rescaled from their native 0–100/count scale to the
 * ~0–5 scale classifyTrend's thresholds were calibrated for, rather than
 * a second trend-classification algorithm.
 */
export function buildPatternIndicators(input: BuildPatternIndicatorsInput): PatternIndicator[] {
  const { buckets } = input
  const indicators: PatternIndicator[] = []

  indicators.push({
    key: 'mood',
    label: 'Mood',
    value: input.moodTrend,
    tone:
      input.moodTrend === 'Improving'
        ? 'positive'
        : input.moodTrend === 'Mixed'
          ? 'attention'
          : input.moodTrend === 'Limited data'
            ? 'insufficient'
            : 'neutral',
  })

  indicators.push({
    key: 'energy',
    label: 'Energy',
    value: input.energyTrend,
    tone:
      input.energyTrend === 'Improving'
        ? 'positive'
        : input.energyTrend === 'Decreasing' || input.energyTrend === 'Mixed'
          ? 'attention'
          : input.energyTrend === 'Limited data'
            ? 'insufficient'
            : 'neutral',
  })

  /**
   * A direction claim ("Trending up/down") needs more than one active
   * period behind it, or a single late/early entry could read as a
   * fabricated trend — so each gate below requires at least 2 buckets
   * with real activity, not just "any activity anywhere in the range".
   */
  const hasCheckIns = buckets.filter((bucket) => bucket.checkInCount > 0).length >= 2
  const consistencySeries = buckets.map((bucket) => bucket.consistencyPercent / 20)
  indicators.push(
    directionIndicator('consistency', 'Check-in consistency', classifyTrend(consistencySeries), hasCheckIns),
  )

  const hasGoalActivity =
    buckets.filter((bucket) => bucket.goalsCompletedInRange > 0 || bucket.progressEntriesInRange > 0).length >= 2
  const goalSeries = buckets.map((bucket) => bucket.progressEntriesInRange)
  indicators.push(directionIndicator('goals', 'Goal progress', classifyTrend(goalSeries), hasGoalActivity))

  const hasJournalActivity = buckets.filter((bucket) => bucket.journalCount > 0).length >= 2
  const journalSeries = buckets.map((bucket) => bucket.journalCount)
  indicators.push(directionIndicator('journal', 'Journal consistency', classifyTrend(journalSeries), hasJournalActivity))

  const scoredBuckets = buckets.filter((bucket) => bucket.wellnessScore !== null)
  const hasScoreData = scoredBuckets.length >= 2
  const scoreSeries = scoredBuckets.map((bucket) => (bucket.wellnessScore as number) / 20)
  indicators.push(
    directionIndicator('wellness-score', 'Wellness score', hasScoreData ? classifyTrend(scoreSeries) : 'stable', hasScoreData),
  )

  return indicators
}

/**
 * Deterministic, factual highlights from real bucket deltas — no model,
 * no invented conclusion. Only surfaces a highlight when the underlying
 * numbers clearly support it (fixed thresholds below), same restraint as
 * buildMonthlyAchievements.
 */
export function buildTrendHighlights(buckets: HealthTrendBucket[], rangeLabel: string): string[] {
  const highlights: string[] = []
  if (buckets.length < 2) return highlights

  const totalCheckIns = buckets.reduce((sum, bucket) => sum + bucket.checkInCount, 0)
  if (totalCheckIns === 0) return highlights

  const first = buckets[0]
  const last = buckets[buckets.length - 1]

  if (last.consistencyPercent - first.consistencyPercent >= 15) {
    highlights.push(
      `Your check-in consistency improved from ${first.consistencyPercent}% to ${last.consistencyPercent}% over the last ${rangeLabel.toLowerCase()}.`,
    )
  } else if (first.consistencyPercent - last.consistencyPercent >= 15) {
    highlights.push(
      `Your check-in consistency has eased from ${first.consistencyPercent}% to ${last.consistencyPercent}% over the last ${rangeLabel.toLowerCase()}.`,
    )
  }

  const totalGoalsCompleted = buckets.reduce((sum, bucket) => sum + bucket.goalsCompletedInRange, 0)
  if (totalGoalsCompleted > 0) {
    highlights.push(`You completed ${totalGoalsCompleted} wellness goal${totalGoalsCompleted === 1 ? '' : 's'} in this period.`)
  }

  const totalJournalEntries = buckets.reduce((sum, bucket) => sum + bucket.journalCount, 0)
  if (totalJournalEntries > 0) {
    highlights.push(`You wrote ${totalJournalEntries} journal entr${totalJournalEntries === 1 ? 'y' : 'ies'} in this period.`)
  }

  const scoredBuckets = buckets.filter((bucket) => bucket.wellnessScore !== null)
  if (scoredBuckets.length >= 2) {
    const firstScore = scoredBuckets[0].wellnessScore as number
    const lastScore = scoredBuckets[scoredBuckets.length - 1].wellnessScore as number
    if (lastScore - firstScore >= 10) {
      highlights.push(`Your wellness score rose from ${firstScore} to ${lastScore} over this period.`)
    } else if (firstScore - lastScore >= 10) {
      highlights.push(`Your wellness score eased from ${firstScore} to ${lastScore} over this period.`)
    }
  }

  if (highlights.length === 0) {
    highlights.push('Your recorded patterns have stayed fairly steady over this period — nothing dramatic to report, which is worth noticing too.')
  }

  return highlights.slice(0, 4)
}
