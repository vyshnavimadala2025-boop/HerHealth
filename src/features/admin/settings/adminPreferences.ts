import type { UsagePeriod } from '@/features/admin/featureUsage/types'

/**
 * A trivial, non-sensitive UI preference (which period to default new
 * admin analytics views to) — explicitly authorized to live in
 * localStorage rather than a database table. This has NOTHING to do with
 * authorization: it is never read by any guard, RPC, or security check,
 * only by UI components deciding an initial dropdown/segmented-control
 * value. Not currently wired into the Overview/Feature Usage/Activity
 * pages' own period state (each keeps its own independent default) — this
 * phase only adds the ability to set and persist the preference itself,
 * per the explicit instruction not to modify already-shipped admin pages
 * beyond navigation integration.
 */
const STORAGE_KEY = 'herhealth-admin-default-period'
const VALID_PERIODS: UsagePeriod[] = [7, 30, 90]
const DEFAULT_PERIOD: UsagePeriod = 30

export function getDefaultAnalyticsPeriod(): UsagePeriod {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? (Number(stored) as UsagePeriod) : null
    return parsed && VALID_PERIODS.includes(parsed) ? parsed : DEFAULT_PERIOD
  } catch {
    return DEFAULT_PERIOD
  }
}

export function setDefaultAnalyticsPeriod(period: UsagePeriod): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(period))
  } catch {
    // localStorage can be unavailable (private browsing, storage quota) — a
    // failed write here only means the preference doesn't persist, never a
    // functional or security failure, so it's safe to ignore.
  }
}
