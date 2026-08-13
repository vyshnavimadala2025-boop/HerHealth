import type { ReactNode } from 'react'
import { ArrowLeft, ShieldCheck, UserX } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminUserDetail } from '@/features/admin/users/useAdminUserDetail'
import { deriveActivityStatus, formatAdminDate } from '@/features/admin/users/types'

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  )
}

/**
 * Admin Phase 3A user detail. Backed by public.admin_user_detail()
 * (0023_admin_user_detail.sql) — the same narrow operational allowlist as
 * the Users list, for exactly one user. No health content is fetched or
 * shown, by construction (the RPC never reads a health-content table).
 */
function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const { status, user, refresh } = useAdminUserDetail(userId)

  return (
    <div className="flex flex-col gap-6">
      <Button type="button" variant="ghost" size="sm" asChild className="w-fit">
        <Link to="/admin/users">
          <ArrowLeft aria-hidden="true" />
          Back to Users
        </Link>
      </Button>

      <PageHeader
        title={status === 'ready' && user ? user.fullName || 'User' : 'User'}
        description={status === 'ready' ? user?.email : undefined}
      />

      {status === 'loading' && (
        <div role="status" className="flex flex-col gap-4">
          <span className="sr-only">Loading user…</span>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="text-sm text-foreground">
            We couldn&rsquo;t load this user.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            Try again
          </Button>
        </div>
      )}

      {status === 'not-found' && (
        <EmptyState icon={UserX} title="User not found" description="This account may no longer exist." />
      )}

      {status === 'ready' && user && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Field label="Name" value={user.fullName || '—'} />
                <Field label="Email" value={user.email} />
                <Field label="User ID" value={<span className="font-mono text-caption break-all">{user.id}</span>} />
                <Field label="Created" value={formatAdminDate(user.createdAt)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Field
                  label="Onboarding"
                  value={
                    user.onboardingCompleted
                      ? `Completed${user.onboardingCompletedAt ? ` on ${formatAdminDate(user.onboardingCompletedAt)}` : ''}`
                      : 'Incomplete'
                  }
                />
                <Field
                  label="Last Active"
                  value={
                    user.lastActiveAt
                      ? `${formatAdminDate(user.lastActiveAt)} (${deriveActivityStatus(user.lastActiveAt) === 'active' ? 'Active' : 'Inactive'})`
                      : 'Unavailable — no recorded activity'
                  }
                />
                <Field
                  label="Admin Status"
                  value={
                    user.isAdmin ? (
                      <Badge className="bg-support text-support-foreground">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Standard user
                      </Badge>
                    )
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-dashed border-border p-4 text-caption text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p>
              This is an operational account view, not a medical-record viewer. Cycle, symptom, journal, sleep,
              nutrition, stress, hormone, and other health data are never shown here.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminUserDetailPage
