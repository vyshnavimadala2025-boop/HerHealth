import { cn } from '@/lib/utils'

/**
 * Shared loading placeholder — preserves layout during load instead of a
 * bare spinner, which reads as more premium and reduces perceived wait.
 * Purely decorative (aria-hidden); the loading state it stands in for
 * still needs its own role="status" text elsewhere, same as existing
 * convention across the app.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted motion-reduce:animate-none', className)}
      {...props}
    />
  )
}

export default Skeleton
