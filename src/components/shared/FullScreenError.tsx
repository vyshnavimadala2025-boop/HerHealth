import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FullScreenErrorProps {
  title: string
  description?: string
  onRetry: () => void
  retryLabel?: string
}

/**
 * Full-screen error state for route guards — the error-branch counterpart
 * to FullScreenLoader, so a failed profile fetch never silently falls
 * through to rendering the protected screen with null data.
 */
function FullScreenError({ title, description, onRetry, retryLabel = 'Try again' }: FullScreenErrorProps) {
  return (
    <main role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="max-w-xs text-caption text-muted-foreground">{description}</p>}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {retryLabel}
      </Button>
    </main>
  )
}

export default FullScreenError
