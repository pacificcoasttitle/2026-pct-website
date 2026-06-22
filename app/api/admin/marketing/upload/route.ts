/**
 * /api/admin/marketing/upload — capability-gated image upload for
 * marketing campaign/template images. Lands in the `marketing/` R2
 * folder (unchanged path — marketing callers keep their URLs).
 *
 * Gate: requireApiRole('marketing') (HR-blocked). Shares the R2 upload
 * lib (no duplicated SigV4 logic). Same validation + return shape
 * ({url,key,size,name}) as the old shared /api/admin/upload.
 */
import { NextRequest } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { handleAdminImageUpload, randomStem } from '@/lib/r2-upload'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  return handleAdminImageUpload(req, ({ ext }) => `marketing/${randomStem()}.${ext}`)
}
