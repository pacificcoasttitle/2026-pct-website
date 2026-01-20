"use client"

import { Button } from "@/components/ui/button"
import { Calculator, Phone, Shield, Award, Lock, CheckCircle } from "lucide-react"

export function CTASection() {
  const badges = [
    { icon: Shield, label: "BBB Accredited" },
    { icon: Award, label: "ALTA Member" },
    { icon: Lock, label: "Cyber Insured" },
    { icon: CheckCircle, label: "SSAE 18 Certified" },
  ]

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
            Ready to Get Started?
          </h2>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto">
            Get an instant quote or speak with one of our title experts
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-primary text-lg px-10 py-7 shadow-xl hover:scale-105 transition-all"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Get Title Quote
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-7 bg-transparent"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="pt-12">
            <p className="text-white/70 text-sm mb-6 uppercase tracking-wider font-semibold">Trusted & Certified</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <badge.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
