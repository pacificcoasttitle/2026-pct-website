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
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
interface AudienceOption { slug: string; name: string; audienceId: string }
interface Template {
  id: number; name: string; subject: string; preheader: string | null
  html_content: string; thumbnail_url: string | null; category: string | null
  updated_at: string
}
interface CampaignLog {
  id: number; name: string; subject: string; audience_id: string | null
  mailchimp_campaign_id: string | null; mailchimp_web_id: string | null
  status: string; created_at: string
}
interface Props { audiences: AudienceOption[]; mailchimpServer?: string }

type View = 'editor' | 'campaign' | 'history'
type PreviewSize = 'desktop' | 'mobile'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const TINYMCE_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'
const EDITOR_ID = 'pct-mkt-editor'

// ── Template categories ───────────────────────────────────────────
const CATEGORIES = [
  { key: 'product',       label: 'Product',       icon: '📦', desc: 'Services & products',   activeBg: 'bg-blue-600' },
  { key: 'title_news',    label: 'Title News',    icon: '📰', desc: 'Regulatory updates',    activeBg: 'bg-purple-600' },
  { key: 'market_update', label: 'Market Update',  icon: '📊', desc: 'Market stats & trends', activeBg: 'bg-emerald-600' },
  { key: 'holidays',      label: 'Holidays',       icon: '🎉', desc: 'Seasonal greetings',   activeBg: 'bg-amber-500' },
]

// ── Merge tags ────────────────────────────────────────────────────
const MERGE_TAGS = [
  { tag: '{{REP_NAME}}',   label: 'Rep Name' },
  { tag: '{{REP_TITLE}}',  label: 'Rep Title' },
  { tag: '{{REP_PHOTO}}',  label: 'Rep Photo' },
  { tag: '{{REP_EMAIL}}',  label: 'Rep Email' },
  { tag: '{{REP_PHONE}}',  label: 'Rep Phone' },
  { tag: '{{REP_URL}}',    label: 'Rep Page URL' },
  { tag: '{{HERO_IMAGE}}', label: 'Hero Image' },
]

