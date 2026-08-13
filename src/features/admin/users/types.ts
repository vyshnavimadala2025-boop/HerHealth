export type OnboardingFilter = 'all' | 'completed' | 'incomplete'
export type ActivityFilter = 'all' | 'active' | 'inactive' | 'unknown'
export type UsersSort = 'newest' | 'oldest' | 'recently_active' | 'least_active' | 'name_asc'
export type ActivityStatus = 'active' | 'inactive' | 'unknown'

export interface AdminUserRow {
  id: string
  fullName: string
  email: string
  createdAt: string
  onboardingCompleted: boolean
  onboardingCompletedAt: string | null
  lastActiveAt: string | null
}

export interface AdminUserDetail extends AdminUserRow {
  isAdmin: boolean
}

export interface AdminUsersPageResult {
  rows: AdminUserRow[]
  totalCount: number
}

export interface AdminUsersQuery {
  search: string
  onboarding: OnboardingFilter
  activity: ActivityFilter
  sort: UsersSort
  page: number
  pageSize: number
}

/**
 * Derives an honest activity status from a nullable last-active date —
 * the same 7-day window public.admin_list_users()/admin_overview_metrics()
 * use server-side. null means "no daily_checkins row was ever recorded for
 * this user," which is NOT the same claim as "inactive" (they may be using
 * other features) — it must render as "Unknown", never folded into
 * "Inactive".
 */
export function deriveActivityStatus(lastActiveAt: string | null): ActivityStatus {
  if (!lastActiveAt) return 'unknown'
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  return new Date(lastActiveAt) >= sevenDaysAgo ? 'active' : 'inactive'
}

/** Formats an ISO date/timestamp for admin display; '—' for null (never "Unavailable" for a value that's simply absent-by-design). */
export function formatAdminDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
