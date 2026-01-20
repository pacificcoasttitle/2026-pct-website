import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ServicesGrid } from "@/components/services-grid"
import { StatsSection } from "@/components/stats-section"
import { TrustIndicators } from "@/components/trust-indicators"
import { WhyChooseUs } from "@/components/why-choose-us"
import { AIShowcase } from "@/components/ai-showcase"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ResourcesPreview } from "@/components/resources-preview"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { TessaChat } from "@/components/tessa-chat"
import { QuickAccessToolbar } from "@/components/quick-access-toolbar"
import { LocationsMap } from "@/components/locations-map"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <TrustIndicators />
      <ServicesGrid />
      <ResourcesPreview />
      <WhyChooseUs />
      <AIShowcase />
      <LocationsMap />
      <TestimonialsSection />
      <CTASection />
      <Footer />
      <TessaChat />
      <QuickAccessToolbar />
    </main>
  )
}