// ── Image uploader ────────────────────────────────────────────────
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
    <div className="space-y-2">
      <div
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center gap-3 py-4 ${
          dragging ? 'border-[#f26b2b] bg-[#f26b2b]/5' : 'border-gray-200 bg-[#f8f6f3] hover:border-gray-300'
        }`}
      >
        <Upload className="w-4 h-4 text-gray-400" />
        <p className="text-xs text-gray-500"><strong>Drop</strong> or click to browse</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => Array.from(e.target.files || []).forEach(uploadFile)} />
      </div>
      {assets.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {assets.map((a) => (
            <div key={a.previewUrl} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square group">
              <img src={a.previewUrl} alt={a.name} className="w-full h-full object-cover" />
              {a.uploading && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div>}
              {!a.uploading && !a.error && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  {onInsert && <button type="button" onClick={(e) => { e.stopPropagation(); onInsert(a.url) }}
                    className="px-1.5 py-0.5 bg-[#f26b2b] text-white text-[9px] font-bold rounded">Insert</button>}
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
export function MarketingStudioClient({ audiences, mailchimpServer = 'us1' }: Props) {
  const [view, setView] = useState<View>('editor')
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop')
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [history, setHistory] = useState<CampaignLog[]>([])
  const [showMergeTags, setShowMergeTags] = useState(false)

  // Active category + template
  const [activeCategory, setActiveCategory] = useState<string>('product')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Template form state
  const [templateId, setTemplateId] = useState<number | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [html, setHtml] = useState('')
  const [assets, setAssets] = useState<UploadedAsset[]>([])

  // Campaign
  const [campaignTemplate, setCampaignTemplate] = useState<string>('')
  const [campaignName, setCampaignName] = useState('')
  const [campaignAudience, setCampaignAudience] = useState('')
  const [campaignAllReps, setCampaignAllReps] = useState(false)
  const [fromName, setFromName] = useState('Pacific Coast Title')
  const [replyTo, setReplyTo] = useState('info@pct.com')
  const [sendNow, setSendNow] = useState(false)
  const [lastEditUrl, setLastEditUrl] = useState('')

  // TinyMCE
  const [tinyLoaded, setTinyLoaded] = useState(false)
  const editorInitialized = useRef(false)

  // ── Template lookup by category ────────────────────────────────
  const templatesByCategory = useMemo(() => {
    const map: Record<string, Template> = {}
    templates.forEach((t) => { if (t.category) map[t.category] = t })
    return map
  }, [templates])

  const activeTemplate = templatesByCategory[activeCategory] || null

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

  // ── Load template into editor when category changes ────────────
  useEffect(() => {
    if (loading) return
    const tpl = templatesByCategory[activeCategory]
    if (tpl) {
      setTemplateId(tpl.id)
      setTemplateName(tpl.name)
      setSubject(tpl.subject)
      setPreheader(tpl.preheader || '')
      setHtml(tpl.html_content)
      setAssets([])
      setSaveStatus('idle')
      try {
        // @ts-expect-error TinyMCE from CDN
        window.tinymce?.get(EDITOR_ID)?.setContent(tpl.html_content)
      } catch { /* not init yet */ }
    } else {
      const cat = CATEGORIES.find((c) => c.key === activeCategory)
      setTemplateId(null)
      setTemplateName(cat?.label || '')
      setSubject('')
      setPreheader('')
      setHtml('')
      setSaveStatus('idle')
      try {
        // @ts-expect-error
        window.tinymce?.get(EDITOR_ID)?.setContent('')
      } catch { /* */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, loading, templatesByCategory])

  // ── Init TinyMCE ──────────────────────────────────────────────
  useEffect(() => {
    if (!tinyLoaded || editorInitialized.current) return
    const el = document.getElementById(EDITOR_ID)
    if (!el) return
    editorInitialized.current = true

    // @ts-expect-error TinyMCE from CDN
    window.tinymce?.init({
      selector: `#${EDITOR_ID}`,
      height: '100%',
      menubar: 'file edit view insert format table',
      plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
      toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | image link | table | code preview fullscreen',
      // ── Email-safe settings ──────────────────────────────────
      paste_as_text: true,                         // strip Word/web formatting on paste
      paste_block_drop: false,
      table_default_styles: { 'border-collapse': 'collapse', width: '100%' },
      valid_styles: {
        '*': 'color,background-color,background,font-family,font-size,font-weight,font-style,text-align,text-decoration,line-height,padding,padding-top,padding-bottom,padding-left,padding-right,margin,margin-top,margin-bottom,margin-left,margin-right,border,border-top,border-bottom,border-left,border-right,border-collapse,border-color,border-width,border-style,border-radius,width,max-width,min-width,height,display,vertical-align,list-style-type,opacity,box-shadow,overflow',
      },
      invalid_styles: { '*': 'position float clear' },  // email clients ignore these
      content_style: `
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; padding: 16px; max-width: 600px; margin: 0 auto; color: #333; }
        img  { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        a { color: #f26b2b; }
      `,
      branding: false,
      promotion: false,
      skin: 'oxide',
      content_css: 'default',
      convert_urls: false,                          // keep absolute image URLs
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
          const content = editor.getContent()
          setHtml(content)
          triggerAutoSave()
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

  // ── Auto-save ─────────────────────────────────────────────────
  function triggerAutoSave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveStatus('idle')
    saveTimerRef.current = setTimeout(() => { performSave(true) }, 2000)
  }

  async function performSave(silent = false) {
    // @ts-expect-error
    const currentHtml = window.tinymce?.get(EDITOR_ID)?.getContent() || html
    const currentName = templateName || CATEGORIES.find((c) => c.key === activeCategory)?.label || 'Template'
    const currentSubject = subject || '(No subject)'

    if (!currentName || !currentSubject || !currentHtml) return
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/admin/marketing/studio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-template',
          id: templateId || undefined,
          name: currentName,
          subject: currentSubject,
          preheader,
          html_content: currentHtml,
          category: activeCategory,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setSaveStatus('saved')
      if (data.template?.id && !templateId) setTemplateId(data.template.id)
      // Silently refresh templates list
      const fresh = await fetch('/api/admin/marketing/studio')
      const freshData = await fresh.json()
      if (fresh.ok) {
        setTemplates(freshData.templates || [])
        setHistory(freshData.campaigns || [])
      }
      if (!silent) setOk('Template saved.')
    } catch (e) {
      setSaveStatus('error')
      if (!silent) setError(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  // Auto-save on meta field changes (subject, preheader, name)
  function onMetaChange() {
    triggerAutoSave()
  }

  // ── Campaign ──────────────────────────────────────────────────
  async function createCampaign() {
    const tpl = campaignTemplate ? templatesByCategory[campaignTemplate] : activeTemplate
    if (!tpl) { setError('Select a template first.'); return }
    const targetAudiences = campaignAllReps ? audiences : audiences.filter((a) => a.audienceId === campaignAudience)
    if (targetAudiences.length === 0) { setError('Select at least one audience.'); return }
    if (!campaignName) { setError('Enter a campaign name.'); return }

    setSending(true); setError(''); setOk('')

    try {
      let lastUrl = ''
      for (const audience of targetAudiences) {
        const res = await fetch('/api/admin/marketing/studio', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-campaign',
            campaignName: campaignAllReps ? `${campaignName} — ${audience.name}` : campaignName,
            audienceId: audience.audienceId,
            subject: tpl.subject,
            preheader: tpl.preheader || '',    // ← send preheader to Mailchimp
            html_content: tpl.html_content,
            templateId: tpl.id,
            repSlug: audience.slug,            // ← resolve {{REP_*}} merge tags
            fromName, replyTo, sendNow,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Failed for ${audience.name}`)
        if (data.editUrl) lastUrl = data.editUrl
      }
      setOk(sendNow
        ? `🎉 Campaign sent to ${targetAudiences.length} audience${targetAudiences.length > 1 ? 's' : ''}!`
        : `✅ Draft${targetAudiences.length > 1 ? 's' : ''} created in Mailchimp.`)
      setLastEditUrl(lastUrl)
      await loadStudio()
      setView('history')
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') }
    finally { setSending(false) }
  }

  function insertMergeTag(tag: string) {
    // @ts-expect-error
    const editor = window.tinymce?.get(EDITOR_ID)
    if (editor) {
      editor.insertContent(tag)
      setHtml(editor.getContent())
      triggerAutoSave()
    }
    setShowMergeTags(false)
  }

  function insertImageIntoEditor(url: string) {
    // @ts-expect-error
    const editor = window.tinymce?.get(EDITOR_ID)
    if (editor) {
      editor.insertContent(`<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:16px 0;" />`)
      setHtml(editor.getContent())
      triggerAutoSave()
    }
    setOk('Image inserted.')
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

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden min-h-[760px] flex flex-col">

        {/* ── Top bar ──────────────────────────────────────────── */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#f26b2b]" />
            <h2 className="text-lg font-bold text-[#03374f]">Marketing Studio</h2>
            {/* Auto-save indicator */}
            {view === 'editor' && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                saveStatus === 'saving' ? 'bg-blue-50 text-blue-600' :
                saveStatus === 'saved'  ? 'bg-emerald-50 text-emerald-600' :
                saveStatus === 'error'  ? 'bg-red-50 text-red-600' :
                'bg-gray-50 text-gray-400'
              }`}>
                {saveStatus === 'saving' ? '⏳ Saving…' :
                 saveStatus === 'saved'  ? '✓ Saved' :
                 saveStatus === 'error'  ? '✗ Error' : ''}
              </span>
            )}
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
            EDITOR VIEW
        ═══════════════════════════════════════════════════════ */}
        {view === 'editor' && (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* ── Category tabs ─────────────────────────────── */}
            <div className="px-6 py-4 border-b border-gray-100 bg-[#fafaf9]">
              <div className="grid grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key
                  const tpl = templatesByCategory[cat.key]
                  return (
                    <button key={cat.key} type="button"
                      onClick={() => setActiveCategory(cat.key)}
                      className={`relative rounded-xl p-4 text-left transition-all border ${
                        isActive
                          ? 'bg-[#03374f] border-[#03374f] text-white shadow-lg shadow-[#03374f]/15 scale-[1.02]'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-xl">{cat.icon}</span>
                        <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-[#03374f]'}`}>{cat.label}</span>
                      </div>
                      <p className={`text-[11px] ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{cat.desc}</p>
                      {tpl && (
                        <p className={`text-[10px] mt-2 ${isActive ? 'text-white/40' : 'text-gray-300'}`}>
                          Updated {new Date(tpl.updated_at).toLocaleDateString()}
                        </p>
                      )}
                      {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-[#03374f] rotate-45" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Editor area ─────────────────────────────── */}
            <div className="flex-1 flex divide-x divide-gray-100 overflow-hidden">

              {/* LEFT sidebar: meta + images + actions */}
              <div className="w-72 flex-shrink-0 flex flex-col bg-[#fafaf9] overflow-y-auto">
                {/* Meta fields */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Template Settings</p>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Template Name</label>
                    <input value={templateName} onChange={(e) => { setTemplateName(e.target.value); onMetaChange() }}
                      className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Subject Line *</label>
                    <input value={subject} onChange={(e) => { setSubject(e.target.value); onMetaChange() }}
                      placeholder="Your Market Update — {{REP_NAME}}"
                      className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Preheader</label>
                    <input value={preheader} onChange={(e) => { setPreheader(e.target.value); onMetaChange() }}
                      placeholder="Preview text for inbox…"
                      className="w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-xs" />
                  </div>
                </div>

                {/* Merge tags */}
                <div className="p-4 border-b border-gray-100">
                  <button type="button" onClick={() => setShowMergeTags(!showMergeTags)}
                    className="flex items-center gap-2 text-xs font-bold text-[#03374f] hover:text-[#f26b2b] transition-colors w-full">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Insert Merge Tags</span>
                    <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${showMergeTags ? 'rotate-90' : ''}`} />
                  </button>
                  {showMergeTags && (
                    <div className="mt-2 space-y-1">
                      {MERGE_TAGS.map((m) => (
                        <button key={m.tag} type="button" onClick={() => insertMergeTag(m.tag)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-[#f26b2b] hover:bg-[#f26b2b]/5 transition-all text-left group">
                          <span className="text-[10px] font-semibold text-gray-600 group-hover:text-[#f26b2b]">{m.label}</span>
                          <code className="text-[9px] text-gray-400 font-mono">{m.tag}</code>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image uploader */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Images</p>
                  <ImageUploader assets={assets} setAssets={setAssets} onInsert={insertImageIntoEditor} />
                </div>

                {/* Actions */}
                <div className="p-4 space-y-2 mt-auto">
                  <button type="button" onClick={() => performSave(false)}
                    disabled={saveStatus === 'saving'}
                    className="w-full h-10 rounded-xl bg-[#03374f] text-white text-xs font-bold hover:bg-[#03374f]/90 disabled:opacity-60 flex items-center justify-center gap-2">
                    {saveStatus === 'saving'
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                      : <><Save className="w-3.5 h-3.5" /> Save Template</>
                    }
                  </button>
                  <button type="button" onClick={() => { setCampaignTemplate(activeCategory); setView('campaign') }}
                    className="w-full h-10 rounded-xl bg-[#f26b2b] text-white text-xs font-bold hover:bg-[#e05d1e] flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5" /> Use in Campaign →
                  </button>
                </div>
              </div>

              {/* CENTER: TinyMCE editor or Preview */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Edit / Preview toggle */}
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

                {/* Content */}
                <div className="flex-1 overflow-auto bg-[#f0ede9]">
                  {showPreview ? (
                    <div className="p-6">
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
                    <div className="h-full" style={{ display: showPreview ? 'none' : 'block' }}>
                      <textarea id={EDITOR_ID} defaultValue={html} style={{ visibility: 'hidden' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            CAMPAIGN VIEW
        ═══════════════════════════════════════════════════════ */}
        {view === 'campaign' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Template selection */}
            <div className="px-6 py-4 border-b border-gray-100 bg-[#fafaf9]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Choose a Template</p>
              <div className="grid grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => {
                  const tpl = templatesByCategory[cat.key]
                  const selected = campaignTemplate === cat.key
                  return (
                    <button key={cat.key} type="button"
                      onClick={() => setCampaignTemplate(cat.key)}
                      disabled={!tpl}
                      className={`relative rounded-xl p-4 text-left transition-all border ${
                        !tpl ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50' :
                        selected
                          ? 'bg-[#f26b2b] border-[#f26b2b] text-white shadow-lg shadow-[#f26b2b]/15'
                          : 'bg-white border-gray-200 hover:border-[#f26b2b]/40 hover:shadow-sm'
                      }`}>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-lg">{cat.icon}</span>
                        <span className={`text-sm font-bold ${selected ? 'text-white' : !tpl ? 'text-gray-400' : 'text-[#03374f]'}`}>{cat.label}</span>
                      </div>
                      {tpl ? (
                        <p className={`text-[11px] truncate ${selected ? 'text-white/70' : 'text-gray-400'}`}>{tpl.subject}</p>
                      ) : (
                        <p className="text-[11px] text-gray-400">Not created yet</p>
                      )}
                      {selected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Campaign form + Preview */}
            <div className="flex-1 grid lg:grid-cols-2 divide-x divide-gray-100 overflow-hidden">
              {/* Left — settings */}
              <div className="p-8 space-y-6 overflow-y-auto">
                {/* Audience selection */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#03374f] uppercase tracking-wide">Audience</p>
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-gray-200 bg-[#f8f6f3] hover:border-[#f26b2b]/30 transition-colors">
                    <input type="checkbox" checked={campaignAllReps} onChange={(e) => { setCampaignAllReps(e.target.checked); if (e.target.checked) setCampaignAudience('') }}
                      className="w-5 h-5 mt-0.5 rounded accent-[#f26b2b]" />
                    <div>
                      <p className="text-sm font-bold text-gray-700">Send to ALL reps</p>
                      <p className="text-xs text-gray-400 mt-0.5">Creates individual campaigns for each rep&apos;s distribution list ({audiences.length} audiences)</p>
                    </div>
                  </label>
                  {!campaignAllReps && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specific Rep</label>
                      <select value={campaignAudience} onChange={(e) => setCampaignAudience(e.target.value)}
                        className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm">
                        <option value="">Select a rep…</option>
                        {audiences.map((a) => <option key={a.audienceId} value={a.audienceId}>{a.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Campaign details */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Campaign Name *</label>
                    <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="June Product Update"
                      className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
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
                  <input type="checkbox" id="sendNow" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded accent-[#f26b2b]" />
                  <label htmlFor="sendNow" className="cursor-pointer">
                    <p className="text-sm font-bold text-gray-700">Send immediately</p>
                    <p className="text-xs text-gray-400 mt-1">Otherwise creates a draft in Mailchimp for review.</p>
                  </label>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button type="button" onClick={createCampaign} disabled={sending}
                    className="h-12 px-8 rounded-xl bg-[#f26b2b] text-white font-bold hover:bg-[#e05d1e] disabled:opacity-60 flex items-center gap-2">
                    {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><Send className="w-4 h-4" /> {sendNow ? 'Send Campaign' : 'Create Draft'}</>}
                  </button>
                  <button type="button" onClick={() => setView('editor')} className="text-sm text-gray-400 hover:text-gray-600">← Back to Editor</button>
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
                {campaignTemplate && templatesByCategory[campaignTemplate] ? (
                  <>
                    <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 w-full max-w-[600px] mb-2">
                      <p className="text-[10px] text-gray-400">Subject: <span className="text-gray-700 font-medium">{templatesByCategory[campaignTemplate]?.subject || '(none)'}</span></p>
                    </div>
                    <iframe title="Campaign Preview"
                      srcDoc={templatesByCategory[campaignTemplate]?.html_content || ''}
                      sandbox="allow-same-origin"
                      className="w-full max-w-[600px] rounded-xl border border-gray-200 bg-white" style={{ height: '500px' }} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                    <FileText className="w-10 h-10 opacity-30 mb-3" />
                    <p className="text-sm">Select a template above</p>
                  </div>
                )}
              </div>
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
                        <td className="px-5 py-3 text-right">{h.mailchimp_web_id ? <a href={`https://${mailchimpServer}.admin.mailchimp.com/campaigns/edit?id=${h.mailchimp_web_id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#f26b2b] hover:underline">Open <ExternalLink className="w-3 h-3" /></a> : '—'}</td>
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
