"use client"

import { useState, useMemo } from "react"
import {
  Flame,
  Zap,
  Droplets,
  Trash2,
  Phone,
  Wifi,
  Building2,
  Landmark,
  GraduationCap,
  BookOpen,
  Search,
  RotateCcw,
  ChevronDown,
  PhoneCall,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import allUtilities from "@/lib/data/all-utilities.json"

type UtilityRecord = {
  County: string
  City: string
  "Utility Category": string
  Provider: string
  "Phone Number(s)": string
}

const data = allUtilities as UtilityRecord[]

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Gas:                 { icon: Flame,          color: "text-orange-600",  bg: "bg-orange-50 border-orange-100" },
  Electric:            { icon: Zap,            color: "text-yellow-600",  bg: "bg-yellow-50 border-yellow-100" },
  Water:               { icon: Droplets,       color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
  Trash:               { icon: Trash2,         color: "text-green-600",   bg: "bg-green-50 border-green-100" },
  Phone:               { icon: Phone,          color: "text-violet-600",  bg: "bg-violet-50 border-violet-100" },
  "Cable/Internet":    { icon: Wifi,           color: "text-sky-600",     bg: "bg-sky-50 border-sky-100" },
  "Chamber of Commerce":{ icon: Building2,     color: "text-rose-600",    bg: "bg-rose-50 border-rose-100" },
  "City Hall":         { icon: Landmark,       color: "text-slate-600",   bg: "bg-slate-50 border-slate-100" },
  School:              { icon: GraduationCap,  color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-100" },
  Library:             { icon: BookOpen,       color: "text-teal-600",    bg: "bg-teal-50 border-teal-100" },
}

// Category display order
const categoryOrder = [
  "Gas", "Electric", "Water", "Trash",
  "Phone", "Cable/Internet",
  "City Hall", "Chamber of Commerce", "School", "Library",
]

export function UtilityLookup() {
  const [selectedCounty, setSelectedCounty] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [results, setResults] = useState<UtilityRecord[] | null>(null)

  // Derive sorted county list
  const counties = useMemo(
    () => [...new Set(data.map((d) => d.County))].sort(),
    []
  )

  // Derive cities for selected county
  const cities = useMemo(() => {
    if (!selectedCounty) return []
    return [...new Set(data.filter((d) => d.County === selectedCounty).map((d) => d.City))].sort()
  }, [selectedCounty])

  function handleCountyChange(county: string) {
    setSelectedCounty(county)
    setSelectedCity("")
    setResults(null)
  }

  function handleSearch() {
    if (!selectedCounty || !selectedCity) return
    const found = data.filter(
      (d) => d.County === selectedCounty && d.City === selectedCity
    )
    // Sort by category order
    found.sort((a, b) => {
      const ai = categoryOrder.indexOf(a["Utility Category"])
      const bi = categoryOrder.indexOf(b["Utility Category"])
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
    setResults(found)
  }

  function handleReset() {
    setSelectedCounty("")
    setSelectedCity("")
    setResults(null)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Search className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-secondary mb-3">Utility Provider Lookup</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Moving or just closed? Look up gas, electric, water, trash, internet, school district, and more
            for any city across California's seven-county service area.
          </p>
        </div>

        {/* Search Controls */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            {/* County */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                1. Select County
              </label>
              <div className="relative">
                <select
                  value={selectedCounty}
                  onChange={(e) => handleCountyChange(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                >
                  <option value="">— Select County —</option>
                  {counties.map((c) => (
                    <option key={c} value={c}>{c} County</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                2. Select City
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedCounty}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">— Select City —</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSearch}
              disabled={!selectedCounty || !selectedCity}
              className="flex-1 gap-2"
              size="lg"
            >
              <Search className="w-4 h-4" />
              Look Up Utilities
            </Button>
            {results !== null && (
              <Button
                variant="outline"
                onClick={handleReset}
                size="lg"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {results !== null && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary">
                Utility Providers for{" "}
                <span className="text-primary">{selectedCity}, {selectedCounty} County</span>
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {results.length} services found
              </span>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                No utility records found for this city. Try a nearby city or contact us.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {results.map((item, idx) => {
                  const config = categoryConfig[item["Utility Category"]] ?? {
                    icon: Building2,
                    color: "text-gray-600",
                    bg: "bg-gray-50 border-gray-100",
                  }
                  const Icon = config.icon

                  // Split multiple providers/phones on semicolon
                  const providers = item.Provider.split(";").map((p) => p.trim())
                  const phones = item["Phone Number(s)"].split(";").map((p) => p.trim())

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-5 ${config.bg}`}
                    >
                      {/* Category header */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <span className={`font-bold text-sm uppercase tracking-wide ${config.color}`}>
                          {item["Utility Category"]}
                        </span>
                      </div>

                      {/* Provider rows */}
                      <div className="space-y-3">
                        {providers.map((provider, pi) => (
                          <div key={pi} className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="font-semibold text-gray-800 text-sm leading-snug mb-1">
                              {provider}
                            </p>
                            {phones[pi] && (
                              <a
                                href={`tel:${phones[pi].replace(/\D/g, "")}`}
                                className={`inline-flex items-center gap-1.5 text-sm font-medium ${config.color} hover:underline`}
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                {phones[pi]}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 mt-6 text-center max-w-2xl mx-auto">
              Utility provider information is sourced from publicly available records and may be subject to
              change. We recommend verifying details directly with the provider before transferring service.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
