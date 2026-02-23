import { Navigation } from "@/components/navigation"
import { HeroSimple } from "@/components/hero-simple"
import { QuickLinks } from "@/components/quick-links"
import { ToolsSection } from "@/components/tools-section"
import { TessaFeatured } from "@/components/tessa-featured"
import { WhyChooseUs } from "@/components/why-choose-us"
import { LocationsMap } from "@/components/locations-map"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { QuickAccessToolbar } from "@/components/quick-access-toolbar"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSimple />
      <QuickLinks />
      <ToolsSection />
      <TessaFeatured />
      <WhyChooseUs />
      <LocationsMap />
      <TestimonialsSection />
      <CTASection />
      <Footer />
      <QuickAccessToolbar />
    </main>
  )
}
