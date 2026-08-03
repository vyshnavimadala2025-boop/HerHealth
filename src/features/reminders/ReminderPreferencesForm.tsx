import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  ALL_WEEKDAYS,
  REMINDER_ACTIVITIES,
  WEEKDAYS,
  type ReminderActivityType,
  type ReminderPreference,
  type Weekday,
} from '@/features/reminders/types'
import type { ReminderPreferenceInput } from '@/features/reminders/reminderService'
import { cn } from '@/lib/utils'

interface ReminderActivityRowProps {
  activityType: ReminderActivityType
  label: string
  preference: ReminderPreference | undefined
  onSave: (input: ReminderPreferenceInput) => Promise<ReminderPreference>
}

function ReminderActivityRow({ activityType, label, preference, onSave }: ReminderActivityRowProps) {
  const [enabled, setEnabled] = useState(preference?.enabled ?? false)
  const [time, setTime] = useState(preference?.reminderTime ?? '09:00')
  const [days, setDays] = useState<Weekday[]>(preference?.reminderDays ?? ALL_WEEKDAYS)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (preference) {
      setEnabled(preference.enabled)
      setTime(preference.reminderTime)
      setDays(preference.reminderDays)
    }
  }, [preference])

  const toggleDay = (day: Weekday) => {
    setDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    )
  }

  const handleSave = async () => {
    if (isSavingRef.current) return
    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await onSave({ activityType, enabled, reminderTime: time, reminderDays: days })
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <label
        htmlFor={`reminder-enabled-${activityType}`}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium"
      >
        <Checkbox
          id={`reminder-enabled-${activityType}`}
          checked={enabled}
          onCheckedChange={(value) => setEnabled(value === true)}
        />
        {label}
      </label>

      {enabled && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`reminder-time-${activityType}`}>Reminder time</Label>
            <Input
              id={`reminder-time-${activityType}`}
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="max-w-40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Days</span>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => {
                const checked = days.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    aria-pressed={checked}
                    className={cn(
                      'rounded-full border px-3 py-1 text-caption transition-colors',
                      checked
                        ? 'border-primary bg-accent/40 text-foreground'
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <p className="text-caption text-muted-foreground">
        {enabled && preference?.enabled
          ? `Reminder set for ${time}.`
          : enabled
            ? 'Not saved yet — choose a time and days, then save.'
            : 'Reminder off.'}
      </p>

      {saveError && (
        <p role="alert" className="text-caption text-destructive">
          {saveError}
        </p>
      )}
      {saveSuccess && (
        <p role="status" className="text-caption text-primary">
          Reminder preference saved.
        </p>
      )}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleSave}
        disabled={isSaving}
        className="self-start"
      >
        {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
        {isSaving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  )
}

interface ReminderPreferencesFormProps {
  status: 'loading' | 'ready' | 'error'
  preferences: ReminderPreference[]
  onSave: (input: ReminderPreferenceInput) => Promise<ReminderPreference>
}

function ReminderPreferencesForm({ status, preferences, onSave }: ReminderPreferencesFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminders</CardTitle>
        <CardDescription>
          In-app reminder preferences only — HerHealth does not send notifications outside the
          app yet. This shows your saved settings; it does not alert you automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your reminder preferences…
          </div>
        )}

        {status === 'error' && (
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your reminder preferences. Please try again.
          </p>
        )}

        {status === 'ready' &&
          REMINDER_ACTIVITIES.map((activity) => (
            <ReminderActivityRow
              key={activity.value}
              activityType={activity.value}
              label={activity.label}
              preference={preferences.find((item) => item.activityType === activity.value)}
              onSave={onSave}
            />
          ))}
      </CardContent>
    </Card>
  )
}

export default ReminderPreferencesForm
