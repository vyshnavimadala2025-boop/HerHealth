import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, HeartPulse, LogOut, Menu } from 'lucide-react'
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
import {
  AUTHENTICATED_CATEGORY_LABELS,
  PUBLIC_CATEGORY_LABELS,
  groupProductItems,
  isProductItemActive,
} from '@/components/layout/productCatalog'
import { useLogout } from '@/features/auth/useLogout'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  variant: 'public' | 'authenticated'
}

/**
 * One shared mobile menu for both public and authenticated navigation,
 * branching only on content (not on a second implementation) — avoids
 * duplicating the slide-in-panel mechanics. Product groups use native
 * <details>/<summary> for expand/collapse: keyboard- and screen-reader-
 * accessible with zero extra JS.
 */
function MobileNav({ variant }: MobileNavProps) {
  const { logout, isLoggingOut } = useLogout()
  const { pathname } = useLocation()
  const labels = variant === 'public' ? PUBLIC_CATEGORY_LABELS : AUTHENTICATED_CATEGORY_LABELS
  const groups = groupProductItems(labels)

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
              <Link
                to="/"
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                Home
              </Link>
            </SheetClose>
          ) : (
            <SheetClose asChild>
              <Link
                to="/dashboard"
                aria-current={pathname === '/dashboard' ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted',
                  pathname === '/dashboard' && 'bg-accent/60',
                )}
              >
                Dashboard
              </Link>
            </SheetClose>
          )}

          <p className="px-2 pt-3 pb-1 text-caption font-medium tracking-wide text-muted-foreground uppercase">
            Products
          </p>
          {groups.map((group) => (
            <details key={group.category} className="group px-2">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg py-2 text-sm font-medium text-foreground marker:content-none focus-visible:ring-3 focus-visible:ring-ring/50">
                {group.label}
                <ChevronDown
                  className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <ul className="flex flex-col gap-0.5 pb-2 pl-2">
                {group.items.map((item) => {
                  const active = isProductItemActive(pathname, item.href)
                  return (
                    <li key={item.name}>
                      <SheetClose asChild>
                        <Link
                          to={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground',
                            active && 'bg-accent/60 text-foreground',
                          )}
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
          ))}

          {variant === 'public' ? (
            <>
              <SheetClose asChild>
                <Link
                  to="/how-it-works"
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  How It Works
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  to="/privacy"
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Privacy
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  to="/about"
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
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
                <Link
                  to="/profile"
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Profile
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  to="/profile#privacy"
                  className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Privacy &amp; Data
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
