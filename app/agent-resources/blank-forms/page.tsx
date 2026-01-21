import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { FileText, Download } from "lucide-react"

export default function BlankFormsPage() {
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
      forms: ["Notice of Completion", "Mechanics Lien Release", "Preliminary Notice", "Mechanics Lien Questionnaire"],
    },
    {
      name: "Notes",
      forms: ["Promissory Note", "Payment Schedule", "Straight Note", "Owner Affidavit", "Payoff Statement"],
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
      forms: ["Full Reconveyance", "Partial Reconveyance", "Request for Reconveyance", "Substitution of Trustee"],
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
          <h1 className="text-5xl md:text-6xl font-bold text-[#03374f] mb-4">Blank Forms Library</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Downloadable legal forms and documents for real estate professionals
          </p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-lg text-gray-600 mb-12 text-center">
              Access our comprehensive library of blank forms commonly used in real estate transactions. All forms are
              available for immediate download in PDF format.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              {formCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-[#f26b2b]" />
                    <h2 className="text-2xl font-bold text-[#03374f]">{category.name}</h2>
                  </div>
                  <ul className="space-y-3">
                    {category.forms.map((form, formIndex) => (
                      <li
                        key={formIndex}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-gray-700">{form}</span>
                        <button className="flex items-center gap-2 text-[#f26b2b] hover:text-[#03374f] transition-colors">
                          <Download className="w-4 h-4" />
                          <span className="text-sm font-medium">PDF</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-[#03374f] mb-4">Need a Specific Form?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find the form you're looking for? Contact our team and we'll assist you in obtaining the documents
                you need.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-[#f26b2b] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#03374f] transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
