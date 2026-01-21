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
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-5">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Why Pacific Coast Title
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-secondary leading-snug">
              Dependable service backed by
              <br />
              <span className="text-secondary/70">decades of experience</span>
            </h2>
            <p className="text-gray-500 leading-relaxed">
              We specialize in residential and commercial title insurance, working behind the scenes 
              to ensure every transaction closes smoothly.
            </p>
            <div className="space-y-3 pt-2">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary/50 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-secondary text-sm">{reason.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src="/professional-title-company-office-team-meeting.jpg"
                alt="Pacific Coast Title Team"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
