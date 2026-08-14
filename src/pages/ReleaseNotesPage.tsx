import { ScrollText } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'

interface ReleaseEntry {
  key: string
  date: string
  title: string
  items: string[]
}

const RELEASES: ReleaseEntry[] = [
  {
    key: 'nav-ia',
    date: 'Latest',
    title: 'Navigation & information architecture redesign',
    items: [
      'Replaced the single "Products" mega-menu with focused Wellness and Lifestyle dropdowns.',
      'Added Insights as a first-level destination, with real weekly/monthly summaries, trend charts, a full activity timeline, goal progress, and data export.',
      'Added Learn, a searchable knowledge center with bookmarks, recently viewed, and reading progress.',
      'Completed every previously "coming soon" Lifestyle product with a real, working experience.',
      'Added a Help Center and this Release Notes page under Support.',
    ],
  },
  {
    key: 'environmental-wellness',
    date: 'Earlier',
    title: 'Environmental Wellness',
    items: [
      'Added an Environmental Wellness overview and lifestyle suggestions.',
      'Introduced honest "not yet tracked" states for environmental factors without a data source, instead of inventing readings.',
    ],
  },
  {
    key: 'lifestyle-intelligence',
    date: 'Earlier',
    title: 'Lifestyle Intelligence',
    items: [
      'Added lifestyle pattern tracking built on your real check-in history.',
      'Added a Lifestyle Score reflecting real check-in consistency, and a weekly progress timeline.',
    ],
  },
  {
    key: 'hormone-balance',
    date: 'Earlier',
    title: 'Hormone Balance',
    items: [
      'Added an educational hormone-wellness companion with a cycle-phase estimate and rule-based observations.',
    ],
  },
  {
    key: 'privacy-controls',
    date: 'Earlier',
    title: 'Data privacy & personal reports',
    items: [
      'Added self-service data export (JSON/CSV) and category-by-category data deletion.',
      'Added wellness trends, a personal activity timeline, and printable reports.',
    ],
  },
  {
    key: 'goals-reminders',
    date: 'Earlier',
    title: 'Wellness goals & reminders',
    items: ['Added personal wellness goals, progress tracking, and reminder preferences.'],
  },
]

/** A real, honest changelog of what has actually shipped — no fabricated dates or metrics. */
function ReleaseNotesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-support text-support-foreground">
          <ScrollText className="size-6" aria-hidden="true" />
        </div>
        <PageHeader title="Release Notes" description="What's changed in SIRILA, most recent first." />
      </div>

      <ol className="flex flex-col gap-6 border-l border-border pl-5">
        {RELEASES.map((release) => (
          <li key={release.key} className="relative">
            <span className="absolute top-1 -left-[1.72rem] size-2.5 rounded-full bg-primary" aria-hidden="true" />
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{release.date}</p>
            <p className="font-display text-lg text-foreground">{release.title}</p>
            <ul className="mt-1 flex list-disc flex-col gap-1 pl-4 text-caption text-muted-foreground">
              {release.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  )
}

export default ReleaseNotesPage
