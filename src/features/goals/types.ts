export const GOAL_CATEGORIES = [
  { value: 'checkins', label: 'Daily check-in consistency' },
  { value: 'journaling', label: 'Personal reflection or journaling' },
  { value: 'cycle_tracking', label: 'Cycle tracking consistency' },
  { value: 'custom', label: 'Custom personal wellness goal' },
  { value: 'recovery', label: 'Recovery action' },
] as const

export type GoalCategory = (typeof GOAL_CATEGORIES)[number]['value']

export const GOAL_STATUSES = ['active', 'completed', 'archived'] as const
export type GoalStatus = (typeof GOAL_STATUSES)[number]

export const TARGET_PERIODS = [
  { value: 'day', label: 'per day' },
  { value: 'week', label: 'per week' },
  { value: 'month', label: 'per month' },
] as const

export type TargetPeriod = (typeof TARGET_PERIODS)[number]['value']

export const TITLE_MAX_LENGTH = 120
export const NOTE_MAX_LENGTH = 500

export interface WellnessGoal {
  id: string
  title: string
  category: GoalCategory
  note: string | null
  targetCount: number | null
  targetPeriod: TargetPeriod | null
  status: GoalStatus
  startDate: string
  targetDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface GoalProgressEntry {
  id: string
  goalId: string
  progressDate: string
  note: string | null
  createdAt: string
}

export interface ActivityCounts {
  totalCheckIns: number
  totalJournalEntries: number
  totalPeriodRecords: number
}

/** Returns the browser's local calendar date as 'YYYY-MM-DD' (not toISOString(), which is UTC). */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parses a 'YYYY-MM-DD' string as a local-midnight Date (not UTC). */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Adds (or subtracts) whole days to a 'YYYY-MM-DD' date, returning 'YYYY-MM-DD'. */
export function addDays(dateString: string, days: number): string {
  const date = parseLocalDate(dateString)
  date.setDate(date.getDate() + days)
  return getLocalDateString(date)
}

/** Formats a 'YYYY-MM-DD' date as e.g. "12 July". */
export function formatFriendlyDate(dateString: string): string {
  return parseLocalDate(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  })
}

/** First day of the local calendar month containing the given date (defaults to today). */
export function getMonthStartDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

/** Start of the current window for a target period: today for 'day', last 7 days for 'week', month-to-date for 'month'. */
export function getTargetWindowStart(targetPeriod: TargetPeriod): string {
  const today = getLocalDateString()
  if (targetPeriod === 'week') return addDays(today, -6)
  if (targetPeriod === 'month') return getMonthStartDateString()
  return today
}
