import { Link } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/useAuth'
import { useLogout } from '@/features/auth/useLogout'

function HeaderNav() {
  const { status } = useAuth()
  const { logout, isLoggingOut } = useLogout()

  if (status === 'loading') {
    return null
  }

  if (status === 'authenticated') {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Open navigation menu">
              <Menu />
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/cycle-tracker">Cycle Tracker</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/journal">Journal</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/wellness-tracker">Wellness Tracker</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/goals">Goals</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/reports">Reports</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={logout} disabled={isLoggingOut}>
          <LogOut />
          {isLoggingOut ? 'Logging out…' : 'Logout'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link to="/login">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link to="/signup">Get started</Link>
      </Button>
    </div>
  )
}

export default HeaderNav
