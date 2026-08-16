import {
  VISUAL_INSIGHT_ALLOWED_MIME_TYPES,
  VISUAL_INSIGHT_MAX_DIMENSION_PX,
  VISUAL_INSIGHT_MAX_SIZE_BYTES,
  type ImageValidationResult,
  type VisualInsightMimeType,
} from '@/features/visualInsight/types'

/**
 * Client-side validation only — convenience/UX, never the security
 * boundary. The server independently re-validates MIME type and size via
 * the ai_visual_insight_images table's CHECK constraints and the Storage
 * bucket's own file_size_limit/allowed_mime_types, exactly matching this
 * project's "never trust the client alone" rule for every other input.
 *
 * Corrupted/unreadable-file detection: attempting to decode the file as an
 * image via the browser's own Image element is the only reliable
 * client-side signal available without a dedicated image-parsing library —
 * if the browser itself can't decode it, it's rejected before upload.
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (file.size === 0) {
    return { valid: false, error: 'empty_file' }
  }

  if (file.size > VISUAL_INSIGHT_MAX_SIZE_BYTES) {
    return { valid: false, error: 'file_too_large' }
  }

  if (!VISUAL_INSIGHT_ALLOWED_MIME_TYPES.includes(file.type as VisualInsightMimeType)) {
    return { valid: false, error: 'unsupported_format' }
  }

  const dimensions = await readImageDimensions(file)
  if (!dimensions) {
    return { valid: false, error: 'corrupted_or_unreadable' }
  }

  if (dimensions.widthPx > VISUAL_INSIGHT_MAX_DIMENSION_PX || dimensions.heightPx > VISUAL_INSIGHT_MAX_DIMENSION_PX) {
    return { valid: false, error: 'dimensions_too_large' }
  }

  return { valid: true, widthPx: dimensions.widthPx, heightPx: dimensions.heightPx }
}

function readImageDimensions(file: File): Promise<{ widthPx: number; heightPx: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ widthPx: img.naturalWidth, heightPx: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }
    img.src = objectUrl
  })
}

/** Strips path separators and control characters; keeps the display name harmless and bounded. */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'image'
  // eslint-disable-next-line no-control-regex -- deliberately stripping control characters, not matching them by accident
  const cleaned = base.replace(/[\x00-\x1f\x7f]/g, '').trim()
  return cleaned.slice(0, 255) || 'image'
}

export function extensionForMimeType(mimeType: VisualInsightMimeType): string {
  switch (mimeType) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'jpg'
  }
}
