import { BellRing } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { useReminderPreferences } from '@/features/reminders/useReminderPreferences'
import ReminderPreferencesForm from '@/features/reminders/ReminderPreferencesForm'

/**
 * Preventive Reminders — a standalone destination over the EXISTING
 * reminder_preferences infrastructure, not a new reminder system.
 * useReminderPreferences() and ReminderPreferencesForm are the exact same
 * hook/component GoalsPage.tsx and PreventiveScreeningPlannerPage.tsx
 * already embed, now as their own first-class page instead of only
 * appearing inline on those two. ReminderPreferencesForm gained one small,
 * backward-compatible addition (an optional onRetry prop, unused by the
 * two existing embedded callers) so this page can offer a retry control on
 * load failure — no new service, no new table, no new calculation, no new
 * copy about delivery: the form's own CardDescription already states these
 * are in-app saved preferences only, and SIRILA does not send push/
 * email/SMS notifications — that disclaimer is reused verbatim.
 */
function PreventiveRemindersPage() {
  const { preferences, status, save, retry } = useReminderPreferences()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <BellRing className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Preventive Reminders"
          description="Choose which wellness activities you'd like a gentle in-app reminder for, and when."
          captions={[
            'These are saved reminder preferences, not medical reminders — SIRILA does not send push, email, or SMS notifications yet.',
          ]}
        />
      </div>

      <ReminderPreferencesForm status={status} preferences={preferences} onSave={save} onRetry={retry} />
    </main>
  )
}

export default PreventiveRemindersPage
