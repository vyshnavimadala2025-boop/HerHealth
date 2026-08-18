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
      className={cn('relative overflow-hidden rounded-md bg-muted', className)}
      {...props}
    >
      <span
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent motion-reduce:hidden"
        style={{ animation: 'shimmer-sweep 1.6s ease-in-out infinite' }}
      />
    </div>
  )
}

export default Skeleton
