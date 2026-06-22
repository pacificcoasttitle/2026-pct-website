/**
 * Marketing hub loading skeleton — card-grid shaped to match the hub's
 * action cards + recent batches. Static + instant (no fetch).
 *
 * Brand: PCT navy #03374f on the #f0ede9 admin shell.
 */
export default function MarketingLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-[#03374f]/15" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#03374f]/10" />
            <div className="h-5 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-100" />
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
