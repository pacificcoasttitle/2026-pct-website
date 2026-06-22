/**
 * /api/admin/employees/upload — capability-gated image upload for
 * employee photos. Lands in the `employees/` R2 folder.
 *
 * Gate: requireApiRole('employees') (HR-allowed). Shares the R2 upload
 * lib (no duplicated SigV4 logic). Same validation + return shape
 * ({url,key,size,name}) as the old shared /api/admin/upload.
 */
import { NextRequest } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { handleAdminImageUpload, randomStem } from '@/lib/r2-upload'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('employees')
  if ('error' in auth) return auth.error

  return handleAdminImageUpload(req, ({ ext }) => `employees/${randomStem()}.${ext}`)
}
