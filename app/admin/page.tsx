/**
 * /admin — Fee & rate editor (outside the team shell).
 *
 * Server wrapper that adds the RBAC gate: requirePageRole('fees')
 * redirects a user lacking the 'fees' capability before the editor
 * loads. The interactive editor UI is the client component below
 * (unchanged — relocated from this file to FeeRateEditor.tsx).
 */
import { requirePageRole } from '@/lib/auth/guards'
import FeeRateEditor from './FeeRateEditor'

export default async function AdminPage() {
  await requirePageRole('fees')
  return <FeeRateEditor />
}
