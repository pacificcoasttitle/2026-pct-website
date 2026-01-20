"use client"

import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

export function TechStack() {
  const technologies = [
    "OpenAI GPT-4 Integration",
    "Machine Learning Risk Assessment",
    "Blockchain-Verified Transactions",
    "Real-Time MLS Data Integration",
    "Automated Fraud Detection",
    "Digital Signature & Notarization",
  ]

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Code Mockup */}
          <div className="order-2 lg:order-1">
            <Card className="bg-secondary text-secondary-foreground p-6 font-mono text-sm overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-white/60">tessa-ai.ts</span>
                </div>
                <div>
                  <span className="text-accent">import</span> <span className="text-white">{"{ TitleAnalyzer }"}</span>{" "}
                  <span className="text-accent">from</span> <span className="text-green-400">'@pct/ai'</span>
                </div>
                <div className="h-4" />
                <div>
                  <span className="text-accent">const</span> <span className="text-white">result</span> ={" "}
                  <span className="text-accent">await</span> <span className="text-white">analyzer</span>.
                  <span className="text-blue-400">process</span>({"{"}
                </div>
                <div className="pl-4">
                  <span className="text-white">document:</span>{" "}
                  <span className="text-green-400">'title-report.pdf'</span>,
                </div>
                <div className="pl-4">
                  <span className="text-white">mode:</span> <span className="text-green-400">'deep-analysis'</span>,
                </div>
                <div className="pl-4">
                  <span className="text-white">aiModel:</span> <span className="text-green-400">'gpt-4'</span>
                </div>
                <div>{"}"});</div>
                <div className="h-4" />
                <div>
                  <span className="text-purple-400">// AI detected 3 potential issues</span>
                </div>
                <div>
                  <span className="text-white">console</span>.<span className="text-blue-400">log</span>(
                  <span className="text-white">result</span>.<span className="text-white">issues</span>);
                </div>
                <div className="pl-4 text-green-400">{'// ["Lien detected", "Boundary dispute", ...]'}</div>
              </div>
            </Card>
          </div>

          {/* Right Side - Technology List */}
          <div className="order-1 lg:order-2 space-y-6">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
                Built on the Most Advanced Title Technology Stack
              </h2>
              <p className="text-xl text-muted-foreground">in California</p>
            </div>

            <div className="space-y-4">
              {technologies.map((tech, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg text-foreground font-medium">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
