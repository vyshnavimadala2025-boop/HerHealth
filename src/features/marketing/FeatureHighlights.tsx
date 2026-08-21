import { Link } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Sun,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import AmbientOrb from '@/components/shared/AmbientOrb'
import { cn } from '@/lib/utils'

type PreviewVariant = 'checkin' | 'cycle' | 'journal' | 'goals' | 'reports'

interface Highlight {
  icon: LucideIcon
  variant: PreviewVariant
  eyebrow: string
  title: string
  description: string
  points: string[]
  href: string
  linkLabel: string
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Sun,
    variant: 'checkin',
    eyebrow: 'Daily check-ins & insights',
    title: 'A few moments a day, organized for you',
    description:
      'Record your mood, energy, and wellbeing, then see the patterns in what you’ve recorded — consistency, trends, and weekly summaries, described in plain language.',
    points: ['Quick daily check-ins', 'Weekly consistency summary', 'Mood and energy patterns'],
    href: '/dashboard',
    linkLabel: 'Go to your dashboard',
  },
  {
    icon: HeartPulse,
    variant: 'cycle',
    eyebrow: 'Cycle tracking',
    title: 'Your cycle, on your own terms',
    description:
      'Record period dates and review your history. Estimates are based only on what you’ve recorded and are never presented as medical predictions.',
    points: ['Period history', 'Estimated cycle length from your own data', 'Private and yours alone'],
    href: '/cycle-tracker',
    linkLabel: 'Open Cycle Tracker',
  },
  {
    icon: BookOpen,
    variant: 'journal',
    eyebrow: 'Private journal',
    title: 'A space that’s truly private',
    description:
      'Write freely. Your journal entries are never analyzed, summarized, or shown anywhere outside the journal itself — not in insights, not in reports.',
    points: ['Searchable entry history', 'Never used in insights or reports', 'Yours to edit or delete anytime'],
    href: '/journal',
    linkLabel: 'Open your journal',
  },
  {
    icon: Target,
    variant: 'goals',
    eyebrow: 'Goals & progress',
    title: 'Set your own pace',
    description:
      'Create personal wellness goals, log progress, and manage reminder preferences — all shaped around what matters to you.',
    points: ['Custom or check-in-linked goals', 'Simple progress logging', 'Reminder preferences you control'],
    href: '/goals',
    linkLabel: 'View your goals',
  },
  {
    icon: ClipboardList,
    variant: 'reports',
    eyebrow: 'Wellness reports',
    title: 'A clear picture, whenever you want it',
    description:
      'Generate a private summary across any date range, review your personal timeline, and export or delete your data whenever you choose.',
    points: ['7, 30, 90-day, or all-time views', 'Personal activity timeline', 'Private export, anytime'],
    href: '/reports',
    linkLabel: 'View your reports',
  },
]

const WEEK_BARS = ['h-3', 'h-6', 'h-4', 'h-7', 'h-5', 'h-8', 'h-6']

/** A 3-week mini calendar grid with a couple of cells marked as period days. */
function CyclePreview() {
  const markedDays = new Set([9, 10, 11])
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 21 }, (_, day) => (
        <div
          key={day}
          className={cn(
            'flex aspect-square items-center justify-center rounded-md text-[0.6rem] font-medium',
            markedDays.has(day) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          {day + 1}
        </div>
      ))}
    </div>
  )
}

function FeaturePreview({ variant, icon: Icon }: { variant: PreviewVariant; icon: LucideIcon }) {
  return (
    <Card interactive className="overflow-hidden border-border bg-card/95" aria-hidden="true">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2">
        <span className="size-2 rounded-full bg-destructive/40" />
        <span className="size-2 rounded-full bg-primary/30" />
        <span className="size-2 rounded-full bg-support" />
      </div>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </div>

        {variant === 'checkin' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-support/60 px-3 py-1 text-[0.65rem] font-medium text-support-foreground">
                Mood: Good
              </span>
              <span className="rounded-full bg-accent px-3 py-1 text-[0.65rem] font-medium text-accent-foreground">
                Energy: High
              </span>
            </div>
            <div className="flex items-end gap-1.5">
              {WEEK_BARS.map((height, index) => (
                <div key={index} className={`w-full flex-1 rounded-t-sm bg-primary/70 ${height}`} />
              ))}
            </div>
          </div>
        )}

        {variant === 'cycle' && (
          <div className="flex flex-col gap-2">
            <CyclePreview />
            <p className="text-[0.65rem] text-muted-foreground">Estimated cycle length: 28 days</p>
          </div>
        )}

        {variant === 'journal' && (
          <div className="flex flex-col gap-2">
            <div className="h-2.5 w-2/3 rounded-full bg-foreground/60" />
            <div className="flex flex-col gap-1.5">
              <div className="h-2 w-full rounded-full bg-muted" />
              <div className="h-2 w-full rounded-full bg-muted" />
              <div className="h-2 w-4/5 rounded-full bg-muted" />
              <div className="h-2 w-3/5 rounded-full bg-muted" />
            </div>
          </div>
        )}

        {variant === 'goals' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-support-foreground" aria-hidden="true" />
              <div className="h-2 w-32 rounded-full bg-muted" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-3/5 rounded-full bg-primary" />
              </div>
              <p className="text-[0.65rem] text-muted-foreground">3 of 5 sessions this week</p>
            </div>
          </div>
        )}

        {variant === 'reports' && (
          <div className="flex flex-col gap-2.5">
            <span className="w-fit rounded-full border border-border px-2.5 py-0.5 text-[0.6rem] font-medium text-muted-foreground">
              Last 30 days
            </span>
            <div className="flex items-end gap-1.5">
              {['h-4', 'h-7', 'h-5', 'h-9', 'h-6'].map((height, index) => (
                <div key={index} className={`w-full flex-1 rounded-t-sm bg-support ${height}`} />
              ))}
            </div>
            <div className="h-2 w-1/2 rounded-full bg-muted" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FeatureHighlights() {
  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 overflow-hidden px-4 py-16 sm:px-6">
      <AmbientOrb color="var(--peach)" size={460} top="10%" left="-160px" opacity={0.08} />
      <AmbientOrb color="var(--primary)" size={420} bottom="0%" right="-160px" opacity={0.07} />
      {HIGHLIGHTS.map((highlight, index) => (
        <div
          key={highlight.title}
          className={cn(
            'flex flex-col items-center gap-8 lg:flex-row lg:gap-14',
            index % 2 === 1 && 'lg:flex-row-reverse',
          )}
        >
          <div className="flex-1">
            <FeaturePreview variant={highlight.variant} icon={highlight.icon} />
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-caption font-medium tracking-wide text-primary uppercase">
              {highlight.eyebrow}
            </p>
            <h3 className="text-heading font-display text-foreground">{highlight.title}</h3>
            <p className="text-body text-muted-foreground">{highlight.description}</p>
            <ul className="mt-1 flex flex-col gap-1.5">
              {highlight.points.map((point) => (
                <li key={point} className="flex items-center gap-2 text-caption text-muted-foreground">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to={highlight.href}
              className="mt-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {highlight.linkLabel} →
            </Link>
          </div>
        </div>
      ))}
    </section>
  )
}

export default FeatureHighlights
