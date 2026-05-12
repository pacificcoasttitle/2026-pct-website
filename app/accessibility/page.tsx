import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, LegalContactBlock, type LegalSection } from "@/components/legal/LegalPage"

export const metadata: Metadata = {
  title: "Accessibility Statement | Pacific Coast Title Company",
  description:
    "Pacific Coast Title Company's commitment to working toward a more accessible website experience for all visitors.",
}

const EFFECTIVE_DATE = "2026-05-12"

const sections: LegalSection[] = [
  {
    id: "our-commitment",
    title: "Our Commitment",
    body: (
      <p>
        Pacific Coast Title Company is committed to working toward making our
        website accessible to all visitors, including those with disabilities.
        We believe that everyone should be able to access the information and
        services on our site.
      </p>
    ),
  },
  {
    id: "ongoing-efforts",
    title: "Ongoing Efforts",
    body: (
      <p>
        We work to follow accessibility best practices and continue to improve
        the experience for all users. Accessibility is an ongoing effort, and
        we appreciate feedback that helps us identify areas for improvement.
      </p>
    ),
  },
  {
    id: "feedback-welcome",
    title: "Feedback Welcome",
    body: (
      <p>
        If you encounter any difficulty accessing content on our website, or
        have suggestions for improvement, please contact us. We will work to
        address concerns and provide information in an accessible format where
        reasonable.
      </p>
    ),
  },
  {
    id: "third-party-content",
    title: "Third-Party Content",
    body: (
      <p>
        Our website may include content or features provided by third parties —
        for example, embedded maps, document viewers, or partner portals. We
        cannot guarantee the accessibility of third-party content but will work
        with users to find alternatives where possible.
      </p>
    ),
  },
  {
    id: "contact-for-accessibility",
    title: "Contact Us About Accessibility",
    body: (
      <>
        <p>To share accessibility feedback or request information in an alternate format:</p>
        <LegalContactBlock />
        <p className="text-sm text-gray-500">
          You can also reach our customer service line at{" "}
          <a href="tel:8667241050">(866) 724-1050</a>, or visit our{" "}
          <Link href="/contact">Contact page</Link>.
        </p>
      </>
    ),
  },
]

export default function AccessibilityPage() {
  return (
    <LegalPage
      label="Legal"
      title="Accessibility Statement"
      subtitle="Our commitment to working toward a more accessible web experience."
      effectiveDate={EFFECTIVE_DATE}
      sections={sections}
    />
  )
}
