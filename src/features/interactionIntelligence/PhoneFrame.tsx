import type { ReactNode } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhoneFrameProps {
  children: ReactNode
  /** True during the "magic moment" reveal, when the phone chrome should recede behind the rhythm visualization. */
  dimmed?: boolean
}

/**
 * Purely presentational phone chrome. On small screens the bezel all but
 * disappears (a full-width panel, not "a phone inside a phone" per the
 * design brief) — from `sm` up it grows a real bezel, notch, and side
 * buttons so it reads as a floating device rather than a shrunk card.
 * Holds no interaction or timing logic of its own; `InteractionDemo`
 * owns all of that and just passes its screen content as children.
 */
function PhoneFrame({ children, dimmed = false }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto w-full max-w-sm sm:max-w-[300px] lg:max-w-[336px]">
      {/* Side button nubs — decorative, only read as "a device" once there's a bezel to attach to. */}
      <span
        aria-hidden="true"
        className="absolute top-20 -left-[3px] hidden h-10 w-[3px] rounded-l-full bg-neutral-800 sm:block"
      />
      <span
        aria-hidden="true"
        className="absolute top-36 -left-[3px] hidden h-14 w-[3px] rounded-l-full bg-neutral-800 sm:block"
      />
      <span
        aria-hidden="true"
        className="absolute top-28 -right-[3px] hidden h-16 w-[3px] rounded-r-full bg-neutral-800 sm:block"
      />

      <div
        className={cn(
          'animate-phone-float relative overflow-hidden rounded-[1.75rem] border border-hero-panel-foreground/10 bg-gradient-to-b from-hero-panel-foreground/[0.06] to-transparent p-0 shadow-[0_0_60px_-15px_color-mix(in_oklch,var(--peach),transparent_55%)] transition-[filter,opacity] duration-500 motion-reduce:animate-none sm:rounded-[2.5rem] sm:border-[6px] sm:border-neutral-900/85 sm:p-0 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55),0_0_70px_-10px_color-mix(in_oklch,var(--peach),transparent_50%)]',
          dimmed && 'opacity-40 blur-[1px] saturate-50',
        )}
      >
        {/* Notch — desktop/tablet only */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 z-10 hidden h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-neutral-900 sm:block"
        />

        <div className="relative flex flex-col bg-hero-panel">
          {/* Status bar */}
          <div
            aria-hidden="true"
            className="flex items-center justify-between px-4 pt-2.5 pb-1 text-[10px] font-medium text-hero-panel-foreground/70 sm:pt-3"
          >
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="size-3" />
              <Wifi className="size-3" />
              <BatteryFull className="size-3.5" />
            </div>
          </div>

          {children}
        </div>
      </div>

      {/* Reflection highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 hidden h-1/3 rounded-t-[2.5rem] bg-gradient-to-b from-white/[0.08] to-transparent sm:block"
      />
    </div>
  )
}

export default PhoneFrame
