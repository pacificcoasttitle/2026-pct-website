"use client"

import { useCallback, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Phone,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

type Mode = 'mms' | 'text'

interface Props {
  repCount: number
}

interface UploadedImage {
  url: string
  name: string
  previewUrl: string // object URL for local preview before upload completes
  uploading: boolean
  error?: string
}

interface SendResult {
  success?: boolean
  total?: number
  successful?: number
  failed?: number
  error?: string
  [key: string]: unknown
}

export function SmsStudioSender({ repCount }: Props) {
  const [mode, setMode]           = useState<Mode>('mms')
  const [message, setMessage]     = useState("Here's your custom social media post!")
  const [sendToAll, setSendToAll] = useState(false)
  const [previewOnly, setPreviewOnly] = useState(true)
  const [testPhone, setTestPhone] = useState('')
  const [images, setImages]       = useState<UploadedImage[]>([])
  const [dragging, setDragging]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [result, setResult]       = useState<SendResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Upload a File ──────────────────────────────────────────────
  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const previewUrl = URL.createObjectURL(file)
    const id = `${Date.now()}-${Math.random()}`
    const placeholder: UploadedImage = { url: '', name: file.name, previewUrl, uploading: true }
    setImages((prev) => [...prev, placeholder])

    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setImages((prev) =>
        prev.map((img) =>
          img.previewUrl === previewUrl
            ? { ...img, url: data.url, uploading: false }
            : img
        )
      )
    } catch (err) {
      setImages((prev) =>
        prev.map((img) =>
          img.previewUrl === previewUrl
            ? { ...img, uploading: false, error: err instanceof Error ? err.message : 'Upload failed' }
            : img
        )
      )
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(uploadFile)
  }

  // ── Drag handlers ──────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback(() => setDragging(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function removeImage(previewUrl: string) {
    URL.revokeObjectURL(previewUrl)
    setImages((prev) => prev.filter((img) => img.previewUrl !== previewUrl))
  }

  // ── Send ───────────────────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!message.trim()) { setError('Message text is required.'); return }
    if (mode === 'mms') {
      if (images.length === 0) { setError('Add at least one image for MMS.'); return }
      if (images.some((img) => img.uploading)) { setError('Wait for all images to finish uploading.'); return }
      if (images.some((img) => img.error)) { setError('Remove failed uploads before sending.'); return }
    }

    const imageUrls = images.filter((img) => img.url).map((img) => img.url)

    setLoading(true)
    try {
      const res = await fetch('/api/admin/sms-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          message,
          send_to_all: sendToAll,
          preview_mode: previewOnly,
          test_phone: testPhone || undefined,
          imageUrls,
        }),
      })
      const data = (await res.json()) as SendResult
      if (!res.ok) { setError(String(data.error || 'Failed to send campaign')); return }
      setResult(data)
    } catch {
      setError('Network error while sending.')
    } finally {
      setLoading(false)
    }
  }

  const charCount = message.length
  const isOverLimit = charCount > 160

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#f26b2b]" />
          <h2 className="font-semibold text-[#03374f] text-sm">SMS Studio</h2>
        </div>
        {/* Mode selector */}
        <div className="flex items-center bg-[#f8f6f3] rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setMode('mms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'mms' ? 'bg-[#03374f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> MMS (with image)
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'text' ? 'bg-[#03374f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Text only
          </button>
        </div>
      </div>

      <form onSubmit={handleSend}>
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

          {/* ── LEFT: Compose ───────────────────────────────────── */}
          <div className="p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Message</label>
                <span className={`text-xs ${isOverLimit ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                  {charCount}/160{isOverLimit ? ' (multi-part)' : ''}
                </span>
              </div>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 resize-none"
                placeholder="Your message text…"
              />
            </div>

            {/* Image drop zone — MMS only */}
            {mode === 'mms' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Images</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#f26b2b] hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Browse files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => images.length === 0 && fileInputRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    dragging
                      ? 'border-[#f26b2b] bg-[#f26b2b]/5 scale-[1.01]'
                      : images.length === 0
                      ? 'border-gray-200 bg-[#f8f6f3] hover:border-gray-300'
                      : 'border-gray-200 bg-[#f8f6f3]'
                  }`}
                >
                  {images.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-3 select-none">
                      <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">Drop images here</p>
                        <p className="text-xs text-gray-400 mt-0.5">or click to browse · JPG, PNG, GIF · max 10 MB</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-3 grid grid-cols-3 gap-2"
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                    >
                      {images.map((img) => (
                        <div key={img.previewUrl} className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                          <img
                            src={img.previewUrl}
                            alt={img.name}
                            className={`w-full h-full object-cover transition-opacity ${img.uploading ? 'opacity-50' : 'opacity-100'}`}
                          />
                          {img.uploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                          )}
                          {img.error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-900/60">
                              <AlertCircle className="w-4 h-4 text-red-200" />
                            </div>
                          )}
                          {!img.uploading && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(img.previewUrl) }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      {/* Add more */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-[10px]">Add more</span>
                      </button>
                    </div>
                  )}
                </div>

                {images.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {images.filter((i) => i.url && !i.error).length} / {images.length} uploaded
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Settings + Preview ────────────────────────── */}
          <div className="p-6 space-y-5 flex flex-col">
            {/* Settings */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Send Settings</p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={sendToAll}
                        onChange={(e) => setSendToAll(e.target.checked)}
                        disabled={mode === 'text'}
                        className="w-4 h-4 rounded accent-[#f26b2b]"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Send to all reps</p>
                      <p className="text-xs text-gray-400">{repCount} reps · same image for everyone</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={previewOnly}
                        onChange={(e) => setPreviewOnly(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#f26b2b]"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Preview mode</p>
                      <p className="text-xs text-gray-400">Logs the send without delivering SMS</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Test Phone <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+18186965791"
                    className="w-full h-10 pl-9 pr-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40"
                  />
                </div>
              </div>
            </div>

            {/* Preview bubble */}
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview</p>
              <div className="rounded-xl bg-[#f8f6f3] border border-gray-100 p-4">
                <div className="max-w-[260px] mx-auto space-y-2">
                  {mode === 'mms' && images[0] && (
                    <img
                      src={images[0].previewUrl}
                      alt="Preview"
                      className="w-full rounded-xl object-cover max-h-40"
                    />
                  )}
                  {message && (
                    <div className="bg-[#03374f] text-white text-xs rounded-2xl rounded-tl-sm px-3 py-2 leading-relaxed">
                      {message}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 text-center">
                    {previewOnly ? '⚠️ Preview mode ON' : '🔴 Live mode'}
                    {testPhone ? ` · Test: ${testPhone}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {result && (
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    {result.successful ?? 0} sent · {result.failed ?? 0} failed
                  </p>
                  {result.error ? <p className="text-red-600 text-xs mt-0.5">{String(result.error)}</p> : null}
                </div>
              </div>
            )}

            {/* Send button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4" /> {mode === 'mms' ? 'Send MMS Campaign' : 'Send Text Campaign'}</>
              )}
            </button>

            {/* Clear button */}
            {(images.length > 0 || result) && (
              <button
                type="button"
                onClick={() => { setImages([]); setResult(null); setError('') }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
