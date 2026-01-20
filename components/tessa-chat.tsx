"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"

export function TessaChat() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl animate-pulse-glow z-50"
        size="icon"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-background border-2 border-primary rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">TESSA AI Assistant</h3>
                <p className="text-xs text-white/80">Online • Instant Responses</p>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 p-4 overflow-y-auto bg-muted">
            <div className="space-y-4">
              <div className="bg-background p-3 rounded-lg shadow-sm max-w-[80%]">
                <p className="text-sm text-foreground">Hi! I'm TESSA, your AI title assistant. I can help you with:</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Title insurance questions</li>
                  <li>• Escrow process guidance</li>
                  <li>• Instant quotes</li>
                  <li>• Document requirements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Send</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
