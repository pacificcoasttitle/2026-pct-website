import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { FileText, Download, ChevronRight, Search } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blank Forms Library | Pacific Coast Title",
  description:
    "Download blank legal forms for real estate transactions. Deeds, affidavits, mechanics liens, power of attorney, and more.",
}

const formCategories = [
  {
    name: "Affidavits",
    forms: [
      "Acknowledgment of Satisfaction",
      "Affidavit of Death",
      "Affidavit of Forgery",
      "Affidavit Re CC&Rs",
      "Revocable Transfer on Death Deed",
    ],
  },
  {
    name: "Deeds",
    forms: [
      "Grant Deed",
      "Quitclaim Deed",
      "Interspousal Transfer Deed",
      "Joint Tenancy Deed",
      "Trust Deed",
      "Corporate Grant Deed",
    ],
  },
  {
    name: "Mechanics Liens",
    forms: [
      "Notice of Completion",
      "Mechanics Lien Release",
      "Preliminary Notice",
      "Mechanics Lien Questionnaire",
    ],
  },
  {
    name: "Notes",
    forms: [
      "Promissory Note",
      "Payment Schedule",
      "Straight Note",
      "Owner Affidavit",
      "Payoff Statement",
    ],
  },
  {
    name: "Power of Attorney",
    forms: [
      "Power of Attorney Confirmation",
      "Revocation of Power of Attorney",
      "Special Power of Attorney",
      "Statutory Power of Attorney",
    ],
  },
  {
    name: "Reconveyances",
    forms: [
      "Full Reconveyance",
      "Partial Reconveyance",
      "Request for Reconveyance",
      "Substitution of Trustee",
    ],
  },
]

export default function BlankFormsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/resources" className="hover:text-primary">
              Resources
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">Blank Forms</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Blank Forms Library
            </h1>
            <p className="text-xl text-gray-600">
              Downloadable legal forms and documents for real estate professionals. All forms are available for
              immediate download in PDF format.
            </p>
          </div>
        </div>
      </section>

      {/* Forms Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {formCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary">{category.name}</h2>
                </div>
                <ul className="space-y-3">
                  {category.forms.map((form, formIndex) => (
                    <li
                      key={formIndex}
                      className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-primary/5 transition-colors group"
                    >
                      <span className="text-gray-700 group-hover:text-primary transition-colors">
                        {form}
                      </span>
                      <button className="flex items-center gap-2 text-gray-400 group-hover:text-primary transition-colors">
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">PDF</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Need a Specific Form?</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Can't find the form you're looking for? Contact our team and we'll assist you in obtaining the
              documents you need.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
