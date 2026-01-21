"use client"

import type React from "react"

import { useState, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Sparkles } from "lucide-react"

interface TessaSearchProps {
  onSubmit: (query: string, mode: "question" | "analyze", file?: File) => void
}

export function TessaSearch({ onSubmit }: TessaSearchProps) {
  const [mode, setMode] = useState<"question" | "analyze">("question")
  const [question, setQuestion] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "question" && question.trim()) {
      onSubmit(question, mode)
    } else if (mode === "analyze" && selectedFile) {
      onSubmit("", mode, selectedFile)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
    }
  }

  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Question Input - Show in 'question' mode */}
          {mode === "question" && (
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about title or escrow?"
              className="flex-1 px-5 py-4 text-base border border-gray-200 rounded-xl focus:border-secondary/40 focus:outline-none focus:ring-2 focus:ring-secondary/10 bg-white text-gray-700 placeholder-gray-400 shadow-sm"
              required
            />
          )}

          {/* File Upload - Show in 'analyze' mode */}
          {mode === "analyze" && (
            <div className="flex-1">
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              <button
                type="button"
                onClick={handleFileButtonClick}
                className="w-full px-5 py-4 text-base border border-emerald-200 rounded-xl bg-emerald-50 text-emerald-700 font-medium shadow-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                {selectedFile ? `✓ ${selectedFile.name}` : "Choose PDF File"}
              </button>
            </div>
          )}
        </div>

        {/* Mode Selector and Submit Button */}
        <div className="flex items-center justify-center gap-3">
          <Button
            type="submit"
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white font-medium px-8 h-12 shadow-sm transition-all text-base rounded-xl"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {mode === "question" ? "Ask TESSA" : "Summarize Report"}
          </Button>

          {/* Mode Selector */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "question" | "analyze")}
            className="px-4 h-12 text-base border border-gray-200 rounded-xl bg-white text-gray-600 font-medium cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
          >
            <option value="question">Ask</option>
            <option value="analyze">Summarize</option>
          </select>
        </div>

        {/* Status Message */}
        {selectedFile && mode === "analyze" && (
          <p className="text-center text-sm text-emerald-600 font-medium">
            ✓ Ready to summarize: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </form>
    </div>
  )
}
