/**
 * Date-only utilities for period tracking. Deliberately avoid:
 * - `new Date('YYYY-MM-DD')`, which parses as UTC midnight and can land on
 *   the wrong local calendar day (the classic off-by-one bug).
 * - `toISOString()` to derive a local date, for the same reason in reverse.
 * - Raw millisecond timestamp subtraction for day differences, which can be
 *   thrown off by daylight-saving transitions.
 */

/** Returns the browser's local calendar date as 'YYYY-MM-DD'. */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parses a 'YYYY-MM-DD' string as a local-midnight Date (not UTC). */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Difference in whole calendar days between two 'YYYY-MM-DD' dates.
 * Computed via Date.UTC on each date's own calendar components, so the
 * result can never be skewed by a daylight-saving transition in the user's
 * timezone (UTC has none).
 */
export function diffInCalendarDays(laterDate: string, earlierDate: string): number {
  const [ly, lm, ld] = laterDate.split('-').map(Number)
  const [ey, em, ed] = earlierDate.split('-').map(Number)
  const laterUtc = Date.UTC(ly, lm - 1, ld)
  const earlierUtc = Date.UTC(ey, em - 1, ed)
  return Math.round((laterUtc - earlierUtc) / 86_400_000)
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
