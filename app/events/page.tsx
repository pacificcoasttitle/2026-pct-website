import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  GraduationCap,
  Building2,
  Sparkles,
} from "lucide-react"

export const metadata = {
  title: "Events & Training | Pacific Coast Title Company",
  description:
    "Stay connected with Pacific Coast Title events, training sessions, webinars, and industry gatherings. RSVP for upcoming events.",
}

const upcomingEvents = [
  {
    title: "Title Insurance 101 for New Agents",
    date: "March 12, 2026",
    time: "10:00 AM - 12:00 PM",
    location: "Orange Office (HQ)",
    type: "Training",
    description:
      "A comprehensive introduction to title insurance for newly licensed real estate agents. Learn what title insurance covers, how to explain it to clients, and how it protects your transactions.",
    spots: "20 spots available",
  },
  {
    title: "Escrow Process Deep Dive",
    date: "March 26, 2026",
    time: "2:00 PM - 4:00 PM",
    location: "Virtual (Zoom)",
    type: "Webinar",
    description:
      "Walk through the escrow process from opening to closing. Understand timelines, common delays, and how to keep transactions on track.",
    spots: "Unlimited",
  },
  {
    title: "Commercial Title Workshop",
    date: "April 9, 2026",
    time: "9:00 AM - 12:00 PM",
    location: "San Diego Office",
    type: "Workshop",
    description:
      "Advanced workshop covering commercial title complexities including multi-party transactions, environmental endorsements, and due diligence best practices.",
    spots: "15 spots available",
  },
  {
    title: "Spring Client Appreciation Mixer",
    date: "April 23, 2026",
    time: "5:00 PM - 7:30 PM",
    location: "Orange Office (HQ)",
    type: "Networking",
    description:
      "Join us for food, drinks, and networking with fellow real estate professionals. It's our way of saying thank you for your partnership.",
    spots: "Open to all clients",
  },
]

const eventTypeColors: Record<string, string> = {
  Training: "bg-blue-50 text-blue-700",
  Webinar: "bg-purple-50 text-purple-700",
  Workshop: "bg-green-50 text-green-700",
  Networking: "bg-amber-50 text-amber-700",
}

const eventTypeIcons: Record<string, typeof Calendar> = {
  Training: GraduationCap,
  Webinar: Users,
  Workshop: Building2,
  Networking: Sparkles,
}

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <PageHero
        label="Stay Connected"
        title="Events &"
        titleHighlight="Training"
        subtitle="Join us for educational sessions, industry workshops, and networking events designed for real estate professionals."
      />

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-gray-600">
                RSVP for upcoming sessions or mark your calendar for future events.
              </p>
            </div>

            <div className="space-y-6">
              {upcomingEvents.map((event) => {
                const TypeIcon = eventTypeIcons[event.type] || Calendar
                return (
                  <div
                    key={event.title}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${eventTypeColors[event.type] || "bg-gray-50 text-gray-700"}`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                          {event.type}
                        </span>
                        <span className="text-sm text-gray-500">{event.spots}</span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-secondary mb-3">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 mb-5">{event.description}</p>

                      <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          {event.location}
                        </span>
                      </div>

                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
                      >
                        RSVP Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Past Events / Training Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-secondary mb-4">
              On-Demand Training
            </h2>
            <p className="text-gray-600 mb-8">
              Can&apos;t make it to a live event? Access our library of educational materials and training resources 
              designed for real estate professionals at every level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/resources/training"
                className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
              >
                View Training Materials
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/learn"
                className="bg-white text-secondary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
              >
                Learning Center
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Host an Event CTA */}
      <section className="py-16 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want Us to Present at Your Office?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            We offer free educational presentations for real estate offices, brokerages, and lending institutions. 
            Topics include title insurance basics, escrow process, closing costs, and more.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Request a Presentation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
