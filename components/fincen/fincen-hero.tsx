import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface QuickLink {
  label: string
  href: string
}

interface FinCENHeroProps {
  badge?: string
  title: string
  titleHighlight?: string
  subtitle: string
  quickLinks?: QuickLink[]
}

export function FinCENHero({
  badge = "Effective March 1, 2026",
  title,
  titleHighlight,
  subtitle,
  quickLinks,
}: FinCENHeroProps) {
  return (
    <>
      {/* Hero — matches PageHero exactly */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: `url(/professional-title-company-office-team-meeting.jpg)`,
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative container mx-auto px-4 text-center">
          {/* Badge — plain text label, matches PageHero style */}
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">
            {badge}
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance max-w-2xl mx-auto">
            {title}
            {titleHighlight && (
              <>
                <br />
                <span className="text-primary">{titleHighlight}</span>
              </>
            )}
          </h1>

          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        </div>
      </section>

      {/* Quick links strip — only rendered when links are provided */}
      {quickLinks && quickLinks.length > 0 && (
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-2">
            {quickLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-primary/5"
              >
                {link.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
