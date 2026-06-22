/**
 * /api/admin/sms/upload — capability-gated image upload for SMS Studio
 * MMS images. Lands in the `sms/` R2 folder.
 *
 * Gate: requireApiRole('sms') (HR-blocked). Shares the R2 upload lib
 * (no duplicated SigV4 logic). Same validation + return shape
 * ({url,key,size,name}) as the old shared /api/admin/upload.
 *
 * ⚠️ SMS FILENAME SHAPE PRESERVED EXACTLY: sms/<safePrefix>_<stem>.<ext>
 * The `prefix` carries the rep's sms_code (e.g. "C-9"); the Render
 * service's extract_sms_code_from_filename routes the inbound MMS to
 * the right rep BY parsing this filename. Do NOT change this shape.
 */
import { NextRequest } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { handleAdminImageUpload, randomStem } from '@/lib/r2-upload'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('sms')
  if ('error' in auth) return auth.error

  return handleAdminImageUpload(req, ({ ext, form }) => {
    const rawPrefix = String(form.get('prefix') || '').trim()
    const safePrefix = rawPrefix.replace(/[^A-Za-z0-9-]/g, '').slice(0, 20)
    const stem = randomStem()
    const safeName = safePrefix ? `${safePrefix}_${stem}.${ext}` : `${stem}.${ext}`
    return `sms/${safeName}`
  })
}
