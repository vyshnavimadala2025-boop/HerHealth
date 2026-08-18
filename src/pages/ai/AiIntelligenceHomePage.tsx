import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageIcon, Loader2, MessageCircleHeart, NotebookText, Sparkles, Stethoscope, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import PreviewGateNotice from '@/features/aiIntelligence/PreviewGateNotice'
import ConsentGate from '@/features/aiIntelligence/ConsentGate'
import ConversationList from '@/features/aiIntelligence/ConversationList'
import { useConversations } from '@/features/aiIntelligence/useConversations'
import { useAiMemory } from '@/features/aiIntelligence/useAiMemory'
import { getConsentState, hasGrantedProcessingConsent } from '@/features/aiIntelligence/consent'
import { AI_CAPABILITIES } from '@/features/aiIntelligence/constants'
import type { AiCapability } from '@/features/aiIntelligence/types'

const CAPABILITY_ICON: Record<AiCapability, typeof MessageCircleHeart> = {
  ask_sirila: MessageCircleHeart,
  symptom_insight: Stethoscope,
}

/**
 * SIRILA Intelligence entry point. Purpose-built capability picker, not a
 * generic chatbot landing page (Phase 2 Section 1) — leads with what the
 * user can do and an explicit "not a diagnosis" framing before anything
 * else.
 */
function AiIntelligenceHomePage() {
  const navigate = useNavigate()
  const [consented, setConsented] = useState(hasGrantedProcessingConsent)
  const [creating, setCreating] = useState<AiCapability | null>(null)
  const { conversations, status, create, rename, archive, remove, retry } = useConversations()
  const memory = useAiMemory()

  const handleStart = async (capability: AiCapability) => {
    setCreating(capability)
    try {
      const consent = getConsentState()
      const conversation = await create(capability, consent.memory)
      navigate(`/ai/${conversation.id}`)
    } finally {
      setCreating(null)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PreviewGateNotice />

      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground shadow-xs">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="SIRILA Intelligence"
          description="Share what you're noticing, and SIRILA can help you make sense of it."
          captions={[
            'Educational only. SIRILA does not diagnose, detect disease, or replace a healthcare professional.',
          ]}
        />
      </div>

      <PrivacyBadge label="Your conversations are private to your account" />

      {!consented ? (
        <ConsentGate onContinue={() => setConsented(true)} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AI_CAPABILITIES.map((capability) => {
              const Icon = CAPABILITY_ICON[capability.value]
              return (
                <Card
                  key={capability.value}
                  className="transition-shadow hover:shadow-sm"
                >
                  <CardHeader>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="size-4.5" aria-hidden="true" />
                    </div>
                    <CardTitle className="mt-2">{capability.label}</CardTitle>
                    <CardDescription>{capability.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 pb-6">
                    <p className="text-caption text-muted-foreground">{capability.description}</p>
                    <Button
                      type="button"
                      size="sm"
                      className="self-start"
                      disabled={creating !== null}
                      onClick={() => handleStart(capability.value)}
                    >
                      {creating === capability.value && <Loader2 className="animate-spin" aria-hidden="true" />}
                      Start
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-foreground">Your conversations</h2>
            <div className="flex gap-1">
              <Button asChild variant="ghost" size="sm">
                <a href="/ai/journal">
                  <NotebookText className="size-3.5" aria-hidden="true" />
                  Symptom journal
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href="/ai/visual-insight">
                  <ImageIcon className="size-3.5" aria-hidden="true" />
                  Visual Insight
                </a>
              </Button>
            </div>
          </div>

          <ConversationList
            status={status}
            conversations={conversations}
            onRename={rename}
            onArchive={archive}
            onDelete={remove}
            onRetry={retry}
          />

          {memory.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What SIRILA remembers</CardTitle>
                <CardDescription>Only what you've explicitly chosen to save.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pb-6">
                {memory.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{item.memoryText}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Forget: ${item.memoryText}`}
                      onClick={() => memory.forget(item.id)}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => memory.clearAll()}>
                  Clear all memory
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </main>
  )
}

export default AiIntelligenceHomePage
