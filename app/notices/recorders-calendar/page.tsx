import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  Calendar, ChevronRight, Download, AlertCircle, Phone, Mail, ArrowRight
} from "lucide-react"

export const metadata = {
  title: "2026 County Recorders Holiday Calendar | Pacific Coast Title",
  description:
    "California county recorder office closures and holidays for 2026. Plan your document recordings around official holidays.",
}

const holidays2026 = [
  { holiday: "New Year's Day", date: "January 1, 2026", day: "Thursday" },
  { holiday: "Martin Luther King Jr. Day", date: "January 19, 2026", day: "Monday" },
  { holiday: "Presidents' Day", date: "February 16, 2026", day: "Monday" },
  { holiday: "César Chávez Day", date: "March 31, 2026", day: "Tuesday" },
  { holiday: "Memorial Day", date: "May 25, 2026", day: "Monday" },
  { holiday: "Independence Day (Observed)", date: "July 3, 2026", day: "Friday" },
  { holiday: "Labor Day", date: "September 7, 2026", day: "Monday" },
  { holiday: "Indigenous Peoples' Day", date: "October 12, 2026", day: "Monday" },
  { holiday: "Veterans Day", date: "November 11, 2026", day: "Wednesday" },
  { holiday: "Thanksgiving Day", date: "November 26, 2026", day: "Thursday" },
  { holiday: "Day After Thanksgiving", date: "November 27, 2026", day: "Friday" },
  { holiday: "Christmas Day", date: "December 25, 2026", day: "Friday" },
]

export default function RecordersCalendarPage() {
  return (
    <>
      <PageHero
        label="2026 Calendar"
        title="2026 County Recorders Holiday Calendar"
        subtitle="Plan your recordings around county office closures."
      />

      {/* Intro */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-600">
              California county recorder offices observe the following holidays in 2026. 
              Plan your document recordings accordingly to avoid delays.
            </p>
          </div>
        </div>
      </section>

      {/* Holiday Table */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Holiday</th>
                      <th className="px-6 py-4 text-left font-semibold">Date</th>
                      <th className="px-6 py-4 text-left font-semibold">Day</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {holidays2026.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-secondary">{item.holiday}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.date}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {item.day}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Some counties may observe additional holidays or have different 
                closure dates. Contact your specific county recorder for confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Download the Complete Calendar
            </h2>
            <p className="text-gray-600 mb-8">
              Get a printable PDF version of the 2026 Recorders Holiday Calendar.
            </p>
            <a
              href="https://pct.com/assets/downloads/calendars/2026-recorders-holiday-calendar.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download 2026 Calendar (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* County Contacts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              County Recorder Contacts
            </h2>
            <p className="text-gray-600 mb-8">
              Need contact information for a specific county recorder? View our recording fees 
              page for county-by-county details.
            </p>
            <Link
              href="/resources/recording-fees"
              className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
            >
              Recording Fees by County
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Questions About Recording Deadlines?
            </h2>
            <p className="text-gray-600 mb-6">
              Our team can help you plan your recordings around holidays.
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
