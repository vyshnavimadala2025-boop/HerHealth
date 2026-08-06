import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface InsightCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
}

/** Shared premium card used across every Insights group section — icon, title, description, hover lift. */
function InsightCard({ icon: Icon, title, description, href }: InsightCardProps) {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground transition-transform duration-300 group-hover:scale-105">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-caption text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}

export default InsightCard
