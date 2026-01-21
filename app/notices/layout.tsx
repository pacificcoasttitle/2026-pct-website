import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Shield, FileText, Calendar, CalendarDays, Bell, ChevronRight } from "lucide-react"

const noticeLinks = [
  {
    title: "Important Notices",
    href: "/notices",
    icon: Bell,
    description: "All compliance notices",
  },
  {
    title: "FinCEN Rule",
    href: "/notices/fincen",
    icon: Shield,
    description: "Anti-money laundering",
  },
  {
    title: "SB2 Forms",
    href: "/notices/sb2-forms",
    icon: FileText,
    description: "Recording fee compliance",
  },
  {
    title: "Recorders Calendar",
    href: "/notices/recorders-calendar",
    icon: Calendar,
    description: "2026 holiday schedule",
  },
  {
    title: "Rescission Calendar",
    href: "/notices/rescission-calendar",
    icon: CalendarDays,
    description: "Refinance deadlines",
  },
]

export default function NoticesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />
      
      {children}

      {/* Notices Navigation Footer */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-secondary mb-2">Compliance Resources</h2>
            <p className="text-gray-600">Quick access to all compliance notices and tools</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {noticeLinks.map((notice) => (
              <Link
                key={notice.href}
                href={notice.href}
                className="group flex flex-col items-center text-center p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary transition-colors">
                  <notice.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <p className="font-semibold text-secondary group-hover:text-primary transition-colors text-sm">
                  {notice.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{notice.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
