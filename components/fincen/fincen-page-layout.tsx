import { KeyTakeaways } from "@/components/fincen/key-takeaways"
import { CTABox } from "@/components/fincen/cta-box"
import type { ReactNode } from "react"

interface CTAButton {
  label: string
  href: string
  variant?: "outline"
}

interface FinCENPageLayoutProps {
  takeaways: string[]
  children: ReactNode
  cta?: {
    heading: string
    body: string
    buttons: CTAButton[]
  }
}

/**
 * Shared layout for all FinCEN pages.
 * Renders a two-column layout on desktop: main content on the left,
 * Key Takeaways as a sticky sidebar on the right.
 * On mobile, takeaways collapse to a compact card above the content.
 */
export function FinCENPageLayout({ takeaways, children, cta }: FinCENPageLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row gap-10 items-start max-w-6xl mx-auto">

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile-only takeaways (shown above content, inline style) */}
          <div className="lg:hidden mb-8">
            <KeyTakeaways items={takeaways} />
          </div>

          {children}

          {cta && (
            <CTABox
              heading={cta.heading}
              body={cta.body}
              buttons={cta.buttons}
            />
          )}
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-6">
            <KeyTakeaways items={takeaways} sidebar />
          </div>
        </aside>

      </div>
    </div>
  )
}
