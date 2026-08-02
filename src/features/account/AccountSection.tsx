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
            Securely deleting an account requires a server-side process to remove your data
            safely, which isn&apos;t available in the app yet. Self-service account deletion will
            be added as a separate, dedicated feature rather than a client-only action, since it
            can&apos;t be done securely from the browser alone.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountSection
