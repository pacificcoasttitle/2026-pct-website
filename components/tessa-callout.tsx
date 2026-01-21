'use client'

import { Sparkles, MessageCircle, FileText, HelpCircle } from 'lucide-react'
import { useTessa } from '@/contexts/TessaContext'

export function TessaCallout() {
  const { openChat } = useTessa()

  const features = [
    {
      icon: HelpCircle,
      title: 'Answer Questions',
      description: 'Get instant answers about title insurance, escrow, and transfer taxes',
    },
    {
      icon: FileText,
      title: 'Analyze Documents',
      description: 'Upload a preliminary report for instant AI-powered analysis',
    },
    {
      icon: MessageCircle,
      title: '24/7 Available',
      description: 'Get help anytime, day or night, with our AI assistant',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-secondary to-secondary/90 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Floating Accent */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">AI-Powered Assistance</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
              Have Questions?
              <br />
              <span className="text-primary">Ask TESSA™</span>
            </h2>

            <p className="text-lg text-white/80 leading-relaxed max-w-lg">
              Our AI-powered Title & Escrow Support Assistant is available 24/7 to answer your questions, 
              explain complex terms, and even analyze your preliminary title reports.
            </p>

            <button
              onClick={openChat}
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-xl shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Chat with TESSA
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </button>
          </div>

          {/* Right - Feature Cards */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex items-start gap-4 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
