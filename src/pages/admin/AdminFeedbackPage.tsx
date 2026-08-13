import { useEffect, useState } from 'react'
import {
  Bug,
  CheckCircle2,
  ClipboardList,
  Flame,
  Lightbulb,
  MessageSquare,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAdminFeedback } from '@/features/admin/feedback/useAdminFeedback'
import { useAdminFeedbackDetail } from '@/features/admin/feedback/useAdminFeedbackDetail'
import {
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES,
  type AdminFeedbackListItem,
  type FeedbackCategoryFilter,
  type FeedbackPriority,
  type FeedbackPriorityFilter,
  type FeedbackStatus,
  type FeedbackStatusFilter,
  type FeedbackTypeFilter,
} from '@/features/admin/feedback/types'
import { FEEDBACK_CATEGORIES, FEEDBACK_TYPES, type FeedbackCategory, type FeedbackType } from '@/features/feedback/types'

function labelFor(options: readonly { value: string; label: string }[], value: string | null): string {
  if (!value) return '—'
  return options.find((option) => option.value === value)?.label ?? value
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TYPE_ICONS: Record<FeedbackType, LucideIcon> = {
  bug: Bug,
  feature_request: Lightbulb,
  general_feedback: MessageSquare,
  usability: Wrench,
}

function TypeBadge({ type }: { type: FeedbackType }) {
  const Icon = TYPE_ICONS[type]
  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="size-3" aria-hidden="true" />
      {labelFor(FEEDBACK_TYPES, type)}
    </Badge>
  )
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const label = labelFor(FEEDBACK_STATUSES, status)
  if (status === 'in_progress') return <Badge className="bg-attention text-attention-foreground">{label}</Badge>
  if (status === 'resolved') return <Badge className="gap-1 bg-support text-support-foreground"><CheckCircle2 className="size-3" aria-hidden="true" />{label}</Badge>
  if (status === 'open') return <Badge className="bg-primary/10 text-primary">{label}</Badge>
  if (status === 'closed') return <Badge variant="outline" className="text-muted-foreground/70">{label}</Badge>
  return <Badge variant="outline">{label}</Badge>
}

function PriorityBadge({ priority }: { priority: FeedbackPriority | null }) {
  if (!priority) return <span className="text-caption text-muted-foreground">Unset</span>
  if (priority === 'critical')
    return (
      <Badge variant="destructive" className="gap-1">
        <Flame className="size-3" aria-hidden="true" />
        Critical
      </Badge>
    )
  if (priority === 'high') return <Badge className="bg-attention text-attention-foreground">High</Badge>
  if (priority === 'medium') return <Badge variant="outline">Medium</Badge>
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Low
    </Badge>
  )
}

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

const STATUS_OPTIONS: { value: FeedbackStatusFilter; label: string }[] = [{ value: 'all', label: 'All' }, ...FEEDBACK_STATUSES]
const TYPE_OPTIONS: { value: FeedbackTypeFilter; label: string }[] = [{ value: 'all', label: 'All' }, ...FEEDBACK_TYPES]
const PRIORITY_OPTIONS: { value: FeedbackPriorityFilter; label: string }[] = [{ value: 'all', label: 'All' }, ...FEEDBACK_PRIORITIES]

