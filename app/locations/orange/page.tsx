import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { MapPin, Phone, Mail, Clock, Printer, ChevronRight } from "lucide-react"

export const metadata = {
  title: "Orange Office (Corporate HQ) | Pacific Coast Title",
  description:
    "Pacific Coast Title Orange office - Corporate Headquarters. Located at 1111 E. Katella Ave, Orange CA. Full-service title and escrow.",
}

const otherLocations = [
  { name: "Downey", href: "/locations/downey" },
  { name: "Fresno", href: "/locations/fresno" },
  { name: "Glendale", href: "/locations/glendale" },
  { name: "Inland Empire", href: "/locations/inland-empire" },
  { name: "San Diego", href: "/locations/san-diego" },
]

export default function OrangeLocationPage() {
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
            <span className="text-primary font-medium">Orange</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <span className="inline-block bg-accent/10 text-accent px-4 py-1 rounded-full text-sm font-medium mb-4">
              Corporate Headquarters
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Pacific Coast Title - Orange
            </h1>
            <p className="text-xl text-gray-600">
              Our corporate headquarters, serving Orange County and surrounding areas with comprehensive 
              title and escrow services since 2006.
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.5!2d-117.87!3d33.80!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDQ4JzAwLjAiTiAxMTfCsDUyJzEyLjAiVw!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pacific Coast Title Orange Office Map"
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
                    <p className="text-gray-600">1111 E. Katella Ave, Suite 120</p>
                    <p className="text-gray-600">Orange, CA 92867</p>
                    <a 
                      href="https://www.google.com/maps/dir/?api=1&destination=1111+E+Katella+Ave+Suite+120+Orange+CA+92867"
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
                      <a href="tel:+17145166700" className="hover:text-primary">(714) 516-6700</a>
                    </p>
                    <p className="text-gray-600">
                      Toll-free: <a href="tel:+18667241050" className="hover:text-primary">(866) 724-1050</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Printer className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Fax</h3>
                    <p className="text-gray-600">(714) 516-6799</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:orange@pct.com" className="text-primary hover:text-accent font-medium">
                      orange@pct.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p className="text-gray-500 text-sm">Closed Saturday & Sunday</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.pct.com/open-order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-center"
                >
                  Open an Order
                </a>
                <Link
                  href="/contact"
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
            {[
              "Residential Title Insurance",
              "Commercial Title Insurance",
              "Escrow Services",
              "1031 Exchange Services",
              "Lender Services",
              "Mobile Signing Services",
            ].map((service) => (
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
            {otherLocations.map((location) => (
              <Link
                key={location.name}
                href={location.href}
                className="px-6 py-3 bg-gray-100 hover:bg-primary hover:text-white rounded-full font-medium transition-colors"
              >
                {location.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
