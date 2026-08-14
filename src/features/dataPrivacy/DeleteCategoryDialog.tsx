import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
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

interface DeleteCategoryDialogProps {
  label: string
  onConfirmDelete: () => Promise<void>
}

/**
 * One reusable confirmation dialog for every Phase 12 category, mirroring
 * the single-click destructive-confirm pattern already used by
 * DeleteGoalDialog/DeleteJournalDialog/etc. Self-contained loading/error
 * state; calls the injected delete action itself and never reads or
 * displays any entry content — only the category label passed in as a
 * prop, and whatever friendly error message the service throws.
 */
function DeleteCategoryDialog({ label, onConfirmDelete }: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    setError(null)
    try {
      await onConfirmDelete()
      toast.success(`All your ${label.toLowerCase()} have been deleted.`)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          <Trash2 />
          Delete all
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all your {label.toLowerCase()}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes every {label.toLowerCase()} record in your SIRILA account.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className={buttonVariants({ variant: 'destructive' })}
          >
            {isDeleting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isDeleting ? 'Deleting…' : 'Delete permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCategoryDialog
