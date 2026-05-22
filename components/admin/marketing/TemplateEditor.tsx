'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, Loader2, Tag, Image as ImageIcon,
  Monitor, Smartphone, ExternalLink, AlertCircle, Replace, Sparkles,
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
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  InlineAlert, TEMPLATE_CATEGORIES, sanitizeAiHtml,
} from './shared'
import { AiGenerateModal } from './AiGenerateModal'

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

/** Marker class added to the hero placeholder <img> inside the editor so
 *  we can find and replace it later via DOM query (not regex). */
const HERO_MARKER_CLASS = 'pct-hero-image'

interface Template {
  id:            number
  name:          string
  category:      string | null
  subject:       string
  preheader:     string | null
  html_content:  string
  thumbnail_url?: string | null
  created_at?:   string
  updated_at:    string
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

/* ── Hero placeholder swap helpers ─────────────────────────────
 * For each {{HERO_IMAGE}} occurrence we substitute an <img> tag carrying
 * BOTH a marker class (pct-hero-image) AND a data-hero="1" attribute.
 * On save we collapse every image with either marker back to the literal
 * {{HERO_IMAGE}} merge tag via DOMParser. Identity-based matching means
 * a real uploaded hero image still round-trips correctly regardless of
 * what its src happens to be (placeholder, R2 URL, etc.). */

/** HTML fragment used to introduce a new hero placeholder where the
 *  source template stored the merge tag as a text node (Case B). */
const HERO_IMG_HTML = `<img src="${HERO_PLACEHOLDER}" data-hero="1" class="${HERO_MARKER_CLASS}" alt="Hero image" style="max-width:100%;height:auto;display:block;margin:16px auto;cursor:pointer;" />`

/**
 * Convert a stored template's HTML into editor-ready HTML.
 *
 * The seed templates store the hero in two shapes:
 *
 *   Case A — merge tag as an entire src attribute:
 *     <img src="{{HERO_IMAGE}}" alt="Holiday Greeting" width="600" />
 *
 *   Case B — merge tag as a literal text node:
 *     <td>{{HERO_IMAGE}}</td>
 *
 * A naive .replace() of `{{HERO_IMAGE}}` with `<img …>` works for Case B
 * but produces nested <img> tags for Case A — browsers then unwrap them,
 * stripping attributes and leaving orphaned text. We use DOM parsing so
 * each case is handled in place without breaking surrounding markup.
 */
function prepareForEditor(html: string): string {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html
  }

  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body><div id="__pct_root">${html}</div></body></html>`,
    'text/html',
  )
  const root = doc.getElementById('__pct_root')
  if (!root) return html

  // Case A: rewrite the existing <img src="{{HERO_IMAGE}}"> in place so
  // every other attribute on that element (alt, width, height, style…)
  // is preserved.
  root.querySelectorAll('img').forEach((img) => {
    if (img.getAttribute('src') === '{{HERO_IMAGE}}') {
      img.setAttribute('src', HERO_PLACEHOLDER)
      img.setAttribute('data-hero', '1')
      img.classList.add(HERO_MARKER_CLASS)
    }
  })

  // Case B: literal {{HERO_IMAGE}} text node sitting outside any <img>.
  // Walk every text node, splice the placeholder text on the merge tag,
  // and insert a tagged <img> between the surrounding text fragments.
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  const textNodes: Text[] = []
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }
  for (const t of textNodes) {
    if (!t.textContent || !t.textContent.includes('{{HERO_IMAGE}}')) continue
    const parts = t.textContent.split('{{HERO_IMAGE}}')
    const frag  = doc.createDocumentFragment()
    parts.forEach((part, i) => {
      if (i > 0) {
        // Build the tagged hero <img> via a <template> so the HTML string
        // is parsed into a real element instead of escaped text.
        const tpl = doc.createElement('template')
        tpl.innerHTML = HERO_IMG_HTML
        const heroImg = tpl.content.firstChild
        if (heroImg) frag.appendChild(heroImg.cloneNode(true))
      }
      if (part) frag.appendChild(doc.createTextNode(part))
    })
    t.replaceWith(frag)
  }

  // Case C: already-uploaded hero image. Once a user saves a template
  // with a real hero, the markup contains a plain <img src="https://…">
  // (no merge tag, no data-hero attribute — those were stripped at save
  // to keep the email markup clean). On reload we re-tag the first
  // "hero-shaped" image so click-to-replace keeps working.
  //
  // Heuristic — skip known non-hero images: logos, rep photos, anything
  // narrower than 400px (probably an icon or a profile shot).
  const hasTaggedHero = root.querySelector('img[data-hero="1"]')
  if (!hasTaggedHero) {
    const candidates = Array.from(root.querySelectorAll('img'))
    for (const img of candidates) {
      const src = (img.getAttribute('src') || '').toLowerCase()
      const alt = (img.getAttribute('alt') || '').toLowerCase()
      const widthAttr = img.getAttribute('width') || ''
      const widthNum  = parseInt(widthAttr, 10)

      if (!src) continue
      if (src.includes('logo')) continue
      if (src.includes('{{rep_photo}}')) continue
      if (alt.includes('logo')) continue
      if (alt === '{{rep_name}}') continue
      if (widthAttr && Number.isFinite(widthNum) && widthNum < 400) continue

      img.setAttribute('data-hero', '1')
      img.classList.add(HERO_MARKER_CLASS)
      break // tag only the first matching image
    }
  }

  return root.innerHTML
}

/** Strip editor-only inline styles (placeholder dashed border / cursor
 *  / hover outline) from a style attribute string. Returns the cleaned
 *  style or an empty string if nothing remains. */
function stripEditorOnlyStyles(style: string): string {
  return style
    .replace(/border\s*:[^;]*;?/gi, '')
    .replace(/cursor\s*:[^;]*;?/gi, '')
    .replace(/outline[^:]*:[^;]*;?/gi, '')
    .replace(/transition\s*:[^;]*;?/gi, '')
    .replace(/;\s*;/g, ';')
    .trim()
}

/**
 * Convert editor HTML into save-ready HTML.
 *
 * Hero handling — we MUST distinguish between two cases:
 *
 *   1. Placeholder image still in place (src points at placehold.co) →
 *      the user never uploaded a hero, so collapse back to a
 *      `<img src="{{HERO_IMAGE}}">` tag whose other attrs are preserved.
 *      The merge tag is resolved per-campaign at send time.
 *
 *   2. Real uploaded image (src points at R2 / any non-placeholder URL) →
 *      KEEP the image as-is. We must NOT overwrite the user's uploaded
 *      hero with the merge tag — that was the previous bug that erased
 *      heroes on save. We only strip the editor-only markers
 *      (data-hero, pct-hero-image class, dashed-border styles) so the
 *      saved HTML is clean email markup.
 */
function prepareForSave(html: string): string {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html
  }
  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body><div id="__pct_root">${html}</div></body></html>`,
    'text/html',
  )
  const root = doc.getElementById('__pct_root')
  if (!root) return html

  const heroImages = Array.from(
    root.querySelectorAll(`img[data-hero="1"], img.${HERO_MARKER_CLASS}`),
  )

  heroImages.forEach((img) => {
    const src = img.getAttribute('src') || ''
    const isPlaceholder = src === HERO_PLACEHOLDER || src.includes('placehold.co')

    if (isPlaceholder) {
      // Placeholder — collapse to <img src="{{HERO_IMAGE}}"> preserving
      // useful attributes (alt, width, height, cleaned style) so the
      // template's wrapping shape survives round-tripping.
      const newImg = doc.createElement('img')
      newImg.setAttribute('src', '{{HERO_IMAGE}}')

      const alt    = img.getAttribute('alt')
      const width  = img.getAttribute('width')
      const height = img.getAttribute('height')
      const style  = img.getAttribute('style') || ''

      if (alt && alt !== 'Hero image' && alt !== 'Hero image placeholder') {
        newImg.setAttribute('alt', alt)
      }
      if (width)  newImg.setAttribute('width',  width)
      if (height) newImg.setAttribute('height', height)

      const cleanStyle = stripEditorOnlyStyles(style)
      if (cleanStyle) {
        newImg.setAttribute('style', cleanStyle)
      } else {
        newImg.setAttribute('style', 'display:block;width:100%;height:auto;')
      }

      img.replaceWith(newImg)
    } else {
      // Real uploaded image — keep src + most attrs, strip editor markers only.
      img.removeAttribute('data-hero')
      img.classList.remove(HERO_MARKER_CLASS)

      const style = img.getAttribute('style') || ''
      const cleanStyle = stripEditorOnlyStyles(style)
      if (cleanStyle) {
        img.setAttribute('style', cleanStyle)
      } else {
        img.removeAttribute('style')
      }
      if (img.classList.length === 0) {
        img.removeAttribute('class')
      }
    }
  })

  return root.innerHTML
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
  const router = useRouter()

  const [notFound, setNotFound]   = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState('')
  const [info,  setInfo]  = useState('')

  const [name,      setName]      = useState('')
  const [subject,   setSubject]   = useState('')
  const [preheader, setPreheader] = useState('')
  const [category,  setCategory]  = useState<string>('')

  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop')

  /* ── Race-free load: TWO ready signals + one effect that fires
        only when BOTH are true. ───────────────────────────────── */
  const [templateData, setTemplateData] = useState<Template | null>(null)
  const [tinyMceReady, setTinyMceReady] = useState(false)

  /* ── Dirty tracking ──────────────────────────────────────────── */
  const [isDirty, setIsDirty] = useState(false)
  const isLoadingRef = useRef(false)   // suppress change events / dirty during programmatic setContent

  /* ── Preview HTML (driven by TinyMCE change events, debounced) ── */
  const [previewHtml, setPreviewHtml] = useState('')
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Preview iframe content. We wrap previewHtml in an email-friendly
     shell so the iframe renders close to what an email client (and the
     TinyMCE editor itself) shows. Specifically:
       - Brand colors for headings + links
       - Off-white page background matching the admin shell
       - !important resets that hide editor-only decorations
         (dashed border, hover outline, pointer cursor) on the hero
         image so the preview never looks different from the email. */
  const previewSrc = useMemo(() => {
    const body = previewHtml.replace(/\{\{HERO_IMAGE\}\}/g, HERO_PLACEHOLDER)
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body {
    margin: 0;
    padding: 0;
    background: #f0ede9;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
    line-height: 1.5;
  }
  table { border-collapse: collapse; }
  img { max-width: 100%; height: auto; display: block; }
  a { color: #f26b2b; text-decoration: underline; }
  h1, h2, h3 { color: #03374f; margin-top: 0; }
  /* Hide editor-only decorations so preview matches the final email. */
  img.${HERO_MARKER_CLASS},
  img[data-hero="1"] {
    outline: none !important;
    border: none !important;
    cursor: default !important;
  }
</style>
</head>
<body>
${body}
</body>
</html>`
  }, [previewHtml])

  /* ── TinyMCE state ───────────────────────────────────────────── */
  const [tinyLoaded, setTinyLoaded] = useState(false)
  const editorInitialized = useRef(false)

  /* ── Upload state ────────────────────────────────────────────── */
  const uploadingRef = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [heroUploading, setHeroUploading] = useState(false)

  /* ── AI modal state ──────────────────────────────────────────── */
  const [aiModalOpen,  setAiModalOpen]  = useState(false)
  const [selectionText, setSelectionText] = useState('')

  /* Ref to the hero-replace function so TinyMCE's setup() callback —
     which runs exactly once — can call the latest version without
     capturing a stale closure. */
  const replaceHeroImageRef = useRef<(file: File) => Promise<void>>(async () => {})

  /* ══════════════════════════════════════════════════════════════
     LOAD template — new per-id endpoint, no race window.
     ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/marketing/studio/${templateId}`)
        if (res.status === 404) {
          if (!cancelled) setNotFound(true)
          return
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        if (cancelled) return
        const tpl: Template = data.template
        setName(tpl.name)
        setSubject(tpl.subject)
        setPreheader(tpl.preheader || '')
        setCategory(tpl.category || '')
        setPreviewHtml(tpl.html_content || '')
        setTemplateData(tpl)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      }
    })()
    return () => { cancelled = true }
  }, [templateId])

  /* ══════════════════════════════════════════════════════════════
     CONTENT SYNC — fires exactly when BOTH the template fetch and
     TinyMCE init have completed. Whichever finishes first, nothing
     happens until the other catches up. Deterministic.
     ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!tinyMceReady || !templateData) return
    const editor = getEditor()
    if (!editor) return

    isLoadingRef.current = true
    editor.setContent(prepareForEditor(templateData.html_content || ''))
    setPreviewHtml(editor.getContent())
    // Loading the template is not a "user edit" — keep isDirty false.
    setIsDirty(false)
    setTimeout(() => { isLoadingRef.current = false }, 300)
  }, [tinyMceReady, templateData])

  /* ══════════════════════════════════════════════════════════════
     INIT TinyMCE — once, after script loads and container is in DOM.
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
      menubar:  'file edit view insert format table',
      plugins:  'advlist autoresize autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
      toolbar:  'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | pctImage link | mergetag | table | code preview fullscreen',
      // Autoresize manages height — grows with content, bounded.
      min_height: 600,
      max_height: 1200,
      autoresize_overflow_padding: 16,
      autoresize_bottom_margin: 24,
      paste_as_text: true,
      paste_block_drop: false,
      table_default_styles: { 'border-collapse': 'collapse', width: '100%' },
      valid_styles: {
        '*': 'color,background-color,background,font-family,font-size,font-weight,font-style,text-align,text-decoration,line-height,padding,padding-top,padding-bottom,padding-left,padding-right,margin,margin-top,margin-bottom,margin-left,margin-right,border,border-top,border-bottom,border-left,border-right,border-collapse,border-color,border-width,border-style,border-radius,width,max-width,min-width,height,display,vertical-align,list-style-type,opacity,box-shadow,overflow,outline,outline-offset,outline-color,outline-width,outline-style,cursor,transition',
      },
      // Keep the hero marker class through TinyMCE's class sanitisation.
      valid_classes: { 'img': HERO_MARKER_CLASS },
      invalid_styles: { '*': 'position float clear' },
      // Allow data-hero (and the rest of the hero img attrs) past TinyMCE's filter.
      extended_valid_elements: `img[class|src|alt|style|width|height|data-hero]`,
      content_style: `
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; padding: 16px; max-width: 600px; margin: 0 auto; color: #333; }
        img  { max-width: 100%; height: auto; }
        img.${HERO_MARKER_CLASS} {
          outline: 2px dashed #d1d5db;
          outline-offset: 2px;
          transition: outline-color 0.2s, outline-width 0.2s;
          cursor: pointer;
        }
        img.${HERO_MARKER_CLASS}:hover {
          outline-color: #f26b2b;
          outline-width: 3px;
        }
        /* Once a real (R2-hosted) image is set, drop the dashed affordance. */
        img.${HERO_MARKER_CLASS}[src*="r2."],
        img.${HERO_MARKER_CLASS}[src*="r2-"],
        img.${HERO_MARKER_CLASS}[src*=".r2.dev"],
        img.${HERO_MARKER_CLASS}[src*="cloudflarestorage.com"] {
          outline: none;
          cursor: default;
        }
        table { border-collapse: collapse; width: 100%; }
        a { color: #f26b2b; }
      `,
      branding:    false,
      promotion:   false,
      skin:        'oxide',
      content_css: 'default',
      convert_urls: false,

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
            pickAndUploadImage(editor)
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

        // Click-to-replace affordance: clicking the hero <img> opens the
        // file picker and routes the selected file through the latest
        // replaceHeroImage handler (via ref to avoid stale closures).
        editor.on('click', (e: { target?: HTMLElement }) => {
          const t = e.target
          if (!t || t.tagName !== 'IMG') return
          const isHero =
            t.getAttribute('data-hero') === '1' ||
            t.classList?.contains(HERO_MARKER_CLASS)
          if (!isHero) return
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = () => {
            const file = input.files?.[0]
            if (file) replaceHeroImageRef.current(file)
          }
          input.click()
        })

        // Editor is ready — the content-sync effect will push template HTML in.
        editor.on('init', () => {
          setTinyMceReady(true)
        })

        // Debounce preview updates so live typing stays smooth.
        const schedulePreview = () => {
          if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
          previewTimerRef.current = setTimeout(() => {
            const ed = getEditor()
            if (ed) setPreviewHtml(ed.getContent())
          }, 500)
        }

        editor.on('change keyup undo redo SetContent', () => {
          // Initial load (and programmatic setContent) doesn't count as a user edit.
          if (isLoadingRef.current) return
          setIsDirty(true)
          schedulePreview()
        })
      },
    })

    // Standalone image-upload helper — TinyMCE button + Insert Image button share it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function pickAndUploadImage(editor: any) {
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
  const save = useCallback(async (): Promise<boolean> => {
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
      setIsDirty(false)
      setInfo('Template saved.')
      setTimeout(() => setSaveState((s) => s === 'saved' ? 'idle' : s), 1500)
      return true
    } catch (e) {
      setSaveState('error')
      setError(e instanceof Error ? e.message : 'Save failed')
      return false
    }
  }, [templateId, name, subject, preheader, category, previewHtml])

  /* ══════════════════════════════════════════════════════════════
     beforeunload guard — only attached while dirty.
     ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  /* ══════════════════════════════════════════════════════════════
     Convenience toolbar helpers
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
     REPLACE HERO IMAGE — DOM-targeted swap inside TinyMCE.

     Takes a File (so it can be called both from the toolbar button
     AND from the click-on-placeholder handler inside TinyMCE setup).

     If a hero <img> already exists (matched by data-hero or marker
     class), we mutate its src/attrs in place — NEVER insertContent,
     which would create a sibling. If none exists yet, we insert a
     new tagged <img> at the cursor as a one-time bootstrap.
     ══════════════════════════════════════════════════════════════ */
  const replaceHeroImage = useCallback(async (file: File): Promise<void> => {
    const ed = getEditor()
    if (!ed) return

    setHeroUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Upload failed: ${res.status}`)
      const url: string | undefined = data.url
      if (!url) throw new Error('No URL returned from upload')

      const body = ed.getBody() as HTMLElement | null
      const existing = body?.querySelector(
        `img[data-hero="1"], img.${HERO_MARKER_CLASS}`,
      ) as HTMLImageElement | null

      if (existing) {
        // In-place mutation — never insertContent here.
        existing.src = url
        existing.setAttribute('data-hero', '1')
        existing.classList.add(HERO_MARKER_CLASS)
        existing.setAttribute('alt', 'Hero image')
        existing.setAttribute(
          'style',
          'max-width:100%;height:auto;display:block;margin:16px auto;border-radius:8px;',
        )
      } else {
        // Bootstrap: no hero yet — insert one at the cursor.
        ed.focus()
        ed.insertContent(
          `<img src="${url}" data-hero="1" class="${HERO_MARKER_CLASS}" alt="Hero image" style="max-width:100%;height:auto;display:block;margin:16px auto;border-radius:8px;" />`,
        )
      }

      // Notify TinyMCE so dirty / preview / undo all update.
      ed.undoManager.add()
      ed.fire('change')

      try {
        ed.notificationManager.open({
          type: 'success',
          text: 'Hero image updated.',
          timeout: 2000,
        })
      } catch { /* ignore */ }
      setInfo('Hero image updated.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Hero upload failed'
      console.error('Hero replace failed:', e)
      try {
        ed.notificationManager.open({
          type: 'error',
          text: 'Failed to upload hero image. Please try again.',
          timeout: 4000,
        })
      } catch { /* ignore */ }
      setError(msg)
    } finally {
      setHeroUploading(false)
    }
  }, [])

  /* Keep the ref pointed at the latest replaceHeroImage so TinyMCE's
     setup-captured click handler always calls the current closure. */
  useEffect(() => {
    replaceHeroImageRef.current = replaceHeroImage
  }, [replaceHeroImage])

  /* ══════════════════════════════════════════════════════════════
     AI MODAL — open/insert helpers.
     ══════════════════════════════════════════════════════════════ */
  function openAiModal() {
    const ed = getEditor()
    const selected = ed?.selection?.getContent?.({ format: 'text' }) || ''
    setSelectionText(selected)
    setAiModalOpen(true)
  }

  function handleAiInsert(rawHtml: string, mode: 'insert' | 'rewrite') {
    const ed = getEditor()
    if (!ed) return
    const sanitized = sanitizeAiHtml(rawHtml)
    ed.focus()
    if (mode === 'rewrite' && selectionText) {
      ed.selection.setContent(sanitized)
    } else {
      ed.insertContent(sanitized)
    }
    // Notify TinyMCE so dirty / preview / undo all update.
    ed.undoManager.add()
    ed.fire('change')
    setAiModalOpen(false)
    setSelectionText('')
    try {
      ed.notificationManager.open({
        type: 'success',
        text: 'AI content inserted.',
        timeout: 2000,
      })
    } catch { /* ignore */ }
    setInfo('AI content inserted.')
  }

  /* File-picker wrapper for the toolbar button. */
  function pickAndReplaceHero() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) replaceHeroImage(file)
    }
    input.click()
  }

  /* ══════════════════════════════════════════════════════════════
     "Use in Campaign" with unsaved-changes guard.
     ══════════════════════════════════════════════════════════════ */
  const useInCampaignHref = `/admin/team/marketing/campaigns/new?templateId=${templateId}`
  const [campaignNavOpen, setCampaignNavOpen] = useState(false)
  const [navSaving, setNavSaving] = useState(false)

  function onUseInCampaignClick(e: React.MouseEvent) {
    if (isDirty) {
      e.preventDefault()
      setCampaignNavOpen(true)
    }
  }

  async function saveAndContinue() {
    setNavSaving(true)
    const ok = await save()
    setNavSaving(false)
    if (ok) {
      setCampaignNavOpen(false)
      router.push(useInCampaignHref)
    }
  }

  function discardAndContinue() {
    // Skip the beforeunload guard for this intentional navigation.
    setIsDirty(false)
    setCampaignNavOpen(false)
    // Defer so the state flush precedes the navigation.
    setTimeout(() => router.push(useInCampaignHref), 0)
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
  const contentReady   = tinyMceReady && !!templateData

  return (
    <>
      <Script
        src={`https://cdn.tiny.cloud/1/${TINYMCE_KEY}/tinymce/7/tinymce.min.js`}
        referrerPolicy="origin"
        strategy="afterInteractive"
        onReady={() => setTinyLoaded(true)}
      />

      <div className="space-y-4">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="sticky top-0 z-20 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-[#f0ede9]/95 backdrop-blur flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/admin/team/marketing/templates"
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#f26b2b]">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="h-5 w-px bg-gray-300" />
            <p className="text-sm">
              <span className="text-gray-400">Template:</span>{' '}
              <span className="font-semibold text-[#03374f]">{name || 'Untitled'}</span>
            </p>
            {/* Status pill — priority: saving > error > unsaved > saved */}
            {saveState === 'saving' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving…
              </span>
            )}
            {saveState !== 'saving' && saveState === 'error' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                ✗ Error
              </span>
            )}
            {saveState !== 'saving' && saveState !== 'error' && isDirty && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            )}
            {saveState === 'saved' && !isDirty && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                ✓ Saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={useInCampaignHref} onClick={onUseInCampaignClick}>
              <Button variant="outline" size="sm">
                Use in Campaign <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Button onClick={() => save()} disabled={!contentReady || saveState === 'saving'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ── Editor panel ─────────────────────────────────── */}
          <Card className="p-5 space-y-4">
            {!templateData ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-full bg-gray-200" />
                <Skeleton className="h-9 w-full bg-gray-200" />
                <Skeleton className="h-9 w-full bg-gray-200" />
                <Skeleton className="h-9 w-full bg-gray-200" />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="tpl-name" className="text-xs text-gray-500">Template Name</Label>
                  <Input id="tpl-name" value={name}
                         onChange={(e) => { setName(e.target.value); setIsDirty(true) }}
                         className="mt-1" />
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Category</Label>
                  <Select value={category || 'none'}
                          onValueChange={(v) => { setCategory(v === 'none' ? '' : v); setIsDirty(true) }}>
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
                  <Input id="tpl-subject" value={subject}
                         onChange={(e) => { setSubject(e.target.value); setIsDirty(true) }}
                         className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="tpl-preheader" className="text-xs text-gray-500">Preheader</Label>
                  <Input id="tpl-preheader" value={preheader}
                         onChange={(e) => { setPreheader(e.target.value); setIsDirty(true) }}
                         placeholder="Preview text shown in inbox…" className="mt-1" />
                </div>
              </div>
            )}

            {/* Convenience toolbar above TinyMCE */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
              <MergeTagMenu onPick={insertMergeTag} disabled={!contentReady} />
              <Button variant="outline" size="sm"
                      onClick={insertImagePrompt} disabled={uploading || !contentReady}>
                {uploading
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Uploading…</>
                  : <><ImageIcon className="w-3.5 h-3.5 mr-1" /> Insert Image</>}
              </Button>
              <Button variant="outline" size="sm"
                      onClick={pickAndReplaceHero}
                      disabled={heroUploading || !contentReady}
                      className="border-[#f26b2b]/30 text-[#f26b2b] hover:bg-[#f26b2b]/10 hover:text-[#f26b2b]">
                {heroUploading
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Uploading…</>
                  : <><Replace className="w-3.5 h-3.5 mr-1" /> Replace Hero Image</>}
              </Button>
              <Button variant="outline" size="sm"
                      onClick={openAiModal}
                      disabled={!contentReady}
                      className="border-[#03374f]/20 text-[#03374f] hover:bg-[#03374f]/5">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-[#f26b2b]" /> Create with AI
              </Button>
              <span className="text-[11px] text-gray-400 ml-auto hidden sm:inline">
                Tip: you can also drag images straight into the editor.
              </span>
            </div>

            {/* TinyMCE container — ALWAYS in the DOM. */}
            <div>
              <Label className="text-xs text-gray-500">Email Content</Label>
              <div className="mt-1 relative rounded-lg border border-gray-200 bg-white">
                <textarea id={EDITOR_ID} defaultValue="" style={{ visibility: 'hidden' }} />

                {/* Overlay skeleton until both fetch AND TinyMCE are ready. */}
                {!contentReady && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-3 p-6">
                    <div className="w-full max-w-md space-y-2">
                      <Skeleton className="h-6 w-3/4 bg-gray-200" />
                      <Skeleton className="h-4 w-full bg-gray-200" />
                      <Skeleton className="h-4 w-full bg-gray-200" />
                      <Skeleton className="h-4 w-5/6 bg-gray-200" />
                      <Skeleton className="h-40 w-full bg-gray-200 mt-3" />
                    </div>
                    <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading template…
                    </p>
                  </div>
                )}
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
          <Button onClick={() => save()} disabled={!contentReady || saveState === 'saving'}
                  className="bg-[#03374f] hover:bg-[#03374f]/90 text-white">
            {saveState === 'saving'
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4 mr-1.5" /> Save Template</>}
          </Button>
        </div>

      </div>

      {/* Create-with-AI modal */}
      <AiGenerateModal
        open={aiModalOpen}
        onClose={() => { setAiModalOpen(false); setSelectionText('') }}
        onInsert={handleAiInsert}
        hasSelection={selectionText.length > 0}
        selectedText={selectionText}
      />

      {/* Unsaved-changes nav guard for "Use in Campaign" */}
      <AlertDialog open={campaignNavOpen} onOpenChange={setCampaignNavOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits to this template. Save before continuing to the campaign wizard?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="outline"
                    onClick={discardAndContinue}
                    className="text-red-600 border-red-200 hover:bg-red-50">
              Discard changes
            </Button>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); saveAndContinue() }}
                               className="bg-[#03374f] hover:bg-[#03374f]/90 text-white"
                               disabled={navSaving}>
              {navSaving
                ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving…</>
                : 'Save & Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   MERGE TAG MENU (above-editor convenience)
   ══════════════════════════════════════════════════════════════ */
function MergeTagMenu({ onPick, disabled }: { onPick: (tag: string) => void; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
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
