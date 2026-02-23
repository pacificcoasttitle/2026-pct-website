import { CheckCircle, ChevronRight } from "lucide-react"

interface KeyTakeawaysProps {
  items: string[]
  /** When true, renders as a compact sidebar card (sticky) */
  sidebar?: boolean
}

export function KeyTakeaways({ items, sidebar = false }: KeyTakeawaysProps) {
  if (sidebar) {
    return (
      <div className="bg-secondary text-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-5 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Key Takeaways
        </h2>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span
                className="text-white/85 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Default inline version (kept for backward compat)
  return (
    <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6 mb-10">
      <h2 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-primary" />
        Key Takeaways
      </h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </span>
            <span
              className="text-gray-700 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: item }}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
