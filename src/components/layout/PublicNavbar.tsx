import { Link, NavLink } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ProductsMenu from '@/components/layout/ProductsMenu'
import MobileNav from '@/components/layout/MobileNav'
import { PUBLIC_CATEGORY_LABELS } from '@/components/layout/productCatalog'

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-foreground',
    isActive ? 'text-foreground' : 'text-muted-foreground',
  )

/**
 * Public-facing marketing navbar — kept as its own component, separate
 * from AuthenticatedNav, so the two navigation surfaces can evolve
 * independently even though they share ProductsMenu/productCatalog.
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
          <NavLink to="/" end className={NAV_LINK_CLASS}>
            Home
          </NavLink>
          <ProductsMenu labels={PUBLIC_CATEGORY_LABELS} />
          <NavLink to="/how-it-works" className={NAV_LINK_CLASS}>
            How It Works
          </NavLink>
          <NavLink to="/privacy" className={NAV_LINK_CLASS}>
            Privacy
          </NavLink>
          <NavLink to="/about" className={NAV_LINK_CLASS}>
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
