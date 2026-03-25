'use client'

import {
  createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode,
} from 'react'
import { Sparkles } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface TessaContextType {
  messages: Message[]
  isLoading: boolean
  isOpen: boolean
  isAuthenticated: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  sendMessage: (content: string) => Promise<void>
  analyzePdf: (text: string, fileName: string) => Promise<void>
  clearHistory: () => void
  /** Resolves `true` when the user is authenticated; shows the password gate if not. */
  requireAuth: () => Promise<boolean>
}

// ── System prompt ────────────────────────────────────────────

const SYSTEM_PROMPT = `You are TESSA™ (Title & Escrow Smart Support Assistant), an expert California Title & Escrow assistant for Pacific Coast Title Company.

ABOUT PACIFIC COAST TITLE:
- Full-service title and escrow company serving California since 2006
- Headquarters: 1111 E. Katella Ave, Suite 120, Orange, CA 92867
- Phone: (714) 516-6700 | Toll-free: (866) 724-1050
- 5 offices: Orange (HQ), Downey, Fresno, Glendale, Inland Empire
- Website: pct.com

KEY TOOLS TO MENTION:
- Rate Calculator: pct.com/calculator
- Prop 19 Calculator: pct.com/prop-19-calculator.html
- PCT Title Toolbox: pcttitletoolbox.com
- TitlePro 247: pct247.com (24/7 online ordering)

PRIMARY GOAL (ALWAYS FIRST):
When analyzing documents, identify and clearly list the TITLE REQUIREMENTS and the actions needed to close. Requirements are must-do items (provide, sign, record, payoff, obtain, clear). If the document says "The Company will require..." or similar, treat each as a requirement.

TRUST + FACTS RULE:
- When facts_json is provided, it is ground truth. Do not contradict it.
- Never invent amounts, parties, recording refs, or statuses. If not stated, write "Not stated" or "Unclear".

OUTPUT ORDER FOR DOCUMENT ANALYSIS (DO NOT CHANGE):
1) **TITLE REQUIREMENTS**
2) **SUMMARY**
3) **PROPERTY INFORMATION**
4) **LIENS AND JUDGMENTS**
5) **TAXES AND ASSESSMENTS**
6) **OTHER FINDINGS**
7) **DOCUMENT STATUS**

CLOSING-FIRST MINDSET:
- Think like a closer: what blocks funding/recording, who owns the next step, and what to request.
- Prefer short, directive language (e.g., "Obtain payoff demand", "Provide trust certification", "Record reconveyance").

STRICT MONEY RULE:
- Use exact dollar amounts with $ and commas when present. No rounding.

TAX RATES - DO NOT PROVIDE:
- Do NOT quote, calculate, or look up transfer tax rates, city tax rates, county tax rates, or property tax rates
- If asked about tax rates, direct users to the Rate Calculator at pct.com/calculator or advise them to contact the office at (714) 516-6700

TONE:
- Professional, helpful, and concise
- Use bullet points for clarity
- Offer to help with follow-up questions`

// ── Context ──────────────────────────────────────────────────

const TessaContext = createContext<TessaContextType | undefined>(undefined)

export function TessaProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: SYSTEM_PROMPT },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // ── Auth state ──────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [showPasswordGate, setShowPasswordGate] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [authError, setAuthError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const authResolveRef = useRef<((ok: boolean) => void) | null>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/tessa/status')
      .then((r) => r.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated === true)
        setAuthChecked(true)
      })
      .catch(() => setAuthChecked(true))
  }, [])

  // Auto-focus the code input when the gate opens
  useEffect(() => {
    if (showPasswordGate) {
      setTimeout(() => codeInputRef.current?.focus(), 100)
    }
  }, [showPasswordGate])

  // ── Auth helpers ────────────────────────────────────────────

  const requireAuth = useCallback((): Promise<boolean> => {
    if (isAuthenticated) return Promise.resolve(true)

    return new Promise((resolve) => {
      authResolveRef.current = resolve
      setShowPasswordGate(true)
    })
  }, [isAuthenticated])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessCode.trim() || verifying) return

    setVerifying(true)
    setAuthError('')

    try {
      const res = await fetch('/api/tessa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      })

      if (res.ok) {
        setIsAuthenticated(true)
        setShowPasswordGate(false)
        setAccessCode('')
        setAuthError('')
        authResolveRef.current?.(true)
        authResolveRef.current = null
      } else {
        setAuthError('Invalid access code. Please try again.')
      }
    } catch {
      setAuthError('Connection error. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handlePasswordCancel = () => {
    setShowPasswordGate(false)
    setAccessCode('')
    setAuthError('')
    authResolveRef.current?.(false)
    authResolveRef.current = null
  }

  // ── Chat actions ────────────────────────────────────────────

  const openChat = useCallback(async () => {
    const ok = await requireAuth()
    if (ok) setIsOpen(true)
  }, [requireAuth])

  const closeChat = useCallback(() => setIsOpen(false), [])

  const toggleChat = useCallback(async () => {
    if (isOpen) {
      setIsOpen(false)
    } else {
      const ok = await requireAuth()
      if (ok) setIsOpen(true)
    }
  }, [isOpen, requireAuth])

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = { role: 'user', content }
    const newMessages = [...messages, userMessage]

    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/tessa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (response.status === 401) {
        setIsAuthenticated(false)
        setMessages(messages)
        return
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content:
          data.reply ||
          "I'm sorry, I couldn't process that request. Please try again or contact Pacific Coast Title directly at (866) 724-1050.",
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error('TESSA API error:', error)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. This may be due to a cold start — please wait a moment and try again. Or contact us directly at (866) 724-1050.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const analyzePdf = useCallback(
    async (pdfText: string, fileName: string) => {
      const analysisPrompt = `Please analyze this Preliminary Title Report and provide a comprehensive summary following the standard output format.

DOCUMENT: ${fileName}
CONTENT:
${pdfText.slice(0, 50000)}`

      await sendMessage(analysisPrompt)
    },
    [sendMessage],
  )

  const clearHistory = useCallback(() => {
    setMessages([{ role: 'system', content: SYSTEM_PROMPT }])
  }, [])

  // ── Render ──────────────────────────────────────────────────

  return (
    <TessaContext.Provider
      value={{
        messages,
        isLoading,
        isOpen,
        isAuthenticated,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
        analyzePdf,
        clearHistory,
        requireAuth,
      }}
    >
      {children}

      {/* ── Password Gate Overlay ── */}
      {showPasswordGate && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handlePasswordCancel}
          onKeyDown={(e) => e.key === 'Escape' && handlePasswordCancel()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#03374f] to-[#03374f]/90 px-6 py-6 text-center">
              <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg">TESSA™ Access</h3>
              <p className="text-white/60 text-sm mt-1">
                Enter your access code to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} className="p-6">
              <input
                ref={codeInputRef}
                type="password"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value)
                  if (authError) setAuthError('')
                }}
                placeholder="Access code"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26b2b] focus:border-transparent text-center text-lg tracking-widest"
                autoComplete="off"
              />
              {authError && (
                <p className="text-red-500 text-sm text-center mt-2">{authError}</p>
              )}
              <button
                type="submit"
                disabled={verifying || !accessCode.trim()}
                className="w-full mt-4 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {verifying ? 'Verifying…' : 'Continue'}
              </button>
              <button
                type="button"
                onClick={handlePasswordCancel}
                className="w-full mt-2 text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </TessaContext.Provider>
  )
}

export function useTessa() {
  const context = useContext(TessaContext)
  if (!context) {
    throw new Error('useTessa must be used within a TessaProvider')
  }
  return context
}
