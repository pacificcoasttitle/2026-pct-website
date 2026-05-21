'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowLeft, Save, Loader2, Tag, Image as ImageIcon,
  Monitor, Smartphone, ExternalLink, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InlineAlert, TEMPLATE_CATEGORIES,
} from './shared'

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════ */
const MERGE_TAGS = [
  { tag: '{{REP_NAME}}',   label: 'Rep Name' },
  { tag: '{{REP_TITLE}}',  label: 'Rep Title' },
  { tag: '{{REP_EMAIL}}',  label: 'Rep Email' },
  { tag: '{{REP_PHONE}}',  label: 'Rep Phone' },
  { tag: '{{REP_PHOTO}}',  label: 'Rep Photo URL' },
  { tag: '{{HERO_IMAGE}}', label: 'Hero Image (per-campaign)' },
] as const

const HERO_PLACEHOLDER =
  'https://placehold.co/600x300/f0ede9/9ca3af?text=Hero+image+placeholder'

const TINYMCE_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'
const EDITOR_ID   = 'pct-template-editor'

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

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/* Visual placeholder for {{HERO_IMAGE}} inside the editor surface so the
 * user sees something instead of a broken-image icon. Replaced back to the
 * literal merge tag at save time. */
function prepareForEditor(html: string): string {
  return html.replace(/\{\{HERO_IMAGE\}\}/g, HERO_PLACEHOLDER)
}
function prepareForSave(html: string): string {
  // Re-collapse the placeholder URL back to the {{HERO_IMAGE}} merge tag.
  const escaped = HERO_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return html.replace(new RegExp(escaped, 'g'), '{{HERO_IMAGE}}')
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function getEditor(): any {
  return (typeof window !== 'undefined') ? (window as any).tinymce?.get(EDITOR_ID) : null
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ══════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════ */
export function TemplateEditor({ templateId }: { templateId: number }) {
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState('')
  const [info,  setInfo]  = useState('')

  const [name,      setName]      = useState('')
  const [subject,   setSubject]   = useState('')
  const [preheader, setPreheader] = useState('')
  const [category,  setCategory]  = useState<string>('')

  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop')

  /* ── Preview HTML (driven by TinyMCE change events, debounced) ── */
  const [previewHtml, setPreviewHtml] = useState('')
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const previewSrc = useMemo(
    () => previewHtml.replace(/\{\{HERO_IMAGE\}\}/g, HERO_PLACEHOLDER),
    [previewHtml],
  )

  /* ── TinyMCE state ───────────────────────────────────────────── */
  const [tinyLoaded, setTinyLoaded] = useState(false)
  const editorInitialized = useRef(false)
  const editorReady       = useRef(false)
  const isLoadingRef      = useRef(false)      // suppress change events during programmatic setContent
  const initialHtmlRef    = useRef<string>('') // html to load once TinyMCE is ready

  /* ══════════════════════════════════════════════════════════════
     REFS used inside TinyMCE callbacks.
     TinyMCE's callbacks capture the closure from the render they were
     created in. By reading from refs we always get the latest value
     and avoid the stale-closure class of bugs the old studio hit.
     ══════════════════════════════════════════════════════════════ */
  const uploadingRef    = useRef(false)
  const [uploading, setUploading] = useState(false)

  /* ══════════════════════════════════════════════════════════════
     LOAD template
     ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/marketing/studio')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        const tpl: Template | undefined = (data.templates || []).find((t: Template) => t.id === templateId)
        if (cancelled) return
        if (!tpl) { setNotFound(true); return }
        setName(tpl.name)
        setSubject(tpl.subject)
        setPreheader(tpl.preheader || '')
        setCategory(tpl.category || '')
        initialHtmlRef.current = tpl.html_content || ''
        setPreviewHtml(tpl.html_content || '')

        // If TinyMCE is already initialised by the time the fetch resolves,
        // push the content in immediately.
        if (editorReady.current) {
          const ed = getEditor()
          if (ed) {
            isLoadingRef.current = true
            ed.setContent(prepareForEditor(initialHtmlRef.current))
            setTimeout(() => { isLoadingRef.current = false }, 300)
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [templateId])

  /* ══════════════════════════════════════════════════════════════
     INIT TinyMCE — once, after script loads and container is in DOM.
     Container stays mounted for the lifetime of the component, so the
     editor instance is never torn down by preview toggles or re-renders.
     ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!tinyLoaded || editorInitialized.current) return
    if (typeof window === 'undefined') return
    const el = document.getElementById(EDITOR_ID)
    if (!el) return
    editorInitialized.current = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).tinymce?.init({
      selector: `#${EDITOR_ID}`,
      height:   '100%',
      menubar:  'file edit view insert format table',
      plugins:  'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
      toolbar:  'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | pctImage link | mergetag | table | code preview fullscreen',
      paste_as_text: true,
      paste_block_drop: false,
      table_default_styles: { 'border-collapse': 'collapse', width: '100%' },
      valid_styles: {
        '*': 'color,background-color,background,font-family,font-size,font-weight,font-style,text-align,text-decoration,line-height,padding,padding-top,padding-bottom,padding-left,padding-right,margin,margin-top,margin-bottom,margin-left,margin-right,border,border-top,border-bottom,border-left,border-right,border-collapse,border-color,border-width,border-style,border-radius,width,max-width,min-width,height,display,vertical-align,list-style-type,opacity,box-shadow,overflow',
      },
      invalid_styles: { '*': 'position float clear' },
      content_style: `
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; padding: 16px; max-width: 600px; margin: 0 auto; color: #333; }
        img  { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        a { color: #f26b2b; }
      `,
      branding:    false,   // remove "powered by tinymce" footer
      promotion:   false,   // hide premium-upgrade prompts
      skin:        'oxide',
      content_css: 'default',
      convert_urls: false,

      // Drag-and-drop / clipboard image uploads pipe through R2.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      images_upload_handler: async (blobInfo: any) => {
        const fd = new FormData()
        fd.append('file', blobInfo.blob(), blobInfo.filename())
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        return data.url as string
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setup: (editor: any) => {
        // Toolbar: "Insert Image" — opens a file picker, uploads to R2.
        editor.ui.registry.addButton('pctImage', {
          icon: 'image',
          tooltip: 'Insert image (uploads to R2)',
          onAction: () => {
            if (uploadingRef.current) return
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = async () => {
              const file = input.files?.[0]
              if (!file) return
              uploadingRef.current = true
              setUploading(true)
              setError('')
              try {
                const fd = new FormData()
                fd.append('file', file)
                const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Upload failed')
                editor.focus()
                editor.insertContent(
                  `<img src="${data.url}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:16px 0;" />`
                )
                setInfo('Image inserted.')
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Upload failed')
              } finally {
                uploadingRef.current = false
                setUploading(false)
              }
            }
            input.click()
          },
        })

        // Toolbar: "Merge tag" menu button.
        editor.ui.registry.addMenuButton('mergetag', {
          text: 'Merge tag',
          icon: 'character-count',
          tooltip: 'Insert a rep merge tag',
          fetch: (cb: (items: unknown[]) => void) => {
            cb(MERGE_TAGS.map((m) => ({
              type: 'menuitem' as const,
              text: `${m.label}  —  ${m.tag}`,
              onAction: () => {
                editor.focus()
                editor.insertContent(m.tag)
              },
            })))
          },
        })

        // Load whatever HTML is available once the editor is fully ready.
        editor.on('init', () => {
          editorReady.current = true
          isLoadingRef.current = true
          editor.setContent(prepareForEditor(initialHtmlRef.current))
          // Sync preview with whatever the editor normalised the HTML into.
          setPreviewHtml(editor.getContent())
          setTimeout(() => { isLoadingRef.current = false }, 300)
        })

        // Debounce preview updates so live typing stays smooth.
        const schedulePreview = () => {
          if (isLoadingRef.current) return
          if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
          previewTimerRef.current = setTimeout(() => {
            const ed = getEditor()
            if (ed) setPreviewHtml(ed.getContent())
          }, 500)
        }

        editor.on('change keyup undo redo SetContent', () => {
          if (isLoadingRef.current) return
          schedulePreview()
        })
      },
    })
  }, [tinyLoaded])

  /* Tear TinyMCE down only on unmount. */
  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
      try { getEditor()?.remove() } catch { /* ignore */ }
    }
  }, [])

  /* ══════════════════════════════════════════════════════════════
     SAVE
     ══════════════════════════════════════════════════════════════ */
  async function save() {
    setSaveState('saving'); setError(''); setInfo('')
    try {
      const ed = getEditor()
      const editorHtml = ed ? ed.getContent() : previewHtml
      const htmlForSave = prepareForSave(editorHtml)

      const res = await fetch('/api/admin/marketing/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-template',
          id: templateId,
          name, subject, preheader,
          html_content: htmlForSave,
          category: category || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSaveState('saved')
      setInfo('Template saved.')
      setTimeout(() => setSaveState((s) => s === 'saved' ? 'idle' : s), 1500)
    } catch (e) {
      setSaveState('error')
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  /* ══════════════════════════════════════════════════════════════
     Toolbar helpers outside TinyMCE — kept for convenience above
     the editor. Both delegate to TinyMCE's API so cursor/selection
     stay correct.
     ══════════════════════════════════════════════════════════════ */
  function insertMergeTag(tag: string) {
    const ed = getEditor()
    if (!ed) return
    ed.focus()
    ed.insertContent(tag)
  }

  async function insertImagePrompt() {
    const ed = getEditor()
    if (!ed) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      uploadingRef.current = true
      setUploading(true); setError('')
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        ed.focus()
        ed.insertContent(
          `<img src="${data.url}" alt="" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:16px 0;" />`,
        )
        setInfo('Image inserted.')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
      } finally {
        uploadingRef.current = false
        setUploading(false)
      }
    }
    input.click()
  }

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════ */
  if (notFound) {
    return (
      <Card className="p-10 text-center space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
        <p className="text-sm text-gray-600">Template not found.</p>
        <Link href="/admin/team/marketing/templates"
              className="text-sm text-[#f26b2b] hover:underline">
          ← Back to templates
        </Link>
      </Card>
    )
  }

  const tinyKeyMissing = !process.env.NEXT_PUBLIC_TINYMCE_API_KEY

  return (
    <>
      {/* TinyMCE script — loaded once. The container with id=EDITOR_ID is
          always mounted below; TinyMCE attaches and stays put. */}
      <Script
        src={`https://cdn.tiny.cloud/1/${TINYMCE_KEY}/tinymce/7/tinymce.min.js`}
        referrerPolicy="origin"
        strategy="afterInteractive"
        onReady={() => setTinyLoaded(true)}
      />

      <div className="space-y-4">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="sticky top-0 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-[#f0ede9]/95 backdrop-blur flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link href="/admin/team/marketing/templates"
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#f26b2b]">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="h-5 w-px bg-gray-300" />
            <p className="text-sm">
              <span className="text-gray-400">Template:</span>{' '}
              <span className="font-semibold text-[#03374f]">{name || 'Untitled'}</span>
            </p>
            {saveState === 'saved' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                ✓ Saved
              </span>
            )}
            {saveState === 'error' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                ✗ Error
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/team/marketing/campaigns/new?templateId=${templateId}`}>
              <Button variant="outline" size="sm">
                Use in Campaign <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Button onClick={save} disabled={loading || saveState === 'saving'}
                    className="bg-[#03374f] hover:bg-[#03374f]/90 text-white">
              {saveState === 'saving'
                ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4 mr-1.5" /> Save</>}
            </Button>
          </div>
        </div>

        {tinyKeyMissing && (
          <InlineAlert
            kind="info"
            message="NEXT_PUBLIC_TINYMCE_API_KEY is not set. TinyMCE will load in evaluation mode — set the env var in Vercel for the licensed experience."
          />
        )}
        {error && <InlineAlert kind="error"   message={error} onClose={() => setError('')} />}
        {info  && <InlineAlert kind="success" message={info}  onClose={() => setInfo('')} />}

        {/* Loading skeleton only obscures the meta fields side, never the
            TinyMCE container — the container must stay mounted. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ── Editor panel ─────────────────────────────────── */}
          <Card className="p-5 space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="tpl-name" className="text-xs text-gray-500">Template Name</Label>
                  <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Category</Label>
                  <Select value={category || 'none'} onValueChange={(v) => setCategory(v === 'none' ? '' : v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category (custom)</SelectItem>
                      {TEMPLATE_CATEGORIES.map((c) => (
                        <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tpl-subject" className="text-xs text-gray-500">Subject Line *</Label>
                  <Input id="tpl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="tpl-preheader" className="text-xs text-gray-500">Preheader</Label>
                  <Input id="tpl-preheader" value={preheader} onChange={(e) => setPreheader(e.target.value)}
                         placeholder="Preview text shown in inbox…" className="mt-1" />
                </div>
              </div>
            )}

            {/* Convenience toolbar above TinyMCE — TinyMCE has its own
                merge-tag/image buttons in the toolbar too. */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
              <MergeTagMenu onPick={insertMergeTag} />
              <Button variant="outline" size="sm"
                      onClick={insertImagePrompt} disabled={uploading || !editorReady.current}>
                {uploading
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Uploading…</>
                  : <><ImageIcon className="w-3.5 h-3.5 mr-1" /> Insert Image</>}
              </Button>
              <span className="text-[11px] text-gray-400 ml-auto">
                Tip: you can also drag images straight into the editor.
              </span>
            </div>

            {/* TinyMCE container — ALWAYS in the DOM. */}
            <div>
              <Label className="text-xs text-gray-500">Email Content</Label>
              <div className="mt-1 rounded-lg border border-gray-200 overflow-hidden bg-white" style={{ minHeight: 480 }}>
                <textarea id={EDITOR_ID} defaultValue="" style={{ visibility: 'hidden', height: 480 }} />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Available Merge Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MERGE_TAGS.map((m) => (
                  <code key={m.tag}
                        className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                    {m.tag}
                  </code>
                ))}
              </div>
            </div>
          </Card>

          {/* ── Live preview panel ───────────────────────────── */}
          <Card className="p-0 gap-0 overflow-hidden bg-[#f0ede9]">
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Live Preview
              </p>
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
            </div>
            <div className="p-4 overflow-auto">
              <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 px-4 py-2 mx-auto"
                   style={{ maxWidth: previewSize === 'mobile' ? 390 : 660 }}>
                <p className="text-[10px] text-gray-400 mb-0.5">
                  From: <span className="text-gray-600">Pacific Coast Title</span>
                </p>
                <p className="text-sm font-bold text-gray-800 truncate">{subject || '(No subject)'}</p>
                {preheader && <p className="text-xs text-gray-400 truncate">{preheader}</p>}
              </div>
              <iframe
                title="Email preview"
                srcDoc={previewSrc}
                sandbox="allow-same-origin"
                className="w-full bg-white rounded-b-xl border border-gray-200 mx-auto block"
                style={{ height: 560, maxWidth: previewSize === 'mobile' ? 390 : 660 }}
              />
            </div>
          </Card>
        </div>

        {/* Bottom Save button (mobile / long pages) */}
        <div className="flex justify-end">
          <Button onClick={save} disabled={loading || saveState === 'saving'}
                  className="bg-[#03374f] hover:bg-[#03374f]/90 text-white">
            {saveState === 'saving'
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4 mr-1.5" /> Save Template</>}
          </Button>
        </div>

      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   MERGE TAG MENU (above-editor convenience)
   ══════════════════════════════════════════════════════════════ */
function MergeTagMenu({ onPick }: { onPick: (tag: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="w-3.5 h-3.5 mr-1" /> Insert Tag
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {MERGE_TAGS.map((m) => (
          <DropdownMenuItem key={m.tag} onClick={() => onPick(m.tag)}>
            <span className="flex-1">{m.label}</span>
            <code className="text-[10px] text-gray-400 font-mono ml-3">{m.tag}</code>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
