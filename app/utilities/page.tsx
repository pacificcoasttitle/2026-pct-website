import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { UtilityLookup } from "./utility-lookup"
import Link from "next/link"
import {
  Search,
  ExternalLink,
  Building2,
  Scale,
  Landmark,
  Globe,
  DollarSign,
  BookOpen,
  Gavel,
  MapPin,
  Shield,
} from "lucide-react"

export const metadata = {
  title: "Utilities & Quick Links Directory | Pacific Coast Title Company",
  description:
    "Quick-access directory of essential real estate utilities, county recorder offices, tax assessor sites, and industry links.",
}

const countyResources = [
  {
    county: "Orange County",
    links: [
      { label: "Recorder's Office", href: "https://www.ocrecorder.com/", icon: Building2 },
      { label: "Tax Assessor", href: "https://www.ocgov.com/gov/assessor", icon: DollarSign },
      { label: "Property Tax Lookup", href: "https://tax.ocgov.com/tcweb/search_page.asp", icon: Search },
    ],
  },
  {
    county: "Los Angeles County",
    links: [
      { label: "Recorder's Office", href: "https://www.lavote.gov/home/records", icon: Building2 },
      { label: "Tax Assessor", href: "https://assessor.lacounty.gov/", icon: DollarSign },
      { label: "Property Tax Lookup", href: "https://vcheck.ttc.lacounty.gov/", icon: Search },
    ],
  },
  {
    county: "San Diego County",
    links: [
      { label: "Recorder's Office", href: "https://arcc.sdcounty.ca.gov/Pages/default.aspx", icon: Building2 },
      { label: "Tax Assessor", href: "https://www.sdcounty.ca.gov/assessor/", icon: DollarSign },
      { label: "Property Tax Lookup", href: "https://iwr.sdcounty.ca.gov/", icon: Search },
    ],
  },
  {
    county: "San Bernardino County",
    links: [
      { label: "Recorder's Office", href: "https://arc.sbcounty.gov/", icon: Building2 },
      { label: "Tax Assessor", href: "https://www.sbcounty.gov/assessor/", icon: DollarSign },
      { label: "Property Tax Lookup", href: "https://www.mytaxcollector.com/", icon: Search },
    ],
  },
  {
    county: "Riverside County",
    links: [
      { label: "Recorder's Office", href: "https://www.rivcoacr.org/", icon: Building2 },
      { label: "Tax Assessor", href: "https://www.rivcoassessor.org/", icon: DollarSign },
      { label: "Property Tax Lookup", href: "https://www.countyofriverside.us/taxes", icon: Search },
    ],
  },
  {
    county: "Fresno County",
    links: [
      { label: "Recorder's Office", href: "https://www.co.fresno.ca.us/departments/county-clerk-registrar-of-voters/recorder-s-office", icon: Building2 },
      { label: "Tax Assessor", href: "https://www.fresnocountyca.gov/Departments/Assessor-Recorder", icon: DollarSign },
      { label: "Property Tax Lookup", href: "https://www.fresnocountyca.gov/Departments/Auditor-Controller-Treasurer-Tax-Collector", icon: Search },
    ],
  },
]

const industryLinks = [
  {
    title: "California Land Title Association (CLTA)",
    href: "https://www.clta.org/",
    description: "State industry organization for title professionals.",
    icon: Landmark,
  },
  {
    title: "American Land Title Association (ALTA)",
    href: "https://www.alta.org/",
    description: "National trade association for the title insurance industry.",
    icon: Globe,
  },
  {
    title: "California Dept. of Insurance",
    href: "https://www.insurance.ca.gov/",
    description: "State regulator for insurance companies and products.",
    icon: Shield,
  },
  {
    title: "California Escrow Association",
    href: "https://www.ceaescrow.org/",
    description: "Professional organization for California escrow officers.",
    icon: Scale,
  },
  {
    title: "California Dept. of Real Estate",
    href: "https://www.dre.ca.gov/",
    description: "State regulator for real estate licensing and activity.",
    icon: Gavel,
  },
  {
    title: "Consumer Financial Protection Bureau",
    href: "https://www.consumerfinance.gov/",
    description: "Federal agency overseeing consumer financial products.",
    icon: Shield,
  },
]


export default function UtilitiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <PageHero
        label="Quick Access"
        title="Utilities &"
        titleHighlight="Quick Links Directory"
        subtitle="Your go-to resource for county recorder offices, tax assessor sites, industry organizations, and PCT tools—all in one convenient place."
      />

      {/* Utility Provider Lookup */}
      <UtilityLookup />

      {/* County Resources */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-secondary mb-4">County Resources</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quick links to county recorder offices, tax assessors, and property tax lookup tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {countyResources.map((county) => (
              <div key={county.county} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-primary/5 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-secondary">{county.county}</h3>
                </div>
                <div className="p-4 space-y-2">
                  {county.links.map((link) => {
                    const LinkIcon = link.icon
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                        <span className="text-sm text-gray-700 group-hover:text-primary font-medium">{link.label}</span>
                        <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                      </a>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Links */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-secondary mb-4">Industry Organizations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Helpful links to industry associations and regulatory bodies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {industryLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary group-hover:text-primary transition-colors mb-1">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500">{link.description}</p>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
