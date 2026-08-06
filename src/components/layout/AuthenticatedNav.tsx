import { Link, NavLink } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import CategoryDropdownMenu from '@/components/layout/CategoryDropdownMenu'
import SupportMenu from '@/components/layout/SupportMenu'
import ProfileMenu from '@/components/layout/ProfileMenu'
import MobileNav from '@/components/layout/MobileNav'
import { WELLNESS_ITEMS } from '@/components/layout/wellnessCatalog'
import { LIFESTYLE_ITEMS } from '@/components/layout/lifestyleCatalog'
import { navLinkClass } from '@/components/layout/navLinkClass'
import { useAuth } from '@/features/auth/useAuth'

/**
 * Authenticated-app navbar. Renders nothing while auth status is
 * 'loading' or 'unauthenticated' — identical to the old HeaderNav's
 * behavior for those states — since this shell only wraps protected
 * routes and ProtectedRoute itself owns the loading/redirect UI.
 *
 * IA note: the old single "Products" mega-menu (3 grouped columns, up to
 * 880px wide) has been split into two focused, compact dropdowns —
 * Wellness (reproductive health) and Lifestyle (preventive/lifestyle) —
 * plus two new first-level destinations, Insights and Learn, promoted out
 * of what used to be buried inside Products. Daily Check-In / Journal /
 * Goals / Reports ("Personal Wellness") aren't a separate nav dropdown —
 * Daily Check-In already lives on Dashboard itself, and Journal/Goals/
 * Reports are one tap away via Dashboard's own quick-actions row, so a
 * fourth dropdown for just those three would add a click without adding
 * real discoverability.
 */
function AuthenticatedNav() {
  const { status } = useAuth()

  if (status !== 'authenticated') {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/dashboard"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-medium"
        >
          <HeartPulse className="size-5 text-primary" aria-hidden="true" />
          HerHealth
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <CategoryDropdownMenu label="Wellness" items={WELLNESS_ITEMS} />
          <CategoryDropdownMenu label="Lifestyle" items={LIFESTYLE_ITEMS} />
          <NavLink to="/insights" className={navLinkClass}>
            Insights
          </NavLink>
          <NavLink to="/learn" className={navLinkClass}>
            Learn
          </NavLink>
          <SupportMenu />
        </nav>

        <div className="hidden shrink-0 items-center md:flex">
          <ProfileMenu />
        </div>

        <MobileNav variant="authenticated" />
      </div>
    </header>
  )
}

export default AuthenticatedNav
