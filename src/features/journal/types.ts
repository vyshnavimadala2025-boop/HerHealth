export const TITLE_MAX_LENGTH = 120
export const CONTENT_MAX_LENGTH = 5000
export const JOURNAL_PAGE_SIZE = 20

export interface JournalEntry {
  id: string
  title: string
  content: string
  entryDate: string
  createdAt: string
  updatedAt: string
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

/** Formats a 'YYYY-MM-DD' date as e.g. "12 July". */
export function formatFriendlyDate(dateString: string): string {
  return parseLocalDate(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  })
}
