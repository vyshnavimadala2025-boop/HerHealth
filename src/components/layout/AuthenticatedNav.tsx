import { Link, NavLink } from 'react-router-dom'
import { HeartPulse, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import ProductsMenu from '@/components/layout/ProductsMenu'
import MobileNav from '@/components/layout/MobileNav'
import { AUTHENTICATED_CATEGORY_LABELS } from '@/components/layout/productCatalog'
import { useAuth } from '@/features/auth/useAuth'
import { useLogout } from '@/features/auth/useLogout'

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:text-foreground',
    isActive ? 'text-foreground' : 'text-muted-foreground',
  )

/**
 * Authenticated-app navbar. Renders nothing while auth status is
 * 'loading' or 'unauthenticated' — identical to the old HeaderNav's
 * behavior for those states — since this shell only wraps protected
 * routes and ProtectedRoute itself owns the loading/redirect UI.
 */
function AuthenticatedNav() {
  const { status } = useAuth()
  const { logout, isLoggingOut } = useLogout()

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
          <NavLink to="/dashboard" className={NAV_LINK_CLASS}>
            Dashboard
          </NavLink>
          <ProductsMenu labels={AUTHENTICATED_CATEGORY_LABELS} />
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" aria-label="Open account menu">
                <User />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile#privacy">Privacy &amp; Data</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} disabled={isLoggingOut}>
                <LogOut />
                {isLoggingOut ? 'Signing out…' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <MobileNav variant="authenticated" />
      </div>
    </header>
  )
}

export default AuthenticatedNav
