import type { TimelinePoint } from '@/features/lifestyleIntelligence/lifestyleCalculations'

/** Average of whichever days in the series have a recorded value, rounded to 1 decimal. Null if none do. */
export function averageSeriesValue(points: TimelinePoint[], key: 'moodAverage' | 'energyAverage'): number | null {
  const values = points.map((point) => point[key]).filter((value): value is number => value !== null)
  if (values.length === 0) return null
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

export interface HighLowDay {
  label: string
  value: number
}

/** The day with the highest/lowest recorded value in the series, or null if no day has data. */
export function highLowDays(
  points: TimelinePoint[],
  key: 'moodAverage' | 'energyAverage',
): { highest: HighLowDay | null; lowest: HighLowDay | null } {
  const withValues = points
    .filter((point) => point[key] !== null)
    .map((point) => ({ label: point.label, value: point[key] as number }))

  if (withValues.length === 0) return { highest: null, lowest: null }

  const highest = withValues.reduce((best, current) => (current.value > best.value ? current : best))
  const lowest = withValues.reduce((worst, current) => (current.value < worst.value ? current : worst))
  return { highest, lowest }
}

/**
 * Current consecutive-day check-in streak within the last 7 days, counted
 * backward from today. Bounded to a week since that's the only window
 * this page fetches — an honest "streak so far this week", not a claim
 * about streaks longer than 7 days.
 */
export function calculateWeeklyStreak(points: TimelinePoint[]): number {
  let streak = 0
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].entryCount > 0) {
      streak += 1
    } else {
      break
    }
  }
  return streak
}

export interface Achievement {
  key: string
  label: string
}

export interface AchievementsInput {
  streak: number
  consistencyPercent: number
  checkInCount: number
  journalCountInRange: number
  goalsCompletedInRange: number | null
}

/** Only ever includes an achievement when the real data behind it clearly supports it. */
export function buildWeeklyAchievements(input: AchievementsInput): Achievement[] {
  const achievements: Achievement[] = []

  if (input.streak >= 7) {
    achievements.push({ key: 'streak-7', label: '7-day check-in streak' })
  } else if (input.streak >= 3) {
    achievements.push({ key: 'streak-3', label: `${input.streak}-day check-in streak` })
  }

  if (input.consistencyPercent >= 70) {
    achievements.push({ key: 'consistent-checkins', label: 'Consistent check-ins this week' })
  }

  if (input.journalCountInRange >= 1) {
    achievements.push({ key: 'journaled', label: 'Journaled this week' })
  }

  if (input.goalsCompletedInRange && input.goalsCompletedInRange > 0) {
    achievements.push({ key: 'goal-completed', label: 'Completed a wellness goal' })
  }

  if (input.checkInCount >= 5) {
    achievements.push({ key: 'wellness-milestone', label: 'Wellness milestone: 5+ check-ins this week' })
  }

  return achievements
}
