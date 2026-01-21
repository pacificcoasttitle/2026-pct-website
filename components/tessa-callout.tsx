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
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f1f5f9] rounded-2xl p-8 sm:p-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left - Content */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 text-secondary/60 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Assistance</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-secondary leading-snug">
                Have Questions?
                <br />
                <span className="text-secondary/70">Ask TESSA™</span>
              </h2>

              <p className="text-gray-500 leading-relaxed">
                Our AI-powered Title & Escrow Support Assistant is available 24/7 to answer your questions, 
                explain complex terms, and analyze your preliminary title reports.
              </p>

              <button
                onClick={openChat}
                className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Chat with TESSA
              </button>
            </div>

            {/* Right - Feature Cards */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 flex items-start gap-4 border border-gray-100"
                >
                  <div className="w-10 h-10 bg-secondary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-secondary/60" />
                  </div>
                  <div>
                    <h3 className="font-medium text-secondary mb-0.5">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
