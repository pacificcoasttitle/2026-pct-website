import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  Scale, Shield, FileText, Search, Home, Upload, 
  ChevronRight, Mail, Phone, MapPin, Users, Award,
  CheckCircle
} from "lucide-react"

export const metadata = {
  title: "TSG / REO Division | Pacific Coast Title",
  description:
    "Foreclosure title services for the Western region. Trustee Sale Guarantees, Deed-in-Lieu services, Litigation Guarantees, and REO title services.",
}

const services = [
  {
    icon: Shield,
    title: "Trustee Sales Guarantees",
    description: "Title guarantees issued at foreclosure initiation to ensure compliance and manage risk throughout the process.",
  },
  {
    icon: FileText,
    title: "Deed-In-Lieu Title Services",
    description: "Title services for deed-in-lieu of foreclosure transactions, providing a streamlined alternative to foreclosure.",
  },
  {
    icon: Scale,
    title: "Litigation Guarantees",
    description: "Title guarantees for litigation and legal proceedings involving real property disputes.",
  },
  {
    icon: Search,
    title: "Custom Non-Insured Title Reports",
    description: "Specialized title reports for unique situations requiring customized research and analysis.",
  },
  {
    icon: Home,
    title: "REO / After-Sale Policies",
    description: "Title insurance for bank-owned and REO properties, facilitating smooth property disposition.",
  },
  {
    icon: Upload,
    title: "eRecording Services",
    description: "Electronic document recording for faster processing, reduced errors, and improved efficiency.",
  },
]

const coverageStates = [
  { name: "Arizona", abbr: "AZ" },
  { name: "California", abbr: "CA" },
  { name: "Nevada", abbr: "NV" },
]

export default function TSGPage() {
  return (
    <>
      <PageHero
        label="Default Title Services"
        title="TSG / REO Division"
        subtitle="Foreclosure title services for the Western region. The Trustee Sale Guarantee (TSG) is a title guarantee issued at the start of foreclosure to assist foreclosing parties with compliance and risk management."
      />

      {/* Coverage & Experience */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Coverage Area */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary mb-6">Coverage Area</h2>
              <div className="flex flex-wrap gap-4 mb-6">
                {coverageStates.map((state) => (
                  <div
                    key={state.abbr}
                    className="flex items-center gap-3 bg-primary/5 rounded-xl px-5 py-3"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-primary">{state.abbr}</span>
                    </div>
                    <span className="font-semibold text-secondary">{state.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600">
                Serving trustees, attorneys, lenders, and servicers across the Western United States.
              </p>
            </div>

            {/* Experience Callout */}
            <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-5xl font-bold">200+</p>
                  <p className="text-white/70">Years Combined Experience</p>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed">
                Our dedicated team offers over 200 years of combined Default Title experience, 
                providing unmatched expertise in foreclosure and REO title services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive default title services for the foreclosure and REO industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors">
                  <service.icon className="w-7 h-7 text-secondary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary text-center mb-10">
              Why Choose PCT's TSG Division?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Expert knowledge of foreclosure processes",
                "Rapid turnaround times",
                "Dedicated account management",
                "Comprehensive compliance support",
                "Electronic document delivery",
                "Multi-state coverage",
                "Experienced title examiners",
                "Competitive pricing",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Contact TSG Division
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Reach out to our dedicated TSG team for foreclosure title services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Corporate Office */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary">Corporate Office</h3>
                  <p className="text-gray-500">Orange, CA</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  1111 E. Katella Ave. Ste. 120<br />
                  Orange, CA 92867
                </p>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <a href="tel:+17145166700" className="text-primary hover:text-primary/80 font-medium block">
                      (714) 516-6700
                    </a>
                    <a href="tel:+18667241050" className="text-primary hover:text-primary/80 font-medium block">
                      (866) 724-1050
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Glendale Office */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary">Glendale Office</h3>
                  <p className="text-gray-500">Glendale, CA</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  516 Burchett St.<br />
                  Glendale, CA 91203
                </p>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href="tel:+18186626700" className="text-primary hover:text-primary/80 font-medium">
                    (818) 662-6700
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Email CTA */}
          <div className="mt-8 text-center">
            <a
              href="mailto:tsg@pct.com"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Contact TSG Team
            </a>
            <p className="text-gray-500 mt-3">tsg@pct.com</p>
          </div>
        </div>
      </section>
    </>
  )
}
