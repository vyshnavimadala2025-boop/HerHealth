import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  /** Stagger delay in ms, applied via inline style so callers can pass an arbitrary index * step without a fixed set of Tailwind classes. */
  delay?: number
}

/**
 * Reveals children with the existing fade-in-up keyframe the first time
 * they scroll into view, instead of animating on mount regardless of
 * position — for content further down a page than the initial viewport.
 * IntersectionObserver-based (native, no new dependency). Unobserves
 * after the first reveal, so it never re-triggers on scroll-back. Starts
 * pre-revealed (no observer at all) when the user prefers reduced motion,
 * so there's no motion and no risk of content staying invisible if a
 * browser's reduced-motion + IntersectionObserver interaction ever misses
 * a trigger.
 */
function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [visible, setVisible] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={ref}
      className={cn('transition-opacity', visible ? 'animate-fade-in-up' : 'opacity-0', className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export default ScrollReveal
