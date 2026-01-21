import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { BookOpen, Download, ChevronRight, ExternalLink } from "lucide-react"
import { booklets } from "@/data/resources"

export const metadata = {
  title: "Educational Booklets | Pacific Coast Title",
  description: "In-depth guides on title, escrow, and the closing process. Download our educational booklets in English and Spanish.",
}

export default function BookletsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/resources" className="hover:text-primary">Resources</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">Booklets</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4">
              Educational Materials
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Educational Booklets
            </h1>
            <p className="text-xl text-gray-600">
              Education at your fingertips. Comprehensive guides to help you and your clients understand the title and escrow process.
            </p>
          </div>
        </div>
      </section>

      {/* Booklets Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {booklets.map((booklet) => (
              <div
                key={booklet.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Booklet Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary/30" />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-secondary mb-2">{booklet.title}</h3>
                  <p className="text-gray-600 text-sm mb-6">{booklet.description}</p>

                  <div className="space-y-2">
                    {booklet.downloads.map((download, index) => (
                      download.href ? (
                        <a
                          key={index}
                          href={download.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors group"
                        >
                          <span className="text-gray-700 group-hover:text-primary text-sm font-medium">
                            {download.label}
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                        </a>
                      ) : (
                        <a
                          key={index}
                          href={`https://pct.com/assets/downloads/booklets/${download.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors group"
                        >
                          <span className="text-gray-700 group-hover:text-primary text-sm font-medium">
                            {download.label}
                          </span>
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                        </a>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Need More Resources?</h3>
            <p className="text-white/80 mb-8">
              Check out our informational flyers for quick reference guides on specific topics.
            </p>
            <Link
              href="/resources/flyers"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Flyers
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
