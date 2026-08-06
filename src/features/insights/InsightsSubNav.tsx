import { Link, useLocation } from 'react-router-dom'
import { INSIGHT_GROUPS } from '@/components/layout/insightsCatalog'
import { cn } from '@/lib/utils'

/** Tab bar shown atop every Insights page so users can move between groups without returning to the hub. */
function InsightsSubNav() {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Insights sections" className="flex flex-wrap gap-1.5 border-b border-border pb-3">
      <Link
        to="/insights"
        className={cn(
          'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          pathname === '/insights' ? 'bg-accent/60 text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        Overview hub
      </Link>
      {INSIGHT_GROUPS.map((group) => (
        <Link
          key={group.key}
          to={group.href}
          aria-current={pathname === group.href ? 'page' : undefined}
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            pathname === group.href ? 'bg-accent/60 text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {group.label}
        </Link>
      ))}
    </nav>
  )
}

export default InsightsSubNav
