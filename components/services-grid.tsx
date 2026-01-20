"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Building2, RefreshCw, Landmark, FileText, Users, ArrowRight } from "lucide-react"

export function ServicesGrid() {
  const services = [
    {
      icon: Home,
      title: "Residential Title Insurance",
      description:
        "Thorough title searches, title clearance, and title policies to produce clear property titles and enable efficient closings.",
      features: ["Title Search & Examination", "Title Insurance Policies", "Closing Coordination"],
    },
    {
      icon: FileText,
      title: "Escrow Settlement Services",
      description:
        "Seasoned settlement agents who facilitate the closing of the most demanding residential and commercial transactions.",
      features: ["Neutral Third Party", "Secure Fund Handling", "Document Preparation"],
    },
    {
      icon: Building2,
      title: "Commercial Title Services",
      description:
        "Top industry professionals with the expertise and knowledge needed to close complex commercial real estate transactions.",
      features: ["Complex Transactions", "Multi-Party Coordination", "Due Diligence Support"],
    },
    {
      icon: RefreshCw,
      title: "1031 Exchange Services",
      description:
        "Expert guidance through tax-deferred exchanges, ensuring compliance and maximizing your investment benefits.",
      features: ["Qualified Intermediary", "Timeline Management", "IRS Compliance"],
    },
    {
      icon: Landmark,
      title: "Lender Solutions",
      description:
        "Title operations and technology infrastructure to partner with lenders requiring comprehensive title and escrow services.",
      features: ["Lender Rate Portal", "Bulk Processing", "Compliance Reporting"],
    },
    {
      icon: Users,
      title: "Credit Union Division",
      description:
        "Specialized services for credit unions and corporate accounts with dedicated support and streamlined processes.",
      features: ["Dedicated Account Managers", "Custom Workflows", "Member-Focused Service"],
    },
  ]

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive title and escrow solutions for every transaction
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-xl bg-white"
            >
              <div className="p-8 space-y-4">
                <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-start group-hover:bg-primary group-hover:scale-110 transition-all">
                  <service.icon className="w-10 h-10 text-primary group-hover:text-white transition-colors ml-4" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{service.description}</p>

                  {/* Features List */}
                  <ul className="space-y-2 pt-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learn More Link */}
                <Button
                  variant="ghost"
                  className="w-full justify-center text-primary hover:text-primary hover:bg-primary/10 mt-4"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
