/** Formats whole seconds as "M:SS" (or "H:MM:SS" past one hour) for a live session timer. */
export function formatElapsed(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

/** Formats whole minutes as "X min" (or "Xh Ym") for a finished-session summary. */
export function formatSessionDuration(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`
}

/** Formats an ISO timestamp as e.g. "2:45 PM". */
export function formatTimeOfDay(isoString: string): string {
  return new Date(isoString).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

/** Formats an ISO timestamp as e.g. "12 July". */
export function formatSessionDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}
