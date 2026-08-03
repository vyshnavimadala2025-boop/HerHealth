import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useLogout } from '@/features/auth/useLogout'

function AccountSection() {
  const { logout, isLoggingOut } = useLogout()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Manage your session and account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          variant="outline"
          onClick={logout}
          disabled={isLoggingOut}
          className="w-full sm:w-auto"
        >
          <LogOut />
          {isLoggingOut ? 'Logging out…' : 'Log out'}
        </Button>

        <div className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
          <p className="text-sm font-medium">Delete account</p>
          <p className="text-caption text-muted-foreground">
            You can now permanently delete your recorded HerHealth data — check-ins, period
            records, journal entries, PCOS/PCOD wellness entries, goals, and reminder
            preferences — from the Data &amp; Privacy section above.
          </p>
          <p className="text-caption text-muted-foreground">
            Closing your account and login entirely is a separate step and isn&apos;t included yet.
            Securely removing your login requires a server-side process that isn&apos;t built into
            the app yet; self-service account closure will be added as its own dedicated feature.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountSection
