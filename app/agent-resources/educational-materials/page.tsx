import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { BookOpen, Download, FileText } from "lucide-react"

export default function EducationalMaterialsPage() {
  const materials = [
    {
      title: "Understanding Title Insurance",
      description: "Comprehensive guide to title insurance basics, coverage, and benefits for your clients",
      type: "PDF Guide",
      pages: "12 pages",
    },
    {
      title: "The Escrow Process Explained",
      description: "Step-by-step walkthrough of the escrow timeline and what to expect",
      type: "PDF Guide",
      pages: "8 pages",
    },
    {
      title: "Top 10 Title Problems",
      description: "Common title issues that can delay or derail a transaction",
      type: "Infographic",
      pages: "2 pages",
    },
    {
      title: "1031 Exchange Basics",
      description: "Essential information about like-kind exchanges and tax deferral strategies",
      type: "PDF Guide",
      pages: "10 pages",
    },
    {
      title: "Home Buyer Checklist",
      description: "Complete checklist for first-time and experienced home buyers",
      type: "Checklist",
      pages: "4 pages",
    },
    {
      title: "Seller Guide",
      description: "What sellers need to know about title and escrow",
      type: "PDF Guide",
      pages: "6 pages",
    },
  ]

  return (
    <>
      <Navigation variant="light" />
      <div className="relative min-h-[40vh] flex items-center justify-center bg-white overflow-hidden">
        <img
          src="/beautiful-modern-california-home-exterior-with-blu.jpg"
          alt="California home"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(100%)" }}
        />
        <div className="absolute inset-0 bg-white/90" />
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#03374f] mb-4">Educational Materials</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Resources to help you educate your clients about title and escrow
          </p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <BookOpen className="w-16 h-16 text-[#f26b2b] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-[#03374f] mb-4">Empower Your Clients with Knowledge</h2>
              <p className="text-lg text-gray-600">
                Download these educational materials to share with your clients. Help them understand the title and
                escrow process, making transactions smoother for everyone involved.
              </p>
            </div>

            <div className="space-y-6">
              {materials.map((material, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-[#f26b2b]" />
                        <h3 className="text-xl font-bold text-[#03374f]">{material.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{material.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{material.type}</span>
                        <span>•</span>
                        <span>{material.pages}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 bg-[#f26b2b] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#03374f] transition-colors whitespace-nowrap">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-[#03374f] text-white rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Need Custom Materials?</h3>
              <p className="mb-6 max-w-2xl mx-auto">
                We can create customized educational materials for your brokerage or team. Contact us to discuss your
                specific needs.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-[#f26b2b] text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#03374f] transition-colors"
              >
                Request Custom Materials
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
