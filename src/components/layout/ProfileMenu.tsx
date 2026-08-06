import { Link } from 'react-router-dom'
import {
  Bell,
  Download,
  Lock,
  LogOut,
  Settings,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/useAuth'
import { useLogout } from '@/features/auth/useLogout'

function getInitials(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email?.trim() || ''
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/**
 * Profile ▾ — avatar dropdown. Every item links to a real, already-built
 * destination — Notifications → the real reminder preferences on
 * /goals#reminders, Privacy and Security → the real data-privacy section
 * on /profile (that one section honestly covers both), Export Data → the
 * real export card on /reports#export, Delete Data → the same real
 * data-deletion section on /profile — rather than a placeholder, since
 * all of this functionality already exists. Sign Out reuses the existing
 * useLogout() hook unchanged.
 */
function ProfileMenu() {
  const { profile, user } = useAuth()
  const { logout, isLoggingOut } = useLogout()
  const initials = getInitials(profile?.fullName, user?.email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Open profile menu"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        {(profile?.fullName || user?.email) && (
          <div className="px-2 py-1.5">
            {profile?.fullName && <p className="truncate text-sm font-medium text-foreground">{profile.fullName}</p>}
            {user?.email && <p className="truncate text-caption text-muted-foreground">{user.email}</p>}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2">
            <User className="size-4 text-primary" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile#account-settings" className="flex items-center gap-2">
            <Settings className="size-4 text-primary" aria-hidden="true" />
            Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/goals#reminders" className="flex items-center gap-2">
            <Bell className="size-4 text-primary" aria-hidden="true" />
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile#privacy" className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            Privacy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile#privacy" className="flex items-center gap-2">
            <Lock className="size-4 text-primary" aria-hidden="true" />
            Security
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/reports#export" className="flex items-center gap-2">
            <Download className="size-4 text-primary" aria-hidden="true" />
            Export Data
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile#privacy" className="flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" aria-hidden="true" />
            Delete Data
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} disabled={isLoggingOut}>
          <LogOut className="size-4" aria-hidden="true" />
          {isLoggingOut ? 'Signing out…' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileMenu
