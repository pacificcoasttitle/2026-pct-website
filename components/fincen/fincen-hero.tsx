import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"

interface QuickLink {
  label: string
  href: string
}

interface FinCENHeroProps {
  badge?: string
  title: string
  subtitle: string
  quickLinks?: QuickLink[]
}

export function FinCENHero({
  badge = "Effective March 1, 2026",
  title,
  subtitle,
  quickLinks,
}: FinCENHeroProps) {
  return (
    <section className="relative bg-secondary pt-32 pb-16 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }} />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Calendar className="w-4 h-4" />
            {badge}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          {/* Subheadline */}
          <p
            className="text-xl text-white/75 max-w-3xl mx-auto leading-relaxed mb-10"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />

          {/* Quick Links */}
          {quickLinks && quickLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {quickLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
                >
                  {link.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
