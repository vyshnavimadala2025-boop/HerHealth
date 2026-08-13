import { Link, NavLink } from 'react-router-dom'
import { ArrowLeftRight, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ADMIN_NAV_ITEMS } from '@/components/layout/adminNavCatalog'
import { useAuth } from '@/features/auth/useAuth'
import { useLogout } from '@/features/auth/useLogout'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  onNavigate?: () => void
}

function getAdminInitials(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email?.trim() || ''
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/**
 * Nav + admin identity/sign-out — rendered inside AdminShell's fixed desktop
 * <aside> and, unchanged, inside AdminTopHeader's mobile Sheet (branding
 * lives in each of those two containers instead of here, since the two
 * present it differently — a plain link vs. a Sheet title).
 */
function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { profile, user } = useAuth()
  const { logout, isLoggingOut } = useLogout()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <nav aria-label="Admin" className="flex flex-1 flex-col gap-1">
        {ADMIN_NAV_ITEMS.map((item) =>
          item.href ? (
            <NavLink
              key={item.key}
              to={item.href}
              end={item.end ?? false}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.name}
            </NavLink>
          ) : (
            <div
              key={item.key}
              aria-disabled="true"
              className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60"
            >
              <item.icon className="size-4" aria-hidden="true" />
              <span className="flex-1">{item.name}</span>
              <Badge variant="outline" className="text-[0.65rem] text-muted-foreground/70">
                Soon
              </Badge>
            </div>
          ),
        )}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {getAdminInitials(profile?.fullName, user?.email)}
          </div>
          <div className="min-w-0">
            {profile?.fullName && (
              <p className="truncate text-sm font-medium text-foreground">{profile.fullName}</p>
            )}
            {user?.email && <p className="truncate text-caption text-muted-foreground">{user.email}</p>}
          </div>
        </div>

        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Exit to HerHealth
        </Link>
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            logout()
          }}
          disabled={isLoggingOut}
          className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {isLoggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar
