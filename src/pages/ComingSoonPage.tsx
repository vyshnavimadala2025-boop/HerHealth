import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import { getComingSoonEntry } from '@/components/layout/comingSoonCatalog'

/**
 * Shared destination for every nav entry that doesn't have a built
 * feature behind it yet (see comingSoonCatalog.ts). Keeping this as one
 * dynamic route means a future real feature only needs its nav entry's
 * href updated — no route or navigation restructuring required.
 */
function ComingSoonPage() {
  const { slug } = useParams<{ slug: string }>()
  const entry = getComingSoonEntry(slug)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 p-4 py-16 text-center animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
        <entry.icon className="size-7" aria-hidden="true" />
      </div>
      <p className="text-caption font-medium tracking-wide text-primary uppercase">{entry.category}</p>
      <PageHeader title={entry.title} description={entry.description} className="items-center" />
      <p className="rounded-full border border-dashed border-border px-4 py-1.5 text-caption font-medium tracking-wide text-muted-foreground uppercase">
        Coming soon
      </p>
      <Button asChild variant="outline">
        <Link to="/dashboard">
          <ArrowLeft aria-hidden="true" />
          Back to Dashboard
        </Link>
      </Button>
    </main>
  )
}

export default ComingSoonPage
