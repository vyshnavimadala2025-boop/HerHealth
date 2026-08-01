import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
        <Button asChild variant="ghost" size="sm">
          <Link to="/cycle-tracker">Cycle Tracker</Link>
        </Button>
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
