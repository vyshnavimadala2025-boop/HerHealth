import { X, Search, Plus, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import EmptyState from '@/components/shared/EmptyState'
import { SYMPTOM_OPTIONS, type SymptomValue } from '@/features/symptomExplorer/types'
import { SYMPTOM_EDUCATION } from '@/features/symptomExplorer/symptomEducation'
import { cn } from '@/lib/utils'

interface SymptomLibraryProps {
  searchValue: string
  onSearchChange: (value: string) => void
  selected: SymptomValue[]
  onToggle: (value: SymptomValue) => void
}

/**
 * The "browse/search supported wellness symptoms + view educational
 * information" requirement. Selecting a card adds it to the entry form
 * below (SymptomEntryForm) rather than saving anything itself — this
 * component never touches Supabase.
 */
function SymptomLibrary({ searchValue, onSearchChange, selected, onToggle }: SymptomLibraryProps) {
  const query = searchValue.trim().toLowerCase()
  const filtered = query
    ? SYMPTOM_OPTIONS.filter((option) => option.label.toLowerCase().includes(query))
    : SYMPTOM_OPTIONS

  return (
    <Card>
      <CardHeader>
        <CardTitle>Explore Symptoms</CardTitle>
        <CardDescription>
          Educational information only — never a diagnosis. Select any that apply to add them to an entry below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="symptom-search">Search symptoms</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="symptom-search"
              type="text"
              placeholder="Search by name"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pr-9 pl-9"
            />
            {searchValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Clear search"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0.5 my-auto"
              >
                <X />
              </Button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Search} title="No symptoms match your search" description="Try a different search term." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggle(option.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex flex-col gap-1.5 rounded-xl border p-3 text-left text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
                    isSelected ? 'border-primary bg-accent/40' : 'border-border hover:bg-muted/50',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{option.label}</span>
                    <span
                      className={cn(
                        'flex size-6 shrink-0 items-center justify-center rounded-full',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                      )}
                      aria-hidden="true"
                    >
                      {isSelected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground">{SYMPTOM_EDUCATION[option.value]}</p>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SymptomLibrary
