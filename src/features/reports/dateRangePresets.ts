import type { ReportDateRange, ReportRangePreset } from '@/features/reports/types'

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

const PRESET_WINDOW_DAYS: Record<'7d' | '30d' | '90d', number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

/** Builds an inclusive [startDate, today] window for a fixed-length preset. */
export function getPresetRange(preset: '7d' | '30d' | '90d', today = getLocalDateString()): ReportDateRange {
  const windowDays = PRESET_WINDOW_DAYS[preset]
  return {
    preset,
    startDate: addDays(today, -(windowDays - 1)),
    endDate: today,
  }
}

/** Builds a custom range from two already-validated 'YYYY-MM-DD' dates. */
export function getCustomRange(startDate: string, endDate: string): ReportDateRange {
  return { preset: 'custom', startDate, endDate }
}

export function getDefaultReportRange(today = getLocalDateString()): ReportDateRange {
  return getPresetRange('7d', today)
}

export interface CustomRangeValidation {
  startDateError: string | null
  endDateError: string | null
  rangeError: string | null
}

/**
 * Validates a custom date range against the four required rules: both dates
 * present, end date not in the future, start date not after end date. Field
 * errors are kept separate from the cross-field range error so the UI can
 * attach each message to the right input.
 */
export function validateCustomRange(
  startDate: string,
  endDate: string,
  today = getLocalDateString(),
): CustomRangeValidation {
  const startDateError = startDate ? null : 'Start date is required.'
  let endDateError: string | null = null
  if (!endDate) {
    endDateError = 'End date is required.'
  } else if (endDate > today) {
    endDateError = 'End date cannot be in the future.'
  }

  let rangeError: string | null = null
  if (startDate && endDate && !endDateError && startDate > endDate) {
    rangeError = 'Start date cannot be after end date.'
  }

  return { startDateError, endDateError, rangeError }
}

export function isCustomRangeValid(validation: CustomRangeValidation): boolean {
  return !validation.startDateError && !validation.endDateError && !validation.rangeError
}

/** Converts a UTC ISO timestamp (e.g. created_at/updated_at) to the browser's local calendar date. */
export function localDateFromTimestamp(isoTimestamp: string): string {
  return getLocalDateString(new Date(isoTimestamp))
}

/** Inclusive membership check against a report date range. */
export function isDateInRange(date: string, range: ReportDateRange): boolean {
  return date >= range.startDate && date <= range.endDate
}

export function getReportRangeLabel(preset: ReportRangePreset): string {
  if (preset === '7d') return 'Last 7 days'
  if (preset === '30d') return 'Last 30 days'
  if (preset === '90d') return 'Last 90 days'
  return 'Custom range'
}
