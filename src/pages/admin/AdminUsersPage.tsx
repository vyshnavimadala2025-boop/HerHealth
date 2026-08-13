import { CheckCircle2, Circle, HelpCircle, MinusCircle, Users as UsersIcon, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdminUsers } from '@/features/admin/users/useAdminUsers'
import {
  deriveActivityStatus,
  formatAdminDate,
  type ActivityFilter,
  type OnboardingFilter,
  type UsersSort,
} from '@/features/admin/users/types'

const ONBOARDING_OPTIONS: { value: OnboardingFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
]

const ACTIVITY_OPTIONS: { value: ActivityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'unknown', label: 'Unknown' },
]

interface FilterGroupProps<T extends string> {
  label: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}

function FilterGroup<T extends string>({ label, value, onChange, options }: FilterGroupProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            size="sm"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

function OnboardingBadge({ completed }: { completed: boolean }) {
  return completed ? (
    <Badge className="gap-1 bg-support text-support-foreground">
      <CheckCircle2 className="size-3" aria-hidden="true" />
      Completed
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Circle className="size-3" aria-hidden="true" />
      Incomplete
    </Badge>
  )
}

function ActivityBadge({ lastActiveAt }: { lastActiveAt: string | null }) {
  const activityStatus = deriveActivityStatus(lastActiveAt)

  if (activityStatus === 'active') {
    return (
      <Badge className="gap-1 bg-support text-support-foreground">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        Active
      </Badge>
    )
  }
  if (activityStatus === 'inactive') {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <MinusCircle className="size-3" aria-hidden="true" />
        Inactive
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground/70">
      <HelpCircle className="size-3" aria-hidden="true" />
      Unknown
    </Badge>
  )
}

/**
 * Admin Phase 3A. Server-side search/filter/sort/pagination via
 * public.admin_list_users() (0022_admin_list_users.sql) — never fetches
 * the full user base into the browser. Only operational/account fields
 * are shown; no health content of any kind. "Onboarding" is deliberately
 * two-state (Completed/Incomplete) rather than three — the schema has only
 * a boolean plus a completion timestamp, with no partial-progress signal,
 * so a "Not Started" vs "In Progress" split would fabricate a distinction
 * the data can't support.
 */
function AdminUsersPage() {
  const {
    status,
    rows,
    totalCount,
    totalPages,
    page,
    setPage,
    searchInput,
    setSearchInput,
    onboarding,
    setOnboarding,
    activity,
    setActivity,
    sort,
    setSort,
    pageSize,
    refresh,
  } = useAdminUsers()

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users" description="Manage and monitor HerHealth platform users." />

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-1.5 sm:max-w-sm">
          <Label htmlFor="users-search">Search</Label>
          <div className="relative">
            <Input
              id="users-search"
              type="text"
              placeholder="Search by name, email, or user ID"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="pr-9"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Clear search"
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0.5 my-auto"
              >
                <X />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-4">
            <FilterGroup label="Onboarding" value={onboarding} onChange={setOnboarding} options={ONBOARDING_OPTIONS} />
            <FilterGroup label="Activity" value={activity} onChange={setActivity} options={ACTIVITY_OPTIONS} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="users-sort">Sort by</Label>
            <select
              id="users-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as UsersSort)}
              className="border-input h-9 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="newest">Newest joined</option>
              <option value="oldest">Oldest joined</option>
              <option value="recently_active">Recently active</option>
              <option value="least_active">Least recently active</option>
              <option value="name_asc">Name A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {status === 'error' && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="text-sm text-foreground">
            We couldn&rsquo;t load users.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            Try again
          </Button>
        </div>
      )}

      {status === 'loading' && (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">Loading users…</span>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      )}

      {status === 'ready' && rows.length === 0 && (
        <EmptyState icon={UsersIcon} title="No users found" description="No users match your current search and filters." />
      )}

      {status === 'ready' && rows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-caption font-medium tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="px-4 py-3">
                  User
                </th>
                <th scope="col" className="px-4 py-3">
                  Email
                </th>
                <th scope="col" className="px-4 py-3">
                  Joined
                </th>
                <th scope="col" className="px-4 py-3">
                  Onboarding
                </th>
                <th scope="col" className="px-4 py-3">
                  Last Active
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium text-foreground">{row.fullName || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatAdminDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <OnboardingBadge completed={row.onboardingCompleted} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {row.lastActiveAt ? formatAdminDate(row.lastActiveAt) : 'No recorded activity'}
                  </td>
                  <td className="px-4 py-3">
                    <ActivityBadge lastActiveAt={row.lastActiveAt} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link to={`/admin/users/${row.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === 'ready' && totalCount > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-caption text-muted-foreground" aria-live="polite">
            Showing {rangeStart}–{rangeEnd} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="text-caption text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage
