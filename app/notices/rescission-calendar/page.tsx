import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  CalendarDays, ChevronRight, Download, AlertCircle, CheckCircle, 
  XCircle, Phone, Mail, Clock, CalendarCheck
} from "lucide-react"

export const metadata = {
  title: "Right of Rescission Calendar | Pacific Coast Title",
  description:
    "Calculate rescission deadlines for refinance transactions. Understand the federal three-day right of rescission period.",
}

const rescissionRules = [
  { text: "Saturdays ARE counted as business days", isIncluded: true },
  { text: "Sundays are NOT counted", isIncluded: false },
  { text: "Federal holidays are NOT counted", isIncluded: false },
]

const federalHolidays2026 = [
  "New Year's Day (January 1)",
  "Martin Luther King Jr. Day (January 19)",
  "Presidents' Day (February 16)",
  "Memorial Day (May 25)",
  "Independence Day (July 4 - observed July 3)",
  "Labor Day (September 7)",
  "Indigenous Peoples' Day (October 12)",
  "Veterans Day (November 11)",
  "Thanksgiving Day (November 26)",
  "Christmas Day (December 25)",
]

export default function RescissionCalendarPage() {
  return (
    <>
      <PageHero
        label="Refinance Compliance"
        title="Right of Rescission Calendar"
        subtitle="Calculate rescission deadlines for refinance transactions."
      />

      {/* What is Rescission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-6">What is the Right of Rescission?</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                The federal Truth in Lending Act (TILA) gives borrowers in certain refinance 
                transactions the right to <strong>cancel (rescind)</strong> the loan within 
                <strong> three business days</strong> of closing.
              </p>
              <p>
                This right applies to refinance transactions secured by the borrower's 
                <strong> primary residence</strong>. It does not apply to purchase transactions.
              </p>
            </div>

            {/* Important Notice */}
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 mb-2">Important:</p>
                  <p className="text-amber-800">
                    <strong>Funds cannot be disbursed</strong> until the rescission period expires. 
                    This is a federal requirement that cannot be waived.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Calculate */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8 flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              How to Calculate the Rescission Period
            </h2>

            <p className="text-lg text-gray-600 mb-6">
              The three-day rescission period:
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mb-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    1
                  </div>
                  <span className="text-gray-700">
                    <strong>Begins</strong> at midnight after the <strong>last</strong> of these events:
                    <ul className="mt-2 ml-6 space-y-1 list-disc text-gray-600">
                      <li>Loan consummation (signing)</li>
                      <li>Delivery of Truth in Lending disclosures</li>
                      <li>Delivery of rescission notice</li>
                    </ul>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    2
                  </div>
                  <span className="text-gray-700">
                    <strong>Excludes</strong> Sundays and federal holidays
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                    3
                  </div>
                  <span className="text-gray-700">
                    <strong>Ends</strong> at midnight on the third business day
                  </span>
                </li>
              </ul>
            </div>

            {/* Business Day Rules */}
            <h3 className="text-xl font-bold text-secondary mb-4">Business Day Rules</h3>
            <div className="space-y-3">
              {rescissionRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  {rule.isIncluded ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-gray-700">{rule.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Example Calculation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8 flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-primary" />
              Example Calculation
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4">
                Borrower signs refinance documents on Monday, March 2, 2026:
              </h3>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Day 1</p>
                  <p className="font-bold text-secondary">Tuesday</p>
                  <p className="text-sm text-gray-600">March 3</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Day 2</p>
                  <p className="font-bold text-secondary">Wednesday</p>
                  <p className="text-sm text-gray-600">March 4</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Day 3</p>
                  <p className="font-bold text-secondary">Thursday</p>
                  <p className="text-sm text-gray-600">March 5</p>
                </div>
                <div className="bg-primary rounded-xl p-4 text-center text-white">
                  <p className="text-sm text-white/80 mb-1">Funds Disburse</p>
                  <p className="font-bold">Friday</p>
                  <p className="text-sm text-white/80">March 6</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4">
                <p className="text-blue-800">
                  <strong>Rescission period expires</strong> at midnight on Thursday, March 5, 2026.
                  <br />
                  <strong>Funds can be disbursed</strong> on Friday, March 6, 2026.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2026 Federal Holidays */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8">
              2026 Federal Holidays
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              The following federal holidays are <strong>excluded</strong> from the rescission period calculation:
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {federalHolidays2026.map((holiday, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-gray-700">{holiday}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <CalendarDays className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Download 2026 Rescission Calendar
            </h2>
            <p className="text-gray-600 mb-8">
              Get a printable PDF calendar with rescission period calculations for 2026.
            </p>
            <a
              href="https://pct.com/assets/downloads/calendars/2026-rescission-calendar.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download 2026 Rescission Calendar (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Questions About Rescission Deadlines?
            </h2>
            <p className="text-gray-600 mb-6">
              Our escrow team can help you calculate rescission periods for your transactions.
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
