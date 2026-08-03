export const REMINDER_ACTIVITIES = [
  { value: 'checkins', label: 'Daily check-in' },
  { value: 'journaling', label: 'Journaling' },
  { value: 'cycle_tracking', label: 'Cycle tracking' },
  { value: 'goals', label: 'Wellness goals' },
] as const

export type ReminderActivityType = (typeof REMINDER_ACTIVITIES)[number]['value']

export const WEEKDAYS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
] as const

export type Weekday = (typeof WEEKDAYS)[number]['value']

export const ALL_WEEKDAYS: Weekday[] = WEEKDAYS.map((day) => day.value)

export interface ReminderPreference {
  id: string
  activityType: ReminderActivityType
  enabled: boolean
  reminderTime: string
  reminderDays: Weekday[]
  createdAt: string
  updatedAt: string
}
