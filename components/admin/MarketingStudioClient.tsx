"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Mail,
  Monitor,
  Plus,
  Save,
  Send,
  Smartphone,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
interface AudienceOption { slug: string; name: string; audienceId: string }

interface Template {
  id: number
  name: string
  subject: string
  preheader: string | null
  html_content: string
  thumbnail_url: string | null
  updated_at: string
}

interface CampaignLog {
  id: number
  name: string
  subject: string
  audience_id: string | null
  mailchimp_campaign_id: string | null
  mailchimp_web_id: string | null
  status: string
  created_at: string
}

interface Props { audiences: AudienceOption[] }
type Tab = 'templates' | 'campaigns' | 'history'
type PreviewSize = 'desktop' | 'mobile'

const DRAFT_KEY = 'pct-marketing-studio-draft-v2'

const NEWSLETTER_HTML = `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f8f6f3;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      <tr><td style="background:#03374f;padding:28px 32px;">
        <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title" width="150" style="display:block;opacity:0.95;" />
      </td></tr>
      <tr><td style="padding:32px;">
        <h2 style="margin:0 0 16px;color:#03374f;font-size:22px;">A Message from Your PCT Rep</h2>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.7;">Add your key update or market insight here. This is your chance to keep clients informed and engaged with valuable local information.</p>
        <a href="https://www.pct.com" style="display:inline-block;padding:12px 24px;border-radius:8px;background:#f26b2b;color:#fff;text-decoration:none;font-weight:600;">Visit PCT.com</a>
      </td></tr>
      <tr><td style="padding:20px 32px;background:#f8f6f3;text-align:center;color:#9ca3af;font-size:12px;">
        Pacific Coast Title Company · <a href="https://www.pct.com" style="color:#f26b2b;text-decoration:none;">pct.com</a>
      </td></tr>
    </table>
  </td></tr>
</table>`

const MARKET_HTML = `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f8f6f3;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      <tr><td style="background:#03374f;padding:28px 32px;">
        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Monthly Report</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:26px;">Market Snapshot</h1>
      </td></tr>
      <tr><td style="padding:32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="48%" style="background:#f8f6f3;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">Inventory</p>
              <p style="margin:0;color:#03374f;font-size:28px;font-weight:700;">+12%</p>
              <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">vs last month</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f8f6f3;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">Avg Days on Market</p>
              <p style="margin:0;color:#f26b2b;font-size:28px;font-weight:700;">18</p>
              <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">days</p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 8px;color:#03374f;font-weight:600;">Key Takeaway</p>
        <p style="margin:0;color:#4b5563;line-height:1.7;">Add your local market commentary and CTA here.</p>
      </td></tr>
      <tr><td style="padding:20px 32px;background:#f8f6f3;text-align:center;color:#9ca3af;font-size:12px;">
        Pacific Coast Title · <a href="https://www.pct.com" style="color:#f26b2b;text-decoration:none;">pct.com</a>
      </td></tr>
    </table>
  </td></tr>
</table>`

// ── ImageUploader sub-component ────────────────────────────────────
interface UploadedAsset { url: string; previewUrl: string; name: string; uploading: boolean; error?: string }

