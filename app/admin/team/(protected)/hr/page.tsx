/**
 * /admin/team/hr — HR roster
 *
 * HR's first workspace page. Lists the full canonical hr_employees
 * roster (~109 people). Server component: gated 'hr-tools', DB-light
 * single SELECT, no external calls. Interactive search/filter lives in
 * the client list component.
 *
 * The segment layout (./layout.tsx) already applies requirePageRole
 * ('hr-tools'); we re-assert it here so the page is self-gating even if
 * rendered outside the segment, mirroring the dashboard page pattern.
 */
import { getAllHrEmployees } from '@/lib/admin-db'
import { requirePageRole } from '@/lib/auth/guards'
import HrRosterClient from '@/components/admin/HrRosterClient'

export const metadata = { title: 'HR Roster | PCT Team Admin' }
export const revalidate = 60

export default async function HrRosterPage() {
  await requirePageRole('hr-tools')

  const employees = await getAllHrEmployees()

  const data = employees.map((e) => ({
    id:                 e.id,
    name:               `${e.first_name} ${e.last_name}`.trim(),
    title:              e.title,
    email:              e.email,
    department:         e.department,
    office:             e.office,
    active:             e.active,
    needs_dedup_review: e.needs_dedup_review,
  }))

  return <HrRosterClient employees={data} />
}
