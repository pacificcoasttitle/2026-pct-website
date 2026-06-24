/**
 * HR employee detail loading skeleton — header + form + facet panels.
 * Static + instant (no fetch). Brand: PCT navy #03374f.
 */
export default function HrDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="h-7 w-56 rounded-md bg-[#03374f]/15" />
        <div className="h-4 w-40 rounded bg-gray-100" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-gray-100" />
            <div className="h-10 w-full rounded-xl bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-3 w-40 rounded bg-gray-100" />
            <div className="h-3 w-28 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
