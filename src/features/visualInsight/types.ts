export type VisualInsightMimeType = 'image/jpeg' | 'image/png' | 'image/webp'

export const VISUAL_INSIGHT_ALLOWED_MIME_TYPES: VisualInsightMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const VISUAL_INSIGHT_MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB — matches the storage bucket's own limit
export const VISUAL_INSIGHT_MAX_DIMENSION_PX = 8000

export interface VisualInsightImage {
  id: string
  storagePath: string
  mimeType: VisualInsightMimeType
  sizeBytes: number
  widthPx: number | null
  heightPx: number | null
  uploadStatus: 'pending' | 'complete' | 'failed'
  processingStatus: 'not_processed' | 'processing' | 'complete' | 'failed'
  createdAt: string
}

export type ImageValidationError =
  | 'unsupported_format'
  | 'file_too_large'
  | 'empty_file'
  | 'corrupted_or_unreadable'
  | 'dimensions_too_large'

export interface ImageValidationResult {
  valid: boolean
  error?: ImageValidationError
  widthPx?: number
  heightPx?: number
}
