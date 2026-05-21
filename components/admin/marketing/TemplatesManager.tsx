'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Copy, Pencil, Send, Loader2, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  categoryIcon, formatDate, isDefaultTemplate, InlineAlert,
} from './shared'

interface Template {
  id:            number
  name:          string
  subject:       string
  preheader:     string | null
  html_content:  string
  thumbnail_url: string | null
  category:      string | null
  updated_at:    string
}

export function TemplatesManager() {
  const router = useRouter()
  const [items, setItems]   = useState<Template[] | null>(null)
  const [error, setError]   = useState('')
  const [filter, setFilter] = useState('')
  const [busyId, setBusyId] = useState<number | 'new' | null>(null)

  async function load() {
    setError('')
    try {
      const res = await fetch('/api/admin/marketing/studio')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setItems(data.templates || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }
  useEffect(() => { load() }, [])

  async function duplicate(t: Template) {
    setBusyId(t.id); setError('')
    try {
      const res = await fetch('/api/admin/marketing/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-template',
          name: `${t.name} (Copy)`,
          subject: t.subject,
          preheader: t.preheader ?? '',
          html_content: t.html_content,
          // Intentionally omit category so the copy doesn't collide visually
          // with the system default in the "Default Templates" bucket.
          category: undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Duplicate failed')
      router.push(`/admin/team/marketing/templates/${data.template.id}/edit`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Duplicate failed')
    } finally { setBusyId(null) }
  }

  async function createBlank() {
    setBusyId('new'); setError('')
    try {
      const res = await fetch('/api/admin/marketing/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-template',
          name: 'Untitled Template',
          subject: 'New Subject',
          preheader: '',
          html_content: '<p>Start writing your email here.</p>',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Create failed')
      router.push(`/admin/team/marketing/templates/${data.template.id}/edit`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed')
      setBusyId(null)
    }
  }

  const filtered = (items ?? []).filter((t) =>
    !filter || t.name.toLowerCase().includes(filter.toLowerCase()) ||
    t.subject.toLowerCase().includes(filter.toLowerCase()),
  )
  const defaults = filtered.filter((t) => isDefaultTemplate(t.category))
  const custom   = filtered.filter((t) => !isDefaultTemplate(t.category))

  return (
    <div className="space-y-5">

      {/* Actions row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search templates…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={createBlank} disabled={busyId === 'new'}
                className="bg-[#f26b2b] hover:bg-[#e05d1e] text-white">
          {busyId === 'new'
            ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Creating…</>
            : <><Plus className="w-4 h-4 mr-1.5" /> New Template</>}
        </Button>
      </div>

      {error && <InlineAlert kind="error" message={error} onClose={() => setError('')} />}

      {items === null ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <Section title="Default Templates" templates={defaults}
                   busyId={busyId} onDuplicate={duplicate} />
          <Section title="Custom Templates" templates={custom}
                   busyId={busyId} onDuplicate={duplicate}
                   emptyHint="Custom templates you create will appear here." />
        </>
      )}
    </div>
  )
}

function Section({
  title, templates, busyId, onDuplicate, emptyHint,
}: {
  title: string
  templates: Template[]
  busyId: number | 'new' | null
  onDuplicate: (t: Template) => void
  emptyHint?: string
}) {
  if (templates.length === 0 && !emptyHint) return null
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</h2>
      {templates.length === 0 ? (
        <Card className="px-5 py-6">
          <p className="text-sm text-gray-400">{emptyHint}</p>
        </Card>
      ) : (
        <Card className="p-0 gap-0 overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {templates.map((t) => (
              <li key={t.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{categoryIcon(t.category)}</span>
                      <h3 className="font-semibold text-[#03374f] truncate">{t.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{t.subject}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Last updated: {formatDate(t.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/team/marketing/templates/${t.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm"
                            disabled={busyId === t.id}
                            onClick={() => onDuplicate(t)}>
                      {busyId === t.id
                        ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        : <Copy className="w-3.5 h-3.5 mr-1" />}
                      Duplicate
                    </Button>
                    <Link href={`/admin/team/marketing/campaigns/new?templateId=${t.id}`}>
                      <Button size="sm" className="bg-[#f26b2b] hover:bg-[#e05d1e] text-white">
                        <Send className="w-3.5 h-3.5 mr-1" /> Use in Campaign
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  )
}
