"use client"

import { useEffect, useState, type ReactNode } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import { Printer, AlertCircle } from "lucide-react"

export interface LegalSection {
  /** URL fragment / scroll-spy id (also used as React key). */
  id: string
  /** Section title shown in the page and the table of contents. */
  title: string
  /** Section body. Pass JSX so each page can render lists, links, etc. */
  body: ReactNode
}

interface LegalPageProps {
  label: string
  title: string
  subtitle: string
  /** ISO date string (e.g. "2026-05-12") used for "Last updated". */
  effectiveDate: string
  sections: LegalSection[]
  /**
   * Optional disclaimer banner shown above the body. Pass for legal-counsel
   * review note on Privacy Policy and Terms of Service.
   */
  disclaimer?: ReactNode
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

export function LegalPage({
  label,
  title,
  subtitle,
  effectiveDate,
  sections,
  disclaimer,
}: LegalPageProps) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null)

  // Scroll-spy: highlight the ToC entry whose section is currently nearest the top.
  useEffect(() => {
    if (typeof window === "undefined") return
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible heading near the top of the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    )
    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections])

  return (
    <main className="min-h-screen bg-white legal-page">
      <Navigation variant="light" />

      <PageHero label={label} title={title} subtitle={subtitle} />

      {/* Last updated stamp + actions strip */}
      <div className="bg-white border-b border-gray-100 print:border-b-2 print:border-black">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-[#03374f]">Last updated:</span>{" "}
            <time dateTime={effectiveDate}>{fmtDate(effectiveDate)}</time>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#f26b2b] transition-colors print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            Print this page
          </button>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-10 max-w-6xl mx-auto">
            {/* ── Table of contents ─────────────────────────── */}
            <aside className="lg:sticky lg:top-24 self-start print:hidden">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                On this page
              </h2>
              <nav>
                <ol className="space-y-1 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`group flex gap-2 py-1.5 border-l-2 pl-3 transition-colors ${
                          activeId === s.id
                            ? "border-[#f26b2b] text-[#03374f] font-semibold"
                            : "border-gray-100 text-gray-500 hover:text-[#03374f] hover:border-gray-300"
                        }`}
                      >
                        <span className="text-gray-400 group-hover:text-[#f26b2b] transition-colors w-5 text-right tabular-nums">
                          {i + 1}.
                        </span>
                        <span>{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            {/* ── Body ──────────────────────────────────────── */}
            <article className="legal-prose min-w-0">
              {disclaimer && (
                <div className="mb-10 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 print:border-black print:bg-white">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                  <div className="text-sm leading-relaxed">{disclaimer}</div>
                </div>
              )}

              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-24 mb-12 last:mb-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#03374f] mb-4 leading-tight">
                    <span className="text-[#f26b2b] mr-2 tabular-nums">{i + 1}.</span>
                    {s.title}
                  </h2>
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {s.body}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

/** Reusable contact block used across all three legal pages. */
export function LegalContactBlock() {
  return (
    <address className="not-italic bg-gray-50 border border-gray-100 rounded-2xl p-5 print:border-black">
      <p className="font-semibold text-[#03374f]">Pacific Coast Title Company</p>
      <p>1111 E. Katella Ave. Ste. 120</p>
      <p>Orange, CA 92867</p>
      <p className="mt-2">
        <a href="mailto:info@pct.com" className="text-[#f26b2b] hover:underline">
          info@pct.com
        </a>
      </p>
      <p>
        <a href="tel:7145166700" className="text-[#f26b2b] hover:underline">
          (714) 516-6700
        </a>
      </p>
    </address>
  )
}
