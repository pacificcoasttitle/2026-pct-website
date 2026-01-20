"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, FileSearch, TrendingUp, Play } from "lucide-react"

export function AIShowcase() {
  const features = [
    {
      icon: Brain,
      title: "TESSA AI Assistant",
      description: "24/7 instant answers to your title questions",
      detail: "Powered by 50 years of title expertise",
    },
    {
      icon: FileSearch,
      title: "Smart Document Processing",
      description: "Automated review and analysis",
      detail: "Faster turnaround times",
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Proactive issue identification",
      detail: "Smoother closings",
    },
  ]

  return (
    <section id="technology" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-secondary mb-4">Technology That Works For You</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We leverage AI to enhance our service, making your transactions faster and more efficient
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-white border border-gray-200 hover:border-primary transition-all duration-300 hover:shadow-xl group"
            >
              <div className="p-8 space-y-4">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-start pl-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-10 h-10 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-secondary">{feature.title}</h3>
                  <p className="text-gray-600 font-medium">{feature.description}</p>
                  <p className="text-primary text-sm">{feature.detail}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Video Demo Button */}
        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-white bg-transparent"
          >
            <Play className="w-5 h-5 mr-2" />
            See How TESSA Can Help
          </Button>
        </div>
      </div>
    </section>
  )
}
