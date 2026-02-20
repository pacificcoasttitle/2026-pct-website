"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Star,
  ThumbsUp,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Send,
} from "lucide-react"

const feedbackTypes = [
  {
    value: "compliment",
    label: "Compliment",
    icon: ThumbsUp,
    description: "Share a positive experience",
    color: "bg-green-50 text-green-700 border-green-200",
    activeColor: "bg-green-100 border-green-400",
  },
  {
    value: "suggestion",
    label: "Suggestion",
    icon: Lightbulb,
    description: "Recommend an improvement",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    activeColor: "bg-blue-100 border-blue-400",
  },
  {
    value: "concern",
    label: "Concern",
    icon: AlertCircle,
    description: "Report an issue or concern",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    activeColor: "bg-amber-100 border-amber-400",
  },
  {
    value: "general",
    label: "General Feedback",
    icon: MessageSquare,
    description: "Share any other thoughts",
    color: "bg-gray-50 text-gray-700 border-gray-200",
    activeColor: "bg-gray-100 border-gray-400",
  },
]

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to an API
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation variant="light" />

        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-secondary mb-4">Thank You!</h1>
              <p className="text-xl text-gray-600 mb-8">
                Your feedback has been received. We appreciate you taking the time to help us improve our services. 
                If your feedback requires a response, a team member will reach out within 1-2 business days.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setSubmitted(false)} variant="outline" size="lg">
                  Submit More Feedback
                </Button>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <a href="/">Return Home</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <PageHero
        label="We Value Your Input"
        title="Suggestions &"
        titleHighlight="Feedback"
        subtitle="Your feedback helps us improve. Whether it's a compliment, suggestion, or concern—we want to hear from you."
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Feedback Type Selection */}
              <div>
                <label className="block text-lg font-semibold text-secondary mb-4">
                  What type of feedback would you like to share?
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon
                    const isActive = feedbackType === type.value
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFeedbackType(type.value)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          isActive ? type.activeColor : `${type.color} hover:shadow-sm`
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-sm">{type.label}</div>
                          <div className="text-xs opacity-75">{type.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-lg font-semibold text-secondary mb-4">
                  How would you rate your overall experience?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      {rating === 5 ? "Excellent!" : rating === 4 ? "Great" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="feedbackName" className="block text-sm font-semibold text-secondary mb-2">
                    Name (optional)
                  </label>
                  <Input id="feedbackName" type="text" placeholder="Your name" className="h-12" />
                </div>
                <div>
                  <label htmlFor="feedbackEmail" className="block text-sm font-semibold text-secondary mb-2">
                    Email (optional)
                  </label>
                  <Input id="feedbackEmail" type="email" placeholder="your@email.com" className="h-12" />
                </div>
              </div>

              {/* Office / Transaction */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="feedbackOffice" className="block text-sm font-semibold text-secondary mb-2">
                    Which office? (optional)
                  </label>
                  <select
                    id="feedbackOffice"
                    className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select an office...</option>
                    <option value="orange">Orange (HQ)</option>
                    <option value="downey">Downey</option>
                    <option value="fresno">Fresno</option>
                    <option value="glendale">Glendale</option>
                    <option value="inland-empire">Inland Empire</option>
                    <option value="san-diego">San Diego</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="feedbackOrder" className="block text-sm font-semibold text-secondary mb-2">
                    Order/Escrow # (optional)
                  </label>
                  <Input id="feedbackOrder" type="text" placeholder="e.g., PCT-2026-12345" className="h-12" />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="feedbackMessage" className="block text-lg font-semibold text-secondary mb-2">
                  Your Feedback *
                </label>
                <Textarea
                  id="feedbackMessage"
                  placeholder="Tell us about your experience, suggestion, or concern..."
                  rows={6}
                  required
                  className="resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
                <p className="text-sm text-gray-500">
                  All feedback is reviewed by our management team.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Why Feedback Matters */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-secondary mb-3">
              Your Voice Matters
            </h3>
            <p className="text-gray-600">
              Every piece of feedback is read by our leadership team. Your suggestions have directly led to 
              improvements in our processes, technology, and customer service. Thank you for helping us 
              be the best title company in California.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
