/**
 * /team/[slug] — permanent, DB-driven employee profile page
 *
 * This route renders any active employee from the vcard_employees table.
 * The root /<slug> route uses this same data for vanity URLs.
 *
 * URL pattern:  pct.com/team/david
 *               pct.com/team/anthony
 *               pct.com/team/angeline-ahn
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllActiveEmployees, getEmployeeBySlug, recordView } from '@/lib/vcard-db'
import type { Employee } from '@/types/employee'
import { resolvePhotoUrl, parseLangs, parseSpecs } from '@/types/employee'
import { TeamMemberPage } from '@/components/team/TeamMemberPage'
import type { TeamMember } from '@/data/team'

export const dynamicParams = true
/** Re-fetch from DB every 60 s so admin edits (photos, bios, etc.) appear quickly */
export const revalidate = 60

// Pre-render all active employees at build time
export async function generateStaticParams() {
  const employees = await getAllActiveEmployees()
  return employees.map((e) => ({ slug: e.slug }))
}

// ── Adapter ───────────────────────────────────────────────────────────────────
function employeeToTeamMember(emp: Employee): TeamMember {
  const officeLabel = emp.office
    ? [emp.office.city, emp.office.state].filter(Boolean).join(', ')
    : undefined

  return {
    slug:       emp.slug,
    name:       emp.name,
    title:      emp.title ?? 'Team Member',
    department: emp.department?.name,
    email:      emp.email ?? '',
    phone:      emp.mobile ?? emp.phone ?? '',
    cell:       emp.mobile && emp.phone ? emp.phone : undefined,
    photo:      resolvePhotoUrl(emp),
    bio:        emp.website_bio ?? emp.bio ?? '',
    specialties: parseSpecs(emp.specialties),
    languages:   parseLangs(emp.languages),
    office:      officeLabel,
    linkedin:    emp.linkedin ?? undefined,
  }
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const emp = await getEmployeeBySlug(slug)
  if (!emp) return {}

  const name  = emp.name
  const title = `${name} | Pacific Coast Title`
  const desc  = `Connect with ${name}${emp.title ? `, ${emp.title}` : ''} at Pacific Coast Title Company.`
  const photo = resolvePhotoUrl(emp)

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [{ url: photo, width: 400, height: 400 }],
      type: 'profile',
    },
    twitter: { card: 'summary', title, description: desc, images: [photo] },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const emp = await getEmployeeBySlug(slug)
  if (!emp) notFound()

  recordView(slug)

  return <TeamMemberPage member={employeeToTeamMember(emp)} />
}
