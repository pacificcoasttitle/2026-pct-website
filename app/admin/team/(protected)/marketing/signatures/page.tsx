/**
 * /admin/team/marketing/signatures — Signature Center landing.
 *
 * Server component. Loads staff + offices and hands them to the
 * client list. Auth is enforced by the (protected) route-group layout.
 */
import Link from 'next/link'
import { ArrowLeft, PenLine } from 'lucide-react'
import {
  getAllStaffMembers,
  getAllOfficeLocations,
  type StaffMember,
  type OfficeLocation,
} from '@/lib/admin-db'
import { SignatureCenter } from '@/components/admin/signatures/SignatureCenter'

export const metadata = { title: 'Signature Center | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function SignatureCenterPage() {
  let staff:   StaffMember[]     = []
  let offices: OfficeLocation[]  = []

  try { staff   = await getAllStaffMembers() }    catch { /* db offline */ }
  try { offices = await getAllOfficeLocations() } catch { /* db offline */ }

  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-6xl">
      <header className="space-y-2">
        <Link href="/admin/team/marketing"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> Back to Marketing
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <PenLine className="w-6 h-6 text-[#f26b2b]" />
          Signature Center
        </h1>
        <p className="text-sm text-gray-500">
          Generate and distribute branded email signatures.
        </p>
      </header>

      <SignatureCenter staff={staff} offices={offices} />
    </div>
  )
}
