"use client"

import { Shield, Award, Users, Clock } from "lucide-react"

export function TrustIndicators() {
  const indicators = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "Full compliance with California regulations",
    },
    {
      icon: Award,
      title: "Industry Leaders",
      description: "Recognized excellence in title services",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Seasoned professionals dedicated to your success",
    },
    {
      icon: Clock,
      title: "Fast Closings",
      description: "Efficient processing without compromising accuracy",
    },
  ]

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {indicators.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <item.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-secondary">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
