'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Calculator,
  Loader2,
  ChevronDown,
  DollarSign,
  Home,
  Building2,
  FileText,
  Receipt,
  Shield,
  AlertTriangle,
  Phone,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────────────────

interface CountyOption {
  id: string
  name: string
}

interface CityOption {
  id: string
  name: string
}

interface TitleFees {
  ownerPolicy: number
  ownerPolicyLabel: string
  lenderPolicy: number
  lenderPolicyLabel: string
  endorsements: { name: string; fee: number }[]
  endorsementTotal: number
  total: number
}

interface EscrowFees {
  baseFee: number
  additionalFees: { name: string; fee: number }[]
  total: number
}

interface TransferTaxResult {
  countyTax: number
  cityTax: number
  countyRate: number
  cityRate: number
  total: number
}

interface CalculatorResult {
  titleFees: TitleFees
  escrowFees: EscrowFees
  transferTaxes: TransferTaxResult
  additionalFees: { name: string; fee: number; category: string }[]
  additionalFeesTotal: number
  grandTotal: number
  callForQuote: boolean
  disclaimer: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatNumberInput(value: string): string {
  const raw = value.replace(/[^0-9]/g, '')
  return raw ? Number(raw).toLocaleString() : ''
}

function parseNumberInput(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
}

// ── Component ───────────────────────────────────────────────────────────────

export function RateCalculator() {
  // Form state
  const [transactionType, setTransactionType] = useState<'purchase' | 'refinance'>('purchase')
  const [counties, setCounties] = useState<CountyOption[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [salesPrice, setSalesPrice] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [ownerPolicyType, setOwnerPolicyType] = useState<'clta' | 'alta'>('clta')
  const [lenderPolicyType, setLenderPolicyType] = useState<'clta' | 'alta'>('clta')
  const [includeOwnerPolicy, setIncludeOwnerPolicy] = useState(true)

  // UI state
  const [isLoadingCounties, setIsLoadingCounties] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resultsRef = useRef<HTMLDivElement>(null)

  // ── Data Fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchCounties() {
      try {
        const res = await fetch(`/api/calculator/counties?type=${transactionType}`)
        const data = await res.json()
        setCounties(data.counties || [])
      } catch {
        console.error('Failed to load counties')
      } finally {
        setIsLoadingCounties(false)
      }
    }
    setIsLoadingCounties(true)
    fetchCounties()
  }, [transactionType])

  useEffect(() => {
    if (!selectedCounty) {
      setCities([])
      setSelectedCity('')
      return
    }
    async function fetchCities() {
      setIsLoadingCities(true)
      try {
        const res = await fetch(
          `/api/calculator/cities?county=${encodeURIComponent(selectedCounty)}&type=${transactionType}`
        )
        const data = await res.json()
        setCities(data.cities || [])
        setSelectedCity('')
      } catch {
        console.error('Failed to load cities')
      } finally {
        setIsLoadingCities(false)
      }
    }
    fetchCities()
  }, [selectedCounty, transactionType])

  // Clear results when form changes
  useEffect(() => {
    setResults(null)
    setError(null)
  }, [transactionType, selectedCounty, selectedCity, salesPrice, loanAmount, ownerPolicyType, lenderPolicyType, includeOwnerPolicy])

  // ── Calculation ───────────────────────────────────────────────────────────

  const handleCalculate = useCallback(async () => {
    setError(null)

    if (!selectedCounty) { setError('Please select a county.'); return }
    if (!selectedCity) { setError('Please select a city.'); return }
    if (transactionType === 'purchase' && !salesPrice) { setError('Please enter a sales price.'); return }
    if (!loanAmount) { setError('Please enter a loan amount.'); return }

    setIsCalculating(true)
    try {
      const res = await fetch('/api/calculator/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionType,
          countyZone: selectedCounty,
          cityName: selectedCity,
          salesPrice: transactionType === 'purchase' ? parseNumberInput(salesPrice) : 0,
          loanAmount: parseNumberInput(loanAmount),
          ownerPolicyType,
          lenderPolicyType,
          includeOwnerPolicy: transactionType === 'purchase' ? includeOwnerPolicy : false,
        }),
      })
      if (!res.ok) throw new Error('Calculation failed')
      const data: CalculatorResult = await res.json()
      setResults(data)

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch {
      setError('Unable to calculate. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }, [transactionType, selectedCounty, selectedCity, salesPrice, loanAmount, ownerPolicyType, lenderPolicyType, includeOwnerPolicy])

  // ── Print ─────────────────────────────────────────────────────────────────

  const handlePrint = useCallback(() => {
    if (!results) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const isPurchase = transactionType === 'purchase'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PCT Rate Estimate</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #333; }
          h1 { font-size: 20px; color: #03374f; border-bottom: 2px solid #e8830c; padding-bottom: 8px; }
          h2 { font-size: 15px; color: #03374f; margin-top: 24px; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
          .row span:last-child { font-weight: 500; }
          .total { border-top: 2px solid #03374f; padding-top: 8px; margin-top: 12px; }
          .total span { font-size: 18px; font-weight: 700; color: #03374f; }
          .info { font-size: 12px; color: #888; margin-top: 4px; }
          .meta { font-size: 13px; color: #666; margin-bottom: 20px; }
          .disclaimer { font-size: 11px; color: #999; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px; }
          .logo { font-size: 14px; font-weight: 700; color: #03374f; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="logo">Pacific Coast Title Company</div>
        <h1>Title & Escrow Fee Estimate</h1>
        <div class="meta">
          <div><strong>Transaction:</strong> ${isPurchase ? 'Purchase' : 'Refinance'}</div>
          <div><strong>County:</strong> ${selectedCounty} · <strong>City:</strong> ${selectedCity}</div>
          ${isPurchase ? `<div><strong>Sales Price:</strong> ${formatCurrency(parseNumberInput(salesPrice))}</div>` : ''}
          <div><strong>Loan Amount:</strong> ${formatCurrency(parseNumberInput(loanAmount))}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        </div>

        <h2>Title Insurance</h2>
        ${results.titleFees.ownerPolicy > 0 ? `<div class="row"><span>${results.titleFees.ownerPolicyLabel}</span><span>${formatCurrency(results.titleFees.ownerPolicy)}</span></div>` : ''}
        <div class="row"><span>${results.titleFees.lenderPolicyLabel}</span><span>${formatCurrency(results.titleFees.lenderPolicy)}</span></div>
        ${results.titleFees.endorsements.map(e => `<div class="row"><span style="font-size:12px;color:#666">${e.name}</span><span>${formatCurrency(e.fee)}</span></div>`).join('')}
        <div class="row" style="font-weight:600"><span>Title Subtotal</span><span>${formatCurrency(results.titleFees.total)}</span></div>

        <h2>Escrow Fees</h2>
        <div class="row"><span>Escrow Fee</span><span>${formatCurrency(results.escrowFees.baseFee)}</span></div>
        ${results.escrowFees.additionalFees.map(f => `<div class="row"><span>${f.name}</span><span>${formatCurrency(f.fee)}</span></div>`).join('')}
        <div class="row" style="font-weight:600"><span>Escrow Subtotal</span><span>${formatCurrency(results.escrowFees.total)}</span></div>

        ${isPurchase ? `
        <h2>Transfer Taxes</h2>
        <div class="row"><span>County Transfer Tax ($${results.transferTaxes.countyRate.toFixed(2)}/1,000)</span><span>${formatCurrency(results.transferTaxes.countyTax)}</span></div>
        ${results.transferTaxes.cityTax > 0 ? `<div class="row"><span>City Transfer Tax ($${results.transferTaxes.cityRate.toFixed(2)}/1,000)</span><span>${formatCurrency(results.transferTaxes.cityTax)}</span></div>` : ''}
        <div class="row" style="font-weight:600"><span>Transfer Tax Subtotal</span><span>${formatCurrency(results.transferTaxes.total)}</span></div>
        ` : ''}

        ${results.additionalFees.length > 0 ? `
        <h2>Additional Fees</h2>
        ${results.additionalFees.map(f => `<div class="row"><span>${f.name}</span><span>${formatCurrency(f.fee)}</span></div>`).join('')}
        <div class="row" style="font-weight:600"><span>Additional Fees Subtotal</span><span>${formatCurrency(results.additionalFeesTotal)}</span></div>
        ` : ''}

        <div class="total">
          <div class="row"><span>Estimated Total</span><span>${formatCurrency(results.grandTotal)}</span></div>
        </div>

        <div class="disclaimer">${results.disclaimer}</div>
        <div class="disclaimer">Pacific Coast Title Company · (714) 516-6700 · pct.com</div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }, [results, transactionType, selectedCounty, selectedCity, salesPrice, loanAmount])

  // ── Validation ────────────────────────────────────────────────────────────

  const isFormValid =
    selectedCounty &&
    selectedCity &&
    loanAmount &&
    (transactionType === 'refinance' || salesPrice)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Form Section */}
      <div className="space-y-5">
        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#f8f6f3] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTransactionType('purchase')
                setSelectedCounty('')
                setSelectedCity('')
              }}
              className={cn(
                'flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all',
                transactionType === 'purchase'
                  ? 'bg-white text-[#03374f] shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              )}
            >
              <Home className="w-4 h-4" />
              Purchase
            </button>
            <button
              type="button"
              onClick={() => {
                setTransactionType('refinance')
                setSelectedCounty('')
                setSelectedCity('')
              }}
              className={cn(
                'flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all',
                transactionType === 'refinance'
                  ? 'bg-white text-[#03374f] shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              )}
            >
              <Building2 className="w-4 h-4" />
              Refinance
            </button>
          </div>
        </div>

        {/* County Select */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2.5">County / Region</label>
          <Select value={selectedCounty} onValueChange={setSelectedCounty} disabled={isLoadingCounties}>
            <SelectTrigger className="w-full h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03374f]/20 focus:border-[#03374f]/40 transition-all">
              <SelectValue placeholder={isLoadingCounties ? 'Loading...' : 'Select county'} />
            </SelectTrigger>
            <SelectContent>
              {counties.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Select */}
        {selectedCounty && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium text-gray-600 mb-2.5">City</label>
            <Select value={selectedCity} onValueChange={setSelectedCity} disabled={isLoadingCities}>
              <SelectTrigger className="w-full h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03374f]/20 focus:border-[#03374f]/40 transition-all">
                <SelectValue placeholder={isLoadingCities ? 'Loading...' : 'Select city'} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sales Price (Purchase only) */}
        {transactionType === 'purchase' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium text-gray-600 mb-2.5">Sales Price</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                inputMode="numeric"
                placeholder="750,000"
                value={salesPrice}
                onChange={(e) => setSalesPrice(formatNumberInput(e.target.value))}
                className="pl-10 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03374f]/20 focus:border-[#03374f]/40 transition-all"
              />
            </div>
          </div>
        )}

        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2.5">Loan Amount</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              inputMode="numeric"
              placeholder="600,000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(formatNumberInput(e.target.value))}
              className="pl-10 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-[#03374f]/20 focus:border-[#03374f]/40 transition-all"
            />
          </div>
        </div>

        {/* Policy Options (Purchase only) */}
        {transactionType === 'purchase' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
            {/* Owner's Policy Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2.5">
                Owner&apos;s Policy Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOwnerPolicyType('clta')}
                  className={cn(
                    'py-2.5 px-3 rounded-lg text-xs font-medium border transition-all',
                    ownerPolicyType === 'clta'
                      ? 'bg-[#03374f]/5 border-[#03374f]/20 text-[#03374f]'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  CLTA Standard
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerPolicyType('alta')}
                  className={cn(
                    'py-2.5 px-3 rounded-lg text-xs font-medium border transition-all',
                    ownerPolicyType === 'alta'
                      ? 'bg-[#03374f]/5 border-[#03374f]/20 text-[#03374f]'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  ALTA Homeowner&apos;s
                </button>
              </div>
            </div>

            {/* Lender's Policy Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2.5">
                Lender&apos;s Policy Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLenderPolicyType('clta')}
                  className={cn(
                    'py-2.5 px-3 rounded-lg text-xs font-medium border transition-all',
                    lenderPolicyType === 'clta'
                      ? 'bg-[#03374f]/5 border-[#03374f]/20 text-[#03374f]'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  CLTA Concurrent
                </button>
                <button
                  type="button"
                  onClick={() => setLenderPolicyType('alta')}
                  className={cn(
                    'py-2.5 px-3 rounded-lg text-xs font-medium border transition-all',
                    lenderPolicyType === 'alta'
                      ? 'bg-[#03374f]/5 border-[#03374f]/20 text-[#03374f]'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  ALTA Extended
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Calculate Button */}
        <Button
          type="button"
          onClick={handleCalculate}
          disabled={!isFormValid || isCalculating}
          className="w-full h-12 bg-[#03374f] hover:bg-[#03374f]/90 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Estimate
            </>
          )}
        </Button>
      </div>

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {results && (
        <div ref={resultsRef} className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-t border-gray-100 pt-6">
            {/* Call for Quote Banner */}
            {results.callForQuote && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                <Phone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Call for Quote</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Properties over $3,000,000 require a custom quote. Please call us at{' '}
                    <a href="tel:7145166700" className="underline font-medium">(714) 516-6700</a>.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-medium text-[#03374f] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#03374f]/60" />
                Fee Estimate
              </h3>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#03374f] transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
            </div>

            <div className="space-y-3">
              {/* Title Insurance */}
              <FeeSection
                icon={<Shield className="w-4 h-4" />}
                title="Title Insurance"
                total={results.titleFees.total}
                items={[
                  ...(results.titleFees.ownerPolicy > 0
                    ? [{ label: results.titleFees.ownerPolicyLabel, amount: results.titleFees.ownerPolicy }]
                    : []),
                  ...(results.titleFees.lenderPolicy > 0
                    ? [{ label: results.titleFees.lenderPolicyLabel, amount: results.titleFees.lenderPolicy }]
                    : []),
                  ...results.titleFees.endorsements
                    .filter(e => e.fee > 0)
                    .map(e => ({ label: e.name, amount: e.fee })),
                ]}
              />

              {/* Escrow Fees */}
              <FeeSection
                icon={<Building2 className="w-4 h-4" />}
                title="Escrow Fees"
                total={results.escrowFees.total}
                items={[
                  { label: 'Escrow Fee', amount: results.escrowFees.baseFee },
                  ...results.escrowFees.additionalFees.map(f => ({ label: f.name, amount: f.fee })),
                ]}
              />

              {/* Transfer Taxes (Purchase only) */}
              {transactionType === 'purchase' && results.transferTaxes.total > 0 && (
                <FeeSection
                  icon={<Receipt className="w-4 h-4" />}
                  title="Transfer Taxes"
                  total={results.transferTaxes.total}
                  items={[
                    {
                      label: `County Transfer Tax ($${results.transferTaxes.countyRate.toFixed(2)}/1,000)`,
                      amount: results.transferTaxes.countyTax,
                    },
                    ...(results.transferTaxes.cityTax > 0
                      ? [{
                        label: `City Transfer Tax ($${results.transferTaxes.cityRate.toFixed(2)}/1,000)`,
                        amount: results.transferTaxes.cityTax,
                      }]
                      : []),
                  ]}
                />
              )}

              {/* Additional Fees */}
              {results.additionalFees.length > 0 && (
                <FeeSection
                  icon={<FileText className="w-4 h-4" />}
                  title="Additional Fees"
                  total={results.additionalFeesTotal}
                  items={results.additionalFees.map(f => ({ label: f.name, amount: f.fee }))}
                />
              )}

              {/* Grand Total */}
              <div className="bg-gradient-to-r from-[#03374f]/5 to-[#03374f]/[0.02] border border-[#03374f]/10 rounded-xl p-5 mt-5">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#03374f]">Estimated Total</span>
                  <span className="font-semibold text-2xl text-[#03374f]">
                    {formatCurrency(results.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 mt-4 p-3 bg-gray-50 rounded-xl">
                <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  {results.disclaimer}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex-1 h-11 border-gray-200 text-[#03374f] hover:bg-gray-50 font-medium text-sm rounded-xl"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Estimate
                </Button>
                <a
                  href="tel:7145166700"
                  className="flex-1 h-11 inline-flex items-center justify-center bg-[#e8830c] hover:bg-[#e8830c]/90 text-white font-medium text-sm rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call for Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Fee Section Sub-Component ───────────────────────────────────────────────

function FeeSection({
  icon,
  title,
  total,
  items,
}: {
  icon: React.ReactNode
  title: string
  total: number
  items: { label: string; amount: number }[]
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-[#f8f6f3]/60 rounded-xl overflow-hidden border border-gray-100/80">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#f8f6f3] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[#03374f]/50">{icon}</span>
          <span className="font-medium text-[#03374f] text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#03374f] text-sm">{formatCurrency(total)}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm pl-7">
              <span className="text-gray-500">{item.label}</span>
              <span className="text-gray-600">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
