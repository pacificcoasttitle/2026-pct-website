/**
 * /admin/team/signatures/import — CSV upload flow.
 *
 * Server component shell; all parsing/validation happens client-side
 * in CsvImporter. Office slugs are fetched here so the upload-step
 * helper text can list real, current values.
 */
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import { getAllOfficeLocations, type OfficeLocation } from '@/lib/admin-db'
import { CsvImporter } from '@/components/admin/signatures/CsvImporter'

export const metadata = { title: 'Import Staff CSV | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function SignatureImportPage() {
  let offices: OfficeLocation[] = []
  try { offices = await getAllOfficeLocations() } catch { /* db offline */ }

  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link href="/admin/team/signatures"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> Back to Signature Center
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <Upload className="w-6 h-6 text-[#f26b2b]" />
          Import Staff CSV
        </h1>
        <p className="text-sm text-gray-500">
          Parse a CSV locally, review the validation report, then commit to the database.
        </p>
      </header>

      <CsvImporter offices={offices} />
    </div>
  )
}
