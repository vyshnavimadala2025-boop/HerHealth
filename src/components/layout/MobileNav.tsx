import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  Download,
  HeartPulse,
  Lock,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { WELLNESS_ITEMS } from '@/components/layout/wellnessCatalog'
import { LIFESTYLE_ITEMS } from '@/components/layout/lifestyleCatalog'
import { SUPPORT_ITEMS } from '@/components/layout/supportCatalog'
import { isProductItemActive } from '@/components/layout/navUtils'
import { useLogout } from '@/features/auth/useLogout'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  variant: 'public' | 'authenticated'
}

const TOP_LINK_CLASS = 'flex min-h-11 items-center rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted'
/** Comfortable touch target (~44px) for nested nav links, consistent across every CategoryDetails/Support group. */
const NESTED_LINK_CLASS =
  'flex min-h-11 items-center gap-2 rounded-lg px-2 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground'
/** Same comfortable touch target as NESTED_LINK_CLASS, but full-weight text for the top-level Profile section. */
const PROFILE_LINK_CLASS = 'flex min-h-11 items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted'

interface CategoryDetailsProps {
  label: string
  items: { key: string; name: string; href: string; icon: typeof User }[]
  pathname: string
}

function CategoryDetails({ label, items, pathname }: CategoryDetailsProps) {
  return (
    <details className="group px-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg py-2 text-sm font-medium text-foreground marker:content-none focus-visible:ring-3 focus-visible:ring-ring/50">
        {label}
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="flex flex-col gap-0.5 pb-2 pl-2">
        {items.map((item) => {
          const active = isProductItemActive(pathname, item.href)
          return (
            <li key={item.key}>
              <SheetClose asChild>
                <Link
                  to={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(NESTED_LINK_CLASS, active && 'bg-accent/60 text-foreground')}
                >
                  <item.icon className="size-4 text-primary" aria-hidden="true" />
                  {item.name}
                </Link>
              </SheetClose>
            </li>
          )
        })}
      </ul>
    </details>
  )
}

/**
 * One shared mobile menu for both public and authenticated navigation,
 * branching only on content (not on a second implementation) — avoids
 * duplicating the slide-in-panel mechanics. Wellness/Lifestyle/Support use
 * native <details>/<summary> for expand/collapse: keyboard- and screen-
 * reader-accessible with zero extra JS, mirroring the same two focused
 * dropdowns shown on desktop instead of one oversized "Products" list.
 */
function MobileNav({ variant }: MobileNavProps) {
  const { logout, isLoggingOut } = useLogout()
  const { pathname } = useLocation()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader className="flex-row items-center justify-between pr-12">
          <SheetTitle asChild>
            <Link to="/" className="flex items-center gap-2">
              <HeartPulse className="size-5 text-primary" aria-hidden="true" />
              HerHealth
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation menu</SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 pb-5">
          {variant === 'public' ? (
            <SheetClose asChild>
              <Link to="/" className={TOP_LINK_CLASS}>
                Home
              </Link>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Link
                to="/dashboard"
                aria-current={pathname === '/dashboard' ? 'page' : undefined}
                className={cn(TOP_LINK_CLASS, pathname === '/dashboard' && 'bg-accent/60')}
              >
                Dashboard
              </Link>
            </SheetClose>
          )}

          <CategoryDetails label="Wellness" items={WELLNESS_ITEMS} pathname={pathname} />
          <CategoryDetails label="Lifestyle" items={LIFESTYLE_ITEMS} pathname={pathname} />

          {variant === 'public' ? (
            <>
              <SheetClose asChild>
                <Link to="/how-it-works" className={TOP_LINK_CLASS}>
                  How It Works
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/privacy" className={TOP_LINK_CLASS}>
                  Privacy
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/about" className={TOP_LINK_CLASS}>
                  About
                </Link>
              </SheetClose>

              <Separator className="my-3" />

              <SheetClose asChild>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Sign In</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="mt-2 w-full">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <Link to="/insights" className={cn(TOP_LINK_CLASS, 'mt-2')}>
                  Insights
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/learn" className={TOP_LINK_CLASS}>
                  Learn
                </Link>
              </SheetClose>

              <details className="group px-2">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg py-2 text-sm font-medium text-foreground marker:content-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  Support
                  <ChevronDown
                    className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="flex flex-col gap-0.5 pb-2 pl-2">
                  {SUPPORT_ITEMS.map((item) => (
                    <li key={item.key}>
                      <SheetClose asChild>
                        {item.external ? (
                          <a href={item.href} className={NESTED_LINK_CLASS}>
                            <item.icon className="size-4 text-primary" aria-hidden="true" />
                            {item.name}
                          </a>
                        ) : (
                          <Link to={item.href} className={NESTED_LINK_CLASS}>
                            <item.icon className="size-4 text-primary" aria-hidden="true" />
                            {item.name}
                          </Link>
                        )}
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </details>

              <Separator className="my-3" />

              <p className="px-2 pb-1 text-caption font-medium tracking-wide text-muted-foreground uppercase">
                Profile
              </p>
              <SheetClose asChild>
                <Link to="/profile" className={PROFILE_LINK_CLASS}>
                  <User className="size-4 text-primary" aria-hidden="true" />
                  Profile
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/profile#account-settings" className={PROFILE_LINK_CLASS}>
                  <Settings className="size-4 text-primary" aria-hidden="true" />
                  Account Settings
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/goals#reminders" className={PROFILE_LINK_CLASS}>
                  <Bell className="size-4 text-primary" aria-hidden="true" />
                  Notifications
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/profile#privacy" className={PROFILE_LINK_CLASS}>
                  <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                  Privacy
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/profile#privacy" className={PROFILE_LINK_CLASS}>
                  <Lock className="size-4 text-primary" aria-hidden="true" />
                  Security
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/reports#export" className={PROFILE_LINK_CLASS}>
                  <Download className="size-4 text-primary" aria-hidden="true" />
                  Export Data
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/profile#privacy" className={PROFILE_LINK_CLASS}>
                  <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                  Delete Data
                </Link>
              </SheetClose>

              <Separator className="my-3" />

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={logout}
                disabled={isLoggingOut}
              >
                <LogOut />
                {isLoggingOut ? 'Signing out…' : 'Sign Out'}
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
