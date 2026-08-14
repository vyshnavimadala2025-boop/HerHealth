export type UsagePeriod = 7 | 30 | 90

export const USAGE_PERIODS: { value: UsagePeriod; label: string }[] = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
]

export type TrendDirection = 'up' | 'down' | 'flat'

export interface FeatureUsageSummary {
  totalUsers: number
  activeUsersPeriod: number
  featuresWithAdoption: number
  mostUsedFeatureKey: string | null
  mostUsedFeatureLabel: string | null
  mostUsedFeatureUsers: number | null
  avgFeaturesPerEngagedUser: number | null
}

export interface FeatureUsageBreakdownRow {
  featureKey: string
  featureLabel: string
  totalUsers: number
  usersEver: number
  usersThisPeriod: number
  usersPreviousPeriod: number
  totalRecords: number
  adoptionPercentage: number | null
  trend: TrendDirection
}

export interface FeatureUsageTrendPoint {
  bucketDate: string
  recordsCount: number
}

/** Total number of features with a genuine backing table (see 0024_admin_feature_usage.sql). */
export const TRACKED_FEATURE_COUNT = 9

/**
 * Features named in SIRILA's product surface that have NO dedicated
 * backing table today — confirmed by reading each feature's own data hook
 * before writing any SQL (see the header comment in
 * 0024_admin_feature_usage.sql for the exact evidence per feature). Shown
 * honestly as "Not available" rather than fabricated or silently omitted.
 */
export const UNTRACKED_FEATURES: { key: string; label: string; reason: string }[] = [
  { key: 'dashboard', label: 'Dashboard', reason: 'The landing page, not a trackable feature' },
  { key: 'womens_health', label: "Women's Health", reason: 'A static content page — no user data' },
  {
    key: 'hormone_balance',
    label: 'Hormone Balance',
    reason: 'Computed from Cycle Tracker and Daily Check-in data — no table of its own',
  },
  { key: 'wellness_score', label: 'Wellness Score', reason: 'Computed client-side — no table of its own' },
  {
    key: 'health_trends',
    label: 'Health Trends',
    reason: 'Computed from other features’ data — no table of its own',
  },
  { key: 'ai_health_insights', label: 'AI Health Insights', reason: 'Computed client-side — no table of its own' },
  { key: 'weekly_summary', label: 'Weekly Summary', reason: 'Computed client-side — no table of its own' },
  { key: 'monthly_overview', label: 'Monthly Overview', reason: 'Computed client-side — no table of its own' },
  {
    key: 'reports',
    label: 'Reports',
    reason: 'Computed client-side from other features’ data — no table of its own',
  },
  {
    key: 'lifestyle_intelligence',
    label: 'Lifestyle Intelligence',
    reason: 'Computed from other features’ data — no table of its own',
  },
  { key: 'knowledge_hub', label: 'Knowledge Hub', reason: 'A static content catalog — no user data' },
]

/** Minimum total users before "Opportunities" is shown — avoids drawing conclusions from a tiny sample. */
export const MIN_USERS_FOR_OPPORTUNITIES = 10
/** Adoption percentage below which a tracked feature is flagged as lower-adoption. */
export const LOWER_ADOPTION_THRESHOLD = 25
