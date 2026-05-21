/**
 * /admin/team/marketing/templates/[id]/edit
 * Full-screen template editor.
 */
import { notFound } from 'next/navigation'
import { TemplateEditor } from '@/components/admin/marketing/TemplateEditor'

export const metadata = { title: 'Edit Template | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const templateId = Number(id)
  if (!Number.isFinite(templateId) || templateId <= 0) notFound()

  return (
    <div className="pt-2 lg:pt-0">
      <TemplateEditor templateId={templateId} />
    </div>
  )
}
