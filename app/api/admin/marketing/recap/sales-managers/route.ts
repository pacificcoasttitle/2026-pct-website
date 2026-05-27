/**
 * /api/admin/marketing/recap/sales-managers
 *
 * GET — read-only list of active employees flagged as Sales Manager.
 *
 * Pulls from vcard_employees.sales_manager (managed in the employee
 * edit form). Exposed alongside the recap recipients API so the
 * Recipients UI can show both sources of recipients in one view.
 *
 * No write methods — sales-manager membership is managed via the
 * employee profile toggle, not here.
 */
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getActiveSalesManagers } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sales_managers = await getActiveSalesManagers()
    return NextResponse.json({ sales_managers })
  } catch (err) {
    console.error('[recap-sales-managers] list failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
