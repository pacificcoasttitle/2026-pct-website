import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  Bell, Shield, FileText, Calendar, CalendarDays, 
  ChevronRight, Phone, Mail, ArrowRight, ExternalLink,
  BookOpen, DollarSign
} from "lucide-react"

export const metadata = {
  title: "Important Notices | Pacific Coast Title",
  description:
    "Stay informed about regulatory requirements, industry updates, and important compliance information affecting real estate transactions in California.",
}

const notices = [
  {
    icon: Shield,
    title: "FinCEN Anti-Money Laundering Rule",
    description: "New reporting requirements effective March 1, 2026 for certain residential property transfers.",
    href: "/notices/fincen",
    badge: "NEW - Effective March 2026",
    badgeColor: "bg-red-500",
  },
  {
    icon: FileText,
    title: "SB2 Recording Fee Forms",
    description: "Required forms for SB2 recording fee compliance in California.",
    href: "/notices/sb2-forms",
  },
  {
    icon: Calendar,
    title: "2026 Recorders Holiday Calendar",
    description: "County recorder office closures and holidays for 2026.",
    href: "/notices/recorders-calendar",
  },
  {
    icon: CalendarDays,
    title: "Rescission Calendar",
    description: "Right of rescission deadline calculator for refinance transactions.",
    href: "/notices/rescission-calendar",
  },
]

const additionalResources = [
  {
    icon: BookOpen,
    title: "Rate Book",
    description: "Download our Schedule of Title Fees",
    href: "/resources/rate-book",
  },
  {
    icon: DollarSign,
    title: "Recording Fees",
    description: "Fee reference by California county",
    href: "/resources/recording-fees",
  },
  {
    icon: DollarSign,
    title: "City Transfer Tax",
    description: "Transfer tax rates by county and city",
    href: "/resources/transfer-tax",
  },
]

export default function NoticesPage() {
  return (
    <>
      <PageHero
        label="Compliance & Regulatory"
        title="Important Notices"
        subtitle="Stay informed about regulatory requirements, industry updates, and important compliance information affecting real estate transactions in California."
      />

      {/* Notice Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {notices.map((notice, index) => (
              <Link
                key={index}
                href={notice.href}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                {notice.badge && (
                  <span className={`absolute -top-3 right-6 ${notice.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {notice.badge}
                  </span>
                )}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                    <notice.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{notice.description}</p>
                    <span className="inline-flex items-center gap-2 text-primary font-medium text-sm">
                      Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-secondary mb-2">Additional Compliance Resources</h2>
            <p className="text-gray-600">Related tools and reference materials</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {additionalResources.map((resource, index) => (
              <Link
                key={index}
                href={resource.href}
                className="group flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary transition-colors">
                  <resource.icon className="w-6 h-6 text-secondary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-secondary group-hover:text-primary transition-colors">
                    {resource.title}
                  </p>
                  <p className="text-sm text-gray-500">{resource.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Questions About Compliance Requirements?
            </h2>
            <p className="text-gray-600 mb-6">
              Our team is here to help you navigate regulatory requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+18667241050"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                <Phone className="w-5 h-5" />
                (866) 724-1050
              </a>
              <a
                href="mailto:info@pct.com"
                className="inline-flex items-center justify-center gap-2 bg-gray-100 text-secondary px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-5 h-5" />
                info@pct.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
