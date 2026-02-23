import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LocationsMap } from "@/components/locations-map"

export const metadata = {
  title: "Office Locations | Pacific Coast Title",
  description:
    "Find a Pacific Coast Title office near you. With 5 locations across California, we're always nearby to serve your title and escrow needs.",
}

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />
      
      {/* Hero */}
      <section className="relative pt-32 pb-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Our Locations</h1>
            <p className="text-xl text-gray-600">
              With 5 offices strategically located throughout California, Pacific Coast Title is always nearby 
              to provide expert title and escrow services for your real estate transactions.
            </p>
          </div>
        </div>
      </section>

      <LocationsMap />

      <Footer />
    </main>
  )
}
