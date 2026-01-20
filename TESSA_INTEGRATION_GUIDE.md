# TESSA Integration Guide for Next.js

## Overview

TESSA (Title & Escrow Smart Support Assistant) is PCT's AI assistant that:
1. Answers title & escrow questions
2. Analyzes Preliminary Title Reports (PDFs)
3. Looks up California transfer tax rates
4. Provides "Realtor Cheat Sheets" for complex documents

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TESSA SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────┐  │
│  │   Next.js   │────▶│  Render Proxy    │────▶│  OpenAI API │  │
│  │   Frontend  │     │  (tessa-proxy)   │     │  (GPT-4)    │  │
│  └─────────────┘     └──────────────────┘     └─────────────┘  │
│         │                    │                                  │
│         │                    ▼                                  │
│         │            ┌──────────────────┐                      │
│         │            │  Transfer Tax    │                      │
│         │            │  JSON Data       │                      │
│         │            └──────────────────┘                      │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   PDF.js    │  (Client-side PDF text extraction)            │
│  │   Library   │                                               │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Chat API
```
POST https://tessa-proxy.onrender.com/api/ask-tessa
Content-Type: application/json

{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "What is title insurance?" }
  ]
}

Response:
{
  "choices": [{
    "message": {
      "content": "Title insurance is..."
    }
  }]
}
```

### 2. Transfer Tax Data
```
GET https://tessa-proxy.onrender.com/data.json

Response: Array of California cities/counties with tax rates
[
  {
    "City": "Los Angeles",
    "County": "Los Angeles",
    "County Transfer Tax": "$1.10 per $1,000",
    "City Transfer Tax (When Applicable)": "$4.50 per $1,000"
  },
  ...
]
```

---

## Implementation Steps

### Step 1: Create the TESSA Context Provider

```typescript
// contexts/TessaContext.tsx
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
  sendMessage: (content: string) => Promise<void>
  analyzePdf: (text: string, fileName: string) => Promise<void>
  clearHistory: () => void
}

const SYSTEM_PROMPT = `You are Tessa™, an expert California Title & Escrow assistant.

PRIMARY GOAL (ALWAYS FIRST):
Identify and clearly list the TITLE REQUIREMENTS and the actions needed to close. Requirements are must-do items (provide, sign, record, payoff, obtain, clear). If the document says "The Company will require..." or similar, treat each as a requirement.

TRUST + FACTS RULE:
- When facts_json is provided, it is ground truth. Do not contradict it.
- Never invent amounts, parties, recording refs, or statuses. If not stated, write "Not stated" or "Unclear".

OUTPUT ORDER (DO NOT CHANGE):
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
- Use exact dollar amounts with $ and commas when present. No rounding.`

const TessaContext = createContext<TessaContextType | undefined>(undefined)

export function TessaProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: SYSTEM_PROMPT }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const openChat = useCallback(() => setIsOpen(true), [])
  const closeChat = useCallback(() => setIsOpen(false), [])

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
        content: data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request."
      }

      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error('TESSA API error:', error)
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "I'm having trouble connecting. Please try again." }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const analyzePdf = useCallback(async (pdfText: string, fileName: string) => {
    const analysisPrompt = `Please analyze this Preliminary Title Report and provide a comprehensive summary following the standard output format.

DOCUMENT: ${fileName}
CONTENT:
${pdfText.slice(0, 50000)} // Truncate for context limits
`
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
```

### Step 2: Create the TESSA Chat Widget Component

```typescript
// components/tessa/TessaChatWidget.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useTessa } from '@/contexts/TessaContext'
import { MessageCircle, X, Send, FileText, Loader2 } from 'lucide-react'

export function TessaChatWidget() {
  const { messages, isLoading, isOpen, openChat, closeChat, sendMessage } = useTessa()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  // Filter out system messages for display
  const displayMessages = messages.filter(m => m.role !== 'system')

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-pct-orange hover:bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Ask TESSA™</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-pct-navy to-pct-blue text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="font-semibold">TESSA™</h3>
                <p className="text-xs text-white/80">Title & Escrow AI Assistant</p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-pct-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Hi, I'm TESSA!</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Your AI-powered Title & Escrow assistant. Ask me about:
                </p>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  <SuggestionButton onClick={() => sendMessage("What is title insurance?")}>
                    What is title insurance?
                  </SuggestionButton>
                  <SuggestionButton onClick={() => sendMessage("What is the transfer tax in Los Angeles?")}>
                    Transfer tax in Los Angeles?
                  </SuggestionButton>
                  <SuggestionButton onClick={() => sendMessage("Explain the escrow process")}>
                    Explain the escrow process
                  </SuggestionButton>
                </div>
              </div>
            )}

            {displayMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-pct-blue text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <TessaMessageContent content={message.content} />
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-pct-orange" />
                  <span className="text-sm text-gray-600">TESSA is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about title, escrow, or upload a prelim..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pct-blue focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-3 bg-pct-orange hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function SuggestionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-pct-blue hover:bg-blue-50 transition-colors"
    >
      {children}
    </button>
  )
}

function TessaMessageContent({ content }: { content: string }) {
  // Basic markdown-like formatting
  const formatted = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
  
  return (
    <div 
      className="text-sm leading-relaxed prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  )
}
```

### Step 3: Create the PDF Analyzer Component

