/**
 * Root-level dynamic route — powers pct.com/<slug>
 *
 * Lookup order:
 *   1. data/team.ts  (static, known marketing reps — pre-rendered at build)
 *   2. vcard_employees DB  (all other active employees — server-rendered on demand)
 *   3. notFound()
 *
 * Next.js gives static routes (e.g. /about, /fincen) priority over this
 * dynamic route, so there is no conflict with existing pages.
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTeamMember, teamMembers } from '@/data/team'
import type { TeamMember } from '@/data/team'
import { getEmployeeBySlug, recordView } from '@/lib/vcard-db'
import type { Employee } from '@/types/employee'
import { resolvePhotoUrl, parseLangs, parseSpecs } from '@/types/employee'
import { TeamMemberPage } from '@/components/team/TeamMemberPage'

// Allow slugs not in generateStaticParams to be rendered on-demand
export const dynamicParams = true

// Pre-render all known team members (from data/team.ts) at build time
export function generateStaticParams() {
  return teamMembers.map((m) => ({ slug: m.slug }))
}

// ── Employee → TeamMember adapter ────────────────────────────────────────────
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

  // Try static team.ts first
  const staticMember = getTeamMember(slug)
  if (staticMember) {
    const title = `${staticMember.name} | Pacific Coast Title`
    const description = [
      `Connect with ${staticMember.name}, ${staticMember.title} at Pacific Coast Title Company.`,
      staticMember.office ? `Serving ${staticMember.office}.` : '',
      staticMember.mailchimp?.subscribeSubHeading ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: staticMember.photo
          ? [{ url: staticMember.photo.startsWith('http') ? staticMember.photo : `https://www.pct.com${staticMember.photo}`, width: 400, height: 400 }]
          : [],
        type: 'profile',
      },
    }
  }

  // Try DB
  const emp = await getEmployeeBySlug(slug)
  if (!emp) return {}

  const name = emp.name
  const title = `${name} | Pacific Coast Title`
  const description = `Connect with ${name}${emp.title ? `, ${emp.title}` : ''} at Pacific Coast Title Company.`
  const photo = resolvePhotoUrl(emp)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: photo, width: 400, height: 400 }],
      type: 'profile',
    },
    twitter: { card: 'summary', title, description, images: [photo] },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 1. Static team.ts lookup (zero DB cost for known reps)
  const staticMember = getTeamMember(slug)
  if (staticMember) {
    return <TeamMemberPage member={staticMember} />
  }

  // 2. DB lookup for all other employees
  const emp = await getEmployeeBySlug(slug)
  if (!emp) notFound()

  // Fire-and-forget view counter
  recordView(slug)

  return <TeamMemberPage member={employeeToTeamMember(emp)} />
}
