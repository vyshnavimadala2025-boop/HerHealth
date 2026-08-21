import { useInteractionCapture } from './useInteractionCapture'

/** Renders nothing — just mounts useInteractionCapture for the lifetime of the authenticated app shell. */
function InteractionCaptureMount() {
  useInteractionCapture()
  return null
}

export default InteractionCaptureMount
