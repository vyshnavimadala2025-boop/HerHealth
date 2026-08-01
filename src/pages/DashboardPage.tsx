import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'
import { useLogout } from '@/features/auth/useLogout'
import { useDashboardData } from '@/features/checkins/useDashboardData'
import { formatFriendlyDate } from '@/features/checkins/types'
import CheckInStatusCard from '@/features/checkins/CheckInStatusCard'
import CheckInForm from '@/features/checkins/CheckInForm'
import RecentCheckIns from '@/features/checkins/RecentCheckIns'
import DashboardCycleCard from '@/features/periods/DashboardCycleCard'

function DashboardPage() {
  const { user, profile } = useAuth()
  const { logout, isLoggingOut } = useLogout()
  const { todayCheckIn, todayStatus, recentCheckIns, recentStatus, refresh } = useDashboardData()

  const firstName = profile?.fullName?.trim().split(' ')[0] || user?.email

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 sm:p-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
            <p className="text-muted-foreground">{formatFriendlyDate()}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} disabled={isLoggingOut}>
            <LogOut />
            {isLoggingOut ? 'Logging out…' : 'Log out'}
          </Button>
        </div>
        <p className="text-body text-muted-foreground">
          Take a moment to check in with yourself today.
        </p>
        <p className="text-caption text-muted-foreground">
          Your entries are private and visible only to you.
        </p>
      </div>

      <CheckInStatusCard status={todayStatus} checkIn={todayCheckIn} />

      {user && (
        <CheckInForm
          userId={user.id}
          initialCheckIn={todayCheckIn}
          todayStatus={todayStatus}
          onSaved={refresh}
        />
      )}

      <RecentCheckIns status={recentStatus} checkIns={recentCheckIns} />

      <DashboardCycleCard />
    </main>
  )
}

export default DashboardPage
