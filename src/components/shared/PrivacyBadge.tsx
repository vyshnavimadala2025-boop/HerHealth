import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivacyBadgeProps {
  label?: string
  className?: string
}

/**
 * Small, consistent "this is private" mark — replaces the repeated
 * hand-written caption sentences on Journal/PCOS Tracker/Profile/Reports
 * with one recognizable visual signal, reused everywhere instead of
 * re-explained everywhere.
 */
function PrivacyBadge({ label = 'Private to your account', className }: PrivacyBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full bg-support/60 px-3 py-1 text-caption font-medium text-support-foreground',
        className,
      )}
    >
      <ShieldCheck className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

export default PrivacyBadge
