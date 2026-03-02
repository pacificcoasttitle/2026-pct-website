/**
 * /team — PCT Team Directory
 * Lists all active employees from the vcard_employees database.
 * Groups by department, shows office badge, links to individual profiles.
 */
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MapPin, Users } from 'lucide-react'
import { getAllActiveEmployees } from '@/lib/vcard-db'
import { resolvePhotoUrl, parseLangs, parseSpecs } from '@/types/employee'
import type { Employee } from '@/types/employee'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Our Team | Pacific Coast Title Company',
  description:
    'Meet the Pacific Coast Title Company team — sales executives, escrow officers, and title professionals serving Los Angeles, Orange County, and the Inland Empire.',
}

// Revalidate every 10 minutes so new employees show up quickly without a full rebuild
export const revalidate = 600

// ── Department order / display config ────────────────────────────────────────
const DEPT_ORDER = ['Sales', 'Escrow', 'Title', 'Administration', 'Marketing']

function groupByDepartment(employees: Employee[]): Map<string, Employee[]> {
  const groups = new Map<string, Employee[]>()
  for (const emp of employees) {
    const key = emp.department?.name ?? 'Other'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(emp)
  }
  // Sort keys by preferred order
  const sorted = new Map<string, Employee[]>()
  for (const name of DEPT_ORDER) {
    if (groups.has(name)) sorted.set(name, groups.get(name)!)
  }
  for (const [k, v] of groups) {
    if (!sorted.has(k)) sorted.set(k, v)
  }
  return sorted
}

// ── Employee Card ─────────────────────────────────────────────────────────────
function EmployeeCard({ emp }: { emp: Employee }) {
  const photo    = resolvePhotoUrl(emp)
  const initials = emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const specs    = parseSpecs(emp.specialties)
  const langs    = parseLangs(emp.languages)
  const officeCity = emp.office?.city ?? null

  return (
    <Link
      href={`/team/${emp.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Photo */}
      <div className="relative h-56 bg-gradient-to-br from-[#03374f] to-[#03374f]/80 overflow-hidden flex-shrink-0">
        <Image
          src={photo}
          alt={emp.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          onError={undefined}
        />
        {/* Dept badge */}
        {emp.department && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow"
            style={{ backgroundColor: emp.department.color + 'dd' }}
          >
            {emp.department.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-[#03374f] text-lg leading-tight group-hover:text-[#f26b2b] transition-colors">
            {emp.name}
          </h3>
          {emp.title && (
            <p className="text-sm text-gray-500 mt-0.5">{emp.title}</p>
          )}
        </div>

        {/* Contact quick-links */}
        <div className="space-y-1.5 text-xs text-gray-500">
          {(emp.mobile ?? emp.phone) && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 flex-shrink-0 text-[#f26b2b]" />
              {emp.mobile ?? emp.phone}
            </span>
          )}
          {emp.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 flex-shrink-0 text-[#f26b2b]" />
              <span className="truncate">{emp.email}</span>
            </span>
          )}
          {officeCity && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0 text-[#f26b2b]" />
              {officeCity}
            </span>
          )}
        </div>

        {/* Specialties */}
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {specs.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-1">
            {langs.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function TeamPage() {
  const employees = await getAllActiveEmployees()
  const groups    = groupByDepartment(employees)

  const salesCount  = (groups.get('Sales')?.length ?? 0)
  const escrowCount = (groups.get('Escrow')?.length ?? 0)

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-[#f8f6f3]">
        {/* ── Hero ── */}
        <section className="bg-[#03374f] text-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Our Team
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              People You Can Count On
            </h1>
            <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
              {employees.length} title &amp; escrow professionals across Los Angeles, Orange County, and the Inland Empire — dedicated to closing your deal right, every time.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-8">
              {[
                { label: 'Sales Executives', value: salesCount },
                { label: 'Offices', value: 3 },
                { label: 'Years in Business', value: '50+' },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl px-5 py-3 text-center">
                  <div className="text-2xl font-bold text-[#f26b2b]">{s.value}</div>
                  <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Department Sections ── */}
        <div className="max-w-6xl mx-auto px-6 py-14 space-y-16">
          {Array.from(groups.entries()).map(([deptName, members]) => (
            <section key={deptName}>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-bold text-[#03374f]">{deptName}</h2>
                <span className="text-sm text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-0.5">
                  {members.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {members.map((emp) => (
                  <EmployeeCard key={emp.id} emp={emp} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── CTA ── */}
        <section className="bg-white border-t border-gray-100 py-14 px-6">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold text-[#03374f]">
              Not sure who to contact?
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Call our main line and we&apos;ll connect you with the right person for your transaction.
            </p>
            <a
              href="tel:+18667241050"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#f26b2b] hover:bg-[#e05d1e] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Phone className="w-4 h-4" />
              (866) 724-1050
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
