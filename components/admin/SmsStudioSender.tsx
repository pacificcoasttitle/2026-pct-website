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

// ── Presets ────────────────────────────────────────────────────────
interface Preset {
  name: string
  desc: string
  width: number
  height: number
  icon: string
}

const PRESETS: Preset[] = [
  { name: 'Social Post',   desc: '1080 × 1080',   width: 1080, height: 1080, icon: '📱' },
  { name: 'Story / Reel',  desc: '1080 × 1920',   width: 1080, height: 1920, icon: '📸' },
  { name: 'Calendar',      desc: '920 × 1080',    width: 920,  height: 1080, icon: '📅' },
  { name: 'Flyer',         desc: '1080 × 1380',   width: 1080, height: 1380, icon: '📄' },
  { name: 'Postcard',      desc: '1875 × 1275',   width: 1875, height: 1275, icon: '🖼️' },
  { name: 'Custom',        desc: 'Any size',       width: 0,    height: 0,    icon: '✏️' },
]

type Mode = 'mms' | 'text'

interface Props { repCount: number }

interface UploadedImage {
  url: string; name: string; previewUrl: string; uploading: boolean; error?: string
}

interface SendResult {
  success?: boolean; total?: number; successful?: number; failed?: number; error?: string
  [key: string]: unknown
}

