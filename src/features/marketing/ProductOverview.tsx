import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, HeartPulse, LineChart, Sun, Target, type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface OverviewCard {
  name: string
  description: string
  href: string
  icon: LucideIcon
}

/**
 * A marketing-oriented 6-card summary, distinct from the 11-item Products
 * mega-menu (productCatalog.ts) — same underlying routes, presented at a
 * coarser grain appropriate for a landing page. Not a duplicate data
 * source for navigation; this list exists only for this section's copy.
 */
const OVERVIEW_CARDS: OverviewCard[] = [
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
    <section id="products" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">What&apos;s inside</p>
        <h2 className="text-title font-display text-foreground">Everything in one private space</h2>
        <p className="text-body text-muted-foreground">
          Each area of SIRILA focuses on one part of your wellness journey, all kept private to
          your account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OVERVIEW_CARDS.map((card) => (
          <Link key={card.name} to={card.href} className="group block">
            <Card className="h-full border-border transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <card.icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-base">{card.name}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default ProductOverview
