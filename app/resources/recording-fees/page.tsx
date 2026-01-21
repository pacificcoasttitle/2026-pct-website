"use client"

import { useState, useMemo } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ChevronRight, Search, ArrowUpDown, X, Info } from "lucide-react"
import { recordingFees } from "@/data/resources"

type SortKey = "county" | "baseFee" | "fraudFee" | "additionalPages" | "nonConforming" | "transferTax"
type SortDirection = "asc" | "desc"

export default function RecordingFeesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("county")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedFees = useMemo(() => {
    let filtered = recordingFees.filter(fee =>
      fee.county.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortDirection === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

    return filtered
  }, [searchQuery, sortKey, sortDirection])

  const SortableHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th 
      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="flex items-center gap-2">
        {label}
        <ArrowUpDown className={`w-4 h-4 ${sortKey === sortKeyName ? "text-primary" : "text-gray-400"}`} />
      </span>
    </th>
  )

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
            <span className="text-primary font-medium">Recording Fees</span>
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
              Recording Fees
            </h1>
            <p className="text-xl text-gray-600">
              Fee reference by California county. Use this table to estimate document recording costs for your transactions.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by county name..."
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
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Info Banner */}
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Recording Fees</p>
              <p>All fees are subject to change. Click column headers to sort. Documentary Transfer Tax is $1.10 per $1,000 of sale price (county standard). Some cities impose additional transfer taxes.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <SortableHeader label="County" sortKeyName="county" />
                  <SortableHeader label="Base Fee" sortKeyName="baseFee" />
                  <SortableHeader label="Fraud Fee" sortKeyName="fraudFee" />
                  <SortableHeader label="Add'l Pages" sortKeyName="additionalPages" />
                  <SortableHeader label="Non-Conforming" sortKeyName="nonConforming" />
                  <SortableHeader label="Transfer Tax" sortKeyName="transferTax" />
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedFees.map((fee, index) => (
                  <tr 
                    key={fee.county}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{fee.county}</td>
                    <td className="px-4 py-3 text-gray-600">${fee.baseFee.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">${fee.fraudFee.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">${fee.additionalPages.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">${fee.nonConforming.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">${fee.transferTax.toFixed(2)}/$1,000</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedFees.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No counties found matching "{searchQuery}"</p>
            </div>
          )}

          <p className="mt-6 text-sm text-gray-500 text-center">
            Showing {filteredAndSortedFees.length} of {recordingFees.length} counties
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Need Transfer Tax Information?</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Some California cities impose additional transfer taxes. Check our City Transfer Tax guide for local rates.
            </p>
            <Link
              href="/resources/transfer-tax"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              View Transfer Tax Rates
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
