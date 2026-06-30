"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'

type OnboardingType = 'sales_rep' | 'employee'

interface TemplateItem {
  id:              number
  onboarding_type: OnboardingType
  item_key:        string
  label:           string
  category:        string
  sort_order:      number
  active:          boolean
  created_at:      string
  updated_at:      string
  created_by:      string | null
  updated_by:      string | null
  deactivated_at:  string | null
}

type TemplatesByType = Record<OnboardingType, TemplateItem[]>

const TYPE_LABELS: Record<OnboardingType, string> = {
  sales_rep: 'Sales Rep',
  employee:  'Regular Employee',
}

const CATEGORY_LABELS: Record<string, string> = {
  administrative:     'Administrative',
  marketing:          'Marketing',
  'customer-service': 'Customer Service',
}

const INPUT =
  "w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all disabled:opacity-60"

function deriveItemKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function HrChecklistTemplateEditorClient({
  initialTemplates,
  categories,
}: {
  initialTemplates: TemplatesByType
  categories:       string[]
}) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<OnboardingType>('sales_rep')
  const [templates, setTemplates] = useState<TemplatesByType>(initialTemplates)
  const [drafts, setDrafts] = useState<Record<number, { label: string; category: string }>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [keyEdited, setKeyEdited] = useState(false)
  const [newItem, setNewItem] = useState({
    label:    '',
    item_key: '',
    category: categories[0] || '',
  })

  const current = useMemo(
    () => [...templates[selectedType]].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [templates, selectedType],
  )
  const activeCount = current.filter((item) => item.active).length

  function replaceItem(updated: TemplateItem) {
    setTemplates((prev) => ({
      ...prev,
      [updated.onboarding_type]: prev[updated.onboarding_type]
        .map((item) => (item.id === updated.id ? updated : item))
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    }))
  }

  async function requestJson(url: string, options: RequestInit) {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || 'Request failed.')
    return data
  }

  async function addItem() {
    const label = newItem.label.trim()
    const itemKey = newItem.item_key.trim()
    if (!label) {
      setError('Label is required.')
      return
    }
    if (!itemKey) {
      setError('Item key is required.')
      return
    }

    setBusy('add')
    setError(null)
    setOk(null)
    try {
      const data = await requestJson('/api/admin/hr/onboarding/templates', {
        method: 'POST',
        body: JSON.stringify({
          onboarding_type: selectedType,
          item_key: itemKey,
          label,
          category: newItem.category,
        }),
      })
      const item = data.item as TemplateItem
      setTemplates((prev) => ({
        ...prev,
        [selectedType]: [...prev[selectedType], item].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
      }))
      setNewItem({ label: '', item_key: '', category: categories[0] || '' })
      setKeyEdited(false)
      setOk('Template item added. It will apply to future onboardings of this type.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item.')
    } finally {
      setBusy(null)
    }
  }

  async function saveItem(item: TemplateItem) {
    const draft = drafts[item.id]
    if (!draft) return

    setBusy(`save-${item.id}`)
    setError(null)
    setOk(null)
    try {
      const data = await requestJson(`/api/admin/hr/onboarding/templates/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          label: draft.label,
          category: draft.category,
        }),
      })
      replaceItem(data.item as TemplateItem)
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
      setOk('Template item saved. Existing onboardings keep their stamped checklist.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item.')
    } finally {
      setBusy(null)
    }
  }

  async function toggleActive(item: TemplateItem) {
    setBusy(`active-${item.id}`)
    setError(null)
    setOk(null)
    try {
      const data = await requestJson(`/api/admin/hr/onboarding/templates/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !item.active }),
      })
      replaceItem(data.item as TemplateItem)
      setOk(
        item.active
          ? 'Template item deactivated. Future onboardings will skip it; existing stamped items remain.'
          : 'Template item reactivated for future onboardings.',
      )
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update active state.')
    } finally {
      setBusy(null)
    }
  }

  async function reorder(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= current.length) return
    const next = [...current]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)

    setBusy('reorder')
    setError(null)
    setOk(null)
    try {
      const data = await requestJson('/api/admin/hr/onboarding/templates/reorder', {
        method: 'PATCH',
        body: JSON.stringify({
          onboarding_type: selectedType,
          orderedIds: next.map((item) => item.id),
        }),
      })
      setTemplates((prev) => ({ ...prev, [selectedType]: data.templates as TemplateItem[] }))
      setOk('Checklist order saved for future onboardings.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder items.')
    } finally {
      setBusy(null)
    }
  }

  async function deleteItem(item: TemplateItem) {
    const confirmed = confirm(
      `Hard-delete "${item.label}" from the ${TYPE_LABELS[item.onboarding_type]} template?\n\n` +
      'This removes the template item for FUTURE onboardings only. It does NOT affect people already onboarded or any already-stamped checklist items.',
    )
    if (!confirmed) return

    setBusy(`delete-${item.id}`)
    setError(null)
    setOk(null)
    try {
      await requestJson(`/api/admin/hr/onboarding/templates/${item.id}`, { method: 'DELETE' })
      setTemplates((prev) => ({
        ...prev,
        [item.onboarding_type]: prev[item.onboarding_type].filter((row) => row.id !== item.id),
      }))
      setOk('Template item hard-deleted. Already-stamped onboarding items were not changed.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-2 lg:pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/team/hr/onboarding"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#03374f]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to onboarding
          </Link>
          <h1 className="text-2xl font-bold text-[#03374f]">Checklist Templates</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage the checklist items stamped onto future onboardings. Existing people keep the checklist rows already stamped for them.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
          <div className="font-semibold text-[#03374f]">{activeCount}/{current.length} active</div>
          <div className="text-xs text-gray-400">{TYPE_LABELS[selectedType]}</div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {ok && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{ok}</span>
        </div>
      )}

      <div className="flex w-fit overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        {(['sales_rep', 'employee'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => { setSelectedType(type); setError(null); setOk(null) }}
            className={`h-10 px-4 text-sm font-semibold transition-all ${
              selectedType === type ? 'bg-[#03374f] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#03374f]">Add item</h2>
            <p className="text-xs text-gray-400">The category list is limited to sections rendered by the HR checklist display.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Label</label>
            <input
              className={INPUT}
              value={newItem.label}
              onChange={(e) => {
                const label = e.target.value
                setNewItem((prev) => ({
                  ...prev,
                  label,
                  item_key: keyEdited ? prev.item_key : deriveItemKey(label),
                }))
              }}
              placeholder="e.g. Assign laptop"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Item key</label>
            <input
              className={INPUT}
              value={newItem.item_key}
              onChange={(e) => {
                setKeyEdited(true)
                setNewItem((prev) => ({ ...prev, item_key: deriveItemKey(e.target.value) }))
              }}
              placeholder="assign-laptop"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Category</label>
            <select
              className={INPUT}
              value={newItem.category}
              onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value }))}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat] ?? cat}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addItem}
            disabled={busy === 'add'}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f26b2b] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#d85c1f] disabled:opacity-50"
          >
            {busy === 'add' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[#03374f]">
            {TYPE_LABELS[selectedType]} items ({current.length})
          </h2>
          <p className="text-xs text-gray-400">Inactive items stay visible here so HR can reactivate or delete them intentionally.</p>
        </div>

        <div className="divide-y divide-gray-50">
          {current.map((item, index) => {
            const draft = drafts[item.id] || { label: item.label, category: item.category }
            const changed = draft.label !== item.label || draft.category !== item.category
            const rowBusy = busy?.endsWith(`-${item.id}`) || busy === 'reorder'
            return (
              <div
                key={item.id}
                className={`grid grid-cols-1 gap-3 px-5 py-4 transition-colors lg:grid-cols-[3.5rem_1fr_12rem_8rem_13rem] lg:items-center ${
                  item.active ? 'bg-white' : 'bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => reorder(index, index - 1)}
                    disabled={index === 0 || !!busy}
                    title="Move up"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#03374f]/30 hover:text-[#03374f] disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorder(index, index + 1)}
                    disabled={index === current.length - 1 || !!busy}
                    title="Move down"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#03374f]/30 hover:text-[#03374f] disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500 lg:hidden">Label</label>
                  <input
                    className={INPUT}
                    value={draft.label}
                    disabled={rowBusy}
                    onChange={(e) => setDrafts((prev) => ({
                      ...prev,
                      [item.id]: { ...draft, label: e.target.value },
                    }))}
                  />
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span>#{item.sort_order}</span>
                    <span>{item.item_key}</span>
                    {!item.active && (
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 font-semibold text-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500 lg:hidden">Category</label>
                  <select
                    className={INPUT}
                    value={draft.category}
                    disabled={rowBusy}
                    onChange={(e) => setDrafts((prev) => ({
                      ...prev,
                      [item.id]: { ...draft, category: e.target.value },
                    }))}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat] ?? cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  disabled={rowBusy}
                  className={`inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    item.active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-500'
                  }`}
                >
                  {busy === `active-${item.id}` && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  {item.active ? 'Active' : 'Inactive'}
                </button>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => saveItem(item)}
                    disabled={!changed || rowBusy}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-500 transition-colors hover:border-[#03374f]/30 hover:text-[#03374f] disabled:opacity-40"
                  >
                    {busy === `save-${item.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item)}
                    disabled={rowBusy}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-100 px-3 text-xs font-semibold text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-40"
                  >
                    {busy === `delete-${item.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
