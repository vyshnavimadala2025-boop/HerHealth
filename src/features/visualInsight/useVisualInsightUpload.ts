import { useCallback, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { validateImageFile } from '@/features/visualInsight/imageValidation'
import { deleteVisualInsightImage, uploadVisualInsightImage } from '@/features/visualInsight/visualInsightService'
import { getConsentState } from '@/features/aiIntelligence/consent'
import type { ImageValidationError, VisualInsightImage } from '@/features/visualInsight/types'

type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error' | 'consent_required'

/**
 * KNOWN LIMITATION (Phase 3A.6 hardening review): there is no cancel
 * button during the 'uploading' state, and this hook has no
 * AbortController wired to the network call — the installed
 * @supabase/storage-js version's upload() method does not accept an
 * AbortSignal (checked directly against its type definitions). A user
 * cannot interrupt an in-flight upload today; they can only cancel
 * before clicking Upload (clearSelection) or delete the image afterward.
 * Not fixed in this pass — would require either an SDK upgrade/patch or
 * a custom fetch-based upload path, both larger changes than this
 * hardening pass's scope justifies for a mock-only feature with no real
 * users yet.
 *
 * KNOWN LIMITATION: no duplicate-upload detection. Uploading the same
 * image content twice creates two separate rows/objects (each with its
 * own UUID) rather than being detected and deduplicated. Server-side
 * rate limiting and the already_processed check (migration 0037) bound
 * the practical impact; content-hash-based dedup was not implemented as
 * it wasn't identified as a real product requirement.
 */
export function useVisualInsightUpload() {
  const { user } = useAuth()
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<ImageValidationError | null>(null)
  const [uploadedImage, setUploadedImage] = useState<VisualInsightImage | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)

  const selectFile = useCallback(async (file: File) => {
    setError(null)
    setValidationError(null)
    setUploadedImage(null)

    if (!getConsentState().imageAnalysis) {
      setStatus('consent_required')
      return
    }

    setStatus('validating')
    const result = await validateImageFile(file)
    if (!result.valid) {
      setValidationError(result.error ?? 'corrupted_or_unreadable')
      setStatus('error')
      return
    }

    setPreviewFile(file)
    setStatus('idle')
  }, [])

  const clearSelection = useCallback(() => {
    setPreviewFile(null)
    setError(null)
    setValidationError(null)
    setStatus('idle')
  }, [])

  const upload = useCallback(
    async (conversationId?: string | null) => {
      if (!user || !previewFile) return

      if (!getConsentState().imageAnalysis) {
        setStatus('consent_required')
        return
      }

      setStatus('uploading')
      setError(null)
      try {
        const result = await validateImageFile(previewFile)
        if (!result.valid || result.widthPx === undefined || result.heightPx === undefined) {
          setValidationError(result.error ?? 'corrupted_or_unreadable')
          setStatus('error')
          return
        }

        const image = await uploadVisualInsightImage({
          userId: user.id,
          file: previewFile,
          mimeType: previewFile.type as VisualInsightImage['mimeType'],
          widthPx: result.widthPx,
          heightPx: result.heightPx,
          conversationId,
        })

        setUploadedImage(image)
        setPreviewFile(null)
        setStatus('success')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        setStatus('error')
      }
    },
    [user, previewFile],
  )

  const removeUploadedImage = useCallback(async () => {
    if (!uploadedImage) return
    try {
      await deleteVisualInsightImage(uploadedImage.id, uploadedImage.storagePath)
      setUploadedImage(null)
      setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }, [uploadedImage])

  return {
    status,
    error,
    validationError,
    previewFile,
    uploadedImage,
    selectFile,
    clearSelection,
    upload,
    removeUploadedImage,
  }
}
