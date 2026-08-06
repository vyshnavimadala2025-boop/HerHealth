import { useState, type FormEvent } from 'react'
import { Loader2, PartyPopper, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDeleteDialog from '@/features/pregnancy/ConfirmDeleteDialog'
import { createPregnancyMilestone, deletePregnancyMilestone } from '@/features/pregnancy/pregnancyMilestoneService'
import { formatFriendlyDate, getLocalDateString } from '@/features/periods/dateUtils'
import { MILESTONE_TYPE_OPTIONS, type MilestoneType, type PregnancyMilestone } from '@/features/pregnancy/types'

interface MilestoneGalleryProps {
  userId: string
  status: 'loading' | 'ready' | 'error'
  milestones: PregnancyMilestone[]
  onChanged: () => void
}

function typeLabel(type: MilestoneType) {
  return MILESTONE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}

/** A gentle celebratory pulse on newly-added cards — a single, restrained entrance animation, not a continuous or flashy effect. */
function MilestoneGallery({ userId, status, milestones, onChanged }: MilestoneGalleryProps) {
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('custom')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(getLocalDateString())
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('Please enter a title for this milestone')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      await createPregnancyMilestone(userId, {
        milestoneType,
        title: title.trim(),
        milestoneDate: date,
        note: null,
      })
      setTitle('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-support/60 text-support-foreground">
            <PartyPopper className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Milestone Gallery</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-muted/30 p-4 sm:flex-row sm:items-end" noValidate>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="milestone-type">Milestone</Label>
            <select
              id="milestone-type"
              value={milestoneType}
              onChange={(event) => setMilestoneType(event.target.value as MilestoneType)}
              className="h-11 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {MILESTONE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {milestoneType === 'custom' && (
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="milestone-title">Title</Label>
              <Input id="milestone-title" className="h-11 rounded-xl" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Custom milestone" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="milestone-date">Date</Label>
            <Input id="milestone-date" type="date" className="h-11 rounded-xl" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-11 rounded-xl"
            disabled={isSaving}
            onClick={() => {
              if (milestoneType !== 'custom' && !title) setTitle(typeLabel(milestoneType))
            }}
          >
            {isSaving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
            Add
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        )}

        {status === 'loading' && (
          <div role="status" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {status === 'error' && <p className="text-sm text-muted-foreground">We couldn&apos;t load your milestones.</p>}

        {status === 'ready' && milestones.length === 0 && (
          <EmptyState icon={PartyPopper} title="No milestones yet" description="Celebrate your first milestone above." />
        )}

        {status === 'ready' && milestones.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex animate-in items-start justify-between gap-2 rounded-xl border border-border bg-card p-3.5 text-sm shadow-sm fade-in zoom-in-95 duration-300 motion-reduce:animate-none"
              >
                <div className="min-w-0">
                  <p className="text-caption font-medium tracking-wide text-primary uppercase">{typeLabel(milestone.milestoneType)}</p>
                  <p className="font-medium">{milestone.title}</p>
                  <p className="text-caption text-muted-foreground">{formatFriendlyDate(milestone.milestoneDate)}</p>
                </div>
                <ConfirmDeleteDialog
                  title="Delete this milestone?"
                  ariaLabel="Delete this milestone"
                  onConfirm={async () => {
                    await deletePregnancyMilestone(milestone.id)
                    onChanged()
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MilestoneGallery
