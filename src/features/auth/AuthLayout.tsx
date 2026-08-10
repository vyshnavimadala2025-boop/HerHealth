import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import authImage from '@/assets/images/herhealth-auth-wellness.png'

interface AuthLayoutProps {
  children: ReactNode
}

/**
 * Shared full-screen split layout for Login and Signup — rendered outside
 * AppShell (see App.tsx) so it isn't boxed in by the marketing navbar and
 * footer. DOM order is [image, content] with `lg:flex-row-reverse` so the
 * image is naturally first (top banner) on mobile's default column flow,
 * while visually landing on the right at `lg` without touching markup
 * order — the same image, just two differently cropped presentations
 * rather than a second asset.
 */
function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row-reverse">
      <div
        role="img"
        aria-label="A woman using her phone in a calm, private wellness space"
        className="h-[200px] w-full shrink-0 animate-in fade-in bg-cover bg-[66%_30%] duration-700 sm:h-[240px] lg:hidden"
        style={{ backgroundImage: `url(${authImage})` }}
      />
      <div
        role="img"
        aria-label="A woman using her phone in a calm, private wellness space"
        className="hidden animate-in fade-in duration-700 lg:block lg:w-[56%] lg:shrink-0 lg:bg-cover lg:bg-[62%_18%]"
        style={{ backgroundImage: `url(${authImage})` }}
      />

      <main className="flex flex-1 flex-col bg-auth-panel px-5 py-6 sm:px-10 sm:py-8 lg:w-[44%] lg:px-12 lg:py-10">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-medium text-foreground"
        >
          <HeartPulse className="size-5 text-primary" aria-hidden="true" />
          HerHealth
        </Link>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
