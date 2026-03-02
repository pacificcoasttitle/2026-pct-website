"use client"

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Mail, Plus, Save } from 'lucide-react'

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

export function MarketingStudioClient({ audiences }: Props) {
  const [tab, setTab] = useState<Tab>('templates')
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
  }, [selectedTemplate])

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
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetTemplate}
                  className="h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  New Blank Template
                </button>
              </div>
            </div>

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

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Live Preview</p>
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="Template preview" className="w-full max-h-52 object-cover rounded-lg border border-gray-200 mb-3" />
              ) : null}
              <iframe title="Email Preview" className="w-full h-72 rounded-lg border border-gray-200 bg-white" srcDoc={html} />
            </div>

            <button
              type="button"
              onClick={saveTemplate}
              disabled={saving}
              className="h-11 px-5 rounded-xl bg-[#03374f] text-white text-sm font-semibold hover:bg-[#03374f]/90 disabled:opacity-60"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Saving...</> : <><Save className="w-4 h-4 inline mr-1" />Save Template</>}
            </button>
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

