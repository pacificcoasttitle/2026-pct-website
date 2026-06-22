/**
 * SMS overview loading skeleton — list-shaped to match the rep/code
 * roster. Static + instant (no fetch).
 *
 * Brand: PCT navy #03374f on the #f0ede9 admin shell.
 */
export default function SmsLoading() {
  return (
    <div className="max-w-5xl space-y-5 animate-pulse" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-md bg-[#03374f]/15" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <div className="h-8 w-1/2 rounded bg-[#03374f]/10" />
            <div className="h-3 w-3/4 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/5 rounded bg-gray-100" />
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
