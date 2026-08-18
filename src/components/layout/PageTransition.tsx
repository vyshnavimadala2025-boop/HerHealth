import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Re-triggers a fade/slide-up entrance animation on route change. Toggles
 * the animation class via a forced reflow instead of a React `key` change,
 * so the wrapper div is never unmounted/remounted — the routed subtree
 * underneath (Outlet's children) keeps its component instances, effects,
 * and in-flight data fetches intact across navigation. A `key`-based
 * remount would replay every page's mount-time fetches on every route
 * change, including param-only changes within the same route component.
 */
function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove('animate-page-in')
    void el.offsetWidth
    el.classList.add('animate-page-in')
  }, [pathname])

  return (
    <div ref={ref} className="flex flex-1 flex-col animate-page-in">
      {children}
    </div>
  )
}

export default PageTransition
