export type ActivityCategory = 'User Registration' | 'Onboarding' | 'Feature Activity' | 'Goal Activity' | 'Preventive Planning'

/** Fixed display order — independent of whatever order the RPC happens to return (it sorts by count desc). */
export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'User Registration',
  'Onboarding',
  'Feature Activity',
  'Goal Activity',
  'Preventive Planning',
]

export interface ActivityByTypeRow {
  category: ActivityCategory
  eventCount: number
}

export interface ActivityTrendPoint {
  bucketDate: string
  activityCount: number
}

export type ActivityEventType =
  | 'user_registered'
  | 'onboarding_completed'
  | 'daily_checkin_saved'
  | 'cycle_tracker_saved'
  | 'sleep_activity_saved'
  | 'nutrition_activity_saved'
  | 'stress_recovery_saved'
  | 'baby_growth_activity_saved'
  | 'goal_created'
  | 'screening_item_created'
  | 'reminder_enabled'

export interface ActivityFeedEvent {
  eventType: ActivityEventType
  occurredAt: string
}

/** Confirmed-activity phrasing only — "saved", never "opened" or "viewed" (the app doesn't record page views). */
export function describeActivityEvent(eventType: ActivityEventType): string {
  switch (eventType) {
    case 'user_registered':
      return 'New user joined'
    case 'onboarding_completed':
      return 'Onboarding completed'
    case 'daily_checkin_saved':
      return 'Daily check-in saved'
    case 'cycle_tracker_saved':
      return 'Cycle Tracker entry saved'
    case 'sleep_activity_saved':
      return 'Sleep Intelligence entry saved'
    case 'nutrition_activity_saved':
      return 'Nutrition Companion entry saved'
    case 'stress_recovery_saved':
      return 'Stress & Recovery entry saved'
    case 'baby_growth_activity_saved':
      return 'Baby Growth entry saved'
    case 'goal_created':
      return 'Goal created'
    case 'screening_item_created':
      return 'Preventive Screening item created'
    case 'reminder_enabled':
      return 'Preventive reminder enabled'
    default:
      return 'Platform activity recorded'
  }
}

/** Untracked activity — surfaced honestly in the UI rather than omitted or fabricated. */
export const UNTRACKED_ACTIVITY_TYPES: { label: string; reason: string }[] = [
  { label: 'Feature page opens / views', reason: 'No page-view instrumentation exists — only saved records are tracked.' },
  { label: 'Knowledge Hub interaction', reason: 'A static content catalog — no user data table.' },
  { label: 'AI Health Insights / Wellness Score views', reason: 'Computed client-side — never persisted.' },
  { label: 'Session duration', reason: 'Not recorded anywhere in the current application.' },
]
