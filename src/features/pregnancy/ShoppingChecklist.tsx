import { useState, type FormEvent } from 'react'
import { CheckSquare, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import ProgressRing from '@/components/shared/ProgressRing'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDeleteDialog from '@/features/pregnancy/ConfirmDeleteDialog'
import { addChecklistItem, deleteChecklistItem, toggleChecklistItem } from '@/features/pregnancy/pregnancyChecklistService'
import { CHECKLIST_CATEGORY_OPTIONS, STARTER_CHECKLIST_ITEMS, type ChecklistCategory, type PregnancyChecklistItem } from '@/features/pregnancy/types'
import { cn } from '@/lib/utils'

interface ShoppingChecklistProps {
  userId: string
  status: 'loading' | 'ready' | 'error'
  items: PregnancyChecklistItem[]
  onChanged: () => void
}

function categoryLabel(category: ChecklistCategory) {
  return CHECKLIST_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category
}

function ShoppingChecklist({ userId, status, items, onChanged }: ShoppingChecklistProps) {
  const [newItemName, setNewItemName] = useState('')
  const [category, setCategory] = useState<ChecklistCategory>('other')
  const [isSaving, setIsSaving] = useState(false)
  const [isAddingStarters, setIsAddingStarters] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkedCount = items.filter((item) => item.isChecked).length
  const completionPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0

  const handleAddItem = async (event: FormEvent) => {
    event.preventDefault()
    if (!newItemName.trim()) return
    setIsSaving(true)
    setError(null)
    try {
      await addChecklistItem(userId, newItemName.trim(), category)
      setNewItemName('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddStarters = async () => {
    setIsAddingStarters(true)
    setError(null)
    try {
      for (const starter of STARTER_CHECKLIST_ITEMS) {
        await addChecklistItem(userId, starter.itemName, starter.category)
      }
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsAddingStarters(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-blush text-primary">
              <CheckSquare className="size-4" aria-hidden="true" />
            </div>
            <CardTitle>Baby Shopping Checklist</CardTitle>
          </div>
          {items.length > 0 && (
            <ProgressRing value={completionPercent} label={`${completionPercent}% complete`} size={44} strokeWidth={5} colorClassName="text-primary">
              <span className="text-caption font-semibold tabular-nums">{completionPercent}%</span>
            </ProgressRing>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={handleAddItem} className="flex flex-col gap-2 sm:flex-row">
          <Input
            className="h-11 flex-1 rounded-xl"
            placeholder="Add an item"
            value={newItemName}
            onChange={(event) => setNewItemName(event.target.value)}
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as ChecklistCategory)}
            className="h-11 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {CHECKLIST_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button type="submit" size="lg" className="h-11 rounded-xl" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
            Add
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        )}

        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {status === 'error' && <p className="text-sm text-muted-foreground">We couldn&apos;t load your checklist.</p>}

        {status === 'ready' && items.length === 0 && (
          <EmptyState
            icon={CheckSquare}
            title="Your checklist is empty"
            description="Add your own items, or start with a few common ones."
            action={
              <Button type="button" variant="outline" size="sm" onClick={handleAddStarters} disabled={isAddingStarters}>
                {isAddingStarters && <Loader2 className="animate-spin" aria-hidden="true" />}
                Add common items
              </Button>
            }
          />
        )}

        {status === 'ready' && items.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm transition-colors',
                  item.isChecked ? 'border-transparent bg-muted/40 text-muted-foreground line-through' : 'border-border',
                )}
              >
                <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={item.isChecked}
                    onCheckedChange={async (value) => {
                      await toggleChecklistItem(item.id, value === true)
                      onChanged()
                    }}
                  />
                  <span className="min-w-0 flex-1">{item.itemName}</span>
                  <span className="text-caption text-muted-foreground">{categoryLabel(item.category)}</span>
                </label>
                <ConfirmDeleteDialog
                  title="Remove this item?"
                  ariaLabel="Remove this checklist item"
                  onConfirm={async () => {
                    await deleteChecklistItem(item.id)
                    onChanged()
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default ShoppingChecklist
