import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  getReminderPreferences,
  upsertReminderPreference,
  type ReminderPreferenceInput,
} from '@/features/reminders/reminderService'
import type { ReminderPreference } from '@/features/reminders/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export function useReminderPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<ReminderPreference[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const result = await getReminderPreferences(user.id)
      setPreferences(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(
    async (input: ReminderPreferenceInput) => {
      if (!user) throw new Error('You must be signed in to update reminder preferences.')
      const saved = await upsertReminderPreference(user.id, input)
      setPreferences((current) => {
        const exists = current.some((item) => item.activityType === saved.activityType)
        return exists
          ? current.map((item) => (item.activityType === saved.activityType ? saved : item))
          : [...current, saved]
      })
      return saved
    },
    [user],
  )

  return { preferences, status, save, retry: load }
}
