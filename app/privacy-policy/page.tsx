{/* LEGAL REVIEW NEEDED: This is a template. Have legal counsel review before considering this final. */}
import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, LegalContactBlock, type LegalSection } from "@/components/legal/LegalPage"

export const metadata: Metadata = {
  title: "Privacy Policy | Pacific Coast Title Company",
  description:
    "How Pacific Coast Title Company collects, uses, and shares information when you use our website and services.",
}

const EFFECTIVE_DATE = "2026-05-12"

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    body: (
      <p>
        This Privacy Policy describes how Pacific Coast Title Company (&quot;PCT,&quot;
        &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
        information when you use our website and services. By using our website or
        services, you acknowledge that you have read and understood this policy.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <p>We collect information in three general ways:</p>
        <h3>Information you provide</h3>
        <p>
          We collect information you give us directly through forms, transaction
          documents, communications, and other interactions — for example when you
          request a quote, open an order, contact us, or use our online tools.
          This may include your name, contact details, property information, and
          information necessary to complete a real estate transaction.
        </p>
        <h3>Information collected automatically</h3>
        <p>
          When you use our website, we may automatically collect information about
          your device and how you interact with the site, including IP address,
          browser type, pages visited, and similar usage data.
        </p>
        <h3>Information from third parties</h3>
        <p>
          During the course of a transaction we may receive information from
          parties such as lenders, real estate agents, title underwriters, public
          record providers, and government agencies.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide title, escrow, and related services;</li>
          <li>Communicate with you about your transaction or inquiry;</li>
          <li>Comply with legal, regulatory, and underwriting obligations;</li>
          <li>Operate, maintain, and improve our website and services;</li>
          <li>Detect, prevent, and respond to fraud or security incidents.</li>
        </ul>
      </>
    ),
  },
  {
    id: "information-sharing",
    title: "Information Sharing",
    body: (
      <>
        <p>We may share information with:</p>
        <ul>
          <li>
            <strong>Parties to your transaction</strong> — such as buyers, sellers,
            lenders, real estate agents, brokers, and attorneys involved in the
            same transaction.
          </li>
          <li>
            <strong>Service providers</strong> — vendors who help us operate our
            business and provide services to you, subject to appropriate
            confidentiality obligations.
          </li>
          <li>
            <strong>Underwriters and insurance partners</strong> — title
            underwriters and related insurance providers who participate in
            issuing your policy.
          </li>
          <li>
            <strong>Government and legal recipients</strong> — when required by
            law, regulation, court order, or to comply with legal process,
            including federal reporting obligations such as FinCEN requirements.
          </li>
        </ul>
        <p>
          <strong>We do not sell personal information to third parties for
          marketing purposes.</strong>
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    body: (
      <p>
        We work to protect your information using reasonable administrative,
        technical, and physical safeguards appropriate to the nature of the
        information and the risks involved. However, no method of transmission or
        electronic storage is completely secure, and we cannot guarantee absolute
        security.
      </p>
    ),
  },
  {
    id: "your-choices-and-rights",
    title: "Your Choices and Rights",
    body: (
      <>
        <p>
          You may have certain rights regarding your personal information,
          depending on where you live and applicable law. <strong>California
          residents</strong> have rights under the California Consumer Privacy
          Act (CCPA) and the California Privacy Rights Act (CPRA), which may
          include the right to know what personal information we collect, the
          right to request deletion, and the right to opt out of certain uses or
          disclosures.
        </p>
        <p>
          To exercise an applicable right or ask a question about this policy,
          please contact us using the information in the{" "}
          <a href="#contact-information">Contact Information</a> section below.
          We will respond to verifiable requests as required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and Similar Technologies",
    body: (
      <p>
        Our website uses cookies and similar technologies to support site
        functionality, remember your preferences, and help us understand how the
        site is used. Most browsers allow you to control cookies through their
        settings. Disabling cookies may affect some features of our site.
      </p>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    body: (
      <p>
        Our services are not directed to children under 13, and we do not
        knowingly collect personal information from children under 13. If you
        believe a child has provided us with personal information, please contact
        us so we can take appropriate action.
      </p>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-Party Links",
    body: (
      <p>
        Our website may contain links to websites or services operated by third
        parties. This Privacy Policy does not apply to those sites. We encourage
        you to review the privacy practices of any third-party site you visit.
      </p>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        post the revised policy on this page and update the &quot;Last
        updated&quot; date at the top. Continued use of our website after a
        change indicates your acknowledgement of the updated policy.
      </p>
    ),
  },
  {
    id: "contact-information",
    title: "Contact Information",
    body: (
      <>
        <p>
          For questions about this Privacy Policy or to exercise a privacy right,
          please contact us:
        </p>
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

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      label="Legal"
      title="Privacy Policy"
      subtitle="How Pacific Coast Title Company collects, uses, and shares your information."
      effectiveDate={EFFECTIVE_DATE}
      sections={sections}
      disclaimer={
        <>
          <strong>Legal review pending.</strong> This Privacy Policy is a working
          template intended to describe our general practices. It should be
          reviewed by qualified legal counsel before being considered final.
        </>
      }
    />
  )
}
