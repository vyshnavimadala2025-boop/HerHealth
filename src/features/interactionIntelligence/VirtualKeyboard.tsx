import { CornerDownLeft, Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROW_1 = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP']
const ROW_2 = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL']
const ROW_3 = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM']

const LABEL: Record<string, string> = Object.fromEntries(
  [...ROW_1, ...ROW_2, ...ROW_3].map((code) => [code, code.replace('Key', '')]),
)

const ACTIVATION_KEYS = new Set(['Enter', 'Space'])

interface VirtualKeyProps {
  code: string
  label: React.ReactNode
  active: boolean
  onKeyPress: (code: string) => void
  onKeyRelease: (code: string) => void
  className?: string
  ariaLabel?: string
}

function VirtualKey({ code, label, active, onKeyPress, onKeyRelease, className, ariaLabel }: VirtualKeyProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? `${code.replace('Key', '')} key`}
      onPointerDown={() => onKeyPress(code)}
      onPointerUp={() => onKeyRelease(code)}
      onPointerLeave={() => active && onKeyRelease(code)}
      onKeyDown={(event) => {
        if (event.repeat || !ACTIVATION_KEYS.has(event.code)) return
        onKeyPress(code)
      }}
      onKeyUp={(event) => {
        if (!ACTIVATION_KEYS.has(event.code)) return
        onKeyRelease(code)
      }}
      className={cn(
        'flex h-10 flex-1 items-center justify-center rounded-md bg-hero-panel-foreground/[0.07] text-xs font-medium text-hero-panel-foreground/85 transition-all duration-100',
        'hover:bg-hero-panel-foreground/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach/60 active:scale-90 sm:h-11 sm:rounded-lg sm:text-sm',
        active &&
          'scale-90 bg-peach/40 text-hero-panel shadow-[0_0_16px_color-mix(in_oklch,var(--peach),transparent_35%)]',
        className,
      )}
    >
      {label}
    </button>
  )
}

interface VirtualKeyboardProps {
  activeCode: string | null
  onKeyPress: (code: string) => void
  onKeyRelease: (code: string) => void
}

/**
 * The on-screen QWERTY surface. Purely interactive/presentational — it
 * only ever forwards a physical key `code` (e.g. "KeyQ") up to its
 * caller, never anything resembling typed content. `InteractionDemo` owns
 * the actual timing capture and decides what to do with each code.
 */
function VirtualKeyboard({ activeCode, onKeyPress, onKeyRelease }: VirtualKeyboardProps) {
  return (
    <div className="mt-3 flex flex-col gap-1.5 sm:gap-2" role="group" aria-label="Simulated SIRILA keyboard — demonstrates interaction timing only">
      <div className="flex gap-1 sm:gap-1.5">
        {ROW_1.map((code) => (
          <VirtualKey key={code} code={code} label={LABEL[code]} active={activeCode === code} onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
        ))}
      </div>
      <div className="flex gap-1 px-2.5 sm:gap-1.5 sm:px-4">
        {ROW_2.map((code) => (
          <VirtualKey key={code} code={code} label={LABEL[code]} active={activeCode === code} onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
        ))}
      </div>
      <div className="flex gap-1 sm:gap-1.5">
        {ROW_3.map((code) => (
          <VirtualKey key={code} code={code} label={LABEL[code]} active={activeCode === code} onKeyPress={onKeyPress} onKeyRelease={onKeyRelease} />
        ))}
        <VirtualKey
          code="Backspace"
          label={<Delete className="size-3.5" aria-hidden="true" />}
          active={activeCode === 'Backspace'}
          onKeyPress={onKeyPress}
          onKeyRelease={onKeyRelease}
          ariaLabel="Backspace key"
          className="flex-[1.6]"
        />
      </div>
      <div className="flex gap-1.5 sm:gap-2">
        <VirtualKey
          code="Space"
          label="space"
          active={activeCode === 'Space'}
          onKeyPress={onKeyPress}
          onKeyRelease={onKeyRelease}
          ariaLabel="Space key"
          className="flex-[5]"
        />
        <VirtualKey
          code="Enter"
          label={<CornerDownLeft className="size-3.5" aria-hidden="true" />}
          active={activeCode === 'Enter'}
          onKeyPress={onKeyPress}
          onKeyRelease={onKeyRelease}
          ariaLabel="Enter key"
          className="flex-[1.6]"
        />
      </div>
    </div>
  )
}

export default VirtualKeyboard
