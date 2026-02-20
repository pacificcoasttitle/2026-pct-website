import { CheckCircle } from "lucide-react"

interface KeyTakeawaysProps {
  items: string[]
}

export function KeyTakeaways({ items }: KeyTakeawaysProps) {
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
