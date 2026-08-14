export type AiCapability = 'ask_sirila' | 'symptom_insight'

export type AiConversationStatus = 'active' | 'archived'

export type AiSafetyTier = 'routine' | 'urgent' | 'emergency' | 'sensitive'

export type AiMessageRole = 'user' | 'assistant'

export interface AiConversation {
  id: string
  title: string | null
  capability: AiCapability
  status: AiConversationStatus
  memoryEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AiMessage {
  id: string
  conversationId: string
  role: AiMessageRole
  content: string
  safetyTier: AiSafetyTier | null
  modelUsed: string | null
  createdAt: string
}

export interface AiMemoryItem {
  id: string
  memoryText: string
  sourceConversationId: string | null
  createdAt: string
  updatedAt: string
}

export type AiSymptomSeverity = 'mild' | 'moderate' | 'significant'

export interface AiSymptomJournalEntry {
  id: string
  conversationId: string | null
  symptom: string
  severity: AiSymptomSeverity | null
  frequency: string | null
  duration: string | null
  location: string | null
  triggers: string[]
  associatedSymptoms: string[]
  cycleContext: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type AiFeedbackRating = 'helpful' | 'not_helpful'

export type AiFeedbackReason =
  | 'inaccurate'
  | 'confusing'
  | 'too_generic'
  | 'unsafe'
  | 'irrelevant'
  | 'missing_information'
  | 'other'

export interface AiFeedbackInput {
  conversationId: string
  messageId: string
  rating: AiFeedbackRating
  reason: AiFeedbackReason | null
}

/** Consent categories, deliberately not bundled — see Phase 0 Section 6. */
export interface AiConsentState {
  processing: boolean
  useWellnessContext: boolean
  memory: boolean
}

export interface AiContextSnapshot {
  categories: string[]
  summary: string | null
}
