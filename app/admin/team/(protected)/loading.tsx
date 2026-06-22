/**
 * Shared admin loading skeleton (route segment fallback).
 *
 * Rendered automatically by Next.js inside the (protected) layout's
 * <main> while any child server component loads — the sidebar stays
 * visible, so navigation feels instant. Static + instant: no data
 * fetching here. Covers every admin route that lacks a tailored
 * loading.tsx.
 *
 * Brand: PCT navy #03374f accents on the #f0ede9 admin shell.
 */
export default function AdminLoading() {
  return (
    <div className="max-w-5xl space-y-5 animate-pulse" aria-hidden="true">
      {/* Header bar */}
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-md bg-[#03374f]/15" />
        <div className="h-4 w-80 rounded bg-gray-200" />
      </div>

      {/* Card placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <div className="h-5 w-2/3 rounded bg-[#03374f]/10" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-4/5 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  )
}
