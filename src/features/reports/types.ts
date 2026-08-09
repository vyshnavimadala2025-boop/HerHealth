import type { EnergyLevel, Mood, Wellbeing } from '@/features/checkins/types'

export const REPORT_RANGE_PRESETS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' },
] as const

export type ReportRangePreset = (typeof REPORT_RANGE_PRESETS)[number]['value']

export interface ReportDateRange {
  preset: ReportRangePreset
  startDate: string
  endDate: string
}

export interface ValueBreakdown<T extends string> {
  value: T
  count: number
}

export interface CheckInConsistencySummary {
  count: number
  daysInRange: number
  consistencyPercent: number
}

export interface MoodEnergyWellbeingSummary {
  mood: ValueBreakdown<Mood>[]
  energyLevel: ValueBreakdown<EnergyLevel>[]
  wellbeing: ValueBreakdown<Wellbeing>[]
}

export interface CycleReportSummary {
  periodRecordCount: number
  averageLoggedDurationDays: number | null
  cycleLength: number | null
}

export interface GoalProgressReportSummary {
  activeGoalCount: number
  completedGoalCount: number
  goalsCreatedInRange: number
  goalsCompletedInRange: number
  progressEntriesInRange: number
}

export interface ReminderPreferencesSummary {
  enabledCount: number
  totalCount: number
}

export interface PcosWellnessReportSummary {
  entryCount: number
}

export interface ReportSummary {
  checkIns: CheckInConsistencySummary
  moodEnergyWellbeing: MoodEnergyWellbeingSummary
  cycle: CycleReportSummary
  goals: GoalProgressReportSummary
  reminders: ReminderPreferencesSummary
  pcosWellness: PcosWellnessReportSummary | null
}

export const TIMELINE_ENTRY_TYPES = [
  'checkin',
  'journal',
  'period',
  'goal_created',
  'goal_completed',
  'goal_progress',
  'pcos_wellness',
  'reminder_updated',
] as const

export type TimelineEntryType = (typeof TIMELINE_ENTRY_TYPES)[number]

/**
 * Deliberately metadata-only: date, type, and a short fixed label. Never a
 * field carrying user-entered free text (journal title/content, PCOS
 * observations/note, goal/period note) — see reportCalculations.ts's
 * buildTimeline(), which constructs every entry from a fixed label string,
 * not from any private field.
 */
export interface TimelineEntry {
  id: string
  date: string
  type: TimelineEntryType
  label: string
}

export interface ExportBundle {
  exportedAt: string
  disclaimer: string
  checkIns: Array<{
    checkinDate: string
    mood: string
    energyLevel: string
    wellbeing: string
    note: string | null
  }>
  periodRecords: Array<{
    startDate: string
    endDate: string | null
    note: string | null
  }>
  journalEntries: Array<{
    entryDate: string
    title: string
    content: string
  }>
  goals: Array<{
    title: string
    category: string
    note: string | null
    targetCount: number | null
    targetPeriod: string | null
    status: string
    startDate: string
    targetDate: string | null
    completedAt: string | null
  }>
  goalProgressEntries: Array<{
    goalId: string
    progressDate: string
    note: string | null
  }>
  reminderPreferences: Array<{
    activityType: string
    enabled: boolean
    reminderTime: string
    reminderDays: string[]
  }>
  pcosWellnessEntries: Array<{
    entryDate: string
    observations: string[]
    note: string | null
  }> | null
  symptomEntries: Array<{
    entryDate: string
    symptoms: string[]
    severity: string | null
    timing: string | null
    note: string | null
  }>
  sleepEntries: Array<{
    entryDate: string
    bedtime: string | null
    wakeTime: string | null
    durationMinutes: number | null
    quality: string | null
    note: string | null
  }>
  nutritionEntries: Array<{
    entryDate: string
    mealsLogged: string[]
    foodCategories: string[]
    hydrationGlasses: number | null
    note: string | null
  }>
  stressRecoveryEntries: Array<{
    entryDate: string
    stressLevel: string | null
    recoveryLevel: string | null
    recoveryActions: string[]
    reflection: string | null
  }>
  screeningItems: Array<{
    title: string
    category: string | null
    plannedDate: string | null
    completedDate: string | null
    status: string
    note: string | null
  }>
}
