"use client"

import { Card } from "@/components/ui/card"
import { Calculator, Video, FileText, Newspaper, ArrowRight } from "lucide-react"

export function ResourcesPreview() {
  const resources = [
    {
      icon: Calculator,
      title: "Smart Calculators",
      description: "Property Tax, Transfer Tax, 1031 Exchange calculators powered by AI",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Video,
      title: "Educational Videos",
      description: "Learn about title insurance, escrow process, and AI technology",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: FileText,
      title: "Downloadable Guides",
      description: "Comprehensive guides for buyers, sellers, and real estate professionals",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Newspaper,
      title: "Industry News",
      description: "Stay updated with the latest in title, escrow, and real estate technology",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <section id="resources" className="py-24 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Your Title Knowledge Hub</h2>
          <p className="text-xl text-muted-foreground">Tools and resources to make your transaction smoother</p>
        </div>

        {/* Resources Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <Card
              key={index}
              className="group p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary"
            >
              <div className="space-y-4">
                <div
                  className={`w-16 h-16 ${resource.bgColor} rounded-2xl flex items-center justify-start pl-4 group-hover:scale-110 transition-transform`}
                >
                  <resource.icon className={`w-8 h-8 ${resource.color}`} />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{resource.description}</p>
                </div>

                {/* Link */}
                <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
