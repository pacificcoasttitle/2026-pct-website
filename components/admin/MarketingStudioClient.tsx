"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Script from 'next/script'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
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
  id: number; name: string; subject: string; preheader: string | null
  html_content: string; thumbnail_url: string | null; updated_at: string
}
interface CampaignLog {
  id: number; name: string; subject: string; audience_id: string | null
  mailchimp_campaign_id: string | null; mailchimp_web_id: string | null
  status: string; created_at: string
}
interface Props { audiences: AudienceOption[] }

type View = 'editor' | 'campaign' | 'history'
type PreviewSize = 'desktop' | 'mobile'

const DRAFT_KEY = 'pct-mkt-draft-v3'
const TINYMCE_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'
const EDITOR_ID = 'pct-tinymce-editor'

// ── Starter templates ──────────────────────────────────────────────
const NEWSLETTER_HTML = `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f8f6f3;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      <tr><td style="background:#03374f;padding:28px 32px;">
        <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title" width="150" style="display:block;opacity:0.95;" />
      </td></tr>
      <tr><td style="padding:32px;">
        <h2 style="margin:0 0 16px;color:#03374f;font-size:22px;">A Message from Your PCT Rep</h2>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.7;">Add your key update or market insight here. Keep clients informed and engaged with valuable local information.</p>
        <a href="https://www.pct.com" style="display:inline-block;padding:12px 24px;border-radius:8px;background:#f26b2b;color:#fff;text-decoration:none;font-weight:600;">Visit PCT.com</a>
      </td></tr>
      <tr><td style="padding:20px 32px;background:#f8f6f3;text-align:center;color:#9ca3af;font-size:12px;">
        Pacific Coast Title Company &middot; <a href="https://www.pct.com" style="color:#f26b2b;text-decoration:none;">pct.com</a>
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
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f8f6f3;border-radius:12px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">Avg Days on Market</p>
              <p style="margin:0;color:#f26b2b;font-size:28px;font-weight:700;">18</p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 8px;color:#03374f;font-weight:600;">Key Takeaway</p>
        <p style="margin:0;color:#4b5563;line-height:1.7;">Add your local market commentary and call-to-action here.</p>
      </td></tr>
      <tr><td style="padding:20px 32px;background:#f8f6f3;text-align:center;color:#9ca3af;font-size:12px;">
        Pacific Coast Title &middot; <a href="https://www.pct.com" style="color:#f26b2b;text-decoration:none;">pct.com</a>
      </td></tr>
    </table>
  </td></tr>
</table>`

// ── ImageUploader ──────────────────────────────────────────────────
interface UploadedAsset { url: string; previewUrl: string; name: string; uploading: boolean; error?: string }

