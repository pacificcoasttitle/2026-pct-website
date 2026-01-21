import { Navigation } from "@/components/navigation"
import { HeroSimple } from "@/components/hero-simple"
import { ToolsSection } from "@/components/tools-section"
import { TessaCallout } from "@/components/tessa-callout"
import { WhyChooseUs } from "@/components/why-choose-us"
import { LocationsMap } from "@/components/locations-map"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { TessaChat } from "@/components/tessa-chat"
import { QuickAccessToolbar } from "@/components/quick-access-toolbar"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSimple />
      <ToolsSection />
      <TessaCallout />
      <WhyChooseUs />
      <LocationsMap />
      <TestimonialsSection />
      <CTASection />
      <Footer />
      <TessaChat />
      <QuickAccessToolbar />
    </main>
  )
}
