import { ClipboardList, Compass, LineChart, NotebookPen, Sparkles } from 'lucide-react'

const UPCOMING_SECTIONS = [
  {
    key: 'daily-exposure-checkin',
    icon: ClipboardList,
    title: 'Daily Exposure Check-in',
    description: 'Log everyday context like indoor/outdoor time, travel, sitting hours, and screen time.',
  },
  {
    key: 'environment-timeline',
    icon: LineChart,
    title: 'Environment Timeline',
    description: 'A day-by-day timeline of what you’ve logged, with simple summaries.',
  },
  {
    key: 'pattern-discovery',
    icon: Compass,
    title: 'Pattern Discovery',
    description: 'Gentle, rule-based observations about how logged patterns relate to your check-ins.',
  },
  {
    key: 'weekly-environmental-summary',
    icon: Sparkles,
    title: 'Weekly Environmental Summary',
    description: 'Charts and trend indicators summarizing a week of logged environmental context.',
  },
  {
    key: 'ai-wellness-reflection',
    icon: NotebookPen,
    title: 'AI Wellness Reflection',
    description: 'A friendly, rule-based weekly reflection generated from your logged entries.',
  },
]

/**
 * These five sections all depend on a new "daily exposure" log that
 * doesn't exist in HerHealth's schema today (worked indoors/outdoors,
 * travel, sitting hours, screen time, noise exposure, and so on — see
 * migrations 0001–0010, none of which cover this). Per this feature's
 * explicit instruction to stop and get approval before generating any
 * SQL, they're shown here as a clear, honest "coming soon" rather than
 * built as non-functional forms.
 */
function UpcomingTrackingPanel() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-muted/20 p-5">
      <div>
        <h2 className="font-display text-lg text-foreground">More tracking, coming soon</h2>
        <p className="text-caption text-muted-foreground">
          These sections need a new place to store your daily entries, which HerHealth doesn&apos;t
          have yet. They&apos;ll appear here once that&apos;s been reviewed and added.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {UPCOMING_SECTIONS.map((section) => (
          <div key={section.key} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <section.icon className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{section.title}</p>
              <p className="text-caption text-muted-foreground">{section.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default UpcomingTrackingPanel