interface FeedbackDetailSheetProps {
  feedbackId: string | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

function FeedbackDetailSheet({ feedbackId, onOpenChange, onSaved }: FeedbackDetailSheetProps) {
  const { status, item, save, saveStatus } = useAdminFeedbackDetail(feedbackId ?? undefined)
  const [draftStatus, setDraftStatus] = useState<FeedbackStatus>('new')
  const [draftPriority, setDraftPriority] = useState<FeedbackPriority | ''>('')
  const [draftCategory, setDraftCategory] = useState<FeedbackCategory | ''>('')
  const [draftNotes, setDraftNotes] = useState('')

  useEffect(() => {
    if (status === 'ready' && item) {
      setDraftStatus(item.status)
      setDraftPriority(item.priority ?? '')
      setDraftCategory(item.category ?? '')
      setDraftNotes(item.adminNotes ?? '')
    }
  }, [status, item])

  const handleSave = async () => {
    await save({
      status: draftStatus,
      priority: draftPriority || null,
      category: draftCategory || null,
      adminNotes: draftNotes.trim() || null,
    })
    onSaved()
  }

  return (
    <Sheet open={feedbackId !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Feedback detail</SheetTitle>
          <SheetDescription className="sr-only">View and manage this feedback submission</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-5 pb-5">
          {status === 'loading' && (
            <div role="status" className="flex flex-col gap-3">
              <span className="sr-only">Loading feedback…</span>
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          )}

          {status === 'error' && (
            <p role="alert" className="text-sm text-destructive">
              We couldn&rsquo;t load this feedback item.
            </p>
          )}

          {status === 'not-found' && <p className="text-sm text-muted-foreground">This feedback item could not be found.</p>}

          {status === 'ready' && item && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={item.type} />
                  <StatusBadge status={item.status} />
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="text-sm whitespace-pre-wrap text-foreground">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-caption text-muted-foreground">
                <div>
                  <p className="font-medium tracking-wide uppercase">Submitted</p>
                  <p>{formatDate(item.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium tracking-wide uppercase">Updated</p>
                  <p>{formatDate(item.updatedAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium tracking-wide uppercase">Submitted by</p>
                  <p>{item.submitterName || item.submitterEmail || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="feedback-status">Status</Label>
                  <select
                    id="feedback-status"
                    value={draftStatus}
                    onChange={(event) => setDraftStatus(event.target.value as FeedbackStatus)}
                    className="border-input h-9 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {FEEDBACK_STATUSES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="feedback-priority">Priority</Label>
                  <select
                    id="feedback-priority"
                    value={draftPriority}
                    onChange={(event) => setDraftPriority(event.target.value as FeedbackPriority | '')}
                    className="border-input h-9 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Unset</option>
                    {FEEDBACK_PRIORITIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-caption text-muted-foreground">Product priority only — not a medical-risk assessment.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="feedback-category">Feature / category</Label>
                  <select
                    id="feedback-category"
                    value={draftCategory}
                    onChange={(event) => setDraftCategory(event.target.value as FeedbackCategory | '')}
                    className="border-input h-9 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">Not specified</option>
                    {FEEDBACK_CATEGORIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="feedback-admin-notes">Admin notes (private)</Label>
                  <Textarea
                    id="feedback-admin-notes"
                    value={draftNotes}
                    onChange={(event) => setDraftNotes(event.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Visible to admins only — never shown to the user."
                  />
                </div>

                {saveStatus === 'error' && (
                  <p role="alert" className="text-caption text-destructive">
                    We couldn&rsquo;t save your changes. Please try again.
                  </p>
                )}

                <Button type="button" onClick={handleSave} disabled={saveStatus === 'saving'} className="self-start">
                  {saveStatus === 'saving' ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Admin Phase 3E. Server-side search/filter/pagination via
 * public.admin_list_feedback() (0027_admin_feedback.sql). List items show
 * no submitter identity (per the Phase 3E spec's own example); identity
 * appears only in the detail sheet, backed by admin_get_feedback_detail().
 * Status/priority/category/admin_notes are the only mutable fields, saved
 * via admin_update_feedback() — the only write path in the entire admin
 * architecture.
 */
function AdminFeedbackPage() {
  const {
    status,
    items,
    totalCount,
    totalPages,
    page,
    setPage,
    kpis,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    pageSize,
    refresh,
  } = useAdminFeedback()

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalCount)

  const kpiCards: { key: string; label: string; value: number | null }[] = [
    { key: 'total', label: 'Total Feedback', value: kpis?.total ?? null },
    { key: 'new', label: 'New', value: kpis?.newCount ?? null },
    { key: 'open', label: 'Open', value: kpis?.openCount ?? null },
    { key: 'in-progress', label: 'In Progress', value: kpis?.inProgressCount ?? null },
    { key: 'resolved', label: 'Resolved', value: kpis?.resolvedCount ?? null },
    { key: 'critical', label: 'Critical', value: kpis?.criticalCount ?? null },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Feedback"
        description="Review, categorize, prioritize, and resolve feedback submitted by HerHealth users."
      />

      <div role="status" aria-live="polite" aria-busy={status === 'loading'} className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {status === 'loading' && <span className="sr-only">Loading feedback metrics…</span>}
        {kpiCards.map((card) => (
          <Card key={card.key} className="gap-2 py-4">
            <CardContent className="flex flex-col gap-1 px-4">
              <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{card.label}</p>
              {card.value === null ? <Skeleton className="h-7 w-12" /> : <p className="text-heading font-display text-foreground">{card.value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-1.5 sm:max-w-sm">
          <Label htmlFor="feedback-search">Search</Label>
          <div className="relative">
            <Input
              id="feedback-search"
              type="text"
              placeholder="Search feedback text"
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

        <div className="flex flex-wrap gap-4">
          <FilterGroup label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          <FilterGroup label="Type" value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
          <FilterGroup label="Priority" value={priorityFilter} onChange={setPriorityFilter} options={PRIORITY_OPTIONS} />

          <div className="flex flex-col gap-1.5">
            <span className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Feature</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as FeedbackCategoryFilter)}
              className="border-input h-9 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">All</option>
              {FEEDBACK_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {status === 'error' && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p role="alert" className="text-sm text-foreground">
            We couldn&rsquo;t load feedback.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            Try again
          </Button>
        </div>
      )}

      {status === 'loading' && (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">Loading feedback…</span>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <EmptyState icon={ClipboardList} title="No feedback has been submitted yet" description="No feedback matches your current search and filters." />
      )}

      {status === 'ready' && items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((feedbackItem: AdminFeedbackListItem) => (
            <li key={feedbackItem.id}>
              <button
                type="button"
                onClick={() => setSelectedId(feedbackItem.id)}
                className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={feedbackItem.type} />
                    <StatusBadge status={feedbackItem.status} />
                    <PriorityBadge priority={feedbackItem.priority} />
                  </div>
                  <p className="line-clamp-2 text-sm text-foreground">{feedbackItem.description}</p>
                  <p className="text-caption text-muted-foreground">
                    {feedbackItem.category ? `${labelFor(FEEDBACK_CATEGORIES, feedbackItem.category)} · ` : ''}
                    Submitted {formatDate(feedbackItem.createdAt)}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {status === 'ready' && totalCount > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-caption text-muted-foreground" aria-live="polite">
            Showing {rangeStart}–{rangeEnd} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
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

      <FeedbackDetailSheet
        feedbackId={selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onSaved={() => {
          setSelectedId(null)
          refresh()
        }}
      />
    </div>
  )
}

export default AdminFeedbackPage
