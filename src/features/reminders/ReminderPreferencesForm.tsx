import { useEffect, useRef, useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

const WEEKDAY_ORDER: Weekday[] = WEEKDAYS.map((day) => day.value)

/** Formats a 'HH:mm' 24-hour time string as e.g. "9:00 AM". */
function formatTime12h(time: string): string {
  const [hoursRaw, minutes] = time.split(':')
  const hours = Number(hoursRaw)
  if (Number.isNaN(hours) || !minutes) return time
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHours}:${minutes} ${period}`
}

/** Human-readable summary of selected reminder days, e.g. "every day", "weekdays", or "Mon, Wed, Fri". */
function formatDaysSummary(days: Weekday[]): string {
  if (days.length === ALL_WEEKDAYS.length) return 'every day'
  const weekdaySet: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri']
  if (days.length === 5 && weekdaySet.every((day) => days.includes(day))) return 'on weekdays'
  const ordered = WEEKDAY_ORDER.filter((day) => days.includes(day))
  return ordered.map((day) => WEEKDAYS.find((item) => item.value === day)?.label).join(', ')
}

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
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-3 transition-colors',
        enabled ? 'border-primary/40 bg-accent/20' : 'border-border',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
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
        <Badge
          className={
            preference?.enabled
              ? 'bg-support text-support-foreground'
              : 'bg-muted text-muted-foreground'
          }
        >
          {preference?.enabled ? 'On' : 'Off'}
        </Badge>
      </div>

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
          ? `Set for ${formatTime12h(time)}, ${formatDaysSummary(days)}.`
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
  onRetry?: () => void
}

function ReminderPreferencesForm({ status, preferences, onSave, onRetry }: ReminderPreferencesFormProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Bell className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Reminders</CardTitle>
        </div>
        <CardDescription>
          In-app reminder preferences only — HerHealth does not send notifications outside the
          app yet. This shows your saved settings; it does not alert you automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {status === 'loading' && (
          <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your reminder preferences…
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="flex flex-col items-start gap-2">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your reminder preferences. Please try again.
            </p>
            {onRetry && (
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
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
