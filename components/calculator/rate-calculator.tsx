'use client'

import { useState, useEffect } from 'react'
import { Calculator, Loader2, ChevronDown, DollarSign, Home, Building2, FileText, Receipt } from 'lucide-react'
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

interface County {
  id: string
  name: string
}

interface City {
  id: string
  name: string
  transferTaxRate: number
}

interface FeeBreakdown {
  titleInsurance: {
    ownerPolicy: number
    lenderPolicy: number
    endorsements: number
    total: number
  }
  escrowFees: {
    baseFee: number
    documentPreparation: number
    notaryFees: number
    wireTransfer: number
    courierFees: number
    total: number
  }
  transferTaxes: {
    county: number
    city: number
    total: number
  }
  recordingFees: {
    deed: number
    mortgage: number
    total: number
  }
  grandTotal: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '')
  return parseFloat(cleaned) || 0
}

export function RateCalculator() {
  const [transactionType, setTransactionType] = useState<'purchase' | 'refinance'>('purchase')
  const [counties, setCounties] = useState<County[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCounty, setSelectedCounty] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedCityData, setSelectedCityData] = useState<City | null>(null)
  const [isLoadingCounties, setIsLoadingCounties] = useState(true)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<FeeBreakdown | null>(null)
  const [salesPrice, setSalesPrice] = useState('')
  const [loanAmount, setLoanAmount] = useState('')

  // Fetch counties on mount
  useEffect(() => {
    async function fetchCounties() {
      try {
        const response = await fetch('/api/calculator/counties')
        const data = await response.json()
        setCounties(data.counties)
      } catch (error) {
        console.error('Failed to fetch counties:', error)
      } finally {
        setIsLoadingCounties(false)
      }
    }
    fetchCounties()
  }, [])

  // Fetch cities when county changes
  useEffect(() => {
    if (!selectedCounty) {
      setCities([])
      setSelectedCity('')
      setSelectedCityData(null)
      return
    }

    async function fetchCities() {
      setIsLoadingCities(true)
      try {
        const response = await fetch(`/api/calculator/cities?county=${selectedCounty}`)
        const data = await response.json()
        setCities(data.cities)
        setSelectedCity('')
        setSelectedCityData(null)
      } catch (error) {
        console.error('Failed to fetch cities:', error)
      } finally {
        setIsLoadingCities(false)
      }
    }
    fetchCities()
  }, [selectedCounty])

  // Update selected city data when city changes
  useEffect(() => {
    if (selectedCity && cities.length > 0) {
      const cityData = cities.find(c => c.id === selectedCity)
      setSelectedCityData(cityData || null)
    } else {
      setSelectedCityData(null)
    }
  }, [selectedCity, cities])

  // Clear results when form changes
  useEffect(() => {
    setResults(null)
  }, [transactionType, selectedCounty, selectedCity, salesPrice, loanAmount])

  const handleCalculate = async () => {
    if (!selectedCounty || !selectedCity || !selectedCityData) return
    if (transactionType === 'purchase' && !salesPrice) return
    if (!loanAmount) return

    setIsCalculating(true)
    try {
      const response = await fetch('/api/calculator/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionType,
          county: selectedCounty,
          city: selectedCity,
          salesPrice: transactionType === 'purchase' ? parseCurrencyInput(salesPrice) : undefined,
          loanAmount: parseCurrencyInput(loanAmount),
          cityTransferTaxRate: selectedCityData.transferTaxRate,
        }),
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Failed to calculate fees:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const isFormValid = 
    selectedCounty && 
    selectedCity && 
    loanAmount && 
    (transactionType === 'refinance' || salesPrice)

  return (
    <div className="w-full">
      {/* Form Section */}
      <div className="space-y-4">
        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-lg border border-gray-100">
            <button
              type="button"
              onClick={() => setTransactionType('purchase')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                transactionType === 'purchase'
                  ? 'bg-white text-secondary shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Home className="w-4 h-4" />
              Purchase
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('refinance')}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                transactionType === 'refinance'
                  ? 'bg-white text-secondary shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Building2 className="w-4 h-4" />
              Refinance
            </button>
          </div>
        </div>

        {/* County Select */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            County
          </label>
          <Select
            value={selectedCounty}
            onValueChange={setSelectedCounty}
            disabled={isLoadingCounties}
          >
            <SelectTrigger className="w-full h-11 bg-white border-gray-200">
              <SelectValue placeholder={isLoadingCounties ? 'Loading counties...' : 'Select county'} />
            </SelectTrigger>
            <SelectContent>
              {counties.map((county) => (
                <SelectItem key={county.id} value={county.id}>
                  {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Select - conditional */}
        {selectedCounty && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              City
            </label>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={isLoadingCities}
            >
              <SelectTrigger className="w-full h-11 bg-white border-gray-200">
                <SelectValue placeholder={isLoadingCities ? 'Loading cities...' : 'Select city'} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCityData && transactionType === 'purchase' && (
              <p className="mt-1.5 text-xs text-gray-400">
                Transfer Tax Rate: ${selectedCityData.transferTaxRate.toFixed(2)} per $1,000
              </p>
            )}
          </div>
        )}

        {/* Sales Price - Purchase only */}
        {transactionType === 'purchase' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Sales Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                inputMode="numeric"
                placeholder="500,000"
                value={salesPrice}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '')
                  if (raw) {
                    setSalesPrice(Number(raw).toLocaleString())
                  } else {
                    setSalesPrice('')
                  }
                }}
                className="pl-9 h-11 bg-white border-gray-200"
              />
            </div>
          </div>
        )}

        {/* Loan Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Loan Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              inputMode="numeric"
              placeholder="400,000"
              value={loanAmount}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '')
                if (raw) {
                  setLoanAmount(Number(raw).toLocaleString())
                } else {
                  setLoanAmount('')
                }
              }}
              className="pl-9 h-11 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          type="button"
          onClick={handleCalculate}
          disabled={!isFormValid || isCalculating}
          className="w-full h-11 bg-secondary hover:bg-secondary/90 text-white font-medium text-sm rounded-lg"
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

      {/* Results Section */}
      {results && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-base font-medium text-secondary mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-secondary/60" />
              Estimated Fees
            </h3>

            <div className="space-y-3">
              {/* Title Insurance */}
              <FeeSection
                icon={<FileText className="w-4 h-4" />}
                title="Title Insurance"
                total={results.titleInsurance.total}
                items={[
                  ...(results.titleInsurance.ownerPolicy > 0
                    ? [{ label: "Owner's Policy", amount: results.titleInsurance.ownerPolicy }]
                    : []),
                  { label: "Lender's Policy", amount: results.titleInsurance.lenderPolicy },
                  { label: 'Endorsements', amount: results.titleInsurance.endorsements },
                ]}
              />

              {/* Escrow Fees */}
              <FeeSection
                icon={<Building2 className="w-4 h-4" />}
                title="Escrow Fees"
                total={results.escrowFees.total}
                items={[
                  { label: 'Base Fee', amount: results.escrowFees.baseFee },
                  { label: 'Document Preparation', amount: results.escrowFees.documentPreparation },
                  { label: 'Notary Fees', amount: results.escrowFees.notaryFees },
                  { label: 'Wire Transfer', amount: results.escrowFees.wireTransfer },
                  { label: 'Courier Fees', amount: results.escrowFees.courierFees },
                ]}
              />

              {/* Transfer Taxes - Purchase only */}
              {transactionType === 'purchase' && results.transferTaxes.total > 0 && (
                <FeeSection
                  icon={<Receipt className="w-4 h-4" />}
                  title="Transfer Taxes"
                  total={results.transferTaxes.total}
                  items={[
                    { label: 'County Transfer Tax', amount: results.transferTaxes.county },
                    { label: 'City Transfer Tax', amount: results.transferTaxes.city },
                  ]}
                />
              )}

              {/* Recording Fees */}
              <FeeSection
                icon={<FileText className="w-4 h-4" />}
                title="Recording Fees"
                total={results.recordingFees.total}
                items={[
                  ...(results.recordingFees.deed > 0
                    ? [{ label: 'Deed Recording', amount: results.recordingFees.deed }]
                    : []),
                  { label: 'Mortgage Recording', amount: results.recordingFees.mortgage },
                ]}
              />

              {/* Grand Total */}
              <div className="bg-secondary/5 border border-secondary/10 rounded-xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-secondary">Estimated Total</span>
                  <span className="font-semibold text-xl text-secondary">{formatCurrency(results.grandTotal)}</span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                This is an estimate only. Actual fees may vary based on specific transaction details.
                Contact us for a detailed quote.
              </p>

              {/* Get Quote Button */}
              <Button
                variant="outline"
                className="w-full h-10 mt-2 border-gray-200 text-secondary hover:bg-gray-50 font-medium text-sm"
              >
                Request Detailed Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-secondary/50">{icon}</span>
          <span className="font-medium text-secondary text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-secondary text-sm">{formatCurrency(total)}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm pl-6">
              <span className="text-gray-500">{item.label}</span>
              <span className="text-gray-600">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
