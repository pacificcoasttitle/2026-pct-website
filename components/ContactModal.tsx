"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Loader2, CheckCircle, Phone, Mail } from "lucide-react"

export type ContactType = "escrow" | "general"

interface ContactModalProps {
  open: boolean
  onClose: () => void
  defaultType?: ContactType
  /** Pre-fill subject context shown in the header (e.g. "Talk to an Escrow Officer") */
  title?: string
}

export function ContactModal({ open, onClose, defaultType = "general", title }: ContactModalProps) {
  const [name,    setName]    = useState("")
  const [email,   setEmail]   = useState("")
  const [phone,   setPhone]   = useState("")
  const [message, setMessage] = useState("")
  const [type,    setType]    = useState<ContactType>(defaultType)
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error,   setError]   = useState("")
  const nameRef = useRef<HTMLInputElement>(null)

  // Reset when opened
  useEffect(() => {
    if (open) {
      setType(defaultType)
      setStatus("idle")
      setError("")
      setTimeout(() => nameRef.current?.focus(), 60)
    }
  }, [open, defaultType])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.")
      return
    }
    setStatus("loading")
    setError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, type }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong."); setStatus("error"); return }
      setStatus("success")
      setName(""); setEmail(""); setPhone(""); setMessage("")
    } catch {
      setError("Network error. Please call us at (866) 724-1050.")
      setStatus("error")
    }
  }

  if (!open) return null

  const isEscrow   = type === "escrow"
  const toDisplay  = isEscrow ? "escrow@pct.com" : "info@pct.com"
  const headerText = title ?? (isEscrow ? "Contact an Escrow Officer" : "Contact Our Team")

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="bg-secondary px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{headerText}</h2>
            <p className="text-white/70 text-sm mt-0.5">
              We&apos;ll reply to <span className="text-primary font-medium">{toDisplay}</span> within one business day
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Type toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-5">
            <button
              type="button"
              onClick={() => setType("escrow")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                isEscrow ? "bg-secondary text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Escrow Inquiry
            </button>
            <button
              type="button"
              onClick={() => setType("general")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                !isEscrow ? "bg-secondary text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              General Inquiry
            </button>
          </div>

          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-secondary mb-2">Message Sent!</h3>
              <p className="text-gray-600 text-sm mb-1">
                Your message has been sent to <span className="font-medium">{toDisplay}</span>.
              </p>
              <p className="text-gray-500 text-sm">We&apos;ll be in touch within one business day.</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phone <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    type="tel"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={
                    isEscrow
                      ? "Tell us about your transaction — property address, escrow number, or any questions..."
                      : "How can we help you today?"
                  }
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              {(status === "error" || error) && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center gap-6 text-xs text-gray-500 border-t border-gray-100 pt-4">
          <a href="tel:+18667241050" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Phone className="w-3.5 h-3.5" /> (866) 724-1050
          </a>
          <a href="mailto:info@pct.com" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Mail className="w-3.5 h-3.5" /> info@pct.com
          </a>
        </div>
      </div>
    </div>
  )
}
