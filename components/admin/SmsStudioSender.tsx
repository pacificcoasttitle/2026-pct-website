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

// ── 3 Presets ─────────────────────────────────────────────────────
interface Preset { name: string; desc: string; width: number; height: number; icon: string }

const PRESETS: Preset[] = [
  { name: 'Social Post', desc: '1080 × 1080', width: 1080, height: 1080, icon: '📱' },
  { name: 'Landscape',   desc: '1920 × 1080', width: 1920, height: 1080, icon: '🖥️' },
  { name: 'US Letter',   desc: '8.5″ × 11″',  width: 2550, height: 3300, icon: '📄' },
]

type Mode = 'mms' | 'text'

interface Props { repCount: number }
interface UploadedImage { url: string; name: string; previewUrl: string; uploading: boolean; error?: string }
interface SendResult { success?: boolean; total?: number; successful?: number; failed?: number; error?: string; [key: string]: unknown }

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
  const readyImages = images.filter((i) => i.url && !i.error)

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
      if (images.some((i) => i.error)) { setError('Remove failed uploads first.'); return }
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

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden min-h-[640px] flex flex-col">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#f26b2b]" />
          <h2 className="text-lg font-bold text-[#03374f]">SMS Studio</h2>
          <span className="text-xs text-gray-400">{repCount} reps</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Presets (inline, compact) */}
          {mode === 'mms' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Size:</span>
              {PRESETS.map((p) => (
                <button key={p.name} type="button" onClick={() => setPreset(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    preset.name === p.name
                      ? 'bg-[#03374f] text-white shadow-sm'
                      : 'bg-[#f0ede9] text-gray-600 hover:bg-gray-200'
                  }`}>
                  <span>{p.icon}</span> {p.name}
                </button>
              ))}
            </div>
          )}
          {/* Mode toggle */}
          <div className="flex items-center bg-[#f0ede9] rounded-xl p-1 gap-1">
            <button type="button" onClick={() => setMode('mms')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'mms' ? 'bg-[#03374f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <ImageIcon className="w-4 h-4" /> MMS
            </button>
            <button type="button" onClick={() => setMode('text')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'text' ? 'bg-[#03374f] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <MessageSquare className="w-4 h-4" /> Text
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSend} className="flex-1 flex flex-col">
        <div className="flex-1 flex divide-x divide-gray-100">

          {/* ═══════ LEFT: Compose + Drop Zone ═══════ */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <div className="p-6 space-y-5 flex-1">

              {/* Message textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-[#03374f]">Message</label>
                  <span className={`text-xs font-medium ${isMultiPart ? 'text-amber-600' : 'text-gray-400'}`}>
                    {charCount}/160{isMultiPart ? ' (multi-part)' : ''}
                  </span>
                </div>
                <textarea
                  rows={mode === 'text' ? 8 : 4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 resize-none leading-relaxed"
                  placeholder="Type your message…"
                />
              </div>

              {/* ── Drag & Drop + Image Grid (MMS only) ── */}
              {mode === 'mms' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-[#03374f]">
                      Images
                      {readyImages.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-400">
                          {readyImages.length} uploaded · {preset.desc}
                        </span>
                      )}
                    </label>
                    {images.length > 0 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#f26b2b] hover:underline font-semibold">+ Add more</button>
                    )}
                  </div>

                  {/* Drop zone */}
                  <div
                    onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                    onClick={() => images.length === 0 && fileInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed transition-all ${
                      dragging
                        ? 'border-[#f26b2b] bg-[#f26b2b]/5 scale-[1.005]'
                        : images.length === 0
                          ? 'border-gray-200 bg-[#f8f6f3] hover:border-gray-300 cursor-pointer'
                          : 'border-gray-200 bg-[#f8f6f3]'
                    }`}
                  >
                    {images.length === 0 ? (
                      /* Empty state */
                      <div className="py-12 flex flex-col items-center gap-3 select-none">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                          <Upload className="w-7 h-7 text-gray-300" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-600">Drop images here</p>
                          <p className="text-xs text-gray-400 mt-1">Upload one image per rep · {preset.desc} · JPG, PNG, GIF</p>
                        </div>
                      </div>
                    ) : (
                      /* Image grid — 4 columns for up to 8+ images */
                      <div className="p-3">
                        <div className="grid grid-cols-4 gap-2">
                          {images.map((img) => (
                            <div key={img.previewUrl}
                              className="relative rounded-lg overflow-hidden bg-gray-100 group border border-gray-200"
                              style={{ aspectRatio: `${preset.width}/${preset.height}` }}
                            >
                              <img src={img.previewUrl} alt={img.name}
                                className={`w-full h-full object-cover transition-opacity ${img.uploading ? 'opacity-40' : 'opacity-100'}`} />
                              {/* Uploading spinner */}
                              {img.uploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="w-5 h-5 text-[#03374f] animate-spin" />
                                </div>
                              )}
                              {/* Error */}
                              {img.error && (
                                <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center gap-1">
                                  <AlertCircle className="w-4 h-4 text-red-200" />
                                  <p className="text-[8px] text-red-200 px-2 text-center leading-tight">{img.error}</p>
                                </div>
                              )}
                              {/* Filename overlay */}
                              {!img.uploading && !img.error && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                                  <p className="text-[9px] text-white truncate">{img.name}</p>
                                </div>
                              )}
                              {/* Remove button */}
                              {!img.uploading && (
                                <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(img.previewUrl) }}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => handleFiles(e.target.files)} />
                </div>
              )}

              {/* ── Send Settings ── */}
              <div className="bg-[#f8f6f3] rounded-xl p-5 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Send Settings</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={sendToAll} onChange={(e) => setSendToAll(e.target.checked)} disabled={mode === 'text'}
                      className="w-5 h-5 mt-0.5 rounded accent-[#f26b2b]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Send to all reps</p>
                      <p className="text-xs text-gray-400">{repCount} reps · same content</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={previewOnly} onChange={(e) => setPreviewOnly(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded accent-[#f26b2b]" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Preview mode</p>
                      <p className="text-xs text-gray-400">Logs without delivering SMS</p>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Test Phone <span className="text-gray-400 font-normal">(optional)</span>
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

          {/* ═══════ RIGHT: Phone Preview ═══════ */}
          <div className="w-[320px] flex-shrink-0 bg-[#f0ede9] flex flex-col items-center justify-start p-6 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 self-start">Phone Preview</p>

            {/* iPhone frame */}
            <div className="w-[260px] bg-[#1c1c1e] rounded-[2.5rem] p-3 shadow-xl">
              <div className="w-24 h-5 bg-[#1c1c1e] rounded-full mx-auto mb-2 relative">
                <div className="w-16 h-3.5 bg-black rounded-full absolute top-0.5 left-1/2 -translate-x-1/2" />
              </div>
              <div className="bg-[#f2f2f7] rounded-[1.8rem] overflow-hidden min-h-[380px] flex flex-col">
                <div className="bg-[#f2f2f7] px-5 pt-2 pb-1 flex items-center justify-between text-[9px] font-semibold text-gray-600">
                  <span>PCT</span>
                  <span>iMessage</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex-1 p-3 flex flex-col justify-end gap-2">
                  {mode === 'mms' && images[0] && (
                    <div className="self-start max-w-[90%]">
                      <img src={images[0].previewUrl} alt="Preview"
                        className="rounded-2xl object-cover"
                        style={{
                          maxHeight: '180px',
                          aspectRatio: `${preset.width}/${preset.height}`,
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
                    <p className="text-[10px] text-gray-400 text-center py-8">Preview will appear here</p>
                  )}
                </div>
                <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 h-6 bg-gray-100 rounded-full" />
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Send className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="w-24 h-1 bg-gray-400 rounded-full mx-auto mt-2" />
            </div>

            {/* Mode badge */}
            <div className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold ${previewOnly ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
              {previewOnly ? '⚠️ Preview Mode ON' : '🔴 LIVE Mode'}
              {testPhone && <span className="ml-1 text-gray-500">· {testPhone}</span>}
            </div>

            {/* Image count summary */}
            {mode === 'mms' && images.length > 0 && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500 font-medium">{readyImages.length} of {images.length} ready</p>
                {images.some((i) => i.uploading) && <p className="text-[10px] text-blue-500 mt-0.5">Uploading…</p>}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center gap-4">
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

          {(images.length > 0 || result) && (
            <button type="button" onClick={() => { setImages([]); setResult(null); setError('') }}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}

          <button type="submit" disabled={loading}
            className="h-12 px-8 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:opacity-60 text-white font-bold rounded-xl transition-all flex items-center gap-2 flex-shrink-0">
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
