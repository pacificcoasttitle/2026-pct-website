/**
 * HR dashboard loading skeleton — card-grid + two breakdown panels to
 * match the overview layout. Static + instant (no fetch).
 *
 * Brand: PCT navy #03374f on the #f0ede9 admin shell.
 */
export default function HrDashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse" aria-hidden="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded-md bg-[#03374f]/15" />
          <div className="h-4 w-60 rounded bg-gray-200" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-[#03374f]/10" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-[#03374f]/10" />
            <div className="h-7 w-12 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <div className="h-4 w-40 rounded bg-gray-200 mb-2" />
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <div className="h-3 w-1/2 rounded bg-gray-100" />
                <div className="h-1.5 w-full rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
