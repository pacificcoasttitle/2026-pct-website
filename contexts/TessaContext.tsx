'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface TessaContextType {
  messages: Message[]
  isLoading: boolean
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  sendMessage: (content: string) => Promise<void>
  analyzePdf: (text: string, fileName: string) => Promise<void>
  clearHistory: () => void
}

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

const TessaContext = createContext<TessaContextType | undefined>(undefined)

export function TessaProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: SYSTEM_PROMPT }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const openChat = useCallback(() => setIsOpen(true), [])
  const closeChat = useCallback(() => setIsOpen(false), [])
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), [])

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('https://tessa-proxy.onrender.com/api/ask-tessa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request. Please try again or contact Pacific Coast Title directly at (866) 724-1050."
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error('TESSA API error:', error)
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: "I'm having trouble connecting right now. This may be due to a cold start - please wait a moment and try again. Or contact us directly at (866) 724-1050." 
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const analyzePdf = useCallback(async (pdfText: string, fileName: string) => {
    const analysisPrompt = `Please analyze this Preliminary Title Report and provide a comprehensive summary following the standard output format.

DOCUMENT: ${fileName}
CONTENT:
${pdfText.slice(0, 50000)}`
    
    await sendMessage(analysisPrompt)
  }, [sendMessage])

  const clearHistory = useCallback(() => {
    setMessages([{ role: 'system', content: SYSTEM_PROMPT }])
  }, [])

  return (
    <TessaContext.Provider value={{
      messages,
      isLoading,
      isOpen,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      analyzePdf,
      clearHistory
    }}>
      {children}
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
