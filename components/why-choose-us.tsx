"use client"

import { CheckCircle2 } from "lucide-react"

export function WhyChooseUs() {
  // Customer-benefit focused reasons
  const reasons = [
    {
      title: "Your Closing Stays on Track",
      description: "45 years of experience means we've seen every curveball. Your deal closes on time.",
    },
    {
      title: "One Team, Start to Finish",
      description: "No getting bounced around. Your escrow officer knows your file and answers your calls.",
    },
    {
      title: "Clear Communication, No Jargon",
      description: "We explain what's happening and why—so you can keep your clients informed and confident.",
    },
    {
      title: "Problems Solved Before You Know",
      description: "We catch title issues early and resolve them quietly, so you never have to deliver bad news.",
    },
    {
      title: "Local Experts, Statewide Reach",
      description: "Whether it's LA transfer taxes or Central Valley timelines, we know your market.",
    },
    {
      title: "You Look Good to Your Clients",
      description: "When closing day goes smoothly, your clients remember who made it happen.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-5">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Your Transaction, Protected
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-secondary leading-snug">
              Get to the closing table
              <br />
              <span className="text-secondary/70">without the headaches</span>
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Deals fall apart when title problems surface late. We've protected over 100,000 transactions 
              because we find issues early and fix them fast—keeping your closing on schedule.
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
                alt="Happy clients at closing"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
