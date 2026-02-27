/**
 * PCT Team Member Data
 *
 * To add a new rep:
 *   1. Add an entry to the `teamMembers` array below.
 *   2. Set `slug` to the URL you want (e.g. "david" → pct.com/david).
 *   3. Drop their headshot in /public/team/<slug>.jpg
 *   4. Paste the Mailchimp embed action URL params into the `mailchimp` block.
 *   5. Commit & push — Vercel rebuilds automatically.
 *
 * Finding Mailchimp values:
 *   Open the embed code Mailchimp gives you.
 *   The <form action="..."> URL contains:  u=..., id=..., f_id=...
 *   The hidden <input name="tags"> contains the tag IDs for this rep.
 *   The server prefix is the subdomain: pct.us17 → server = "us17"
 */

export interface TeamMember {
  /** URL slug — becomes pct.com/<slug> */
  slug: string
  name: string
  title: string
  department?: string
  email: string
  /** Main office / direct line */
  phone: string
  /** Mobile / cell (optional) */
  cell?: string
  /** Path relative to /public, e.g. "/team/david.jpg" */
  photo?: string
  bio: string
  specialties?: string[]
  /** Office region shown on the profile card */
  office?: string
  licenseNumber?: string
  linkedin?: string
  languages?: string[]

  /** Mailchimp subscription form configuration */
  mailchimp?: {
    /**
     * Mailchimp server prefix — the subdomain before ".list-manage.com"
     * e.g. for "https://pct.us17.list-manage.com/..." the server is "us17"
     */
    server: string
    /** "u" param from the form action URL (account ID) */
    u: string
    /** "id" param from the form action URL (audience/list ID) */
    audienceId: string
    /** "f_id" param from the form action URL */
    formId: string
    /** Comma-separated Mailchimp tag IDs for this rep (from hidden tags input) */
    tags?: string
    /** Heading shown above the subscribe form — defaults to "[Name]'s Updates" */
    subscribeHeading?: string
    /** Sub-heading text under the heading */
    subscribeSubHeading?: string
  }
}

export const teamMembers: TeamMember[] = [
  {
    slug: "david",
    name: "David Gomez",
    title: "Senior Account Executive",
    department: "Sales",
    email: "Dgomez@pct.com",
    phone: "(562) 619-6062",
    cell: "(866) 724-1050",
    photo: "https://pub-dbe01c2b9ef0457c979ef76b8d8618f3.r2.dev/sales-rep-photos/WebThumb/David.png",
    bio: "David is dedicated to helping real estate agents and lending partners across Los Angeles and Orange County grow their business with Pacific Coast Title. With a hands-on approach and deep knowledge of the title and escrow process, he makes sure your clients feel supported from contract to close — every time.",
    specialties: [
      "Residential Resale",
      "New Construction",
      "Refinance",
      "REO / Short Sale",
      "Commercial",
    ],
    office: "Los Angeles & Orange County",
    licenseNumber: "CA Notary #XXXXXXX", // ← update

    mailchimp: {
      server: "us17",
      u: "3f123598483b787fa180fff0f",
      audienceId: "a8f29f3045",
      formId: "00babae2f0",
      tags: "8368532,8368533,8368534,8368535",
      subscribeHeading: "David's Weekly Updates",
      subscribeSubHeading:
        "Subscribe to receive market trends, rate changes, and title tips from David — delivered straight to your inbox.",
    },
  },

  // ── Add more reps below ───────────────────────────────────────────────────
  // {
  //   slug: "sarah",
  //   name: "Sarah Johnson",
  //   title: "Title Officer",
  //   email: "sarah@pct.com",
  //   phone: "(714) 516-6700",
  //   photo: "https://pub-dbe01c2b9ef0457c979ef76b8d8618f3.r2.dev/sales-rep-photos/WebThumb/Sarah.png",
  //   bio: "...",
  //   specialties: ["Commercial", "1031 Exchange"],
  //   office: "Los Angeles",
  //   mailchimp: {
  //     server: "us17",
  //     u: "3f123598483b787fa180fff0f",
  //     audienceId: "a8f29f3045",   // same list, different tags
  //     formId: "XXXXXXXX",
  //     tags: "XXXXXXXX,XXXXXXXX",
  //     subscribeHeading: "Sarah's Market Updates",
  //   },
  // },
]

/** Lookup a team member by slug (case-insensitive). Returns undefined if not found. */
export function getTeamMember(slug: string): TeamMember | undefined {
  return teamMembers.find(
    (m) => m.slug.toLowerCase() === slug.toLowerCase()
  )
}
