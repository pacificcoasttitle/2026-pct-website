'use client'

import { Sparkles, MessageCircle, FileText, Clock } from 'lucide-react'
import { useTessa } from '@/contexts/TessaContext'

export function TessaFeatured() {
  const { openChat } = useTessa()

  return (
    <section className="py-20 bg-gradient-to-br from-secondary via-secondary to-[#002d5a] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-white/90">AI-Powered Assistant</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Meet TESSA™
              <br />
              <span className="text-primary">Your Title Expert</span>
            </h2>

            <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl">
              TESSA (Title & Escrow Support Assistant) is available 24/7 to answer your questions, 
              explain complex terms, and analyze your preliminary title reports instantly.
            </p>

            <button
              onClick={() => openChat()}
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with TESSA
            </button>
          </div>

          {/* Right - Feature Cards */}
          <div className="grid gap-4">
            <FeatureCard
              icon={<MessageCircle className="w-6 h-6" />}
              title="Ask Anything"
              description="Get instant answers about title insurance, escrow processes, and closing costs"
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Document Analysis"
              description="Upload your preliminary title report for AI-powered insights and explanations"
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Always Available"
              description="24/7 support whenever you need it - no waiting for office hours"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-white/70 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