```typescript
// components/tessa/TessaPdfAnalyzer.tsx
'use client'

import { useState, useCallback } from 'react'
import { useTessa } from '@/contexts/TessaContext'
import { FileText, Upload, Loader2, AlertCircle } from 'lucide-react'

// You'll need to install: npm install pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist'

// Set worker path (add to your public folder or use CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export function TessaPdfAnalyzer() {
  const { analyzePdf, isLoading, openChat } = useTessa()
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n\n'
    }
    
    return fullText
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    
    if (!selectedFile) return
    
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file')
      return
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Please select a PDF under 10MB')
      return
    }
    
    setFile(selectedFile)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!file) return
    
    setExtracting(true)
    setError(null)
    
    try {
      const text = await extractTextFromPdf(file)
      openChat()
      await analyzePdf(text, file.name)
      setFile(null)
    } catch (err) {
      console.error('PDF extraction error:', err)
      setError('Failed to extract text from PDF. Please try another file.')
    } finally {
      setExtracting(false)
    }
  }, [file, analyzePdf, openChat])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-pct-orange/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-pct-orange" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Analyze Preliminary Title Report</h3>
          <p className="text-sm text-gray-600">Upload a PDF and TESSA will summarize it</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {!file ? (
        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-pct-blue hover:bg-blue-50/50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              <span className="text-pct-blue font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF files up to 10MB</p>
          </div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <FileText className="w-5 h-5 text-green-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">{file.name}</p>
              <p className="text-xs text-green-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Remove
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={extracting || isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pct-orange hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
          >
            {extracting || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {extracting ? 'Extracting text...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Analyze with TESSA
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
```

### Step 4: Create Transfer Tax Lookup Hook

```typescript
// hooks/useTransferTax.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

interface TransferTaxEntry {
  City: string
  County: string
  'County Transfer Tax': string
  'City Transfer Tax (When Applicable)': string
}

let cachedData: TransferTaxEntry[] | null = null

export function useTransferTax() {
  const [data, setData] = useState<TransferTaxEntry[] | null>(cachedData)
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedData) return

    async function fetchData() {
      try {
        const response = await fetch('https://tessa-proxy.onrender.com/data.json', {
          cache: 'force-cache'
        })
        const json = await response.json()
        cachedData = json
        setData(json)
      } catch (err) {
        setError('Transfer tax data unavailable')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const lookup = useCallback((cityOrCounty: string): TransferTaxEntry | null => {
    if (!data) return null
    const lower = cityOrCounty.toLowerCase()
    return data.find(
      entry => 
        entry.City.toLowerCase() === lower || 
        entry.County.toLowerCase() === lower
    ) || null
  }, [data])

  return { data, isLoading, error, lookup }
}
```

### Step 5: Add to Layout

```typescript
// app/layout.tsx
import { TessaProvider } from '@/contexts/TessaContext'
import { TessaChatWidget } from '@/components/tessa/TessaChatWidget'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TessaProvider>
          {children}
          <TessaChatWidget />
        </TessaProvider>
      </body>
    </html>
  )
}
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Add TessaProvider + TessaChatWidget
│   └── ...
├── components/
│   └── tessa/
│       ├── TessaChatWidget.tsx
│       ├── TessaPdfAnalyzer.tsx
│       ├── TessaMessageContent.tsx
│       └── index.ts
├── contexts/
│   └── TessaContext.tsx
├── hooks/
│   └── useTransferTax.ts
└── lib/
    └── tessa/
        ├── system-prompt.ts
        └── pdf-parser.ts     # Advanced parsing (optional)
```

---

## Dependencies

```bash
npm install pdfjs-dist lucide-react
```

---

## CSS Variables (add to globals.css)

```css
:root {
  /* TESSA Theme */
  --tessa-primary: #2563eb;
  --tessa-accent: #f26b2b;
  --tessa-text: #1f2937;
  --tessa-text-light: #6b7280;
  --tessa-bg: #ffffff;
  --tessa-bg-subtle: #f9fafb;
  --tessa-border: #e5e7eb;
  --tessa-success: #059669;
  --tessa-warning: #d97706;
  --tessa-danger: #dc2626;
}
```

---

## Advanced Features (Optional)

### 1. Pre-Parser for Better PDF Analysis

The original TESSA includes sophisticated parsing for:
- Tax information extraction
- Deed of Trust parsing
- HOA lien detection
- Foreclosure flag detection
- Schedule A parsing

If you want full feature parity, port the `computeFacts()` function and its helpers from the original script. This allows sending structured `facts_json` alongside the PDF text for more accurate analysis.

### 2. Collapsible Cards UI

The original has a collapsible cards UI for displaying analysis results. Consider implementing this for better readability of long reports.

### 3. Realtor Cheat Sheet

Auto-generates plain-English explanations for each requirement. The `agentExplanationByType()` function maps requirement types to helpful descriptions.

---

## Testing Checklist

- [ ] Chat opens/closes correctly
- [ ] Messages send and receive
- [ ] PDF upload works (under 10MB)
- [ ] PDF text extraction works
- [ ] Analysis results display correctly
- [ ] Loading states show properly
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Transfer tax lookup works
- [ ] Keyboard accessibility (Enter to send, Escape to close)

---

## Environment Variables (if needed later)

```env
# If you move away from the proxy
NEXT_PUBLIC_TESSA_API_URL=https://tessa-proxy.onrender.com/api/ask-tessa
NEXT_PUBLIC_TESSA_TAX_URL=https://tessa-proxy.onrender.com/data.json
```

---

## Notes

1. **Proxy Server**: TESSA uses `tessa-proxy.onrender.com` to handle CORS and API key management. The proxy wraps OpenAI API calls.

2. **Cold Starts**: Render.com free tier has cold starts. First request may take 10-30 seconds. Consider upgrading for production.

3. **Rate Limits**: The proxy may have rate limits. Monitor usage in production.

4. **PDF.js Worker**: Must be loaded from CDN or bundled. The worker handles CPU-intensive PDF parsing off the main thread.

5. **Context Limits**: Very large PDFs may exceed token limits. The implementation truncates to 50,000 characters. Consider chunking for longer documents.
