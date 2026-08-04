import { BookOpen, Loader2, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import JournalEntryCard from '@/features/journal/JournalEntryCard'
import type { JournalEntry } from '@/features/journal/types'

interface JournalEntryListProps {
  status: 'loading' | 'ready' | 'error'
  entries: JournalEntry[]
  hasLoadedEntries: boolean
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  onRetry: () => void
  onEdit: (entry: JournalEntry) => void
  onDeleted: (entryId: string) => void
}

function JournalEntryList({
  status,
  entries,
  hasLoadedEntries,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onRetry,
  onEdit,
  onDeleted,
}: JournalEntryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Journal History</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2 py-1">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="flex flex-col items-start gap-2 py-4">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your journal entries. Please try again.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && !hasLoadedEntries && (
          <EmptyState
            icon={BookOpen}
            title="Your journal is ready when you are"
            description="Add your first entry above to begin recording your personal reflections."
          />
        )}

        {status === 'ready' && hasLoadedEntries && entries.length === 0 && (
          <EmptyState
            icon={SearchX}
            title="No matching entries"
            description="Try a different search term."
          />
        )}

        {status === 'ready' && entries.length > 0 && (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {entries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} onEdit={onEdit} onDeleted={onDeleted} />
              ))}
            </ul>
            {hasMore && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore && <Loader2 className="animate-spin" aria-hidden="true" />}
                {isLoadingMore ? 'Loading…' : 'Load more'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default JournalEntryList
