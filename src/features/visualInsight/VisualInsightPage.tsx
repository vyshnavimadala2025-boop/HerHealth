import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ImageIcon, Loader2, Sparkles, Square, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import PreviewGateNotice from '@/features/aiIntelligence/PreviewGateNotice'
import VisualInsightConsentNotice from '@/features/visualInsight/VisualInsightConsentNotice'
import VisualInsightMockNotice from '@/features/visualInsight/VisualInsightMockNotice'
import VisualInsightProcessingResult from '@/features/visualInsight/VisualInsightProcessingResult'
import { useVisualInsightUpload } from '@/features/visualInsight/useVisualInsightUpload'
import { useVisualInsightProcessing } from '@/features/visualInsight/useVisualInsightProcessing'
import { useAuth } from '@/features/auth/useAuth'
import { getConsentState, hasGrantedProcessingConsent } from '@/features/aiIntelligence/consent'
import { listOwnVisualInsightImages, deleteVisualInsightImage, getSignedImageUrl } from '@/features/visualInsight/visualInsightService'
import {
  VISUAL_INSIGHT_ALLOWED_MIME_TYPES,
  VISUAL_INSIGHT_MAX_SIZE_BYTES,
  type VisualInsightImage,
} from '@/features/visualInsight/types'

const PROCESSING_STATE_LABEL: Record<string, string> = {
  queued: 'Queued…',
  validating: 'Checking image…',
  processing: 'Analyzing (mock)…',
}

const VALIDATION_MESSAGES: Record<string, string> = {
  unsupported_format: 'Unsupported format — please use JPEG, PNG, or WEBP.',
  file_too_large: 'This file is too large — please choose an image under 10MB.',
  empty_file: 'This file appears to be empty.',
  corrupted_or_unreadable: "We couldn't read this file — it may be corrupted. Please try a different image.",
  dimensions_too_large: 'This image is too large to process. Please choose a smaller image.',
}

/**
 * Built Phase 3A.1, hardened through Phase 3A.6 — still mock-only.
 * REAL PROVIDER = NOT CONNECTED. MOCK PROVIDER = ACTIVE. REAL HEALTH
 * IMAGES = NOT PROCESSED. PUBLIC VISUAL INSIGHT = DISABLED (gated behind
 * AI_INTELLIGENCE_PREVIEW_ONLY). Not yet wired into a real conversation.
 * Upload, preview, consent, validation, rate-limiting, retry, and
 * deletion are all built and live-verified with real test accounts,
 * ahead of any real AI processing.
 */
function VisualInsightPage() {
  const { user } = useAuth()
  const upload = useVisualInsightUpload()
  const processing = useVisualInsightProcessing()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [images, setImages] = useState<VisualInsightImage[]>([])
  const [imagesStatus, setImagesStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [consentAcknowledged, setConsentAcknowledged] = useState(() => getConsentState().imageAnalysis)
  const [description, setDescription] = useState('')

  const loadImages = async () => {
    if (!user) return
    setImagesStatus('loading')
    try {
      const result = await listOwnVisualInsightImages(user.id)
      setImages(result)
      setImagesStatus('ready')
    } catch {
      setImagesStatus('error')
    }
  }

  useEffect(() => {
    loadImages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!upload.previewFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(upload.previewFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [upload.previewFile])

  useEffect(() => {
    // Phase 3A.6 hardening: was previously triggered as a side effect
    // during render (inside the images.map() below), which could fire the
    // same fetch multiple times per render pass, especially under
    // StrictMode's dev-mode double-render. Driven by an effect instead —
    // one pass per images-list change, only for ids not already cached.
    const missing = images.filter((image) => !signedUrls[image.id])
    if (missing.length === 0) return
    let cancelled = false
    void (async () => {
      for (const image of missing) {
        try {
          const url = await getSignedImageUrl(image.storagePath)
          if (cancelled) return
          setSignedUrls((current) => ({ ...current, [image.id]: url }))
        } catch {
          // Non-fatal — the thumbnail simply won't render; the rest of the page still works.
        }
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  if (!hasGrantedProcessingConsent()) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 sm:p-6">
        <PreviewGateNotice />
        <EmptyState
          icon={ImageIcon}
          title="SIRILA Intelligence consent required"
          description="Grant SIRILA Intelligence processing consent before using Visual Insight."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/ai">Go to SIRILA Intelligence</Link>
            </Button>
          }
        />
      </main>
    )
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await upload.selectFile(file)
  }

  const handleSubmit = async () => {
    await upload.upload(null)
    // Phase 3A.6 hardening: the "Your images" grid previously never
    // reflected a fresh upload until some unrelated action (e.g. deleting
    // a different image) happened to call loadImages() again — found via
    // live smoke testing, not by inspection alone.
    loadImages()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (image: VisualInsightImage) => {
    try {
      await deleteVisualInsightImage(image.id, image.storagePath)
      setImages((current) => current.filter((item) => item.id !== image.id))
      toast.success('Image deleted.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PreviewGateNotice />

      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/ai">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to SIRILA Intelligence
        </Link>
      </Button>

      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-support text-support-foreground">
          <ImageIcon className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Visual Insight"
          description="Help me understand what I'm seeing — attach an image alongside your own description."
          captions={[
            'Educational only. SIRILA does not diagnose or medically analyze images. Visual analysis is not enabled in this development build.',
          ]}
        />
      </div>

      <PrivacyBadge label="Your images are private to your account" />

      {upload.status === 'consent_required' && !consentAcknowledged ? (
        <VisualInsightConsentNotice onContinue={() => setConsentAcknowledged(true)} />
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={VISUAL_INSIGHT_ALLOWED_MIME_TYPES.join(',')}
            onChange={handleFileChange}
            className="sr-only"
            id="visual-insight-file-input"
            aria-label="Attach an image"
          />

          {!upload.previewFile && !upload.uploadedImage && (
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-fit">
              <ImageIcon className="size-4" aria-hidden="true" />
              Attach image
            </Button>
          )}

          {upload.previewFile && previewUrl && (
            <div className="flex flex-col gap-3">
              <div className="relative w-fit">
                <img
                  src={previewUrl}
                  alt="Preview of the image you're about to attach"
                  className="max-h-64 rounded-xl border border-border object-contain"
                />
                <button
                  type="button"
                  onClick={upload.clearSelection}
                  aria-label="Remove selected image"
                  className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-background text-foreground shadow-md border border-border"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={upload.status === 'uploading'} onClick={handleSubmit}>
                  {upload.status === 'uploading' && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
                  {upload.status === 'uploading' ? 'Uploading…' : 'Upload'}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={upload.clearSelection}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {upload.status === 'error' && upload.validationError && (
            <p role="alert" className="text-caption text-destructive">
              {VALIDATION_MESSAGES[upload.validationError]}
            </p>
          )}
          {upload.status === 'error' && upload.error && (
            <p role="alert" className="text-caption text-destructive">
              {upload.error}
            </p>
          )}

          {upload.status === 'success' && upload.uploadedImage && (
            <div className="flex flex-col gap-3">
              <VisualInsightMockNotice />

              {processing.state === 'idle' && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="visual-insight-description">Describe what you're noticing (optional)</Label>
                  <Textarea
                    id="visual-insight-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value.slice(0, 1000))}
                    rows={2}
                    placeholder="e.g. mild redness, noticed yesterday…"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="w-fit"
                    onClick={() => processing.process(upload.uploadedImage?.id, null, description.trim() || null)}
                  >
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    Analyze (mock)
                  </Button>
                </div>
              )}

              {(processing.state === 'queued' || processing.state === 'validating' || processing.state === 'processing') && (
                <div className="flex items-center justify-between gap-2">
                  <p role="status" className="flex items-center gap-1.5 text-caption text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                    {PROCESSING_STATE_LABEL[processing.state]}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={processing.cancel}>
                    <Square className="size-3 " aria-hidden="true" />
                    Cancel
                  </Button>
                </div>
              )}

              {processing.state === 'cancelled' && (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-caption text-muted-foreground">Analysis cancelled.</p>
                  <Button type="button" variant="outline" size="sm" onClick={processing.reset}>
                    Try again
                  </Button>
                </div>
              )}

              {processing.state === 'failed' && processing.error && (
                <div className="flex flex-col items-start gap-2">
                  <p role="alert" className="text-caption text-destructive">
                    {processing.error}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={processing.reset}>
                    Try again
                  </Button>
                </div>
              )}

              {processing.state === 'completed' && processing.result && (
                <VisualInsightProcessingResult result={processing.result} />
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={async () => {
                  await upload.removeUploadedImage()
                  processing.reset()
                  setDescription('')
                  loadImages()
                }}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove this image
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium text-foreground">Your images</h2>
        {imagesStatus === 'loading' && (
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {imagesStatus === 'error' && (
          <EmptyState icon={ImageIcon} title="We couldn't load your images" description="Please try again." action={
            <Button type="button" variant="outline" size="sm" onClick={loadImages}>Retry</Button>
          } />
        )}
        {imagesStatus === 'ready' && images.length === 0 && (
          <EmptyState icon={ImageIcon} title="No images yet" description="Images you attach will appear here." />
        )}
        {imagesStatus === 'ready' && images.length > 0 && (
          <ul className="grid grid-cols-3 gap-2">
            {images.map((image) => {
              return (
                <li key={image.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                  {signedUrls[image.id] ? (
                    <img src={signedUrls[image.id]} alt="Your uploaded image" className="size-full object-cover" />
                  ) : (
                    <Skeleton className="size-full" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    aria-label="Delete this image"
                    className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <p className="text-caption text-muted-foreground">
          {VISUAL_INSIGHT_MAX_SIZE_BYTES / (1024 * 1024)}MB max per image. JPEG, PNG, or WEBP only.
        </p>
      </div>
    </main>
  )
}

export default VisualInsightPage
