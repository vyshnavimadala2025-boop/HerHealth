import { supabase } from '@/lib/supabaseClient'
import { extensionForMimeType, sanitizeFilename } from '@/features/visualInsight/imageValidation'
import type { VisualInsightImage, VisualInsightMimeType } from '@/features/visualInsight/types'

const BUCKET = 'ai-visual-insight-images'

interface ImageRow {
  id: string
  storage_path: string
  mime_type: VisualInsightMimeType
  size_bytes: number
  width_px: number | null
  height_px: number | null
  upload_status: 'pending' | 'complete' | 'failed'
  processing_status: 'not_processed' | 'processing' | 'complete' | 'failed'
  created_at: string
}

function mapImage(row: ImageRow): VisualInsightImage {
  return {
    id: row.id,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    widthPx: row.width_px,
    heightPx: row.height_px,
    uploadStatus: row.upload_status,
    processingStatus: row.processing_status,
    createdAt: row.created_at,
  }
}

export interface UploadImageInput {
  userId: string
  file: File
  mimeType: VisualInsightMimeType
  widthPx: number
  heightPx: number
  conversationId?: string | null
}

/**
 * Two-step upload: (1) upload the object directly to the private Storage
 * bucket, scoped by the client-generated id and enforced by Storage's own
 * path-based RLS (a client can only ever write under its own auth.uid()
 * folder); (2) register the metadata row via
 * public.ai_register_visual_insight_image(), which independently verifies
 * the path belongs to the caller, verifies conversation ownership when
 * supplied, and enforces the server-side rate limit. Duplicate uploads
 * (e.g. the same file selected twice) are never merged or overwritten —
 * each attempt gets a fresh id and becomes its own independent row;
 * `upsert: false` (the default) makes an accidental literal path
 * collision fail loudly rather than silently overwrite another upload.
 */
export async function uploadVisualInsightImage(input: UploadImageInput): Promise<VisualInsightImage> {
  const imageId = crypto.randomUUID()
  const extension = extensionForMimeType(input.mimeType)
  const storagePath = `${input.userId}/${imageId}.${extension}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, input.file, {
    contentType: input.mimeType,
    upsert: false,
  })

  if (uploadError) {
    throw new Error('We could not upload this image. Please try again.')
  }

  const { data, error: registerError } = await supabase
    .rpc('ai_register_visual_insight_image', {
      p_id: imageId,
      p_storage_path: storagePath,
      p_mime_type: input.mimeType,
      p_size_bytes: input.file.size,
      p_conversation_id: input.conversationId ?? null,
      p_original_filename: sanitizeFilename(input.file.name),
      p_width_px: input.widthPx,
      p_height_px: input.heightPx,
    })
    .single<ImageRow>()

  if (registerError) {
    // Registration failed after the object was already uploaded — remove
    // the now-orphaned object rather than leaving an unregistered file in
    // storage with no metadata row pointing at it.
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => {})

    if (registerError.hint === 'rate_limit') {
      throw new Error("You've reached today's image upload limit. Please try again tomorrow.")
    }
    throw new Error('We could not save this image. Please try again.')
  }

  return mapImage(data)
}

export async function listOwnVisualInsightImages(userId: string): Promise<VisualInsightImage[]> {
  const { data, error } = await supabase
    .from('ai_visual_insight_images')
    .select('id, storage_path, mime_type, size_bytes, width_px, height_px, upload_status, processing_status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load your images. Please try again.')
  return (data ?? []).map(mapImage)
}

export async function getSignedImageUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 300) // 5 minutes
  if (error || !data) throw new Error('Unable to load this image. Please try again.')
  return data.signedUrl
}

/** Deletes both the storage object and its metadata row — Storage does not cascade from a table DELETE. */
export async function deleteVisualInsightImage(imageId: string, storagePath: string): Promise<void> {
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (storageError) throw new Error('We could not delete this image. Please try again.')

  const { error: rowError } = await supabase.from('ai_visual_insight_images').delete().eq('id', imageId)
  if (rowError) throw new Error('We could not delete this image. Please try again.')
}
