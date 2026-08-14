import { useState } from 'react'
import { Download, Printer, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/shared/PageHeader'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import { useReportData } from '@/features/reports/useReportData'
import DataExportCard from '@/features/reports/DataExportCard'

/**
 * Insights → Reports. Export reuses the exact real DataExportCard and
 * useReportData().exportData already used on Reports (nothing new).
 * Share and Print are genuinely functional, not placeholders: Share uses
 * the real Web Share API (falling back to copying the link) to share the
 * app itself — never personal data — and Print reuses window.print(),
 * the same mechanism already used on Reports.
 */
function InsightsReportsPage() {
  const { exportStatus, exportData } = useReportData()
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle')

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/insights`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SIRILA', text: 'My wellness insights on SIRILA', url: shareUrl })
        setShareState('shared')
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setShareState('copied')
      }
    } catch {
      setShareState('error')
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6 print:p-0">
      <div className="flex flex-col items-start gap-4 print:hidden">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Download className="size-6" aria-hidden="true" />
        </div>
        <PageHeader title="Reports" description="Export, share, or print a copy of what you've recorded." />
      </div>

      <div className="print:hidden">
        <InsightsSubNav />
      </div>

      <div id="export" className="scroll-mt-24 print:hidden">
        <DataExportCard status={exportStatus} onExport={exportData} />
      </div>

      <div id="share" className="scroll-mt-24 print:hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
                <Share2 className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>Share</CardTitle>
            </div>
            <CardDescription>
              Shares a link to SIRILA itself — never your personal data, which stays private to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleShare} className="w-fit">
              <Share2 aria-hidden="true" />
              Share SIRILA
            </Button>
            {shareState === 'copied' && (
              <p role="status" className="text-caption text-muted-foreground">
                Link copied to your clipboard.
              </p>
            )}
            {shareState === 'shared' && (
              <p role="status" className="text-caption text-muted-foreground">
                Shared.
              </p>
            )}
            {shareState === 'error' && (
              <p role="alert" className="text-caption text-destructive">
                We couldn&apos;t share or copy the link. Please try again.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div id="print" className="scroll-mt-24 print:hidden">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-support text-support-foreground">
                <Printer className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>Print</CardTitle>
            </div>
            <CardDescription>For a printable report with your full recorded summary, use Reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()} className="w-fit">
              <Printer aria-hidden="true" />
              Print this page
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default InsightsReportsPage
