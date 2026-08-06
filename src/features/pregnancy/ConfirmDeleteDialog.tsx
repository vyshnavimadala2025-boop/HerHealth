import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
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

interface ConfirmDeleteDialogProps {
  title: string
  description?: string
  ariaLabel: string
  onConfirm: () => Promise<void>
}

/**
 * One generic confirm-delete dialog reused across every Baby Growth
 * sub-feature (entries, appointments, milestones, checklist items)
 * instead of a near-identical dialog per entity type.
 */
function ConfirmDeleteDialog({ title, description, ariaLabel, onConfirm }: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await onConfirm()
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" className="size-11" aria-label={ariaLabel}>
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description ?? 'This action cannot be undone.'}</AlertDialogDescription>
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
            {isDeleting ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDeleteDialog
