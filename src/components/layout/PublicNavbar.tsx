import { Link, NavLink } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CategoryDropdownMenu from '@/components/layout/CategoryDropdownMenu'
import MobileNav from '@/components/layout/MobileNav'
import { WELLNESS_ITEMS } from '@/components/layout/wellnessCatalog'
import { LIFESTYLE_ITEMS } from '@/components/layout/lifestyleCatalog'
import { navLinkClass } from '@/components/layout/navLinkClass'

/**
 * Public-facing marketing navbar — kept as its own component, separate
 * from AuthenticatedNav, so the two navigation surfaces can evolve
 * independently even though they share CategoryDropdownMenu and the
 * underlying catalogs.
 */
function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-medium">
          <HeartPulse className="size-5 text-primary" aria-hidden="true" />
          HerHealth
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <CategoryDropdownMenu label="Wellness" items={WELLNESS_ITEMS} />
          <CategoryDropdownMenu label="Lifestyle" items={LIFESTYLE_ITEMS} />
          <NavLink to="/how-it-works" className={navLinkClass}>
            How It Works
          </NavLink>
          <NavLink to="/privacy" className={navLinkClass}>
            Privacy
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>

        <MobileNav variant="public" />
      </div>
    </header>
  )
}

export default PublicNavbar
