import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import onboardingImage from '@/assets/images/herhealth-onboarding-wellness.png'

interface OnboardingLayoutProps {
  children: ReactNode
}

/**
 * Same full-screen split mechanics as the auth pages' AuthLayout — DOM
 * order [image, content] with `lg:flex-row-reverse` so the image is the
 * mobile top banner by default and the desktop right panel purely via
 * CSS, no markup reordering. A separate component (not a shared one)
 * because the image, alt text, and crop are onboarding-specific and the
 * two flows have no other content in common.
 */
function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row-reverse">
      <div
        role="img"
        aria-label="A woman using a wellness app on her phone in a calm and private home setting"
        className="h-[200px] w-full shrink-0 animate-in fade-in bg-cover bg-[68%_26%] duration-700 sm:h-[240px] lg:hidden"
        style={{ backgroundImage: `url(${onboardingImage})` }}
      />
      <div
        role="img"
        aria-label="A woman using a wellness app on her phone in a calm and private home setting"
        className="hidden animate-in fade-in duration-700 lg:block lg:w-[48%] lg:shrink-0 lg:bg-cover lg:bg-[62%_20%]"
        style={{ backgroundImage: `url(${onboardingImage})` }}
      />

      <div className="flex flex-1 flex-col bg-auth-panel px-5 py-6 sm:px-10 sm:py-8 lg:w-[52%] lg:px-12 lg:py-10">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-medium text-foreground"
        >
          <HeartPulse className="size-5 text-primary" aria-hidden="true" />
          HerHealth
        </Link>

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-[460px] animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingLayout
