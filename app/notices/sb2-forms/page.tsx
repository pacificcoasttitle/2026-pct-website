import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  FileText, ChevronRight, Download, CheckCircle, XCircle, 
  AlertCircle, Phone, Mail, ArrowRight, DollarSign
} from "lucide-react"

export const metadata = {
  title: "SB2 Recording Fee Forms | Pacific Coast Title",
  description:
    "Required forms for SB2 recording fee compliance. Download exemption forms and fee payment documentation for California recordings.",
}

const sb2Applies = [
  "Deeds (Grant Deeds, Quitclaim Deeds, etc.)",
  "Deeds of Trust",
  "Notices of Default",
  "Most other recordable real estate documents",
]

const sb2Exemptions = [
  "Documents recorded in connection with a transfer subject to documentary transfer tax",
  "Documents recorded by government agencies",
  "Documents related to affordable housing",
  "Certain other exemptions as defined by statute",
]

const forms = [
  {
    title: "SB2 Fee Exemption Declaration",
    description: "Declaration of exemption from the SB2 recording fee. Use this form when your document qualifies for an exemption.",
    href: "https://pct.com/assets/downloads/forms/sb2-exemption-declaration.pdf",
  },
  {
    title: "SB2 Fee Payment Form",
    description: "Standard form for documenting SB2 fee payment when recording documents.",
    href: "https://pct.com/assets/downloads/forms/sb2-fee-payment-form.pdf",
  },
  {
    title: "SB2 Affordable Housing Exemption",
    description: "Special exemption form for documents related to affordable housing transactions.",
    href: "https://pct.com/assets/downloads/forms/sb2-affordable-housing-exemption.pdf",
  },
]

export default function SB2FormsPage() {
  return (
    <>
      <PageHero
        label="Recording Compliance"
        title="SB2 Recording Fee Forms"
        subtitle="Required forms for California recording fee compliance."
      />

      {/* What is SB2 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-6">What is SB2?</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Senate Bill 2 (SB2), also known as the <strong>Building Homes and Jobs Act</strong>, 
                established a $75 recording fee on certain real estate documents to fund affordable 
                housing programs in California.
              </p>
              <p>
                This fee applies to most recorded documents, with some exemptions. The fee is 
                <strong> capped at $225 per transaction</strong> (first 3 documents).
              </p>
            </div>

            {/* Fee Box */}
            <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">$75</p>
                  <p className="text-gray-600">per document (max $225 per transaction)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When SB2 Applies */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8">When Does SB2 Apply?</h2>
            
            <p className="text-lg text-gray-600 mb-6">The $75 SB2 fee applies to:</p>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {sb2Applies.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Exemptions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8">SB2 Exemptions</h2>
            
            <p className="text-lg text-gray-600 mb-6">Certain documents are exempt from the SB2 fee:</p>
            
            <div className="space-y-4 mb-8">
              {sb2Exemptions.map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If your document qualifies for an exemption, you must submit 
                the appropriate exemption form with your recording.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Forms */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8">Download SB2 Forms</h2>

            <div className="space-y-4">
              {forms.map((form, index) => (
                <a
                  key={index}
                  href={form.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <FileText className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-secondary group-hover:text-primary transition-colors">
                        {form.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{form.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary ml-4">
                    <Download className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">PDF</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* County Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-6">County Recorder Information</h2>
            <p className="text-lg text-gray-600 mb-8">
              For specific questions about SB2 fees in your county, contact the county recorder's 
              office directly or view our recording fee reference guide.
            </p>

            <Link
              href="/resources/recording-fees"
              className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
            >
              Recording Fees by County
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Questions About SB2 Compliance?
            </h2>
            <p className="text-gray-600 mb-6">
              Our recording department can help you with SB2 requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+18667241050"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                <Phone className="w-5 h-5" />
                (866) 724-1050
              </a>
              <a
                href="mailto:info@pct.com"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 text-secondary px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-5 h-5" />
                info@pct.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
