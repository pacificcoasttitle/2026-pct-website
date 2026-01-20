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
    <div className="w-full max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3">
          {/* Question Input - Show in 'question' mode */}
          {mode === "question" && (
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about title or escrow?"
              className="flex-1 px-6 py-6 text-lg border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-gray-900 placeholder-gray-500 shadow-lg"
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
                className="w-full px-6 py-6 text-lg border-2 border-green-500 rounded-lg bg-gradient-to-r from-green-500 to-green-400 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                {selectedFile ? `✓ ${selectedFile.name}` : "Choose PDF File"}
              </button>
            </div>
          )}
        </div>

        {/* Mode Selector and Submit Button */}
        <div className="flex items-center justify-center gap-4">
          <Button
            type="submit"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-14 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {mode === "question" ? "Ask TESSA™" : "Summarize Report"}
          </Button>

          {/* Mode Selector */}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "question" | "analyze")}
            className="px-6 h-14 text-lg border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium cursor-pointer shadow-lg hover:border-primary/80 transition-colors"
          >
            <option value="question">Ask</option>
            <option value="analyze">Summarize</option>
          </select>
        </div>

        {/* Status Message */}
        {selectedFile && mode === "analyze" && (
          <p className="text-center text-sm text-green-600 font-medium">
            ✓ Ready to summarize: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </form>
    </div>
  )
}
