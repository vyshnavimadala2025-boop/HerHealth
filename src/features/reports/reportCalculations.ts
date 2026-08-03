import { diffInCalendarDays } from '@/features/periods/dateUtils'
import { calculateCycleLength, calculatePeriodDuration } from '@/features/periods/cycleCalculations'
import { REMINDER_ACTIVITIES } from '@/features/reminders/types'
import { isDateInRange, localDateFromTimestamp } from '@/features/reports/dateRangePresets'
import { ENERGY_LEVEL_OPTIONS, MOOD_OPTIONS, WELLBEING_OPTIONS } from '@/features/checkins/types'
import type { CheckIn, EnergyLevel, Mood, Wellbeing } from '@/features/checkins/types'
import type { PeriodRecord } from '@/features/periods/types'
import type { JournalEntry } from '@/features/journal/types'
import type { WellnessGoal, GoalProgressEntry } from '@/features/goals/types'
import type { ReminderPreference } from '@/features/reminders/types'
import type { PcosWellnessEntry } from '@/features/pcosWellness/types'
import type {
  CheckInConsistencySummary,
  CycleReportSummary,
  GoalProgressReportSummary,
  MoodEnergyWellbeingSummary,
  PcosWellnessReportSummary,
  ReminderPreferencesSummary,
  ReportDateRange,
  TimelineEntry,
  TimelineEntryType,
  ValueBreakdown,
} from '@/features/reports/types'

/**
 * Counts occurrences of each option value that appears at least once,
 * ordered by count (descending), ties broken by the option's canonical
 * order (from *_OPTIONS) so results are deterministic.
 */
function countBreakdown<T extends string>(
  values: T[],
  canonicalOrder: readonly { value: T }[],
): ValueBreakdown<T>[] {
  const counts = new Map<T, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return canonicalOrder
    .map((option) => option.value)
    .filter((value) => (counts.get(value) ?? 0) > 0)
    .map((value) => ({ value, count: counts.get(value) as number }))
    .sort((a, b) => b.count - a.count)
}

/**
 * For the 'all' preset, range.startDate is deliberately '' (see
 * dateRangePresets.ts's getPresetRange) — there is no meaningful "days in
 * range" to compute a percentage against (the account didn't necessarily
 * exist for the full calendar history), so daysInRange/consistencyPercent
 * are returned as 0 and the caller (ReportSummaryCard) shows a count-only
 * message instead of a percentage for that case.
 */
export function calculateCheckInConsistency(
  checkIns: CheckIn[],
  range: ReportDateRange,
): CheckInConsistencySummary {
  const inRange = checkIns.filter((entry) => isDateInRange(entry.checkinDate, range))

  if (!range.startDate) {
    return { count: inRange.length, daysInRange: 0, consistencyPercent: 0 }
  }

  const daysInRange = diffInCalendarDays(range.endDate, range.startDate) + 1
  const consistencyPercent = daysInRange > 0 ? Math.round((inRange.length / daysInRange) * 100) : 0

  return { count: inRange.length, daysInRange, consistencyPercent }
}

export function calculateMoodEnergyWellbeingBreakdown(
  checkIns: CheckIn[],
  range: ReportDateRange,
): MoodEnergyWellbeingSummary {
  const inRange = checkIns.filter((entry) => isDateInRange(entry.checkinDate, range))

  return {
    mood: countBreakdown<Mood>(inRange.map((entry) => entry.mood), MOOD_OPTIONS),
    energyLevel: countBreakdown<EnergyLevel>(inRange.map((entry) => entry.energyLevel), ENERGY_LEVEL_OPTIONS),
    wellbeing: countBreakdown<Wellbeing>(inRange.map((entry) => entry.wellbeing), WELLBEING_OPTIONS),
  }
}

export function calculateCycleReportSummary(
  periodRecords: PeriodRecord[],
  range: ReportDateRange,
): CycleReportSummary {
  const inRange = periodRecords.filter((record) => isDateInRange(record.startDate, range))

  const durations = inRange
    .map((record) => calculatePeriodDuration(record.startDate, record.endDate))
    .filter((duration): duration is number => duration !== null)
  const averageLoggedDurationDays =
    durations.length > 0
      ? Math.round((durations.reduce((sum, value) => sum + value, 0) / durations.length) * 10) / 10
      : null

  const startDatesDesc = [...inRange]
    .sort((a, b) => (a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : 0))
    .map((record) => record.startDate)
  const cycleLength = calculateCycleLength(startDatesDesc)

  return { periodRecordCount: inRange.length, averageLoggedDurationDays, cycleLength }
}

export function calculateGoalProgressSummary(
  goals: WellnessGoal[],
  progressEntries: GoalProgressEntry[],
  range: ReportDateRange,
): GoalProgressReportSummary {
  const activeGoalCount = goals.filter((goal) => goal.status === 'active').length
  const completedGoalCount = goals.filter((goal) => goal.status === 'completed').length
  const goalsCreatedInRange = goals.filter((goal) =>
    isDateInRange(localDateFromTimestamp(goal.createdAt), range),
  ).length
  const goalsCompletedInRange = goals.filter(
    (goal) => goal.completedAt && isDateInRange(localDateFromTimestamp(goal.completedAt), range),
  ).length
  const progressEntriesInRange = progressEntries.filter((entry) =>
    isDateInRange(entry.progressDate, range),
  ).length

  return {
    activeGoalCount,
    completedGoalCount,
    goalsCreatedInRange,
    goalsCompletedInRange,
    progressEntriesInRange,
  }
}

