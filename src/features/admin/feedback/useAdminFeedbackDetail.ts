import { useCallback, useEffect, useState } from 'react'
import { getAdminFeedbackDetail, updateAdminFeedback } from '@/features/admin/feedback/adminFeedbackService'
import type { AdminFeedbackDetail, AdminFeedbackUpdateInput } from '@/features/admin/feedback/types'

export type AdminFeedbackDetailStatus = 'loading' | 'ready' | 'not-found' | 'error'
export type AdminFeedbackSaveStatus = 'idle' | 'saving' | 'error'

export function useAdminFeedbackDetail(feedbackId: string | undefined) {
  const [status, setStatus] = useState<AdminFeedbackDetailStatus>('loading')
  const [item, setItem] = useState<AdminFeedbackDetail | null>(null)
  const [saveStatus, setSaveStatus] = useState<AdminFeedbackSaveStatus>('idle')

  const load = useCallback(() => {
    if (!feedbackId) {
      setStatus('not-found')
      return
    }
    setStatus('loading')
    getAdminFeedbackDetail(feedbackId)
      .then((result) => {
        if (!result) {
          setItem(null)
          setStatus('not-found')
          return
        }
        setItem(result)
        setStatus('ready')
      })
      .catch(() => {
        setItem(null)
        setStatus('error')
      })
  }, [feedbackId])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(
    async (input: AdminFeedbackUpdateInput) => {
      if (!feedbackId) return
      setSaveStatus('saving')
      try {
        await updateAdminFeedback(feedbackId, input)
        await getAdminFeedbackDetail(feedbackId).then((result) => {
          if (result) setItem(result)
        })
        setSaveStatus('idle')
      } catch {
        setSaveStatus('error')
      }
    },
    [feedbackId],
  )

  return { status, item, refresh: load, save, saveStatus }
}
