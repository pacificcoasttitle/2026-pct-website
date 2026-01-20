'use client'

import { useState, useEffect, useCallback } from 'react'

interface TransferTaxEntry {
  City: string
  County: string
  'County Transfer Tax': string
  'City Transfer Tax (When Applicable)': string
}

let cachedData: TransferTaxEntry[] | null = null

export function useTransferTax() {
  const [data, setData] = useState<TransferTaxEntry[] | null>(cachedData)
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedData) return

    async function fetchData() {
      try {
        const response = await fetch('https://tessa-proxy.onrender.com/data.json', {
          cache: 'force-cache'
        })
        const json = await response.json()
        cachedData = json
        setData(json)
      } catch (err) {
        console.error('Transfer tax data fetch error:', err)
        setError('Transfer tax data unavailable')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const lookup = useCallback((cityOrCounty: string): TransferTaxEntry | null => {
    if (!data) return null
    const lower = cityOrCounty.toLowerCase().trim()
    return data.find(
      entry => 
        entry.City.toLowerCase() === lower || 
        entry.County.toLowerCase() === lower
    ) || null
  }, [data])

  const search = useCallback((query: string): TransferTaxEntry[] => {
    if (!data || !query.trim()) return []
    const lower = query.toLowerCase().trim()
    return data.filter(
      entry =>
        entry.City.toLowerCase().includes(lower) ||
        entry.County.toLowerCase().includes(lower)
    ).slice(0, 10) // Limit results
  }, [data])

  return { data, isLoading, error, lookup, search }
}
