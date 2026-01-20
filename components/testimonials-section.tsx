"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      quote:
        "Pacific Coast Title's AI technology saved us 3 days on our last closing. TESSA answered questions instantly that would have taken hours of research. Game changer!",
      author: "Amanda Stevens",
      role: "Real Estate Agent, Compass",
      rating: 5,
    },
    {
      quote:
        "As a commercial developer, I've worked with dozens of title companies. PCT's predictive analytics caught an issue that could have delayed our $50M project by months.",
      author: "Robert Chang",
      role: "CEO, Chang Development Group",
      rating: 5,
    },
    {
      quote:
        "The combination of cutting-edge AI and experienced professionals is unbeatable. They handled our complex 1031 exchange flawlessly.",
      author: "Maria Gonzalez",
      role: "Property Investor",
      rating: 5,
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">What Our Clients Say</h2>
          <p className="text-xl text-white/80">Real experiences from real estate professionals</p>
        </div>

        {/* Testimonial Card */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8 sm:p-12 relative">
          {/* Quote */}
          <div className="mb-8">
            <div className="flex gap-1 mb-6">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-accent text-accent" />
              ))}
            </div>
            <blockquote className="text-2xl sm:text-3xl text-white leading-relaxed font-medium text-pretty">
              "{testimonials[currentIndex].quote}"
            </blockquote>
          </div>

          {/* Author */}
          <div className="space-y-1">
            <div className="text-xl font-bold text-white">{testimonials[currentIndex].author}</div>
            <div className="text-white/70">{testimonials[currentIndex].role}</div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" size="icon" onClick={goToPrevious} className="text-white hover:bg-white/10">
              <ChevronLeft className="w-6 h-6" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-accent w-8" : "bg-white/30"
                  }`}
                />
              ))}
            </div>

            <Button variant="ghost" size="icon" onClick={goToNext} className="text-white hover:bg-white/10">
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
