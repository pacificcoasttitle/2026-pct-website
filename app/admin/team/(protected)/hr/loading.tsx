/**
 * HR roster loading skeleton — list-shaped to match the roster table so
 * the transition feels smooth. Static + instant (no fetch).
 *
 * Brand: PCT navy #03374f on the #f0ede9 admin shell.
 */
export default function HrLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse" aria-hidden="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-md bg-[#03374f]/15" />
          <div className="h-4 w-56 rounded bg-gray-200" />
        </div>
      </div>

      <div className="h-16 rounded-2xl border border-gray-100 bg-white shadow-sm" />

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-100" />
            </div>
            <div className="hidden sm:block h-5 w-24 rounded-full bg-gray-100" />
            <div className="hidden md:block h-4 w-28 rounded bg-gray-100" />
            <div className="h-6 w-16 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
