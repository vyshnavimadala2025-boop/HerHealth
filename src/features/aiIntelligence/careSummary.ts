import type { AiConversation, AiMessage, AiSymptomJournalEntry } from '@/features/aiIntelligence/types'

/**
 * Care Summary — Phase 0 Section 19 / Phase 2 Section 8 foundation only.
 * Purely local: assembled from data already in memory, nothing is
 * persisted as its own record, and nothing is ever sent anywhere by this
 * module. The UI flow built on top of this (CareSummarySheet.tsx) is
 * GENERATE → REVIEW → EDIT → APPROVE → SHARE/EXPORT, and "export" reuses
 * the same local-file-download pattern already established by
 * src/features/reports/exportService.ts — nothing is transmitted to a
 * server or a third party at any point, and nothing reaches SHARE/EXPORT
 * without the user explicitly approving the reviewed draft first.
 */
export interface CareSummaryDraft {
  concern: string
  conversationTitle: string
  generatedAt: string
  keyPoints: string[]
  journalEntries: { symptom: string; severity: string | null; notes: string | null }[]
  openQuestions: string[]
  disclaimer: string
}

const DISCLAIMER =
  'This summary was assembled from your own SIRILA Intelligence conversation and symptom journal. It is not a medical record, diagnosis, or clinical assessment — review and edit it before sharing it with anyone.'

function firstUserMessage(messages: AiMessage[]): string | null {
  return messages.find((message) => message.role === 'user')?.content ?? null
}

export function generateCareSummaryDraft(
  conversation: AiConversation,
  messages: AiMessage[],
  journalEntries: AiSymptomJournalEntry[],
): CareSummaryDraft {
  const concern = firstUserMessage(messages) ?? 'No description recorded yet.'

  const keyPoints = messages
    .filter((message) => message.role === 'user')
    .slice(0, 5)
    .map((message) => message.content)

  const relatedJournalEntries = journalEntries
    .filter((entry) => entry.conversationId === conversation.id)
    .map((entry) => ({ symptom: entry.symptom, severity: entry.severity, notes: entry.notes }))

  return {
    concern,
    conversationTitle: conversation.title ?? 'SIRILA Intelligence conversation',
    generatedAt: new Date().toISOString(),
    keyPoints,
    journalEntries: relatedJournalEntries,
    openQuestions: [],
    disclaimer: DISCLAIMER,
  }
}

export function careSummaryToText(draft: CareSummaryDraft): string {
  const lines = [
    `SIRILA Care Summary — ${draft.conversationTitle}`,
    `Generated: ${new Date(draft.generatedAt).toLocaleString()}`,
    '',
    'What I shared:',
    draft.concern,
    '',
  ]

  if (draft.keyPoints.length > 0) {
    lines.push('Key points from the conversation:')
    draft.keyPoints.forEach((point) => lines.push(`- ${point}`))
    lines.push('')
  }

  if (draft.journalEntries.length > 0) {
    lines.push('Related symptom journal entries:')
    draft.journalEntries.forEach((entry) => {
      lines.push(`- ${entry.symptom}${entry.severity ? ` (${entry.severity})` : ''}${entry.notes ? ` — ${entry.notes}` : ''}`)
    })
    lines.push('')
  }

  if (draft.openQuestions.length > 0) {
    lines.push('Questions I want to ask:')
    draft.openQuestions.forEach((question) => lines.push(`- ${question}`))
    lines.push('')
  }

  lines.push(draft.disclaimer)
  return lines.join('\n')
}
