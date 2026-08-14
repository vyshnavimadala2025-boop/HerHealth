import { useState, type ReactNode } from 'react'
import { Loader2, LogOut, ShieldCheck, Wrench } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'
import { useLogout } from '@/features/auth/useLogout'
import { getDefaultAnalyticsPeriod, setDefaultAnalyticsPeriod } from '@/features/admin/settings/adminPreferences'
import { USAGE_PERIODS, type UsagePeriod } from '@/features/admin/featureUsage/types'

function SettingRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

/**
 * Admin Phase 4 — Settings. Reuses the existing useAuth/useLogout hooks
 * (same ones AdminSidebar already uses) rather than duplicating sign-out
 * logic. The only mutable state on this page is the local "default
 * analytics period" UI preference (localStorage-backed, non-sensitive,
 * unrelated to authorization) — every other section is informational.
 */
function AdminSettingsPage() {
  const { user, profile } = useAuth()
  const { logout, isLoggingOut } = useLogout()
  const [defaultPeriod, setDefaultPeriodState] = useState<UsagePeriod>(() => getDefaultAnalyticsPeriod())

  const handlePeriodChange = (period: UsagePeriod) => {
    setDefaultPeriodState(period)
    setDefaultAnalyticsPeriod(period)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Admin account, platform information, and operational preferences." />

      <Card>
        <CardHeader>
          <CardTitle>Admin Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SettingRow label="Admin email" value={user?.email ?? '—'} />
          <SettingRow label="Name" value={profile?.fullName || '—'} />
          <SettingRow label="Admin role" value={<Badge className="bg-support text-support-foreground">Administrator</Badge>} />
          <SettingRow label="Account status" value={<Badge variant="outline">Active</Badge>} />
          <Button type="button" variant="outline" onClick={logout} disabled={isLoggingOut} className="self-start">
            {isLoggingOut ? <Loader2 className="animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}
            {isLoggingOut ? 'Signing out…' : 'Sign Out'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SettingRow label="Platform" value="SIRILA" />
          <SettingRow label="Environment" value={import.meta.env.MODE === 'production' ? 'Production' : import.meta.env.MODE} />
          <SettingRow label="Version / build" value="Not available — no build identifier is currently embedded in the client bundle." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <span className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Default analytics period</span>
          <div role="group" aria-label="Default analytics period" className="flex flex-wrap gap-1.5">
            {USAGE_PERIODS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={defaultPeriod === option.value ? 'default' : 'outline'}
                size="sm"
                aria-pressed={defaultPeriod === option.value}
                onClick={() => handlePeriodChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-caption text-muted-foreground">
            Saved to this browser only. Existing Feature Usage, Activity, and Overview pages keep their own defaults for now.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span className="font-medium text-foreground">Admin authorization</span>
            <Badge className="gap-1 bg-support text-support-foreground">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Protected
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span className="font-medium text-foreground">Admin data</span>
            <Badge className="gap-1 bg-support text-support-foreground">
              <ShieldCheck className="size-3" aria-hidden="true" />
              RLS protected
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span className="font-medium text-foreground">Service-role key</span>
            <Badge className="gap-1 bg-support text-support-foreground">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Not exposed to browser
            </Badge>
          </div>
          <p className="text-caption text-muted-foreground">Informational only — these properties are enforced by the database and cannot be changed from this screen.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2 text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Wrench className="size-4 text-muted-foreground" aria-hidden="true" />
              Maintenance mode
            </span>
            <Badge variant="outline" className="text-muted-foreground">
              Not configured
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminSettingsPage
