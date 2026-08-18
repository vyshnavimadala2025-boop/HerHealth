import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, ClipboardList, HeartPulse, LineChart, Sun, Target, type LucideIcon } from 'lucide-react'

interface OverviewItem {
  name: string
  description: string
  href: string
  icon: LucideIcon
}

/**
 * A marketing-oriented 6-item summary, distinct from the 11-item Products
 * mega-menu (productCatalog.ts) — same underlying routes, presented at a
 * coarser grain appropriate for a landing page. Rendered as an editorial
 * index (a numbered list with a hover-reveal detail), not six identical
 * bordered cards — deliberately avoiding the repeated-card-grid pattern.
 */
const OVERVIEW_ITEMS: OverviewItem[] = [
  {
    name: 'Daily Wellness',
    description: 'Log your mood, energy, and wellbeing in moments each day.',
    href: '/dashboard#checkin',
    icon: Sun,
  },
  {
    name: 'Cycle Tracking',
    description: 'Record your cycle and review your own recorded patterns over time.',
    href: '/cycle-tracker',
    icon: HeartPulse,
  },
  {
    name: 'Personal Insights',
    description: 'See the patterns in what you’ve recorded — never interpreted as diagnosis.',
    href: '/dashboard#insights',
    icon: LineChart,
  },
  {
    name: 'Private Journal',
    description: 'A private space for your own reflections, always yours alone.',
    href: '/journal',
    icon: BookOpen,
  },
  {
    name: 'Goals & Reminders',
    description: 'Set personal wellness goals and manage your reminder preferences.',
    href: '/goals',
    icon: Target,
  },
  {
    name: 'Wellness Reports',
    description: 'A clear, private summary of what you’ve recorded — export or delete anytime.',
    href: '/reports',
    icon: ClipboardList,
  },
]

function ProductOverview() {
  return (
    <section id="products" className="mx-auto w-full max-w-4xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-10 flex flex-col gap-3">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">What&apos;s inside</p>
        <h2 className="max-w-lg text-title font-display text-foreground">Everything in one private space</h2>
        <p className="max-w-lg text-body text-muted-foreground">
          Each area of SIRILA focuses on one part of your wellness journey, all kept private to
          your account.
        </p>
      </div>

      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {OVERVIEW_ITEMS.map((item, index) => (
          <li key={item.name}>
            <Link
              to={item.href}
              className="group flex items-center gap-4 py-5 transition-colors hover:bg-muted/40 sm:gap-6 sm:py-6"
            >
              <span className="w-6 shrink-0 font-display text-caption text-muted-foreground sm:w-8 sm:text-sm">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <item.icon className="size-4.5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg text-foreground">{item.name}</p>
                <p className="text-caption text-muted-foreground sm:text-sm">{item.description}</p>
              </div>
              <ArrowUpRight
                className="size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ProductOverview
