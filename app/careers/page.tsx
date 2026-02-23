import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import Link from "next/link"
import {
  Heart,
  TrendingUp,
  GraduationCap,
  Shield,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Star,
} from "lucide-react"

export const metadata = {
  title: "Careers - Join Our Team | Pacific Coast Title Company",
  description:
    "Build your career with Pacific Coast Title. We're looking for talented professionals who are passionate about real estate, title insurance, and exceptional client service.",
}

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive medical, dental, and vision insurance for you and your family.",
  },
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    description: "Market-rate salaries with performance bonuses and profit-sharing opportunities.",
  },
  {
    icon: Clock,
    title: "Work-Life Balance",
    description: "Paid time off, holidays, and flexible scheduling to support your personal life.",
  },
  {
    icon: GraduationCap,
    title: "Professional Development",
    description: "Continuing education, industry certifications, and career growth paths within PCT.",
  },
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description: "Internal promotion paths and leadership development programs for career advancement.",
  },
  {
    icon: Shield,
    title: "Retirement Planning",
    description: "401(k) plan with company match to help you plan for a secure financial future.",
  },
]

const values = [
  "Integrity in every transaction",
  "Client-first service mentality",
  "Collaboration and teamwork",
  "Innovation and continuous improvement",
  "Respect and inclusion for all",
  "Excellence as a standard, not a goal",
]

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <PageHero
        label="Join Our Team"
        title="Build Your Career"
        titleHighlight="With Pacific Coast Title"
        subtitle="We're looking for talented professionals who share our passion for protecting property owners and delivering exceptional service."
      />

      {/* Why Join PCT */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
              Why Work at Pacific Coast Title?
            </h2>
            <p className="text-xl text-gray-600">
              For nearly two decades, we&apos;ve built a culture that values expertise, rewards initiative, 
              and treats every team member like family. When you join PCT, you&apos;re not just getting a job—you&apos;re 
              joining a team that&apos;s shaping the future of title and escrow services in California.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-gray-600">
                These principles guide everything we do—from how we serve clients to how we treat each other.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {values.map((value) => (
                <div key={value} className="flex items-center gap-3 bg-white p-5 rounded-xl border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Current Openings
              </h2>
              <p className="text-xl text-gray-600">
                Explore opportunities to join our growing team across California.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-10 text-center">
              <Briefcase className="w-14 h-14 text-primary mx-auto mb-5" />
              <h3 className="text-2xl font-bold text-secondary mb-3">We&apos;re Always Looking for Great Talent</h3>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                Even when specific openings aren&apos;t listed, we welcome talented professionals who are passionate 
                about real estate, title, and exceptional service. Send us your resume and let&apos;s connect.
              </p>
              <a
                href="mailto:hr@pct.com"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Send Your Resume to hr@pct.com
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make Your Move?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
            Join a team where your work matters, your growth is supported, and your contributions are valued.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hr@pct.com"
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              Send Your Resume
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/about"
              className="bg-white text-secondary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Learn About PCT
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
