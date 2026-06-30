/**
 * /admin/team/hr/onboarding/templates — HR checklist template editor.
 *
 * Gated 'hr-tools'. Edits hr_onboarding_item_templates only, which feed
 * future onboarding stamps; existing hr_onboarding_items remain untouched.
 */
import { requirePageRole } from '@/lib/auth/guards'
import {
  getChecklistTemplates,
  HR_ONBOARDING_CHECKLIST_CATEGORIES,
} from '@/lib/admin-db'
import HrChecklistTemplateEditorClient from '@/components/admin/HrChecklistTemplateEditorClient'

export const metadata = { title: 'Checklist Templates | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function HrChecklistTemplateEditorPage() {
  await requirePageRole('hr-tools')

  const [salesRepTemplates, employeeTemplates] = await Promise.all([
    getChecklistTemplates('sales_rep'),
    getChecklistTemplates('employee'),
  ])

  return (
    <HrChecklistTemplateEditorClient
      initialTemplates={{
        sales_rep: salesRepTemplates,
        employee: employeeTemplates,
      }}
      categories={[...HR_ONBOARDING_CHECKLIST_CATEGORIES]}
    />
  )
}
