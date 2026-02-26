"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { Calculator, Home, HelpCircle, AlertTriangle, ChevronDown, ChevronUp, FileText, Printer } from "lucide-react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
}

function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "")
  return parseFloat(cleaned) || 0
}

export default function Prop19CalculatorPage() {
  const [assessedValue, setAssessedValue] = useState("")
  const [currentMarketValue, setCurrentMarketValue] = useState("")
  const [newHomePrice, setNewHomePrice] = useState("")
  const [showExplanation, setShowExplanation] = useState(false)
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null)
  const explanationRef = useRef<HTMLDivElement>(null)

  // Parse values
  const assessed = parseCurrency(assessedValue)
  const marketValue = parseCurrency(currentMarketValue)
  const newPrice = parseCurrency(newHomePrice)

  // Calculations
  const difference = newPrice - marketValue
  const taxableValue = newPrice <= marketValue ? assessed : assessed + difference
  const taxWithoutProp19 = newPrice * 0.012
  const taxWithProp19 = taxableValue * 0.012
  const annualSavings = taxWithoutProp19 - taxWithProp19

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, "")
    const formatted = rawValue ? formatCurrency(parseCurrency(rawValue)) : ""
    setter(formatted)
  }

  const generateExplanation = useCallback(() => {
    if (!assessed || !marketValue || !newPrice) {
      return "<p class='text-gray-500'>Please enter all values to see your scenario explanation.</p>"
    }

    let explanation = `<div class="space-y-4">
      <h4 class="font-bold text-lg text-secondary">Your Scenario Breakdown</h4>
      <div class="grid gap-3">
        <p><strong>1. Original Assessed Value:</strong> $${formatCurrency(assessed)}</p>
        <p><strong>2. Current Fair Market Value:</strong> $${formatCurrency(marketValue)}</p>
        <p><strong>3. New Home Purchase Price:</strong> $${formatCurrency(newPrice)}</p>
      </div>`

    if (newPrice <= marketValue) {
      explanation += `
      <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mt-4">
        <p class="text-green-800">Since the <strong>new home's market value ($${formatCurrency(newPrice)})</strong> is less than or equal to your <strong>original home's market value ($${formatCurrency(marketValue)})</strong>, Proposition 19 allows the assessed value from your original home to transfer directly to the new home without any adjustment.</p>
        <p class="mt-2 text-green-800"><strong>Transferred Taxable Value:</strong> $${formatCurrency(assessed)}</p>
      </div>`
    } else {
      explanation += `
      <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
        <p class="text-amber-800">Since the <strong>new home's market value ($${formatCurrency(newPrice)})</strong> is greater than your <strong>original home's market value ($${formatCurrency(marketValue)})</strong>, Proposition 19 allows the original assessed value to transfer, but the difference will be added to it.</p>
        <p class="mt-2 text-amber-800"><strong>Difference in Market Value:</strong> $${formatCurrency(difference)}</p>
        <p class="text-amber-800"><strong>New Taxable Value:</strong> $${formatCurrency(taxableValue)}</p>
      </div>`
    }

    explanation += `
      <div class="bg-gray-50 p-4 rounded-lg mt-4">
        <p><strong>Annual Property Tax with Prop 19:</strong> <span class="text-green-600 font-bold">$${formatCurrency(taxWithProp19)}</span></p>
        <p><strong>Annual Property Tax without Prop 19:</strong> <span class="text-red-600 font-bold">$${formatCurrency(taxWithoutProp19)}</span></p>
        <p class="mt-2 text-primary font-bold">Annual Savings: $${formatCurrency(annualSavings)}</p>
      </div>
    </div>`

    return explanation
  }, [assessed, marketValue, newPrice, difference, taxableValue, taxWithProp19, taxWithoutProp19, annualSavings])

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prop 19 Calculator Results</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #03374f; border-bottom: 2px solid #D35411; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
            .label { color: #666; font-size: 14px; }
            .value { font-size: 24px; font-weight: bold; color: #03374f; }
            .green { color: #16a34a; }
            .red { color: #dc2626; }
            .disclaimer { font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .logo { text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="logo">
            <img src="https://pct.com/assets/media/general/logo2-dark.png" alt="Pacific Coast Title" style="height: 50px;">
          </div>
          <h1>Prop 19 Calculator Results</h1>
          
          <div class="section">
            <h3>Input Values</h3>
            <p><span class="label">Primary Residence Current Assessed Value:</span><br><span class="value">$${formatCurrency(assessed)}</span></p>
            <p><span class="label">Primary Residence Sales Price:</span><br><span class="value">$${formatCurrency(marketValue)}</span></p>
            <p><span class="label">Replacement Primary Residence:</span><br><span class="value">$${formatCurrency(newPrice)}</span></p>
          </div>
          
          <div class="section">
            <h3>Calculation Results</h3>
            <p><span class="label">Difference Between Primary & Replacement:</span><br><span class="value">$${formatCurrency(difference)}</span></p>
            <p><span class="label">Estimated Taxable Value of New Home:</span><br><span class="value">$${formatCurrency(taxableValue)}</span></p>
          </div>
          
          <div class="section">
            <h3>Annual Property Tax Comparison</h3>
            <p><span class="label">Without Prop 19:</span><br><span class="value red">$${formatCurrency(taxWithoutProp19)}</span></p>
            <p><span class="label">With Prop 19:</span><br><span class="value green">$${formatCurrency(taxWithProp19)}</span></p>
            <p><span class="label">Estimated Annual Savings:</span><br><span class="value green">$${formatCurrency(annualSavings)}</span></p>
          </div>
          
          <div class="disclaimer">
            <strong>DISCLAIMER:</strong> This Prop 19 property tax estimator is based on general analysis of Prop 19. These calculations are estimates only. Tax assessments may vary by county and city, and additional factors may affect your actual property taxes. For a precise calculation, please consult with a professional tax or estate advisor.
            <br><br>
            Generated by Pacific Coast Title Company - ${new Date().toLocaleDateString()}
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: "url(/beautiful-modern-california-home-exterior-with-blu.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative container mx-auto px-4 text-center">
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">
            Agent Resources
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Prop 19 Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Estimate property tax savings under California's Proposition 19
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary mb-3">About Proposition 19</h2>
                  <p className="text-gray-600 mb-4">
                    Under California's Proposition 19, homeowners who are <strong>over 55 years of age</strong>, 
                    <strong> severely disabled</strong>, or victims of a <strong>wildfire or natural disaster</strong> may 
                    transfer the base year value of their primary residence to a replacement primary residence anywhere 
                    within California.
                  </p>
                  <p className="text-gray-600">
                    The replacement home must be purchased or newly constructed within two years of the sale of the 
                    original property and must serve as the homeowner's primary residence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary">Enter Your Values</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Home className="w-4 h-4 inline mr-2 text-primary" />
                      Primary Residence Current Assessed Value
                    </label>
                    <p className="text-xs text-gray-500 mb-2">The taxable value based on prior purchase or assessment</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                      <input
                        type="text"
                        value={assessedValue}
                        onChange={handleInputChange(setAssessedValue)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-4 text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Home className="w-4 h-4 inline mr-2 text-primary" />
                      Primary Residence Sales Price
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Current home's approximate selling price today</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                      <input
                        type="text"
                        value={currentMarketValue}
                        onChange={handleInputChange(setCurrentMarketValue)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-4 text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Home className="w-4 h-4 inline mr-2 text-primary" />
                      Replacement Primary Residence
                    </label>
                    <p className="text-xs text-gray-500 mb-2">New home purchase price</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
                      <input
                        type="text"
                        value={newHomePrice}
                        onChange={handleInputChange(setNewHomePrice)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-4 text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="space-y-6">
                {/* Difference */}
                <div className="bg-[#03374f]/10 rounded-2xl p-6">
                  <p className="text-sm font-medium text-[#03374f] mb-1">
                    Difference Between Primary & Replacement Residence
                  </p>
                  <p className="text-3xl font-bold text-[#03374f]">
                    ${formatCurrency(difference)}
                  </p>
                </div>

                {/* Taxable Value */}
                <div className="bg-green-100 rounded-2xl p-6">
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Estimated Taxable Value of New Home
                  </p>
                  <p className="text-xs text-green-700 mb-2">(0-365 Days Between Sales)</p>
                  <p className="text-3xl font-bold text-green-800">
                    ${formatCurrency(taxableValue)}
                  </p>
                </div>

                {/* Tax Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-100/70 rounded-2xl p-6">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Without Prop 19
                    </p>
                    <p className="text-xs text-red-700 mb-2">Annual Property Tax</p>
                    <p className="text-2xl font-bold text-red-800">
                      ${formatCurrency(taxWithoutProp19)}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-2xl p-6">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      With Prop 19
                    </p>
                    <p className="text-xs text-green-700 mb-2">Annual Property Tax</p>
                    <p className="text-2xl font-bold text-green-800">
                      ${formatCurrency(taxWithProp19)}
                    </p>
                  </div>
                </div>

                {/* Savings Highlight */}
                {annualSavings > 0 && (
                  <div className="bg-primary text-white rounded-2xl p-6 text-center">
                    <p className="text-sm font-medium opacity-90 mb-1">Estimated Annual Savings</p>
                    <p className="text-4xl font-bold">${formatCurrency(annualSavings)}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white px-6 py-4 rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    {showExplanation ? "Hide" : "Explain My Scenario"}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                    Print
                  </button>
                </div>
              </div>
            </div>

            {/* Explanation Section */}
            {showExplanation && (
              <div 
                ref={explanationRef}
                className="mt-8 bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                dangerouslySetInnerHTML={{ __html: generateExplanation() }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-amber-800 font-semibold mb-2">Disclaimer</p>
              <p className="text-amber-700 text-sm">
                This Prop 19 property tax estimator is based on the California Association of Realtors' analysis of 
                Prop 19. These calculations are estimates only. Tax assessments may vary by county and city, and 
                additional factors may affect your actual property taxes. For a precise calculation, please consult 
                with a professional tax or estate advisor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Scenarios */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8 text-center">Example Scenarios</h2>
            
            <div className="space-y-4">
              {/* Scenario 1 */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedScenario(expandedScenario === 1 ? null : 1)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="text-xl font-bold text-secondary">Scenario 1: Property Below $1 Million</h3>
                    <p className="text-gray-600">Buying a less expensive replacement home</p>
                  </div>
                  {expandedScenario === 1 ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                {expandedScenario === 1 && (
                  <div className="p-6 pt-0 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold text-secondary mb-4">The Situation:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>Original Home's Current Assessed Value:</strong> $300,000</li>
                        <li><strong>Original Home's Market Value:</strong> $800,000</li>
                        <li><strong>New Home's Purchase Price:</strong> $750,000</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6">
                      <h4 className="font-semibold text-green-800 mb-4">What Happens with Proposition 19?</h4>
                      <p className="text-green-700 mb-4">
                        Since the new home's market value ($750,000) is less than the original home's market value 
                        ($800,000), the assessed value from the original home transfers directly to the new home.
                      </p>
                      <ul className="space-y-2 text-green-700">
                        <li><strong>New Home's Taxable Value:</strong> $300,000</li>
                        <li><strong>Annual Property Tax:</strong> $300,000 × 1.2% = <strong>$3,600</strong></li>
                        <li><strong>Without Prop 19:</strong> $750,000 × 1.2% = <strong>$9,000</strong></li>
                        <li className="text-green-800 font-bold">Annual Savings: $5,400</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Scenario 2 */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedScenario(expandedScenario === 2 ? null : 2)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="text-xl font-bold text-secondary">Scenario 2: Property Over $1 Million</h3>
                    <p className="text-gray-600">Buying a more expensive replacement home</p>
                  </div>
                  {expandedScenario === 2 ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                {expandedScenario === 2 && (
                  <div className="p-6 pt-0 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h4 className="font-semibold text-secondary mb-4">The Situation:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>Original Home's Current Assessed Value:</strong> $400,000</li>
                        <li><strong>Original Home's Market Value:</strong> $1,200,000</li>
                        <li><strong>New Home's Purchase Price:</strong> $1,500,000</li>
                      </ul>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-6">
                      <h4 className="font-semibold text-amber-800 mb-4">What Happens with Proposition 19?</h4>
                      <p className="text-amber-700 mb-4">
                        Because the new home's market value ($1,500,000) is more than the original home's market value 
                        ($1,200,000), the homeowner can transfer the original assessed value but must add the difference.
                      </p>
                      <ul className="space-y-2 text-amber-700">
                        <li><strong>Difference in Market Value:</strong> $1,500,000 - $1,200,000 = $300,000</li>
                        <li><strong>New Home's Taxable Value:</strong> $400,000 + $300,000 = $700,000</li>
                        <li><strong>Annual Property Tax:</strong> $700,000 × 1.2% = <strong>$8,400</strong></li>
                        <li><strong>Without Prop 19:</strong> $1,500,000 × 1.2% = <strong>$18,000</strong></li>
                        <li className="text-amber-800 font-bold">Annual Savings: $9,600</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/professional-title-company-office-team-meeting.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-primary/90" />
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Help With Your Transaction?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Our team can help you navigate the complexities of property transfers and ensure a smooth closing process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <a
              href="tel:+18667241050"
              className="bg-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
            >
              Call (866) 724-1050
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
