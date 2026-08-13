export type OverviewPeriod = 7 | 30 | 90

export const OVERVIEW_PERIODS: { value: OverviewPeriod; label: string }[] = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
]

export interface OverviewExtendedMetrics {
  totalWellnessRecords: number
  activePregnancyJourneys: number
  returningUsersPeriod: number
}

export interface UserGrowthPoint {
  bucketDate: string
  newUsers: number
}

export type RecentActivityEventType = 'user_registered' | 'onboarding_completed'

export interface RecentActivityEvent {
  eventType: RecentActivityEventType
  occurredAt: string
}

export function describeActivityEvent(eventType: RecentActivityEventType): string {
  if (eventType === 'user_registered') return 'New user registered'
  return 'User completed onboarding'
}
