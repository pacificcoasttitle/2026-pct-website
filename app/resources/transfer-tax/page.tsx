"use client"

import { useState, useMemo } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ChevronRight, Search, X, AlertCircle, Info, MapPin } from "lucide-react"
import { cityTransferTax } from "@/data/resources"

export default function TransferTaxPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null)

  const counties = useMemo(() => {
    const uniqueCounties = [...new Set(cityTransferTax.map(item => item.county))]
    return uniqueCounties.sort()
  }, [])

  const filteredData = useMemo(() => {
    return cityTransferTax
      .filter(item => 
        (!selectedCounty || item.county === selectedCounty) &&
        (!searchQuery || 
          item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.county.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => a.city.localeCompare(b.city))
  }, [searchQuery, selectedCounty])

  // Highlight cities with higher tax rates
  const isHighRate = (rate: number) => rate > 5

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Breadcrumb */}
      <div className="pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/resources" className="hover:text-primary">Resources</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">Transfer Tax</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4">
              Reference Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              City Transfer Tax
            </h1>
            <p className="text-xl text-gray-600">
              Transfer tax rates for California counties and cities. While the standard county tax is $1.10 per $1,000, 
              many cities impose additional transfer taxes.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search city or county..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <select
              value={selectedCounty || ""}
              onChange={(e) => setSelectedCounty(e.target.value || null)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-gray-900"
            >
              <option value="">All Counties</option>
              {counties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Info Banners */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Standard County Tax</p>
                <p>The standard California county documentary transfer tax is $1.10 per $1,000 of sale price (or portion thereof).</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">City Transfer Taxes</p>
                <p>City taxes are in addition to county taxes. Some cities (like San Francisco and Oakland) have tiered rates based on sale price.</p>
              </div>
            </div>
          </div>

          {/* Notable Cities Section */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-secondary mb-4">Notable Cities with Higher Rates</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <h3 className="font-semibold text-red-900">San Francisco</h3>
                </div>
                <p className="text-sm text-red-800 mb-1">Tiered rates up to <span className="font-bold">6%</span> for sales $25M+</p>
                <p className="text-xs text-red-600">Base rate: $5.00 per $1,000</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">Oakland</h3>
                </div>
                <p className="text-sm text-orange-800 mb-1">Tiered rates up to <span className="font-bold">$25</span> per $1,000 for $5M+</p>
                <p className="text-xs text-orange-600">Base rate: $15.00 per $1,000</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-amber-900">Berkeley</h3>
                </div>
                <p className="text-sm text-amber-800 mb-1">Transfer tax rate: <span className="font-bold">$15.00</span> per $1,000</p>
                <p className="text-xs text-amber-600">One of the highest in California</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">City</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">County</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr 
                    key={`${item.city}-${item.county}-${index}`}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    } ${isHighRate(item.rate) ? "bg-red-50/30" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.city}
                      {isHighRate(item.rate) && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">High</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.county}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      ${item.rate.toFixed(2)} / $1,000
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No results found</p>
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500 text-center">
            Showing {filteredData.length} results
          </p>

          {/* Disclaimer */}
          <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Disclaimer</h3>
            <p className="text-sm text-gray-600">
              All listed closing costs are reflective of current customary practices within the State of California. 
              All items are subject to individual contractual negotiation and change without notice. 
              For the most current rates and exemptions, please contact your local county assessor or escrow officer.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
