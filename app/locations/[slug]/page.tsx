import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { MapPin, Phone, Mail, Clock, Printer, ChevronRight, ArrowRight } from "lucide-react"
import { locations, getLocationBySlug, getAllLocationSlugs, formatAddress, getDirectionsUrl } from "@/data/locations"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

// Generate static params for all locations
export function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({ slug }))
}

// Dynamic metadata
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const location = getLocationBySlug(params.slug)
  if (!location) return { title: "Location Not Found" }
  
  const fullAddress = formatAddress(location.address)
  return {
    title: `${location.name} Office${location.isHQ ? " (Corporate HQ)" : ""} | Pacific Coast Title`,
    description: `Pacific Coast Title ${location.name} office. Located at ${fullAddress}. Full-service title and escrow services.`,
  }
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const location = getLocationBySlug(params.slug)
  if (!location) notFound()

  const otherLocations = locations.filter((l) => l.slug !== location.slug)
  const fullAddress = formatAddress(location.address)
  const directionsUrl = getDirectionsUrl(location.address)

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Breadcrumb */}
      <div className="pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/locations" className="hover:text-primary">Locations</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">{location.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {location.isHQ && (
              <span className="inline-block bg-accent/10 text-accent px-4 py-1 rounded-full text-sm font-medium mb-4">
                Corporate Headquarters
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Pacific Coast Title – {location.name}
            </h1>
            <p className="text-xl text-gray-600">
              {location.isHQ
                ? `Our corporate headquarters, serving ${location.address.city === "Orange" ? "Orange County" : location.name} and surrounding areas with comprehensive title and escrow services.`
                : `Serving ${location.name === "Inland Empire" ? "the Inland Empire" : location.name} and surrounding communities with full-service title and escrow solutions.`}
            </p>
          </div>
        </div>
      </section>

      {/* Location Details */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg h-[400px] lg:h-auto">
              <iframe
                src={location.googleMapsUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Pacific Coast Title ${location.name} Office Map`}
              />
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-8">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">{location.address.street}{location.address.suite ? `, ${location.address.suite}` : ""}</p>
                    <p className="text-gray-600">{location.address.city}, {location.address.state} {location.address.zip}</p>
                    <a 
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent font-medium mt-2 inline-block"
                    >
                      Get Directions &rarr;
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">
                      <a href={`tel:+1${location.phone.replace(/\D/g, '')}`} className="hover:text-primary">{location.phone}</a>
                    </p>
                    {location.tollFree && (
                      <p className="text-gray-600">
                        Toll-free: <a href={`tel:+1${location.tollFree.replace(/\D/g, '')}`} className="hover:text-primary">{location.tollFree}</a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Printer className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Fax</h3>
                    <p className="text-gray-600">{location.fax}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href={`mailto:${location.email}`} className="text-primary hover:text-accent font-medium">
                      {location.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Hours</h3>
                    <p className="text-gray-600">{location.hours}</p>
                    <p className="text-gray-500 text-sm">Closed Saturday &amp; Sunday</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="flex-1 bg-primary text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-center"
                >
                  Open an Order
                </Link>
                <Link
                  href="/resources/rate-book"
                  className="flex-1 bg-accent text-white px-6 py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors text-center"
                >
                  Get a Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services at this Location */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary mb-8">Services Available</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {location.services.map((service) => (
              <div key={service} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-gray-700 font-medium">{service}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Locations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary mb-8">Our Other California Offices</h2>
          <div className="flex flex-wrap gap-4">
            {otherLocations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/locations/${loc.slug}`}
                className="px-6 py-3 bg-gray-100 hover:bg-primary hover:text-white rounded-full font-medium transition-colors"
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Ready to Get Started?
          </h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Our {location.name} team is here to help with all your title and escrow needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact This Office
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resources/rate-book"
              className="inline-flex items-center gap-2 bg-white text-secondary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Get a Rate Estimate
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
