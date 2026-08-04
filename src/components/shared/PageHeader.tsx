import { cn } from '@/lib/utils'

interface PageHeaderProps {
  id?: string
  title: string
  description?: string
  captions?: string[]
  className?: string
}

/**
 * Shared page-title block used across every authenticated page, so the
 * same title/description/disclaimer-caption hierarchy (font-display
 * title, body description, caption-sized disclaimers) doesn't get
 * hand-rolled slightly differently on each page. Purely presentational —
 * no data, no behavior.
 */
function PageHeader({ id, title, description, captions, className }: PageHeaderProps) {
  return (
    <div id={id} className={cn('flex scroll-mt-24 flex-col gap-2', className)}>
      <h1 className="text-title font-display text-foreground">{title}</h1>
      {description && <p className="text-body text-muted-foreground">{description}</p>}
      {captions?.map((caption) => (
        <p key={caption} className="text-caption text-muted-foreground">
          {caption}
        </p>
      ))}
    </div>
  )
}

export default PageHeader
