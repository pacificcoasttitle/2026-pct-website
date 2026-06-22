/**
 * /api/admin/signatures/upload — capability-gated image upload for
 * staff signature photos. Lands in the `signatures/` R2 folder.
 *
 * Gate: requireApiRole('signatures') (HR-allowed). Shares the R2
 * upload lib (no duplicated SigV4 logic). Same validation + return
 * shape ({url,key,size,name}) as the old shared /api/admin/upload.
 */
import { NextRequest } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { handleAdminImageUpload, randomStem } from '@/lib/r2-upload'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('signatures')
  if ('error' in auth) return auth.error

  return handleAdminImageUpload(req, ({ ext }) => `signatures/${randomStem()}.${ext}`)
}
