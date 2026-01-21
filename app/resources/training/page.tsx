"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ChevronRight, Play, ExternalLink, Video } from "lucide-react"

type FilterType = "all" | "titlepro247" | "toolbox" | "general"

const trainingVideos = [
  {
    id: "1",
    title: "Getting Started with TitlePro 247",
    description: "Learn how to navigate the TitlePro 247 platform and place your first order.",
    thumbnail: "/training/titlepro-getting-started.jpg",
    duration: "5:32",
    category: "titlepro247" as const,
    youtubeId: "example1",
  },
  {
    id: "2",
    title: "How to Order a Title Search",
    description: "Step-by-step guide to ordering a title search through our online portal.",
    thumbnail: "/training/order-title-search.jpg",
    duration: "4:15",
    category: "titlepro247" as const,
    youtubeId: "example2",
  },
  {
    id: "3",
    title: "Using the PCT Title Toolbox",
    description: "Overview of all the tools available in the PCT Title Toolbox.",
    thumbnail: "/training/toolbox-overview.jpg",
    duration: "8:45",
    category: "toolbox" as const,
    youtubeId: "example3",
  },
  {
    id: "4",
    title: "Rate Calculator Tutorial",
    description: "How to use our rate calculator to provide accurate estimates to your clients.",
    thumbnail: "/training/rate-calculator.jpg",
    duration: "3:20",
    category: "toolbox" as const,
    youtubeId: "example4",
  },
  {
    id: "5",
    title: "Tracking Your Orders",
    description: "Learn how to track order status and get real-time updates.",
    thumbnail: "/training/track-orders.jpg",
    duration: "4:50",
    category: "titlepro247" as const,
    youtubeId: "example5",
  },
  {
    id: "6",
    title: "Understanding Your Prelim Report",
    description: "A guide to reading and understanding preliminary title reports.",
    thumbnail: "/training/prelim-report.jpg",
    duration: "12:30",
    category: "general" as const,
    youtubeId: "example6",
  },
  {
    id: "7",
    title: "Document Upload & Management",
    description: "How to upload and manage documents in your TitlePro 247 account.",
    thumbnail: "/training/document-management.jpg",
    duration: "6:15",
    category: "titlepro247" as const,
    youtubeId: "example7",
  },
  {
    id: "8",
    title: "Setting Up Email Notifications",
    description: "Configure your notification preferences to stay updated on your orders.",
    thumbnail: "/training/notifications.jpg",
    duration: "3:45",
    category: "titlepro247" as const,
    youtubeId: "example8",
  },
  {
    id: "9",
    title: "Prop 19 Calculator Demo",
    description: "Learn how to use the Prop 19 calculator to help clients understand tax benefits.",
    thumbnail: "/training/prop19-demo.jpg",
    duration: "7:20",
    category: "toolbox" as const,
    youtubeId: "example9",
  },
]

export default function TrainingPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  const filteredVideos = trainingVideos.filter(
    video => activeFilter === "all" || video.category === activeFilter
  )

  const filterLabels: Record<FilterType, string> = {
    all: "All Videos",
    titlepro247: "TitlePro 247",
    toolbox: "PCT Toolbox",
    general: "General",
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Breadcrumb */}
      <div className="pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/resources" className="hover:text-primary">Resources</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">Training</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4">
              Video Tutorials
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Training Center
            </h1>
            <p className="text-xl text-gray-600">
              Learning on demand. Video tutorials to help you get the most out of PCT's tools and services.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? "bg-primary text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              >
                {filterLabels[filter]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-secondary/10 to-primary/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-12 h-12 text-primary/30" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all shadow-xl">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                  {/* Category Badge */}
                  <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded font-medium ${
                    video.category === "titlepro247"
                      ? "bg-blue-100 text-blue-700"
                      : video.category === "toolbox"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {video.category === "titlepro247" ? "TitlePro 247" : video.category === "toolbox" ? "Toolbox" : "General"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-16">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No videos in this category yet</p>
            </div>
          )}

          {/* YouTube Channel CTA */}
          <div className="mt-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Want More Training Content?</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Subscribe to our YouTube channel for the latest tutorials, product updates, and industry insights.
            </p>
            <a
              href="https://www.youtube.com/@pacificcoasttitle"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Visit Our YouTube Channel
            </a>
          </div>

          {/* Need Help CTA */}
          <div className="mt-8 max-w-4xl mx-auto bg-gray-50 rounded-2xl p-10 text-center border border-gray-100">
            <h3 className="text-xl font-bold text-secondary mb-4">Need Personalized Training?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our team offers one-on-one training sessions for agents and teams. Contact us to schedule a session.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-secondary text-white px-8 py-4 rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
