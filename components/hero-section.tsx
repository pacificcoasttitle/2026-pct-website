"use client"

import { useState } from "react"
import { TessaSearch } from "./tessa-search"
import { TessaModal } from "./tessa-modal"

export function HeroSection() {
  const [isTessaOpen, setIsTessaOpen] = useState(false)
  const [tessaQuery, setTessaQuery] = useState("")
  const [tessaMode, setTessaMode] = useState<"question" | "analyze">("question")
  const [tessaFile, setTessaFile] = useState<File | undefined>()

  const handleTessaSubmit = (query: string, mode: "question" | "analyze", file?: File) => {
    setTessaQuery(query)
    setTessaMode(mode)
    setTessaFile(file)
    setIsTessaOpen(true)
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img
            src="/beautiful-modern-california-home-exterior-with-blu.jpg"
            alt=""
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-white/90" />
        </div>

        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(3,55,79,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(3,55,79,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-secondary leading-tight tracking-tight text-balance pt-12">
              California's Trusted
              <br />
              <span className="text-secondary">Title & Escrow Partner</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-pretty">
              Residential & Commercial Title Insurance and Escrow Services
              <br />
              <span className="text-lg text-gray-500">Serving California with Excellence Since 2006</span>
            </p>

            <div className="pt-6">
              <TessaSearch onSubmit={handleTessaSubmit} />
            </div>

            <div className="pt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-gray-700 pb-12">
              <div className="flex items-center gap-2">
                <span className="font-bold text-3xl text-secondary">500,000+</span>
                <span className="text-sm">Successful Closings</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-3xl text-secondary">19+</span>
                <span className="text-sm">Years of Excellence</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-300" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-3xl text-secondary">6</span>
                <span className="text-sm">California Offices</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TessaModal
        isOpen={isTessaOpen}
        onClose={() => setIsTessaOpen(false)}
        initialQuery={tessaQuery}
        initialMode={tessaMode}
        initialFile={tessaFile}
      />
    </>
  )
}
