import { Link, NavLink } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import CategoryDropdownMenu from '@/components/layout/CategoryDropdownMenu'
import SupportMenu from '@/components/layout/SupportMenu'
import ProfileMenu from '@/components/layout/ProfileMenu'
import MobileNav from '@/components/layout/MobileNav'
import { WELLNESS_ITEMS } from '@/components/layout/wellnessCatalog'
import { LIFESTYLE_ITEMS } from '@/components/layout/lifestyleCatalog'
import { heroNavLinkClass } from '@/components/layout/navLinkClass'
import { useAuth } from '@/features/auth/useAuth'
import { FEATURE_SIRILA_CHAT } from '@/features/aiIntelligence/constants'

/**
 * Authenticated-app navbar. Renders nothing while auth status is
 * 'loading' or 'unauthenticated' — identical to the old HeaderNav's
 * behavior for those states — since this shell only wraps protected
 * routes and ProtectedRoute itself owns the loading/redirect UI.
 *
 * Shares the same premium violet-glass theme as PublicNavbar (see that
 * file's comment) — both navbars are one consistent visual surface across
 * the whole app now, not just the public marketing site.
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
    <header className="sticky top-0 z-40 border-b border-hero-panel-foreground/12 bg-hero-panel/70 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/dashboard"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-medium tracking-tight text-hero-panel-foreground transition-colors hover:text-peach"
        >
          <HeartPulse className="size-5 text-peach" aria-hidden="true" />
          SIRILA
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <NavLink to="/dashboard" className={heroNavLinkClass}>
            Dashboard
          </NavLink>
          <CategoryDropdownMenu label="Wellness" items={WELLNESS_ITEMS} theme="hero" />
          <CategoryDropdownMenu label="Lifestyle" items={LIFESTYLE_ITEMS} theme="hero" />
          <NavLink to="/insights" className={heroNavLinkClass}>
            Insights
          </NavLink>
          <NavLink to="/learn" className={heroNavLinkClass}>
            Learn
          </NavLink>
          {FEATURE_SIRILA_CHAT && (
            <NavLink to="/ai" className={heroNavLinkClass}>
              SIRILA Intelligence
            </NavLink>
          )}
          <SupportMenu />
        </nav>

        <div className="hidden shrink-0 items-center lg:flex">
          <ProfileMenu />
        </div>

        <MobileNav variant="authenticated" theme="hero" />
      </div>
    </header>
  )
}

export default AuthenticatedNav
