"use client"

import { useMemo, useState } from 'react'
import { AlertCircle, Image as ImageIcon, Loader2, MessageSquare } from 'lucide-react'

type Mode = 'mms' | 'text'

interface Props {
  repCount: number
}

interface SmsStudioResult {
  success?: boolean
  total?: number
  successful?: number
  failed?: number
  error?: string
  [key: string]: unknown
}

export function SmsStudioSender({ repCount }: Props) {
  const [mode, setMode] = useState<Mode>('mms')
  const [message, setMessage] = useState("Here's your custom social media post!")
  const [sendToAll, setSendToAll] = useState(false)
  const [previewMode, setPreviewMode] = useState(true)
  const [testPhone, setTestPhone] = useState('')
  const [imageUrlsRaw, setImageUrlsRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SmsStudioResult | null>(null)

  const imageUrls = useMemo(
    () =>
      imageUrlsRaw
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean),
    [imageUrlsRaw]
  )

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!message.trim()) {
      setError('Message is required.')
      return
    }
    if (mode === 'mms' && imageUrls.length === 0) {
      setError('Add at least one image URL for MMS sends.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/sms-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          message,
          send_to_all: sendToAll,
          preview_mode: previewMode,
          test_phone: testPhone || undefined,
          imageUrls,
        }),
      })
      const data = (await res.json()) as SmsStudioResult
      if (!res.ok) {
        setError(String(data.error || 'Failed to send campaign'))
        return
      }
      setResult(data)
    } catch {
      setError('Network error while sending campaign.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[#f26b2b]" />
        <h2 className="font-semibold text-[#03374f] text-sm">SMS Studio Sender</h2>
      </div>

      <form onSubmit={handleSend} className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('mms')}
            className={`h-10 rounded-xl border text-sm font-semibold transition-colors ${
              mode === 'mms'
                ? 'bg-[#03374f] text-white border-[#03374f]'
                : 'bg-[#f8f6f3] text-gray-600 border-gray-200'
            }`}
          >
            MMS Batch
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`h-10 rounded-xl border text-sm font-semibold transition-colors ${
              mode === 'text'
                ? 'bg-[#03374f] text-white border-[#03374f]'
                : 'bg-[#f8f6f3] text-gray-600 border-gray-200'
            }`}
          >
            Text-only Batch
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40"
          />
        </div>

        {mode === 'mms' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Image URLs (one per line)
            </label>
            <textarea
              rows={4}
              value={imageUrlsRaw}
              onChange={(e) => setImageUrlsRaw(e.target.value)}
              placeholder="https://documents.pct.com/social/C-1_mar-april.png"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              If <strong>Send to all</strong> is OFF, filenames should include SMS code like
              {' '}<code className="bg-gray-100 px-1 rounded">C-28_post.jpg</code>.
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={sendToAll}
              onChange={(e) => setSendToAll(e.target.checked)}
              className="w-4 h-4 rounded accent-[#f26b2b]"
              disabled={mode === 'text'}
            />
            Send to all reps ({repCount})
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
              className="w-4 h-4 rounded accent-[#f26b2b]"
            />
            Preview mode
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Test Phone (optional)
          </label>
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="+18186965791"
            className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-gray-200 bg-[#f8f6f3] p-4 text-sm text-gray-700 space-y-1">
            <p className="font-semibold text-[#03374f]">Send complete</p>
            <p>Total: {typeof result.total === 'number' ? result.total : '—'}</p>
            <p>Successful: {typeof result.successful === 'number' ? result.successful : '—'}</p>
            <p>Failed: {typeof result.failed === 'number' ? result.failed : '—'}</p>
            {result.error ? <p className="text-red-600">Error: {String(result.error)}</p> : null}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : mode === 'mms' ? (
            <>
              <ImageIcon className="w-4 h-4" />
              Send MMS Campaign
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              Send Text Campaign
            </>
          )}
        </button>
      </form>
    </div>
  )
}

