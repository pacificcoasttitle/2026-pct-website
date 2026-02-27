/**
 * Root-level dynamic route — powers pct.com/<slug>
 *
 * Next.js gives static routes (e.g. /about, /fincen) priority over this
 * dynamic route, so there is no conflict with existing pages.
 *
 * Only slugs defined in data/team.ts are pre-rendered.
 * Any other slug returns a 404.
 */
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getTeamMember, teamMembers } from "@/data/team"
import { TeamMemberPage } from "@/components/team/TeamMemberPage"

// Pre-render all known team member slugs at build time
export function generateStaticParams() {
  return teamMembers.map((m) => ({ slug: m.slug }))
}

// Per-page SEO metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const member = getTeamMember(slug)
  if (!member) return {}

  const title = `${member.name} | Pacific Coast Title`
  const description = [
    `Connect with ${member.name}, ${member.title} at Pacific Coast Title Company.`,
    member.office ? `Serving ${member.office}.` : "",
    member.mailchimp?.subscribeSubHeading ?? "",
  ]
    .filter(Boolean)
    .join(" ")

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: member.photo
        ? [{ url: `https://www.pct.com${member.photo}`, width: 400, height: 400 }]
        : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: member.photo ? [`https://www.pct.com${member.photo}`] : [],
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const member = getTeamMember(slug)

  // Return 404 for any slug not in our team data
  if (!member) notFound()

  return <TeamMemberPage member={member} />
}