function ImageUploader({
  assets, setAssets, onInsert,
}: {
  assets: UploadedAsset[]
  setAssets: React.Dispatch<React.SetStateAction<UploadedAsset[]>>
  onInsert?: (url: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const previewUrl = URL.createObjectURL(file)
    setAssets((prev) => [...prev, { url: '', previewUrl, name: file.name, uploading: true }])
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setAssets((prev) =>
        prev.map((a) => a.previewUrl === previewUrl ? { ...a, url: data.url, uploading: false } : a)
      )
    } catch (err) {
      setAssets((prev) =>
        prev.map((a) =>
          a.previewUrl === previewUrl
            ? { ...a, uploading: false, error: err instanceof Error ? err.message : 'Failed' }
            : a
        )
      )
    }
  }

  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback(() => setDragging(false), [])
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    Array.from(e.dataTransfer.files).forEach(uploadFile)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center gap-3 py-4 ${
          dragging ? 'border-[#f26b2b] bg-[#f26b2b]/5' : 'border-gray-200 bg-[#f8f6f3] hover:border-gray-300'
        }`}
      >
        <Upload className="w-4 h-4 text-gray-400" />
        <p className="text-sm text-gray-500"><strong>Drop images</strong> or click to browse</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => Array.from(e.target.files || []).forEach(uploadFile)} />
      </div>

      {/* Uploaded grid */}
      {assets.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {assets.map((a) => (
            <div key={a.previewUrl} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square group">
              <img src={a.previewUrl} alt={a.name} className="w-full h-full object-cover" />
              {a.uploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
              {!a.uploading && !a.error && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {onInsert && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); onInsert(a.url) }}
                      className="px-2 py-1 bg-[#f26b2b] text-white text-[10px] font-semibold rounded-lg">
                      Insert
                    </button>
                  )}
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); URL.revokeObjectURL(a.previewUrl); setAssets((p) => p.filter((x) => x.previewUrl !== a.previewUrl)) }}
                    className="w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {a.error && (
                <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────
export function MarketingStudioClient({ audiences }: Props) {
  const [tab, setTab]           = useState<Tab>('templates')
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState('')
  const [ok, setOk]             = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [history, setHistory]   = useState<CampaignLog[]>([])

  // Template form state
  const [templateId, setTemplateId]     = useState<number | ''>('')
  const [templateName, setTemplateName] = useState('')
  const [subject, setSubject]           = useState('')
  const [preheader, setPreheader]       = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [html, setHtml]                 = useState(NEWSLETTER_HTML)
  const [assets, setAssets]             = useState<UploadedAsset[]>([])
  const [loadedDraft, setLoadedDraft]   = useState(false)

  // Campaign state
  const [campaignName, setCampaignName]       = useState('')
  const [campaignAudience, setCampaignAudience] = useState('')
  const [fromName, setFromName]               = useState('Pacific Coast Title')
  const [replyTo, setReplyTo]                 = useState('info@pct.com')
  const [sendNow, setSendNow]                 = useState(false)
  const [lastEditUrl, setLastEditUrl]         = useState('')

  // ── Load data ──────────────────────────────────────────────────
  async function loadStudio() {
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/admin/marketing/studio')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setTemplates(data.templates || [])
      setHistory(data.campaigns || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStudio() }, [])

  // ── Local draft ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const d = JSON.parse(raw)
      if (d.templateName) setTemplateName(d.templateName)
      if (d.subject)      setSubject(d.subject)
      if (d.preheader)    setPreheader(d.preheader)
      if (d.thumbnailUrl) setThumbnailUrl(d.thumbnailUrl)
      if (d.html)         setHtml(d.html)
      setLoadedDraft(true)
    } catch { /* ignore */ }
  }, [])

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) || null,
    [templateId, templates]
  )

  useEffect(() => {
    if (!selectedTemplate) return
    setTemplateName(selectedTemplate.name)
    setSubject(selectedTemplate.subject)
    setPreheader(selectedTemplate.preheader || '')
    setThumbnailUrl(selectedTemplate.thumbnail_url || '')
    setHtml(selectedTemplate.html_content || '')
    setAssets([])
  }, [selectedTemplate])

  // ── Actions ────────────────────────────────────────────────────
  async function saveTemplate() {
    if (!templateName || !subject || !html) { setError('Name, subject, and content are required.'); return }
    setSaving(true); setError(''); setOk('')
    try {
      const res  = await fetch('/api/admin/marketing/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-template',
          id: templateId || undefined,
          name: templateName, subject, preheader,
          thumbnail_url: thumbnailUrl,
          html_content: html,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setOk('Template saved successfully.')
      await loadStudio()
      if (data.template?.id) setTemplateId(data.template.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function createCampaign() {
    if (!campaignName || !campaignAudience || !subject || !html) {
      setError('Campaign name, audience, subject, and content are all required.')
      return
    }
    setSending(true); setError(''); setOk('')
    try {
      const res  = await fetch('/api/admin/marketing/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-campaign',
          campaignName, audienceId: campaignAudience,
          subject, html_content: html,
          templateId: templateId || undefined,
          fromName, replyTo, sendNow,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign')
      setOk(sendNow ? '🎉 Campaign sent!' : '✅ Campaign draft created in Mailchimp.')
      setLastEditUrl(String(data.editUrl || ''))
      await loadStudio()
      setTab('history')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSending(false)
    }
  }

  function resetTemplate() {
    setTemplateId(''); setTemplateName(''); setSubject(''); setPreheader('')
    setThumbnailUrl(''); setHtml(NEWSLETTER_HTML); setAssets([])
    window.localStorage.removeItem(DRAFT_KEY)
    setLoadedDraft(false)
  }

  function saveDraft() {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ templateName, subject, preheader, thumbnailUrl, html }))
    setOk('Draft saved in browser.')
  }

  function insertImageIntoHtml(url: string) {
    setHtml((prev) => `${prev}\n\n<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:16px 0;" />`)
    setOk('Image inserted into HTML.')
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-sm text-gray-400 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading Marketing Studio…
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#f26b2b]" />
          <h2 className="font-semibold text-[#03374f]">Marketing Studio</h2>
          {loadedDraft && (
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Draft loaded</span>
          )}
        </div>
        <div className="flex items-center bg-[#f8f6f3] rounded-xl p-1 gap-1">
          {(['templates', 'campaigns', 'history'] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === t ? 'bg-[#03374f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'templates' ? '✏️ Editor' : t === 'campaigns' ? '🚀 Campaign' : '📋 History'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feedback ──────────────────────────────────────────── */}
      {(error || ok) && (
        <div className={`mx-6 mt-4 flex items-start gap-2.5 p-3.5 rounded-xl text-sm ${
          error
            ? 'bg-red-50 border border-red-100 text-red-600'
            : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
        }`}>
          {error
            ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          }
          <span>{error || ok}</span>
          <button type="button" onClick={() => { setError(''); setOk('') }} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: Editor (2-column compose + live preview)
      ══════════════════════════════════════════════════════════ */}
      {tab === 'templates' && (
        <div className="grid xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-gray-100">

          {/* LEFT — compose */}
          <div className="p-6 space-y-5">
            {/* Template picker row */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : '')}
                className="flex-1 min-w-0 h-10 px-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm"
              >
                <option value="">— New template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button type="button" onClick={resetTemplate} title="New blank"
                className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
              <button type="button" onClick={() => { setHtml(NEWSLETTER_HTML); setOk('Newsletter starter loaded.') }} title="Newsletter starter"
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Wand2 className="w-3.5 h-3.5" /> Newsletter
              </button>
              <button type="button" onClick={() => { setHtml(MARKET_HTML); setOk('Market snapshot starter loaded.') }} title="Market snapshot"
                className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Wand2 className="w-3.5 h-3.5" /> Market
              </button>
            </div>

            {/* Template library cards */}
            {templates.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Saved Templates</p>
                <div className="grid grid-cols-3 gap-2">
                  {templates.map((t) => (
                    <button key={t.id} type="button" onClick={() => setTemplateId(t.id)}
                      className={`text-left rounded-xl border overflow-hidden transition-all ${
                        templateId === t.id ? 'border-[#03374f] ring-2 ring-[#03374f]/10' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-16 bg-gray-100 overflow-hidden">
                        {t.thumbnail_url
                          ? <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><FileText className="w-5 h-5" /></div>
                        }
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-[#03374f] truncate">{t.name}</p>
                        <p className="text-[10px] text-gray-400">{new Date(t.updated_at).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Meta fields */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Template Name *</label>
                <input value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Q2 Market Update" className="w-full h-10 px-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subject Line *</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your Market Update Is Here" className="w-full h-10 px-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preheader</label>
                <input value={preheader} onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Quick preview text..." className="w-full h-10 px-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Thumbnail URL</label>
                <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..." className="w-full h-10 px-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>

            {/* Image uploader */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Images <span className="text-gray-400 normal-case font-normal">— hover to insert into HTML</span>
              </label>
              <ImageUploader assets={assets} setAssets={setAssets} onInsert={insertImageIntoHtml} />
            </div>

            {/* HTML editor */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">HTML Content *</label>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button type="button" onClick={saveTemplate} disabled={saving}
                className="h-11 px-5 rounded-xl bg-[#03374f] text-white text-sm font-semibold hover:bg-[#03374f]/90 disabled:opacity-60 flex items-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Template</>}
              </button>
              <button type="button" onClick={saveDraft}
                className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Save Draft
              </button>
              <button type="button" onClick={resetTemplate}
                className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> New
              </button>
              {templateId && (
                <button type="button" onClick={() => setTab('campaigns')}
                  className="h-11 px-4 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#e05d1e] flex items-center gap-2 ml-auto">
                  <Send className="w-3.5 h-3.5" /> Use in Campaign →
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — live preview */}
          <div className="p-6 flex flex-col gap-4 bg-[#fafaf9]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</p>
              <div className="flex items-center bg-white rounded-xl border border-gray-200 p-0.5 gap-0.5">
                <button type="button" onClick={() => setPreviewSize('desktop')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${previewSize === 'desktop' ? 'bg-[#03374f] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button type="button" onClick={() => setPreviewSize('mobile')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${previewSize === 'mobile' ? 'bg-[#03374f] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>
            </div>

            {/* Subject / preheader preview bar */}
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">From: <span className="text-gray-600">Pacific Coast Title</span></p>
              <p className="text-sm font-semibold text-gray-800 truncate">{subject || '(No subject)'}</p>
              {preheader && <p className="text-xs text-gray-400 truncate">{preheader}</p>}
            </div>

            {/* Thumbnail preview */}
            {thumbnailUrl && (
              <img src={thumbnailUrl} alt="Thumbnail" className="w-full max-h-32 object-cover rounded-xl border border-gray-200" />
            )}

            {/* iframe */}
            <div className={`flex-1 transition-all ${previewSize === 'mobile' ? 'max-w-[390px] mx-auto w-full' : 'w-full'}`}>
              <iframe
                title="Email Preview"
                srcDoc={html}
                sandbox="allow-same-origin"
                className="w-full rounded-xl border border-gray-200 bg-white"
                style={{ height: previewSize === 'mobile' ? '520px' : '560px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: Campaign Builder
      ══════════════════════════════════════════════════════════ */}
      {tab === 'campaigns' && (
        <div className="p-6 max-w-2xl space-y-5">
          <div className="bg-[#f8f6f3] rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              Using template: <strong className="text-[#03374f]">{selectedTemplate?.name || '(none — go back to Editor first)'}</strong>
            </p>
            {!selectedTemplate && (
              <button type="button" onClick={() => setTab('templates')}
                className="mt-2 text-xs text-[#f26b2b] hover:underline">
                ← Go to Editor
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Campaign Name *</label>
              <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)}
                placeholder="June Newsletter" className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Audience / Rep *</label>
              <select value={campaignAudience} onChange={(e) => setCampaignAudience(e.target.value)}
                className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm">
                <option value="">Select an audience…</option>
                {audiences.map((a) => (
                  <option key={`${a.slug}-${a.audienceId}`} value={a.audienceId}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">From Name</label>
              <input value={fromName} onChange={(e) => setFromName(e.target.value)}
                className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Reply-To Email</label>
              <input value={replyTo} onChange={(e) => setReplyTo(e.target.value)}
                className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-[#f8f6f3]">
            <input type="checkbox" id="sendNow" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded accent-[#f26b2b]" />
            <label htmlFor="sendNow" className="cursor-pointer">
              <p className="text-sm font-semibold text-gray-700">Send immediately</p>
              <p className="text-xs text-gray-400 mt-0.5">Otherwise creates a draft in Mailchimp that you can review first</p>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={createCampaign} disabled={sending}
              className="h-12 px-6 rounded-xl bg-[#f26b2b] text-white text-sm font-bold hover:bg-[#e05d1e] disabled:opacity-60 flex items-center gap-2">
              {sending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                : <><Send className="w-4 h-4" /> {sendNow ? 'Send Campaign' : 'Create Draft'}</>
              }
            </button>
            {lastEditUrl && (
              <a href={lastEditUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#f26b2b] hover:underline">
                Open in Mailchimp <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: History
      ══════════════════════════════════════════════════════════ */}
      {tab === 'history' && (
        <div className="p-6">
          {history.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No campaigns sent yet.</p>
              <button type="button" onClick={() => setTab('campaigns')}
                className="mt-3 text-sm text-[#f26b2b] hover:underline">
                Create your first campaign →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Campaign</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Audience</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#03374f]">{h.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{h.subject}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {audiences.find((a) => a.audienceId === h.audience_id)?.name || h.audience_id || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          h.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {h.mailchimp_web_id ? (
                          <a href={`https://us1.admin.mailchimp.com/campaigns/edit?id=${h.mailchimp_web_id}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#f26b2b] hover:underline">
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
