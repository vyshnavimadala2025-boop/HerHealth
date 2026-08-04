import HeroSection from '@/features/marketing/HeroSection'
import TrustStrip from '@/features/marketing/TrustStrip'
import ProductOverview from '@/features/marketing/ProductOverview'
import HowItWorksSection from '@/features/marketing/HowItWorksSection'
import FeatureHighlights from '@/features/marketing/FeatureHighlights'
import PrivacySection from '@/features/marketing/PrivacySection'
import FinalCta from '@/features/marketing/FinalCta'

function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ProductOverview />
      <HowItWorksSection />
      <FeatureHighlights />
      <PrivacySection />
      <FinalCta />
    </>
  )
}

export default HomePage
