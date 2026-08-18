import { Link, NavLink } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CategoryDropdownMenu from '@/components/layout/CategoryDropdownMenu'
import MobileNav from '@/components/layout/MobileNav'
import { WELLNESS_ITEMS } from '@/components/layout/wellnessCatalog'
import { LIFESTYLE_ITEMS } from '@/components/layout/lifestyleCatalog'
import { heroNavLinkClass } from '@/components/layout/navLinkClass'

/**
 * Public-facing marketing navbar — kept as its own component, separate
 * from AuthenticatedNav, so the two navigation surfaces can evolve
 * independently even though they share CategoryDropdownMenu and the
 * underlying catalogs.
 *
 * Premium violet-glass theme, applied app-wide (every public route, not
 * just "/"). Reuses the existing hero-panel/peach design tokens rather
 * than introducing a separate raw color palette, so it stays visually
 * integrated with the rest of SIRILA's system instead of a bolted-on
 * accent.
 */
function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-hero-panel-foreground/12 bg-hero-panel/70 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-medium tracking-tight text-hero-panel-foreground transition-colors hover:text-peach"
        >
          <HeartPulse className="size-5 text-peach" aria-hidden="true" />
          SIRILA
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={heroNavLinkClass}>
            Home
          </NavLink>
          <CategoryDropdownMenu label="Wellness" items={WELLNESS_ITEMS} theme="hero" />
          <CategoryDropdownMenu label="Lifestyle" items={LIFESTYLE_ITEMS} theme="hero" />
          <NavLink to="/how-it-works" className={heroNavLinkClass}>
            How It Works
          </NavLink>
          <NavLink to="/privacy" className={heroNavLinkClass}>
            Privacy
          </NavLink>
          <NavLink to="/about" className={heroNavLinkClass}>
            About
          </NavLink>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-hero-panel-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/10 hover:text-hero-panel-foreground"
          >
            <Link to="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-hero-panel-foreground text-hero-panel transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/90"
          >
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>

        <MobileNav variant="public" theme="hero" />
      </div>
    </header>
  )
}

export default PublicNavbar
