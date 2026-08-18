import { useState, type ReactNode } from 'react'
import { Loader2, LogOut, ShieldAlert, ShieldCheck, Sparkles, Wrench } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'
import { useLogout } from '@/features/auth/useLogout'
import { getDefaultAnalyticsPeriod, setDefaultAnalyticsPeriod } from '@/features/admin/settings/adminPreferences'
import { USAGE_PERIODS, type UsagePeriod } from '@/features/admin/featureUsage/types'
import { FEATURE_SIRILA_CHAT, FEATURE_VISUAL_INSIGHT } from '@/features/aiIntelligence/constants'
import { useAdminAiSafetyMetrics } from '@/features/admin/aiSafety/useAdminAiSafetyMetrics'

function SettingRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

function SafetyStatCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-0.5 rounded-lg border border-border px-3 py-2">
      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-lg font-medium text-foreground">{value}</p>
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
  const aiSafety = useAdminAiSafetyMetrics()

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
          <CardTitle>SIRILA Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
              SIRILA Intelligence (chat)
            </span>
            {FEATURE_SIRILA_CHAT ? (
              <Badge className="bg-support text-support-foreground">Enabled</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
              Visual Insight (image analysis)
            </span>
            {FEATURE_VISUAL_INSIGHT ? (
              <Badge className="bg-support text-support-foreground">Enabled</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
            )}
          </div>
          <p className="text-caption text-muted-foreground">
            Controlled by FEATURE_SIRILA_CHAT / FEATURE_VISUAL_INSIGHT in source
            (src/features/aiIntelligence/constants.ts) — not configurable from this screen. Visual Insight is a
            planned post-launch feature; its architecture is preserved but disabled.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>AI Safety Metrics</CardTitle>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <ShieldAlert className="size-3" aria-hidden="true" />
              Aggregate only
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {aiSafety.status === 'loading' && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading safety metrics…
            </p>
          )}
          {aiSafety.status === 'error' && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm">
              <span className="text-muted-foreground">Unable to load AI safety metrics.</span>
              <Button type="button" variant="ghost" size="sm" onClick={aiSafety.refresh}>
                Retry
              </Button>
            </div>
          )}
          {aiSafety.status === 'ready' && aiSafety.metrics && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <SafetyStatCell label="Total" value={aiSafety.metrics.totalEvents} />
                <SafetyStatCell label="Routine" value="N/A" />
                <SafetyStatCell label="Urgent" value={aiSafety.metrics.urgentCount} />
                <SafetyStatCell label="Sensitive" value={aiSafety.metrics.sensitiveCount} />
                <SafetyStatCell
                  label="Emergency"
                  value={<span className="text-destructive">{aiSafety.metrics.emergencyCount}</span>}
                />
              </div>
              <p className="text-caption text-muted-foreground">
                Blocked {aiSafety.metrics.blockedCount} · Escalated {aiSafety.metrics.escalatedCount} · Last 24h{' '}
                {aiSafety.metrics.eventsLast24h} · Last 7d {aiSafety.metrics.eventsLast7d}
              </p>
              <p className="text-caption text-muted-foreground">
                &quot;Routine&quot; shows N/A — routine-tier messages are never written to the safety-event log by
                design, so this table cannot report that count. Every figure above is a count only: no message
                content, conversation text, or individual user is ever included.
              </p>
            </>
          )}
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