function ImageUploader({ assets, setAssets, onInsert }: {
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
      const form = new FormData(); form.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setAssets((p) => p.map((a) => a.previewUrl === previewUrl ? { ...a, url: data.url, uploading: false } : a))
    } catch (err) {
      setAssets((p) => p.map((a) => a.previewUrl === previewUrl ? { ...a, uploading: false, error: err instanceof Error ? err.message : 'Failed' } : a))
    }
  }

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback(() => setDragging(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    Array.from(e.dataTransfer.files).forEach(uploadFile)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-3">
      <div
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center gap-3 py-5 ${
          dragging ? 'border-[#f26b2b] bg-[#f26b2b]/5' : 'border-gray-200 bg-[#f8f6f3] hover:border-gray-300'
        }`}
      >
        <Upload className="w-4 h-4 text-gray-400" />
        <p className="text-sm text-gray-500"><strong>Drop images</strong> or click to browse</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => Array.from(e.target.files || []).forEach(uploadFile)} />
      </div>
      {assets.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {assets.map((a) => (
            <div key={a.previewUrl} className="relative rounded-lg overflow-hidden bg-gray-100 w-20 h-20 group flex-shrink-0">
              <img src={a.previewUrl} alt={a.name} className="w-full h-full object-cover" />
              {a.uploading && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div>}
              {!a.uploading && !a.error && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {onInsert && <button type="button" onClick={(e) => { e.stopPropagation(); onInsert(a.url) }} className="px-1.5 py-0.5 bg-[#f26b2b] text-white text-[9px] font-bold rounded">Insert</button>}
                  <button type="button" onClick={(e) => { e.stopPropagation(); URL.revokeObjectURL(a.previewUrl); setAssets((p) => p.filter((x) => x.previewUrl !== a.previewUrl)) }}
                    className="w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              )}
              {a.error && <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-red-200" /></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export function MarketingStudioClient({ audiences }: Props) {
  const [view, setView] = useState<View>('editor')
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [history, setHistory] = useState<CampaignLog[]>([])

  // Template form
  const [templateId, setTemplateId] = useState<number | ''>('')
  const [templateName, setTemplateName] = useState('')
  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [html, setHtml] = useState(NEWSLETTER_HTML)
  const [assets, setAssets] = useState<UploadedAsset[]>([])

  // Campaign
  const [campaignName, setCampaignName] = useState('')
  const [campaignAudience, setCampaignAudience] = useState('')
  const [fromName, setFromName] = useState('Pacific Coast Title')
  const [replyTo, setReplyTo] = useState('info@pct.com')
  const [sendNow, setSendNow] = useState(false)
  const [lastEditUrl, setLastEditUrl] = useState('')

  // TinyMCE
  const [tinyLoaded, setTinyLoaded] = useState(false)
  const editorInitialized = useRef(false)
  const htmlRef = useRef(html) // keep a ref in sync for the editor callback
  htmlRef.current = html

  // ── Load data ──────────────────────────────────────────────────
  async function loadStudio() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/marketing/studio')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setTemplates(data.templates || [])
      setHistory(data.campaigns || [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load') }
    finally { setLoading(false) }
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
      if (d.subject) setSubject(d.subject)
      if (d.preheader) setPreheader(d.preheader)
      if (d.html) setHtml(d.html)
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
    const newHtml = selectedTemplate.html_content || ''
    setHtml(newHtml)
    setAssets([])
    // Sync into TinyMCE if loaded
    try {
      // @ts-expect-error TinyMCE loaded from CDN
      window.tinymce?.get(EDITOR_ID)?.setContent(newHtml)
    } catch { /* not init yet */ }
  }, [selectedTemplate])

  // ── Init TinyMCE ──────────────────────────────────────────────
  useEffect(() => {
    if (!tinyLoaded || editorInitialized.current) return
    const el = document.getElementById(EDITOR_ID)
    if (!el) return

    editorInitialized.current = true
    // @ts-expect-error TinyMCE loaded from CDN
    window.tinymce?.init({
      selector: `#${EDITOR_ID}`,
      height: 640,
      menubar: 'file edit view insert format table',
      plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image link media | table | code preview fullscreen',
      content_style: 'body { font-family: Arial, sans-serif; font-size: 14px; padding: 16px; }',
      branding: false,
      promotion: false,
      skin: 'oxide',
      content_css: 'default',
      images_upload_handler: async (blobInfo: { blob: () => Blob; filename: () => string }) => {
        const formData = new FormData()
        formData.append('file', blobInfo.blob(), blobInfo.filename())
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        return data.url
      },
      setup: (editor: { on: (event: string, cb: () => void) => void; getContent: () => string }) => {
        editor.on('change keyup', () => {
          setHtml(editor.getContent())
        })
      },
    })

    return () => {
      try {
        // @ts-expect-error
        window.tinymce?.get(EDITOR_ID)?.remove()
        editorInitialized.current = false
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tinyLoaded, view])

  // ── Actions ────────────────────────────────────────────────────
  async function saveTemplate() {
    if (!templateName || !subject || !html) { setError('Name, subject, and content are required.'); return }
    setSaving(true); setError(''); setOk('')
    try {
      const res = await fetch('/api/admin/marketing/studio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-template', id: templateId || undefined, name: templateName, subject, preheader, thumbnail_url: thumbnailUrl, html_content: html }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setOk('Template saved.')
      await loadStudio()
      if (data.template?.id) setTemplateId(data.template.id)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  async function createCampaign() {
    if (!campaignName || !campaignAudience || !subject || !html) { setError('Fill in all required fields.'); return }
    setSending(true); setError(''); setOk('')
    try {
      const res = await fetch('/api/admin/marketing/studio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-campaign', campaignName, audienceId: campaignAudience, subject, html_content: html, templateId: templateId || undefined, fromName, replyTo, sendNow }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setOk(sendNow ? '🎉 Campaign sent!' : '✅ Draft created in Mailchimp.')
      setLastEditUrl(String(data.editUrl || ''))
      await loadStudio()
      setView('history')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setSending(false) }
  }

  function resetTemplate() {
    setTemplateId(''); setTemplateName(''); setSubject(''); setPreheader('')
    setThumbnailUrl(''); setAssets([])
    const newHtml = NEWSLETTER_HTML
    setHtml(newHtml)
    // @ts-expect-error
    window.tinymce?.get(EDITOR_ID)?.setContent(newHtml)
    window.localStorage.removeItem(DRAFT_KEY)
  }

  function loadStarter(kind: 'newsletter' | 'market') {
    const newHtml = kind === 'newsletter' ? NEWSLETTER_HTML : MARKET_HTML
    setHtml(newHtml)
    // @ts-expect-error
    window.tinymce?.get(EDITOR_ID)?.setContent(newHtml)
    setOk(`Loaded ${kind === 'newsletter' ? 'newsletter' : 'market snapshot'} starter.`)
  }

  function insertImageIntoEditor(url: string) {
    // @ts-expect-error
    const editor = window.tinymce?.get(EDITOR_ID)
    if (editor) {
      editor.insertContent(`<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:16px 0;" />`)
      setHtml(editor.getContent())
    } else {
      setHtml((prev: string) => prev + `\n<img src="${url}" alt="" style="max-width:100%;height:auto;" />`)
    }
    setOk('Image inserted.')
  }

  function saveDraft() {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ templateName, subject, preheader, html }))
    setOk('Draft saved in browser.')
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-12 flex items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading Marketing Studio…</span>
      </div>
    )
  }

  return (
    <>
      {/* TinyMCE CDN */}
      <Script
        src={`https://cdn.tiny.cloud/1/${TINYMCE_KEY}/tinymce/7/tinymce.min.js`}
        referrerPolicy="origin"
        strategy="afterInteractive"
        onReady={() => setTinyLoaded(true)}
      />

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden min-h-[700px] flex flex-col">

        {/* ── Top bar ──────────────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#f26b2b]" />
            <h2 className="text-lg font-bold text-[#03374f]">Marketing Studio</h2>
          </div>
          <div className="flex items-center bg-[#f0ede9] rounded-xl p-1 gap-1">
            {([
              { key: 'editor' as View,   label: '✏️ Editor' },
              { key: 'campaign' as View, label: '🚀 Campaign' },
              { key: 'history' as View,  label: '📋 History' },
            ]).map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setView(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  view === key ? 'bg-[#03374f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Feedback toast ──────────────────────────────────── */}
        {(error || ok) && (
          <div className={`mx-6 mt-4 flex items-start gap-2.5 p-3.5 rounded-xl text-sm ${error ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}>
            {error ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span>{error || ok}</span>
            <button type="button" onClick={() => { setError(''); setOk('') }} className="ml-auto text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            EDITOR VIEW — 3-column: sidebar | editor | preview
        ═══════════════════════════════════════════════════════ */}
        {view === 'editor' && (
          <div className="flex-1 flex divide-x divide-gray-100 overflow-hidden">

            {/* LEFT — sidebar: templates + meta */}
            <div className="w-72 flex-shrink-0 flex flex-col bg-[#fafaf9] overflow-y-auto">
              {/* Template picker */}
              <div className="p-4 border-b border-gray-100 space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Templates</p>
                <div className="flex gap-1.5">
                  <button type="button" onClick={resetTemplate} title="New blank"
                    className="h-8 w-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"><Plus className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button type="button" onClick={() => loadStarter('newsletter')} title="Newsletter starter"
                    className="h-8 px-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-1 text-[10px] font-semibold text-gray-600"><Wand2 className="w-3 h-3" /> Newsletter</button>
                  <button type="button" onClick={() => loadStarter('market')} title="Market starter"
                    className="h-8 px-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-1 text-[10px] font-semibold text-gray-600"><Wand2 className="w-3 h-3" /> Market</button>
                </div>
                {templates.map((t) => (
                  <button key={t.id} type="button" onClick={() => setTemplateId(t.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                      templateId === t.id ? 'bg-[#03374f] text-white' : 'bg-white border border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden ${templateId === t.id ? 'bg-white/10' : 'bg-gray-100'}`}>
                      {t.thumbnail_url
                        ? <img src={t.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><FileText className={`w-4 h-4 ${templateId === t.id ? 'text-white/50' : 'text-gray-300'}`} /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${templateId === t.id ? 'text-white' : 'text-[#03374f]'}`}>{t.name}</p>
                      <p className={`text-[10px] ${templateId === t.id ? 'text-white/50' : 'text-gray-400'}`}>{new Date(t.updated_at).toLocaleDateString()}</p>
                    </div>
                    {templateId === t.id && <ChevronRight className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Meta fields */}
              <div className="p-4 border-b border-gray-100 space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Settings</p>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Template Name *</label>
                  <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Q2 Market Update"
                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Subject Line *</label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your Market Update"
                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Preheader</label>
                  <input value={preheader} onChange={(e) => setPreheader(e.target.value)} placeholder="Preview text…"
                    className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs" />
                </div>
              </div>

              {/* Image uploader */}
              <div className="p-4 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Images</p>
                <ImageUploader assets={assets} setAssets={setAssets} onInsert={insertImageIntoEditor} />
              </div>

              {/* Actions */}
              <div className="p-4 space-y-2 mt-auto">
                <button type="button" onClick={saveTemplate} disabled={saving}
                  className="w-full h-10 rounded-xl bg-[#03374f] text-white text-xs font-bold hover:bg-[#03374f]/90 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save Template</>}
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={saveDraft} className="flex-1 h-9 rounded-lg border border-gray-200 bg-white text-[10px] font-semibold text-gray-600 hover:bg-gray-50">Draft</button>
                  <button type="button" onClick={resetTemplate} className="flex-1 h-9 rounded-lg border border-gray-200 bg-white text-[10px] font-semibold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> New</button>
                </div>
                {templateId && (
                  <button type="button" onClick={() => setView('campaign')}
                    className="w-full h-10 rounded-xl bg-[#f26b2b] text-white text-xs font-bold hover:bg-[#e05d1e] flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5" /> Use in Campaign →
                  </button>
                )}
              </div>
            </div>

            {/* CENTER — editor or preview */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Editor toolbar */}
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowPreview(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!showPreview ? 'bg-[#03374f] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    Edit
                  </button>
                  <button type="button" onClick={() => setShowPreview(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showPreview ? 'bg-[#03374f] text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    Preview
                  </button>
                </div>
                {showPreview && (
                  <div className="flex items-center bg-[#f0ede9] rounded-lg p-0.5 gap-0.5">
                    <button type="button" onClick={() => setPreviewSize('desktop')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all ${previewSize === 'desktop' ? 'bg-white text-[#03374f] shadow-sm' : 'text-gray-500'}`}>
                      <Monitor className="w-3 h-3" /> Desktop
                    </button>
                    <button type="button" onClick={() => setPreviewSize('mobile')}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-all ${previewSize === 'mobile' ? 'bg-white text-[#03374f] shadow-sm' : 'text-gray-500'}`}>
                      <Smartphone className="w-3 h-3" /> Mobile
                    </button>
                  </div>
                )}
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-auto bg-[#f0ede9]">
                {showPreview ? (
                  <div className="p-6">
                    {/* Subject bar */}
                    <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 px-5 py-3 max-w-[660px] mx-auto">
                      <p className="text-[10px] text-gray-400 mb-0.5">From: <span className="text-gray-600">{fromName || 'Pacific Coast Title'}</span></p>
                      <p className="text-sm font-bold text-gray-800 truncate">{subject || '(No subject)'}</p>
                      {preheader && <p className="text-xs text-gray-400 truncate">{preheader}</p>}
                    </div>
                    <div className={`mx-auto transition-all ${previewSize === 'mobile' ? 'max-w-[390px]' : 'max-w-[660px]'}`}>
                      <iframe title="Email Preview" srcDoc={html} sandbox="allow-same-origin"
                        className="w-full bg-white rounded-b-xl border border-gray-200" style={{ height: '640px' }} />
                    </div>
                  </div>
                ) : (
                  <div className="p-4" style={{ display: showPreview ? 'none' : 'block' }}>
                    <textarea id={EDITOR_ID} defaultValue={html} style={{ visibility: 'hidden' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            CAMPAIGN VIEW
        ═══════════════════════════════════════════════════════ */}
        {view === 'campaign' && (
          <div className="flex-1 grid lg:grid-cols-2 divide-x divide-gray-100">
            {/* Left — settings */}
            <div className="p-8 space-y-6">
              <div className="bg-[#f8f6f3] rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Template</p>
                  <p className="font-semibold text-[#03374f]">{selectedTemplate?.name || '(none)'}</p>
                </div>
                {!selectedTemplate && (
                  <button type="button" onClick={() => setView('editor')} className="text-xs text-[#f26b2b] hover:underline">← Back to Editor</button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Campaign Name *</label>
                  <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="June Newsletter"
                    className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Audience / Rep *</label>
                  <select value={campaignAudience} onChange={(e) => setCampaignAudience(e.target.value)}
                    className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm">
                    <option value="">Select an audience…</option>
                    {audiences.map((a) => <option key={a.audienceId} value={a.audienceId}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">From Name</label>
                  <input value={fromName} onChange={(e) => setFromName(e.target.value)}
                    className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reply-To Email</label>
                  <input value={replyTo} onChange={(e) => setReplyTo(e.target.value)}
                    className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>

              <div className="flex items-start gap-3 p-5 rounded-xl border border-gray-200 bg-[#f8f6f3]">
                <input type="checkbox" id="sendNow" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)} className="w-5 h-5 mt-0.5 rounded accent-[#f26b2b]" />
                <label htmlFor="sendNow" className="cursor-pointer">
                  <p className="text-sm font-bold text-gray-700">Send immediately</p>
                  <p className="text-xs text-gray-400 mt-1">Otherwise creates a draft in Mailchimp that you can review first.</p>
                </label>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button type="button" onClick={createCampaign} disabled={sending}
                  className="h-12 px-8 rounded-xl bg-[#f26b2b] text-white font-bold hover:bg-[#e05d1e] disabled:opacity-60 flex items-center gap-2">
                  {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><Send className="w-4 h-4" /> {sendNow ? 'Send Campaign' : 'Create Draft'}</>}
                </button>
                {lastEditUrl && (
                  <a href={lastEditUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#f26b2b] hover:underline">
                    Open in Mailchimp <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right — preview */}
            <div className="p-6 bg-[#f0ede9] flex flex-col items-center justify-start overflow-auto">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 self-start">Campaign Preview</p>
              <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 w-full max-w-[600px] mb-2">
                <p className="text-[10px] text-gray-400">Subject: <span className="text-gray-700 font-medium">{subject || '(none)'}</span></p>
              </div>
              <iframe title="Campaign Preview" srcDoc={html} sandbox="allow-same-origin"
                className="w-full max-w-[600px] rounded-xl border border-gray-200 bg-white" style={{ height: '500px' }} />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            HISTORY VIEW
        ═══════════════════════════════════════════════════════ */}
        {view === 'history' && (
          <div className="flex-1 p-6 overflow-auto">
            {history.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-4 opacity-30" />
                <p className="text-sm font-medium">No campaigns sent yet.</p>
                <button type="button" onClick={() => setView('campaign')} className="mt-3 text-sm text-[#f26b2b] hover:underline">Create your first campaign →</button>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500">Campaign</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500">Audience</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-center">Status</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-5 py-3"><p className="font-semibold text-[#03374f]">{h.name}</p><p className="text-xs text-gray-400 truncate max-w-[220px]">{h.subject}</p></td>
                        <td className="px-5 py-3 text-xs text-gray-500">{audiences.find((a) => a.audienceId === h.audience_id)?.name || h.audience_id || '—'}</td>
                        <td className="px-5 py-3 text-center"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${h.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{h.status}</span></td>
                        <td className="px-5 py-3 text-right">{h.mailchimp_web_id ? <a href={`https://us1.admin.mailchimp.com/campaigns/edit?id=${h.mailchimp_web_id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#f26b2b] hover:underline">Open <ExternalLink className="w-3 h-3" /></a> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
