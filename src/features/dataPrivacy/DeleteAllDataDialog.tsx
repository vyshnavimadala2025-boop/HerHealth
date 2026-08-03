import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import {
  DATA_CATEGORIES,
  DELETE_ALL_CONFIRMATION_PHRASE,
  isDeleteAllConfirmed,
} from '@/features/dataPrivacy/types'
import type { DeletionOutcome } from '@/features/dataPrivacy/types'

function categoryLabel(category: DeletionOutcome['category']): string {
  return DATA_CATEGORIES.find((item) => item.value === category)?.label ?? category
}

interface DeleteAllDataDialogProps {
  onConfirmDeleteAll: () => Promise<DeletionOutcome[]>
}

/**
 * Master "delete everything" action. Requires typing the exact
 * confirmation phrase before the confirm button enables — a stronger gate
 * than any single-category dialog, since this one destroys every category
 * at once. Reports partial failure explicitly (never a false "all
 * deleted") and, on partial failure, keeps the dialog open so the user can
 * retry — re-running is safe because deleting an already-empty category is
 * a harmless no-op.
 */
function DeleteAllDataDialog({ onConfirmDeleteAll }: DeleteAllDataDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [failedCategories, setFailedCategories] = useState<string[] | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const canConfirm = isDeleteAllConfirmed(confirmText) && !isDeleting

  const resetState = () => {
    setConfirmText('')
    setFailedCategories(null)
    setGeneralError(null)
  }

  const handleDelete = async () => {
    if (!canConfirm || isDeleting) return
    setIsDeleting(true)
    setFailedCategories(null)
    setGeneralError(null)
    try {
      const outcomes = await onConfirmDeleteAll()
      const failed = outcomes.filter((outcome) => !outcome.success)
      if (failed.length === 0) {
        toast.success('All your HerHealth data has been deleted.')
        setOpen(false)
        resetState()
      } else {
        setFailedCategories(failed.map((outcome) => categoryLabel(outcome.category)))
      }
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isDeleting) return
        setOpen(next)
        if (!next) resetState()
      }}
    >
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          <Trash2 />
          Delete All My HerHealth Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all your HerHealth data?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes every check-in, period record, journal entry, PCOS/PCOD
            wellness entry, wellness goal, and reminder preference in your account. This action
            cannot be undone. Consider exporting your data from Reports first.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delete-all-confirm">Type {DELETE_ALL_CONFIRMATION_PHRASE} to confirm</Label>
          <Input
            id="delete-all-confirm"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            aria-describedby="delete-all-confirm-hint"
            disabled={isDeleting}
            autoComplete="off"
          />
          <p id="delete-all-confirm-hint" className="text-caption text-muted-foreground">
            This confirms you understand this cannot be undone.
          </p>
        </div>

        {failedCategories && (
          <p role="alert" className="text-caption text-destructive">
            We deleted what we could, but couldn&apos;t delete: {failedCategories.join(', ')}. Please
            try again.
          </p>
        )}
        {generalError && (
          <p role="alert" className="text-caption text-destructive">
            {generalError}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              handleDelete()
            }}
            disabled={!canConfirm}
            className={buttonVariants({ variant: 'destructive' })}
          >
            {isDeleting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isDeleting ? 'Deleting…' : 'Delete everything permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteAllDataDialog
