import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface DataExportCardProps {
  status: 'idle' | 'loading' | 'error'
  onExport: (format: 'json' | 'csv') => void
}

function DataExportCard({ status, onExport }: DataExportCardProps) {
  const isExporting = status === 'loading'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Download className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Export Your Data</CardTitle>
        </div>
        <CardDescription>
          Download your complete SIRILA history, not just the selected range above. Files are generated
          in your browser and are never uploaded anywhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-caption text-muted-foreground">
          Exported files may contain private information you&apos;ve recorded, including journal entries and
          wellness notes. Once downloaded, storing and sharing the file safely is your responsibility.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onExport('json')} disabled={isExporting}>
            {isExporting && <Loader2 className="animate-spin" aria-hidden="true" />}
            Export as JSON
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onExport('csv')} disabled={isExporting}>
            {isExporting && <Loader2 className="animate-spin" aria-hidden="true" />}
            Export as CSV
          </Button>
        </div>

        {isExporting && (
          <p role="status" className="text-caption text-muted-foreground">
            Preparing your export…
          </p>
        )}

        {status === 'error' && (
          <p role="alert" className="text-caption text-destructive">
            We couldn&apos;t prepare your export. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default DataExportCard
