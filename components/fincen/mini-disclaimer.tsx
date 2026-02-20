import { AlertTriangle } from "lucide-react"

export function MiniDisclaimer() {
  return (
    <div className="mt-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800">
        <strong>Disclaimer:</strong> This information is provided for general educational purposes and does not
        constitute legal or tax advice. FinCEN applicability can vary by facts and exemptions. Please confirm
        specifics with your escrow officer or legal counsel.
      </p>
    </div>
  )
}
