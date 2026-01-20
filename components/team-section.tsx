"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function TeamSection() {
  const team = [
    {
      name: "Sarah Mitchell",
      title: "Chief Title Officer",
      stat: "15 years experience",
      image: "/professional-woman-executive.png",
    },
    {
      name: "Michael Chen",
      title: "VP of Technology",
      stat: "500+ AI implementations",
      image: "/professional-asian-man-tech-executive.jpg",
    },
    {
      name: "Jennifer Rodriguez",
      title: "Senior Escrow Officer",
      stat: "2,000+ closings",
      image: "/professional-latina-woman.png",
    },
    {
      name: "David Thompson",
      title: "Commercial Title Expert",
      stat: "$2B+ transactions",
      image: "/professional-man-business-suit.jpg",
    },
  ]

  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Meet Your Team</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI Powers the Process, Humans Provide the Care
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl"
            >
              <div className="relative">
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Mail className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                <p className="text-muted-foreground">{member.title}</p>
                <p className="text-sm text-primary font-semibold">{member.stat}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
