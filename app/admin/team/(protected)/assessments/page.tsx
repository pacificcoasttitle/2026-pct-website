import { ClipboardCheck } from 'lucide-react'
import { getAssessments } from '@/lib/admin-db'
import { AssessmentsClient } from '@/components/admin/AssessmentsClient'

export const metadata = { title: 'Assessments | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function AssessmentsPage() {
  let rows: Awaited<ReturnType<typeof getAssessments>> = []
  try {
    rows = await getAssessments(300)
  } catch {
    // DB unavailable – show empty state
  }
  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-2 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-[#03374f]">Assessments</h1>
        <p className="text-gray-500 text-sm mt-1">Tool competency submissions from `/assessment`.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-[#f26b2b]" />
          <h2 className="font-semibold text-[#03374f] text-sm">Submission Overview</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="rounded-xl bg-[#f8f6f3] border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Submissions</p>
            <p className="text-2xl font-bold text-[#03374f]">{rows.length}</p>
          </div>
          <div className="rounded-xl bg-[#f8f6f3] border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Avg Capability</p>
            <p className="text-2xl font-bold text-[#03374f]">
              {rows.length ? (rows.reduce((s, r) => s + Number(r.capability_score), 0) / rows.length).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="rounded-xl bg-[#f8f6f3] border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Avg Confidence</p>
            <p className="text-2xl font-bold text-[#03374f]">
              {rows.length ? (rows.reduce((s, r) => s + Number(r.avg_confidence_score), 0) / rows.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      <AssessmentsClient rows={rows} />
    </div>
  )
}

