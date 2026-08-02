import { useMemo, useState } from 'react'
import { useJournalData } from '@/features/journal/useJournalData'
import JournalEntryForm from '@/features/journal/JournalEntryForm'
import JournalSearch from '@/features/journal/JournalSearch'
import JournalEntryList from '@/features/journal/JournalEntryList'
import type { JournalEntry } from '@/features/journal/types'

function JournalPage() {
  const { entries, status, hasMore, isLoadingMore, loadMore, create, update, removeEntry, retry } =
    useJournalData()
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [search, setSearch] = useState('')

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return entries
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) || entry.content.toLowerCase().includes(query),
    )
  }, [entries, search])

  const handleSaved = () => {
    setEditingEntry(null)
  }

  const handleDeleted = (entryId: string) => {
    removeEntry(entryId)
    if (editingEntry?.id === entryId) {
      setEditingEntry(null)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Journal</h1>
        <p className="text-body text-muted-foreground">
          A private space for longer personal reflections and observations.
        </p>
        <p className="text-caption text-muted-foreground">
          Your journal entries are private personal records and are not analyzed for medical
          purposes.
        </p>
      </div>

      <JournalEntryForm
        editingEntry={editingEntry}
        onCreate={create}
        onUpdate={update}
        onSaved={handleSaved}
        onCancelEdit={() => setEditingEntry(null)}
      />

      <JournalSearch value={search} onChange={setSearch} />

      <JournalEntryList
        status={status}
        entries={filteredEntries}
        hasLoadedEntries={entries.length > 0}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        onRetry={retry}
        onEdit={setEditingEntry}
        onDeleted={handleDeleted}
      />
    </main>
  )
}

export default JournalPage
