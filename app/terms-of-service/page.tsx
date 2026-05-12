{/* LEGAL REVIEW NEEDED: This is a template. Have legal counsel review before considering this final. */}
import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, LegalContactBlock, type LegalSection } from "@/components/legal/LegalPage"

export const metadata: Metadata = {
  title: "Terms of Service | Pacific Coast Title Company",
  description:
    "The terms that govern your use of the Pacific Coast Title Company website and online tools.",
}

const EFFECTIVE_DATE = "2026-05-12"

const sections: LegalSection[] = [
  {
    id: "acceptance-of-terms",
    title: "Acceptance of Terms",
    body: (
      <p>
        By accessing or using this website, you agree to these Terms of Service
        and to our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>. If you do not agree,
        please do not use the website.
      </p>
    ),
  },
  {
    id: "description-of-services",
    title: "Description of Services",
    body: (
      <p>
        This website provides information about Pacific Coast Title
        Company&apos;s title insurance and escrow services, along with tools and
        resources for real estate professionals and consumers — including rate
        calculators, educational content, downloadable forms, and our AI-assisted
        tools.
      </p>
    ),
  },
  {
    id: "use-of-website",
    title: "Use of Website",
    body: (
      <>
        <h3>Permitted use</h3>
        <p>
          You may use this website for personal and business purposes related to
          Pacific Coast Title Company&apos;s services.
        </p>
        <h3>Prohibited activities</h3>
        <p>You agree not to:</p>
        <ul>
          <li>Use the website for any unlawful purpose;</li>
          <li>
            Attempt to disrupt, overload, or interfere with the website or its
            underlying systems;
          </li>
          <li>
            Scrape, harvest, or systematically extract data from the website
            without our prior written permission;
          </li>
          <li>
            Attempt to access any portion of the website you are not authorized
            to access, or circumvent any security or authentication measure;
          </li>
          <li>
            Upload or transmit any malicious code or content that infringes on
            the rights of others.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    body: (
      <p>
        All content on this website — including text, graphics, logos, icons,
        images, audio, video, software, and the overall design — is the property
        of Pacific Coast Title Company or its licensors and is protected by U.S.
        and international intellectual property laws. You may not copy, modify,
        distribute, or create derivative works from this content without our
        prior written permission, except as expressly permitted on the site.
      </p>
    ),
  },
  {
    id: "tools-and-calculators-disclaimer",
    title: "Tools, Calculators, and AI Assistants",
    body: (
      <>
        <p>
          Rate calculators, AI assistants (including TESSA™), document analyzers,
          and similar tools on this website provide <strong>estimates and
          general information only</strong>. They do not constitute legal,
          financial, tax, insurance, or other professional advice.
        </p>
        <p>
          Actual rates, fees, coverage, and services are subject to the terms of
          specific written agreements and applicable underwriting requirements.
          You should consult with a qualified professional regarding your
          specific situation before relying on any output from these tools.
        </p>
      </>
    ),
  },
  {
    id: "no-warranty",
    title: "No Warranty",
    body: (
      <p>
        This website and its content are provided &quot;as is&quot; and &quot;as
        available&quot; without warranties of any kind, either express or
        implied, including but not limited to warranties of merchantability,
        fitness for a particular purpose, non-infringement, or accuracy. We do
        not warrant that the website will be uninterrupted, error-free, or free
        of harmful components.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    body: (
      <p>
        To the fullest extent permitted by applicable law, Pacific Coast Title
        Company and its affiliates, officers, employees, and agents will not be
        liable for any indirect, incidental, special, consequential, or punitive
        damages — or for any loss of profits, data, or goodwill — arising out of
        or relating to your use of, or inability to use, this website or any
        content obtained from it, even if we have been advised of the
        possibility of such damages.
      </p>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-Party Links",
    body: (
      <p>
        Our website may contain links to websites, content, or services operated
        by third parties. We are not responsible for the content, policies, or
        practices of those sites and provide such links for convenience only. A
        link to a third-party site does not imply endorsement.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law",
    body: (
      <p>
        These Terms of Service and any disputes arising out of or relating to
        them are governed by the laws of the State of California, without regard
        to its conflict of laws principles. Venue for any action shall lie in
        the state or federal courts located in Orange County, California.
      </p>
    ),
  },
  {
    id: "changes-to-terms",
    title: "Changes to These Terms",
    body: (
      <p>
        We may update these Terms of Service from time to time. When we do, we
        will post the revised terms on this page and update the &quot;Last
        updated&quot; date at the top. Your continued use of the website after
        changes are posted constitutes your acceptance of the revised terms.
      </p>
    ),
  },
  {
    id: "contact-information",
    title: "Contact Information",
    body: (
      <>
        <p>For questions about these Terms of Service, please contact us:</p>
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

export default function TermsOfServicePage() {
  return (
    <LegalPage
      label="Legal"
      title="Terms of Service"
      subtitle="The terms that govern your use of this website and our online tools."
      effectiveDate={EFFECTIVE_DATE}
      sections={sections}
      disclaimer={
        <>
          <strong>Legal review pending.</strong> These Terms of Service are a
          working template. Limitation-of-liability, indemnification, and
          dispute-resolution language in particular should be reviewed by
          qualified legal counsel before being considered final.
        </>
      }
    />
  )
}