export function calculateReminderPreferencesSummary(
  preferences: ReminderPreference[],
): ReminderPreferencesSummary {
  return {
    enabledCount: preferences.filter((preference) => preference.enabled).length,
    totalCount: preferences.length,
  }
}

export function calculatePcosWellnessSummary(
  entries: PcosWellnessEntry[],
  range: ReportDateRange,
): PcosWellnessReportSummary {
  return { entryCount: entries.filter((entry) => isDateInRange(entry.entryDate, range)).length }
}

function reminderActivityLabel(activityType: string): string {
  return REMINDER_ACTIVITIES.find((activity) => activity.value === activityType)?.label ?? activityType
}

const TIMELINE_TYPE_ORDER: TimelineEntry['type'][] = [
  'goal_completed',
  'goal_created',
  'goal_progress',
  'period',
  'checkin',
  'pcos_wellness',
  'journal',
  'reminder_updated',
]

export interface BuildTimelineInput {
  checkIns: CheckIn[]
  periodRecords: PeriodRecord[]
  journalEntries: JournalEntry[]
  goals: WellnessGoal[]
  goalProgressEntries: GoalProgressEntry[]
  reminderPreferences: ReminderPreference[]
  pcosWellnessEntries: PcosWellnessEntry[] | null
  range: ReportDateRange
}

/**
 * Builds the chronological personal-activity timeline for the selected
 * range. Every entry is constructed from a fixed label string and a date —
 * never from journal title/content, PCOS observations/note, or any other
 * user-entered free text field, regardless of what the source object
 * contains. Sorted newest first; same-day entries are ordered by a fixed
 * type priority, then by id, so ordering is fully deterministic.
 */
export function buildTimeline(input: BuildTimelineInput): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  for (const checkIn of input.checkIns) {
    if (isDateInRange(checkIn.checkinDate, input.range)) {
      entries.push({
        id: `checkin-${checkIn.id}`,
        date: checkIn.checkinDate,
        type: 'checkin',
        label: 'Daily check-in recorded',
      })
    }
  }

  for (const record of input.periodRecords) {
    if (isDateInRange(record.startDate, input.range)) {
      entries.push({
        id: `period-${record.id}`,
        date: record.startDate,
        type: 'period',
        label: 'Period record added',
      })
    }
  }

  for (const entry of input.journalEntries) {
    if (isDateInRange(entry.entryDate, input.range)) {
      entries.push({
        id: `journal-${entry.id}`,
        date: entry.entryDate,
        type: 'journal',
        label: 'Journal entry recorded',
      })
    }
  }

  for (const goal of input.goals) {
    const createdDate = localDateFromTimestamp(goal.createdAt)
    if (isDateInRange(createdDate, input.range)) {
      entries.push({
        id: `goal-created-${goal.id}`,
        date: createdDate,
        type: 'goal_created',
        label: 'Wellness goal created',
      })
    }
    if (goal.completedAt) {
      const completedDate = localDateFromTimestamp(goal.completedAt)
      if (isDateInRange(completedDate, input.range)) {
        entries.push({
          id: `goal-completed-${goal.id}`,
          date: completedDate,
          type: 'goal_completed',
          label: 'Wellness goal completed',
        })
      }
    }
  }

  for (const progress of input.goalProgressEntries) {
    if (isDateInRange(progress.progressDate, input.range)) {
      entries.push({
        id: `goal-progress-${progress.id}`,
        date: progress.progressDate,
        type: 'goal_progress',
        label: 'Goal progress logged',
      })
    }
  }

  if (input.pcosWellnessEntries) {
    for (const entry of input.pcosWellnessEntries) {
      if (isDateInRange(entry.entryDate, input.range)) {
        entries.push({
          id: `pcos-${entry.id}`,
          date: entry.entryDate,
          type: 'pcos_wellness',
          label: 'Wellness tracking entry recorded',
        })
      }
    }
  }

  for (const preference of input.reminderPreferences) {
    const updatedDate = localDateFromTimestamp(preference.updatedAt)
    if (isDateInRange(updatedDate, input.range)) {
      entries.push({
        id: `reminder-${preference.id}-${preference.updatedAt}`,
        date: updatedDate,
        type: 'reminder_updated',
        label: `Reminder preference updated (${reminderActivityLabel(preference.activityType)})`,
      })
    }
  }

  return entries.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    const typeDiff = TIMELINE_TYPE_ORDER.indexOf(a.type) - TIMELINE_TYPE_ORDER.indexOf(b.type)
    if (typeDiff !== 0) return typeDiff
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  })
}

/**
 * Pure client-side filter over an already-built timeline — no Supabase
 * query involved. A plain filter with no "empty means show everything"
 * special case: the caller (PersonalTimeline) initializes its selected-types
 * state to every type present in the timeline, so "nothing filtered out" is
 * represented by selecting everything, not by an empty selection — an
 * empty selectedTypes here means the user deliberately deselected every
 * type, and should correctly show no entries.
 */
export function filterTimelineByTypes(
  entries: TimelineEntry[],
  selectedTypes: TimelineEntryType[],
): TimelineEntry[] {
  return entries.filter((entry) => selectedTypes.includes(entry.type))
}
