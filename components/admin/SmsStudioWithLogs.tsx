"use client"

import { useRef } from 'react'
import { SmsStudioSender } from './SmsStudioSender'
import { SmsLogsPanel, type SmsLogsPanelHandle } from './SmsLogsPanel'

interface RepLite {
  slug: string
  name: string
  first_name: string
  sms_code: string
  mobile: string | null
}

export function SmsStudioWithLogs({ repCount, reps }: { repCount: number; reps: RepLite[] }) {
  const panelRef = useRef<SmsLogsPanelHandle>(null)

  return (
    <div className="space-y-6">
      <SmsStudioSender
        repCount={repCount}
        reps={reps}
        onSendComplete={(logId) => panelRef.current?.refresh(logId)}
      />
      <SmsLogsPanel ref={panelRef} />
    </div>
  )
}
