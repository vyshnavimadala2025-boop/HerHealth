import { supabase } from '@/lib/supabaseClient'
import type { ReminderActivityType, ReminderPreference, Weekday } from '@/features/reminders/types'

interface ReminderPreferenceRow {
  id: string
  activity_type: string
  enabled: boolean
  reminder_time: string
  reminder_days: string[]
  created_at: string
  updated_at: string
}

const REMINDER_COLUMNS =
  'id, activity_type, enabled, reminder_time, reminder_days, created_at, updated_at'

function mapRow(row: ReminderPreferenceRow): ReminderPreference {
  return {
    id: row.id,
    activityType: row.activity_type as ReminderActivityType,
    enabled: row.enabled,
    reminderTime: row.reminder_time.slice(0, 5),
    reminderDays: (row.reminder_days ?? []) as Weekday[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getReminderPreferences(userId: string): Promise<ReminderPreference[]> {
  const { data, error } = await supabase
    .from('reminder_preferences')
    .select(REMINDER_COLUMNS)
    .eq('user_id', userId)
    .order('activity_type', { ascending: true })

  if (error) throw new Error('Unable to load your reminder preferences. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface ReminderPreferenceInput {
  activityType: ReminderActivityType
  enabled: boolean
  reminderTime: string
  reminderDays: Weekday[]
}

/** Create-or-update by (user_id, activity_type) — one reminder row per activity per user. */
export async function upsertReminderPreference(
  userId: string,
  input: ReminderPreferenceInput,
): Promise<ReminderPreference> {
  const { data, error } = await supabase
    .from('reminder_preferences')
    .upsert(
      {
        user_id: userId,
        activity_type: input.activityType,
        enabled: input.enabled,
        reminder_time: input.reminderTime,
        reminder_days: input.reminderDays,
      },
      { onConflict: 'user_id,activity_type' },
    )
    .select(REMINDER_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your reminder preference. Please try again.')
  return mapRow(data)
}
