"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  role: "user" | "tessa"
  content: string
}

interface TessaModalProps {
  isOpen: boolean
  onClose: () => void
  initialQuery?: string
  initialMode?: "question" | "analyze"
  initialFile?: File
}

export function TessaModal({ isOpen, onClose, initialQuery, initialMode, initialFile }: TessaModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && initialQuery && initialMode === "question") {
      handleInitialQuery(initialQuery)
    } else if (isOpen && initialFile && initialMode === "analyze") {
      handlePdfAnalysis(initialFile)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleInitialQuery = async (query: string) => {
    const userMessage: Message = { role: "user", content: query }
    setMessages([userMessage])
    setIsTyping(true)

    try {
      const response = await fetch("/api/tessa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are TESSA™, an expert Title & Escrow assistant for Pacific Coast Title Company. Provide helpful, professional answers about title insurance, escrow processes, and real estate transactions.",
            },
            { role: "user", content: query },
          ],
        }),
      })

      const data = await response.json()
      const tessaMessage: Message = { role: "tessa", content: data.reply }
      setMessages((prev) => [...prev, tessaMessage])
    } catch (error) {
      console.error("[v0] Error calling TESSA API:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "tessa",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again or contact us directly at (800) 234-5678.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handlePdfAnalysis = async (file: File) => {
    setMessages([{ role: "user", content: `Analyzing: ${file.name}` }])
    setIsTyping(true)

    try {
      // In a real implementation, this would use PDF.js to extract text
      // and send it to the API for analysis
      const formData = new FormData()
      formData.append("pdf", file)

      const response = await fetch("/api/tessa/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      const tessaMessage: Message = { role: "tessa", content: data.analysis }
      setMessages((prev) => [...prev, tessaMessage])
    } catch (error) {
      console.error("[v0] Error analyzing PDF:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "tessa",
          content:
            "I apologize, but I'm having trouble analyzing the PDF right now. Please try again or contact your title officer directly.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role === "tessa" ? "assistant" : "user",
        content: m.content,
      }))

      const response = await fetch("/api/tessa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are TESSA™, an expert Title & Escrow assistant for Pacific Coast Title Company. Provide helpful, professional answers about title insurance, escrow processes, and real estate transactions.",
            },
            ...conversationHistory,
            { role: "user", content: input },
          ],
        }),
      })

      const data = await response.json()
      const tessaMessage: Message = { role: "tessa", content: data.reply }
      setMessages((prev) => [...prev, tessaMessage])
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "tessa",
          content: "I apologize, but I'm having trouble responding right now. Please try again.",
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-secondary">TESSA™ Enhanced (Beta)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-white border-2 border-gray-200 text-gray-900 ml-8"
                  : "bg-gray-50 border-2 border-gray-100 text-gray-900 mr-8"
              }`}
            >
              <div className="text-sm font-semibold mb-2 text-primary">
                {message.role === "user" ? "You" : "TESSA™"}
              </div>
              <div className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="ml-2">TESSA is thinking…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Have another question about Title or Escrow?"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