export function SmsStudioSender({ repCount }: Props) {
  const [mode, setMode] = useState<Mode>('mms')
  const [preset, setPreset] = useState<Preset>(PRESETS[0])
  const [message, setMessage] = useState("Here's your custom social media post!")
  const [sendToAll, setSendToAll] = useState(false)
  const [previewOnly, setPreviewOnly] = useState(true)
  const [testPhone, setTestPhone] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SendResult | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Upload ────────────────────────────────────────────────────
  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const previewUrl = URL.createObjectURL(file)
    setImages((prev) => [...prev, { url: '', name: file.name, previewUrl, uploading: true }])
    try {
      const form = new FormData(); form.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setImages((p) => p.map((img) => img.previewUrl === previewUrl ? { ...img, url: data.url, uploading: false } : img))
    } catch (err) {
      setImages((p) => p.map((img) => img.previewUrl === previewUrl ? { ...img, uploading: false, error: err instanceof Error ? err.message : 'Failed' } : img))
    }
  }

  function handleFiles(files: FileList | null) { if (files) Array.from(files).forEach(uploadFile) }

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true) }, [])
  const onDragLeave = useCallback(() => setDragging(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function removeImage(previewUrl: string) {
    URL.revokeObjectURL(previewUrl)
    setImages((p) => p.filter((img) => img.previewUrl !== previewUrl))
  }

  // ── Send ──────────────────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault(); setError(''); setResult(null)
    if (!message.trim()) { setError('Message text is required.'); return }
    if (mode === 'mms') {
      if (images.length === 0) { setError('Add at least one image for MMS.'); return }
      if (images.some((i) => i.uploading)) { setError('Wait for uploads to finish.'); return }
      if (images.some((i) => i.error)) { setError('Remove failed uploads.'); return }
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sms-studio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode, message, send_to_all: sendToAll, preview_mode: previewOnly,
          test_phone: testPhone || undefined,
          imageUrls: images.filter((i) => i.url).map((i) => i.url),
        }),
      })
      const data = (await res.json()) as SendResult
      if (!res.ok) { setError(String(data.error || 'Failed to send')); return }
      setResult(data)
    } catch { setError('Network error.') }
    finally { setLoading(false) }
  }

  const charCount = message.length
  const isMultiPart = charCount > 160
  const aspectRatio = preset.width && preset.height ? preset.width / preset.height : 1

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#f26b2b]" />
          <h2 className="text-lg font-bold text-[#03374f]">SMS Studio</h2>
        </div>
        <div className="flex items-center bg-[#f0ede9] rounded-xl p-1 gap-1">
          <button type="button" onClick={() => setMode('mms')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'mms' ? 'bg-[#03374f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <ImageIcon className="w-4 h-4" /> MMS
          </button>
          <button type="button" onClick={() => setMode('text')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'text' ? 'bg-[#03374f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <MessageSquare className="w-4 h-4" /> Text Only
          </button>
        </div>
      </div>

      <form onSubmit={handleSend} className="flex-1 flex flex-col">
        <div className="flex-1 flex divide-x divide-gray-100">

          {/* ═══════ LEFT PANEL: Presets + Image Canvas ═══════ */}
          {mode === 'mms' && (
            <div className="w-80 flex-shrink-0 flex flex-col bg-[#fafaf9] overflow-y-auto">
              {/* Presets */}
              <div className="p-4 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Piece Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p) => (
                    <button key={p.name} type="button" onClick={() => setPreset(p)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                        preset.name === p.name
                          ? 'bg-[#03374f] text-white shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}>
                      <span className="text-base">{p.icon}</span>
                      <div>
                        <p className={`text-xs font-semibold ${preset.name === p.name ? 'text-white' : 'text-[#03374f]'}`}>{p.name}</p>
                        <p className={`text-[10px] ${preset.name === p.name ? 'text-white/60' : 'text-gray-400'}`}>{p.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image canvas */}
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Image{images.length > 0 ? `s (${images.filter(i => i.url && !i.error).length}/${images.length})` : ''}
                </p>

                {/* Drop zone with aspect-ratio guide */}
                <div
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                  onClick={() => images.length === 0 && fileInputRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer flex-1 min-h-[200px] flex flex-col items-center justify-center ${
                    dragging ? 'border-[#f26b2b] bg-[#f26b2b]/5 scale-[1.01]' : images.length === 0 ? 'border-gray-200 bg-white hover:border-gray-300' : 'border-gray-200 bg-white'
                  }`}
                >
                  {images.length === 0 ? (
                    <div className="py-8 flex flex-col items-center gap-3 select-none">
                      {/* Aspect ratio indicator */}
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center" style={{
                        width: `${Math.min(180, 180 * (aspectRatio > 1 ? 1 : aspectRatio))}px`,
                        height: `${Math.min(180, 180 / (aspectRatio < 1 ? 1 : aspectRatio))}px`,
                      }}>
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                          <p className="text-[10px] text-gray-400 font-medium">{preset.desc}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-600">Drop images here</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, GIF · max 10 MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full p-3">
                      <div className="grid grid-cols-2 gap-2">
                        {images.map((img) => (
                          <div key={img.previewUrl}
                            className="relative rounded-lg overflow-hidden bg-gray-100 group"
                            style={{ aspectRatio: preset.width && preset.height ? `${preset.width}/${preset.height}` : '1/1' }}
                          >
                            <img src={img.previewUrl} alt={img.name}
                              className={`w-full h-full object-cover ${img.uploading ? 'opacity-40' : 'opacity-100'}`} />
                            {img.uploading && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-[#03374f] animate-spin" />
                              </div>
                            )}
                            {img.error && (
                              <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center flex-col gap-1">
                                <AlertCircle className="w-4 h-4 text-red-200" />
                                <p className="text-[9px] text-red-200 px-1 text-center">{img.error}</p>
                              </div>
                            )}
                            {!img.uploading && (
                              <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(img.previewUrl) }}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {/* Add more tile */}
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
                          style={{ aspectRatio: preset.width && preset.height ? `${preset.width}/${preset.height}` : '1/1' }}>
                          <Upload className="w-4 h-4" />
                          <span className="text-[10px] font-medium">Add more</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => handleFiles(e.target.files)} />
              </div>
            </div>
          )}

          {/* ═══════ CENTER PANEL: Message Compose ═══════ */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-6 flex-1 space-y-5">
              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#03374f]">Message</label>
                  <span className={`text-xs font-medium ${isMultiPart ? 'text-amber-600' : 'text-gray-400'}`}>
                    {charCount}/160{isMultiPart ? ' (multi-part SMS)' : ''}
                  </span>
                </div>
                <textarea
                  rows={mode === 'text' ? 10 : 6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 resize-none leading-relaxed"
                  placeholder="Type your message…"
                />
              </div>

              {/* Send settings */}
              <div className="bg-[#f8f6f3] rounded-xl p-5 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Send Settings</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={sendToAll} onChange={(e) => setSendToAll(e.target.checked)} disabled={mode === 'text'}
                      className="w-5 h-5 mt-0.5 rounded accent-[#f26b2b]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Send to all reps</p>
                      <p className="text-xs text-gray-400">{repCount} reps · same content for everyone</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={previewOnly} onChange={(e) => setPreviewOnly(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded accent-[#f26b2b]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Preview mode</p>
                      <p className="text-xs text-gray-400">Logs the send without delivering SMS</p>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Test Phone <span className="text-gray-400 font-normal">(optional — overrides recipients)</span>
                  </label>
                  <div className="relative max-w-xs">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="+18186965791"
                      className="w-full h-10 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT PANEL: Phone Preview ═══════ */}
          <div className="w-80 flex-shrink-0 bg-[#f0ede9] flex flex-col items-center justify-start p-6 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 self-start">Phone Preview</p>

            {/* Phone frame */}
            <div className="w-[260px] bg-[#1c1c1e] rounded-[2.5rem] p-3 shadow-xl">
              {/* Notch */}
              <div className="w-24 h-5 bg-[#1c1c1e] rounded-full mx-auto mb-2 relative">
                <div className="w-16 h-3.5 bg-black rounded-full absolute top-0.5 left-1/2 -translate-x-1/2" />
              </div>
              {/* Screen */}
              <div className="bg-[#f2f2f7] rounded-[1.8rem] overflow-hidden min-h-[380px] flex flex-col">
                {/* Status bar */}
                <div className="bg-[#f2f2f7] px-5 pt-2 pb-1 flex items-center justify-between text-[9px] font-semibold text-gray-600">
                  <span>PCT</span>
                  <span>iMessage</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {/* Messages */}
                <div className="flex-1 p-3 flex flex-col justify-end gap-2">
                  {mode === 'mms' && images[0] && (
                    <div className="self-start max-w-[90%]">
                      <img src={images[0].previewUrl} alt="Preview"
                        className="rounded-2xl object-cover"
                        style={{
                          maxHeight: '180px',
                          aspectRatio: preset.width && preset.height ? `${preset.width}/${preset.height}` : undefined,
                        }} />
                    </div>
                  )}
                  {message && (
                    <div className="self-start max-w-[90%]">
                      <div className="bg-[#e5e5ea] text-black text-xs rounded-2xl rounded-bl-md px-3.5 py-2.5 leading-relaxed">
                        {message}
                      </div>
                    </div>
                  )}
                  {!message && !images[0] && (
                    <p className="text-[10px] text-gray-400 text-center py-8">Your message will preview here</p>
                  )}
                </div>
                {/* Input bar */}
                <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-gray-100 rounded-full" />
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Send className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              {/* Home indicator */}
              <div className="w-24 h-1 bg-gray-400 rounded-full mx-auto mt-2" />
            </div>

            {/* Mode badge */}
            <div className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold ${previewOnly ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              {previewOnly ? '⚠️ Preview Mode ON' : '🔴 LIVE Mode'}
              {testPhone && <span className="ml-1 text-gray-500">· {testPhone}</span>}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center gap-4">
          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{error}</span>
              <button type="button" onClick={() => setError('')} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {result && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 flex-1">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{result.successful ?? 0} sent · {result.failed ?? 0} failed</span>
              <button type="button" onClick={() => setResult(null)} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {!error && !result && <div className="flex-1" />}

          {/* Clear */}
          {(images.length > 0 || result) && (
            <button type="button" onClick={() => { setImages([]); setResult(null); setError('') }}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          {/* Send */}
          <button type="submit" disabled={loading}
            className="h-12 px-8 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center gap-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              : <><Send className="w-4 h-4" /> {mode === 'mms' ? 'Send MMS Campaign' : 'Send Text Campaign'}</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
