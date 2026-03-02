"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  Mail,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Wand2,
} from 'lucide-react'

interface AudienceOption {
  slug: string
  name: string
  audienceId: string
}

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

interface Props {
  audiences: AudienceOption[]
}

type Tab = 'templates' | 'campaigns' | 'history'
type PreviewMode = 'desktop' | 'mobile'

export function MarketingStudioClient({ audiences }: Props) {
  const [tab, setTab] = useState<Tab>('templates')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [history, setHistory] = useState<CampaignLog[]>([])

  const [templateId, setTemplateId] = useState<number | ''>('')
  const [templateName, setTemplateName] = useState('')
  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [html, setHtml] = useState('<h1>Hello from Pacific Coast Title</h1><p>Replace this content.</p>')

  const [campaignName, setCampaignName] = useState('')
  const [campaignAudience, setCampaignAudience] = useState('')
  const [fromName, setFromName] = useState('Pacific Coast Title')
  const [replyTo, setReplyTo] = useState('info@pct.com')
  const [sendNow, setSendNow] = useState(false)
  const [lastEditUrl, setLastEditUrl] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loadedDraft, setLoadedDraft] = useState(false)

  const DRAFT_KEY = 'pct-marketing-studio-draft-v1'

  async function loadStudio() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/marketing/studio')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load studio data')
      setTemplates(data.templates || [])
      setHistory(data.campaigns || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudio()
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
    setImageUrls([])
  }, [selectedTemplate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    try {
      const d = JSON.parse(raw) as {
        templateName?: string
        subject?: string
        preheader?: string
        thumbnailUrl?: string
        html?: string
        imageUrls?: string[]
      }
      if (d.templateName) setTemplateName(d.templateName)
      if (d.subject) setSubject(d.subject)
      if (d.preheader) setPreheader(d.preheader)
      if (d.thumbnailUrl) setThumbnailUrl(d.thumbnailUrl)
      if (d.html) setHtml(d.html)
      if (Array.isArray(d.imageUrls)) setImageUrls(d.imageUrls)
      setLoadedDraft(true)
    } catch {
      // ignore malformed draft
    }
  }, [])

  async function saveTemplate() {
    setSaving(true)
    setError('')
    setOk('')
    try {
      const res = await fetch('/api/admin/marketing/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-template',
          id: templateId || undefined,
          name: templateName,
          subject,
          preheader,
          thumbnail_url: thumbnailUrl,
          html_content: html,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save template')
      setOk('Template saved.')
      await loadStudio()
      if (data.template?.id) setTemplateId(data.template.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function createCampaign() {
    setSending(true)
    setError('')
    setOk('')
    try {
      const res = await fetch('/api/admin/marketing/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-campaign',
          campaignName,
          audienceId: campaignAudience,
          subject,
          html_content: html,
          templateId: templateId || undefined,
          fromName,
          replyTo,
          sendNow,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign')
      setOk(sendNow ? 'Campaign sent.' : 'Campaign draft created.')
      setLastEditUrl(String(data.editUrl || ''))
      await loadStudio()
      setTab('history')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create campaign')
    } finally {
      setSending(false)
    }
  }

  function resetTemplate() {
    setTemplateId('')
    setTemplateName('')
    setSubject('')
    setPreheader('')
    setThumbnailUrl('')
    setHtml('<h1>Hello from Pacific Coast Title</h1><p>Replace this content.</p>')
    setImageUrls([])
  }

  function saveLocalDraft() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        templateName,
        subject,
        preheader,
        thumbnailUrl,
        html,
        imageUrls,
      })
    )
    setOk('Local draft saved in this browser.')
  }

  function clearLocalDraft() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(DRAFT_KEY)
    setLoadedDraft(false)
    setOk('Local draft cleared.')
  }

  function addImageUrl() {
    const url = imageUrlInput.trim()
    if (!url) return
    if (imageUrls.includes(url)) {
      setImageUrlInput('')
      return
    }
    setImageUrls((prev) => [...prev, url])
    setImageUrlInput('')
  }

  function insertImageTag(url: string) {
    setHtml((prev) => `${prev}\n\n<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;" />`)
  }

  function applyStarterTemplate(kind: 'newsletter' | 'market') {
    const isNewsletter = kind === 'newsletter'
    setHtml(
      isNewsletter
        ? `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f8f6f3;padding:24px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
      <tr><td style="background:#03374f;color:#fff;padding:24px;font-size:22px;font-weight:700;">Pacific Coast Title Update</td></tr>
      <tr><td style="padding:24px;color:#1f2937;">
        <h2 style="margin:0 0 12px;">Hello from your PCT team</h2>
        <p style="margin:0 0 16px;">Add this week's market insight, key updates, and a clear CTA.</p>
        <a href="https://www.pct.com" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#f26b2b;color:#fff;text-decoration:none;">Visit PCT</a>
      </td></tr>
    </table>
  </td></tr>
</table>`
        : `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f8f6f3;padding:24px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
      <tr><td style="background:#03374f;color:#fff;padding:24px;font-size:22px;font-weight:700;">Monthly Market Snapshot</td></tr>
      <tr><td style="padding:24px;color:#1f2937;">
        <p style="margin:0 0 12px;"><strong>Inventory:</strong> Add your local trend</p>
        <p style="margin:0 0 12px;"><strong>Rates:</strong> Add your update</p>
        <p style="margin:0 0 16px;"><strong>Opportunity:</strong> Add your CTA</p>
      </td></tr>
    </table>
  </td></tr>
</table>`
    )
    setOk(`Loaded ${isNewsletter ? 'newsletter' : 'market snapshot'} starter template.`)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-sm text-gray-500 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading marketing studio...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#f26b2b]" />
          <h2 className="font-semibold text-[#03374f] text-sm">Marketing Studio</h2>
        </div>
        <div className="flex items-center gap-2">
          {(['templates', 'campaigns', 'history'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === t ? 'bg-[#03374f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'templates' ? 'Templates' : t === 'campaigns' ? 'Campaign Builder' : 'History'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {ok && (
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{ok}</span>
          </div>
        )}

        {tab === 'templates' && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Saved Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm"
                >
                  <option value="">New template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2 flex-wrap">
                <button type="button" onClick={resetTemplate} className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100">
                  <Plus className="w-4 h-4 inline mr-1" />
                  New Blank
                </button>
                <button type="button" onClick={() => applyStarterTemplate('newsletter')} className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100">
                  <Wand2 className="w-4 h-4 inline mr-1" />
                  Newsletter Starter
                </button>
                <button type="button" onClick={() => applyStarterTemplate('market')} className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100">
                  <Wand2 className="w-4 h-4 inline mr-1" />
                  Market Starter
                </button>
              </div>
            </div>

            {templates.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Template Library</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.slice(0, 9).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      className={`text-left rounded-xl border transition-all overflow-hidden ${
                        templateId === t.id
                          ? 'border-[#03374f] ring-2 ring-[#03374f]/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-24 bg-gray-100">
                        {t.thumbnail_url ? (
                          <img src={t.thumbnail_url} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No thumbnail</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-[#03374f] text-sm truncate">{t.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(t.updated_at).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Template Name</label>
                <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preheader</label>
                <input value={preheader} onChange={(e) => setPreheader(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thumbnail URL</label>
                <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">HTML Content</label>
              <textarea value={html} onChange={(e) => setHtml(e.target.value)} rows={14} className="w-full px-4 py-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm font-mono" />
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Image Blocks</p>
              <div className="flex items-center gap-2">
                <input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste image URL and click Add"
                  className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm"
                />
                <button type="button" onClick={addImageUrl} className="h-10 px-3 rounded-lg bg-[#03374f] text-white text-sm font-semibold">Add</button>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {imageUrls.map((url) => (
                    <div key={url} className="rounded-lg border border-gray-200 bg-white p-2 space-y-2">
                      <img src={url} alt="Block preview" className="w-full h-20 object-cover rounded-md" />
                      <div className="flex items-center justify-between gap-2">
                        <button type="button" onClick={() => insertImageTag(url)} className="text-xs px-2 py-1 rounded bg-[#f26b2b] text-white">Insert</button>
                        <button type="button" onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-2 py-1 rounded text-xs ${previewMode === 'desktop' ? 'bg-[#03374f] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                  >
                    <Monitor className="w-3 h-3 inline mr-1" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-2 py-1 rounded text-xs ${previewMode === 'mobile' ? 'bg-[#03374f] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                  >
                    <Smartphone className="w-3 h-3 inline mr-1" /> Mobile
                  </button>
                </div>
              </div>
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="Template preview" className="w-full max-h-52 object-cover rounded-lg border border-gray-200 mb-3" />
              ) : null}
              <div className={`${previewMode === 'mobile' ? 'max-w-[390px] mx-auto' : 'w-full'}`}>
                <iframe
                  title="Email Preview"
                  className="w-full h-72 rounded-lg border border-gray-200 bg-white"
                  srcDoc={html}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={saveTemplate} disabled={saving} className="h-11 px-5 rounded-xl bg-[#03374f] text-white text-sm font-semibold hover:bg-[#03374f]/90 disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Saving...</> : <><Save className="w-4 h-4 inline mr-1" />Save Template</>}
              </button>
              <button type="button" onClick={saveLocalDraft} className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100">
                <Eye className="w-4 h-4 inline mr-1" /> Save Local Draft
              </button>
              <button type="button" onClick={clearLocalDraft} className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100">
                Clear Draft
              </button>
              {loadedDraft && <span className="text-xs text-amber-600">Loaded local draft</span>}
            </div>
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Campaign Name</label>
                <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Audience / Rep</label>
                <select value={campaignAudience} onChange={(e) => setCampaignAudience(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm">
                  <option value="">Select an audience</option>
                  {audiences.map((a) => (
                    <option key={`${a.slug}-${a.audienceId}`} value={a.audienceId}>{a.name} ({a.audienceId})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">From Name</label>
                <input value={fromName} onChange={(e) => setFromName(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reply-To Email</label>
                <input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)} className="w-4 h-4 rounded accent-[#f26b2b]" />
              Send immediately (otherwise create draft)
            </label>

            <button
              type="button"
              onClick={createCampaign}
              disabled={sending}
              className="h-11 px-5 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#e05d1e] disabled:opacity-60"
            >
              {sending ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Processing...</> : 'Create Campaign'}
            </button>

            {lastEditUrl ? (
              <a href={lastEditUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-[#f26b2b] hover:underline">
                Open campaign in Mailchimp <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>
        )}

        {tab === 'history' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Date</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Campaign</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Audience</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-500">{new Date(h.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-[#03374f]">{h.name}</p>
                      <p className="text-xs text-gray-400">{h.subject}</p>
                    </td>
                    <td className="px-3 py-2 text-gray-500 font-mono text-xs">{h.audience_id || '—'}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{h.status}</span>
                    </td>
                    <td className="px-3 py-2">
                      {h.mailchimp_web_id ? (
                        <a
                          href={`https://us1.admin.mailchimp.com/campaigns/edit?id=${h.mailchimp_web_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#f26b2b] hover:underline text-xs inline-flex items-center gap-1"
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-400 text-sm">No campaigns yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

