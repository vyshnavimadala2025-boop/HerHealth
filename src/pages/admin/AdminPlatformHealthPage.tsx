import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  KeyRound,
  RefreshCw,
  ShieldQuestion,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import Skeleton from '@/components/shared/Skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminHealth } from '@/features/admin/health/useAdminHealth'
import type { HealthCheckResult, OverallHealthStatus } from '@/features/admin/health/types'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function OverallStatusBanner({ status }: { status: OverallHealthStatus }) {
  if (status === 'loading') {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-5">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const config: Record<Exclude<OverallHealthStatus, 'loading'>, { icon: LucideIcon; label: string; className: string; description: string }> = {
    healthy: {
      icon: CheckCircle2,
      label: 'Healthy',
      className: 'bg-support text-support-foreground',
      description: 'All platform health checks passed.',
    },
    warning: {
      icon: AlertTriangle,
      label: 'Warning',
      className: 'bg-attention text-attention-foreground',
      description: 'One or more platform health checks failed.',
    },
    critical: {
      icon: XCircle,
      label: 'Critical',
      className: 'bg-destructive/10 text-destructive',
      description: 'All platform health checks failed.',
    },
  }
  const { icon: Icon, label, className, description } = config[status]

  return (
    <Card role="status" aria-live="polite">
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`flex size-11 items-center justify-center rounded-full ${className}`}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-heading font-display text-foreground">{label}</p>
          <p className="text-caption text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface HealthCheckCardProps {
  icon: LucideIcon
  label: string
  description: string
  result: HealthCheckResult | undefined
  loading: boolean
}

function HealthCheckCard({ icon: Icon, label, description, result, loading }: HealthCheckCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
          </div>
          {loading ? (
            <Skeleton className="h-6 w-20" />
          ) : result?.status === 'healthy' ? (
            <Badge className="gap-1 bg-support text-support-foreground">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              Healthy
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="size-3" aria-hidden="true" />
              Error
            </Badge>
          )}
        </div>
        <p className="text-caption text-muted-foreground">{description}</p>
        {!loading && result && (
          <p className="text-caption text-muted-foreground">
            {result.message}
            {result.latencyMs !== null ? ` · ${result.latencyMs}ms` : ''}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Admin Phase 4 — Platform Health. Every check is a real network round
 * trip against an existing admin RPC or the Supabase Auth SDK (see
 * adminHealthService.ts) — no new migration, no fabricated status. No
 * error-log system exists anywhere in this application, so "Recent System
 * Errors" says so honestly rather than inventing one.
 */
function AdminPlatformHealthPage() {
  const { pageStatus, snapshot, overallStatus, refresh } = useAdminHealth()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Platform Health"
          description="Live operational status of the systems HerHealth Admin depends on."
        />
        <Button type="button" variant="outline" size="sm" onClick={refresh} disabled={pageStatus === 'loading'}>
          <RefreshCw className={pageStatus === 'loading' ? 'animate-spin' : ''} aria-hidden="true" />
          Refresh Health
        </Button>
      </div>

      {pageStatus === 'error' && (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-start gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p role="alert" className="text-sm text-foreground">
              We couldn&rsquo;t run platform health checks.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={refresh}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      <OverallStatusBanner status={pageStatus === 'error' ? 'critical' : overallStatus} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <HealthCheckCard
          icon={Database}
          label="Database"
          description="Supabase/Postgres reachability, verified via an existing admin function call."
          result={snapshot?.database}
          loading={pageStatus === 'loading'}
        />
        <HealthCheckCard
          icon={KeyRound}
          label="Authentication"
          description="Supabase Auth service reachability, verified without exposing any token."
          result={snapshot?.authentication}
          loading={pageStatus === 'loading'}
        />
        <HealthCheckCard
          icon={Zap}
          label="Admin RPC"
          description="End-to-end admin RPC infrastructure, verified via an existing authorized call."
          result={snapshot?.adminRpc}
          loading={pageStatus === 'loading'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Environment</p>
            <p className="text-foreground">{import.meta.env.MODE === 'production' ? 'Production' : import.meta.env.MODE}</p>
          </div>
          <div>
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Version / Build</p>
            <p className="text-foreground">Not available — no build identifier is currently embedded in the client bundle.</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Last Checked</p>
            <p className="flex items-center gap-1.5 text-foreground">
              <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
              {snapshot ? formatDateTime(snapshot.checkedAt) : pageStatus === 'loading' ? 'Checking…' : 'Unavailable'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent System Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p>No system error feed configured. This application has no error-tracking or logging service integrated yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPlatformHealthPage
