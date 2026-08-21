import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import InteractionIntelligencePanel from '@/features/interactionIntelligence/InteractionIntelligencePanel'

function InteractionIntelligencePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PageHeader
        title="Interaction Intelligence"
        description="SIRILA can optionally learn subtle interaction patterns — without needing to read what you type."
        captions={['These signals are wellness-oriented and are not medical diagnoses.']}
      />
      <PrivacyBadge label="Timing signals only — message content is never read or stored" />
      <InteractionIntelligencePanel />
    </main>
  )
}

export default InteractionIntelligencePage
