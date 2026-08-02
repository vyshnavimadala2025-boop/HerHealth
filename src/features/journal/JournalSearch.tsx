import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface JournalSearchProps {
  value: string
  onChange: (value: string) => void
}

function JournalSearch({ value, onChange }: JournalSearchProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="journal-search">Search your journal</Label>
      <div className="relative">
        <Input
          id="journal-search"
          type="text"
          placeholder="Search by title or content"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-9"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0.5 my-auto"
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  )
}

export default JournalSearch
