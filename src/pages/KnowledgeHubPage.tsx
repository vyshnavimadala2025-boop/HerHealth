import { BookOpen } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import CardLinkGrid from '@/components/shared/CardLinkGrid'
import { KNOWLEDGE_HUB_TOPICS } from '@/components/layout/knowledgeHubCatalog'

/** Knowledge Hub — searchable, educational topic cards. */
function KnowledgeHubPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-support text-support-foreground">
          <BookOpen className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Knowledge Hub"
          description="Educational, women's-health-focused topics to explore at your own pace."
          captions={['Educational only. SIRILA never diagnoses, predicts, or replaces professional medical advice.']}
        />
      </div>

      <CardLinkGrid
        items={KNOWLEDGE_HUB_TOPICS.map((topic) => ({
          key: topic.key,
          icon: topic.icon,
          title: topic.title,
          description: topic.description,
          href: topic.href,
        }))}
        searchable
        searchPlaceholder="Search topics…"
      />
    </main>
  )
}

export default KnowledgeHubPage
