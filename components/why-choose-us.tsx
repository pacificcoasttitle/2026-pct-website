"use client"

import { CheckCircle2 } from "lucide-react"

export function WhyChooseUs() {
  const reasons = [
    {
      title: "Experienced Professionals",
      description: "Our team brings decades of combined experience in title and escrow services.",
    },
    {
      title: "Comprehensive Coverage",
      description: "From residential to commercial, we handle transactions of all sizes and complexity.",
    },
    {
      title: "Customer-Focused Service",
      description: "Your success is our success. We work hard to make your experience satisfying.",
    },
    {
      title: "Technology-Enhanced",
      description: "Modern tools and AI assistance to streamline processes and reduce closing times.",
    },
    {
      title: "Statewide Presence",
      description: "Six California offices strategically located to serve you better.",
    },
    {
      title: "Proven Track Record",
      description: "Over 500,000 successful closings demonstrate our commitment to excellence.",
    },
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-secondary leading-tight">
              Why Choose Pacific Coast Title?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We specialize in Residential & Commercial Title Insurance and work hard behind the scenes to make sure
              your experience with us is a satisfying one.
            </p>
            <div className="space-y-4 pt-4">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-secondary mb-1">{reason.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/professional-title-company-office-team-meeting.jpg"
                alt="Pacific Coast Title Team"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent Element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
