/**
 * Signature Center list loading skeleton — list-shaped to match the
 * staff signature rows. Static + instant (no fetch).
 *
 * Brand: PCT navy #03374f on the #f0ede9 admin shell.
 */
export default function SignaturesLoading() {
  return (
    <div className="max-w-5xl space-y-5 animate-pulse" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-7 w-52 rounded-md bg-[#03374f]/15" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50">
            <div className="h-10 w-10 rounded-full bg-[#03374f]/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-100" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-gray-100" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
