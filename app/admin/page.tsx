"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  LogOut,
  DollarSign,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Save,
  RefreshCw,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ─── Types ───────────────────────────────────────────────────────

interface Fee {
  id: number
  transactionType: string
  category: string
  name: string
  value: number
  active: boolean
}

interface RateEntry {
  [key: string]: any
}

// ─── Fee Editor Component ────────────────────────────────────────

function FeeEditor({ fee, onSave, onCancel }: { fee?: Fee; onSave: (data: Partial<Fee>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    transactionType: fee?.transactionType || "resale",
    category: fee?.category || "escrow",
    name: fee?.name || "",
    value: fee?.value?.toString() || "",
    active: fee?.active !== false,
  })

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
      <h3 className="font-semibold text-secondary">{fee ? "Edit Fee" : "Add New Fee"}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Transaction Type</label>
          <select
            value={formData.transactionType}
            onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"
          >
            <option value="resale">Resale</option>
            <option value="refinance">Refinance</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"
          >
            <option value="escrow">Escrow</option>
            <option value="recording">Recording</option>
            <option value="title">Title</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fee Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Fee name"
            className="h-10"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Value ($)</label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="0.00"
            className="h-10"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="rounded"
          />
          Active
        </label>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() =>
              onSave({
                ...formData,
                value: parseFloat(formData.value) || 0,
                ...(fee && { id: fee.id }),
              })
            }
          >
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Fee Management Tab ──────────────────────────────────────────

function FeesTab() {
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Fee | null>(null)
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<string>("all")

  const loadFees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/fees")
      if (res.ok) {
        const data = await res.json()
        setFees(data)
      }
    } catch (err) {
      console.error("Failed to load fees:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFees()
  }, [loadFees])

  const handleSave = async (data: Partial<Fee>) => {
    try {
      const isUpdate = data.id !== undefined
      const res = await fetch("/api/admin/fees", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setEditing(null)
        setAdding(false)
        loadFees()
      }
    } catch (err) {
      console.error("Failed to save fee:", err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this fee?")) return
    try {
      const res = await fetch(`/api/admin/fees?id=${id}`, { method: "DELETE" })
      if (res.ok) loadFees()
    } catch (err) {
      console.error("Failed to delete fee:", err)
    }
  }

  const filteredFees = filter === "all" ? fees : fees.filter((f) => f.transactionType === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-secondary">Additional Fees</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredFees.length} fees
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="resale">Resale</option>
            <option value="refinance">Refinance</option>
          </select>
          <Button size="sm" onClick={() => loadFees()} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Fee
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {adding && (
        <FeeEditor onSave={handleSave} onCancel={() => setAdding(false)} />
      )}

      {/* Edit Form */}
      {editing && (
        <FeeEditor fee={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading fees...</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Value</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-center">Active</th>
                <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{fee.id}</td>
                  <td className="px-4 py-3 font-medium text-secondary">{fee.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      fee.transactionType === "resale" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}>
                      {fee.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{fee.category}</td>
                  <td className="px-4 py-3 text-right font-mono">${fee.value.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    {fee.active ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing(fee)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(fee.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Rates Management Tab ────────────────────────────────────────

function RatesTab() {
  const [rateType, setRateType] = useState("title")
  const [rates, setRates] = useState<RateEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editData, setEditData] = useState<RateEntry>({})

  const rateTypes = [
    { value: "title", label: "Title Rates" },
    { value: "escrow-resale", label: "Escrow (Resale)" },
    { value: "escrow-refinance", label: "Escrow (Refinance)" },
    { value: "endorsements", label: "Endorsements" },
  ]

  const loadRates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/rates?type=${rateType}`)
      if (res.ok) {
        const json = await res.json()
        setRates(json.data)
      }
    } catch (err) {
      console.error("Failed to load rates:", err)
    } finally {
      setLoading(false)
    }
  }, [rateType])

  useEffect(() => {
    loadRates()
  }, [loadRates])

  const handleSave = async (index: number, data: RateEntry) => {
    try {
      const res = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: rateType, index, data }),
      })
      if (res.ok) {
        setEditIndex(null)
        loadRates()
      }
    } catch (err) {
      console.error("Failed to update rate:", err)
    }
  }

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this rate entry?")) return
    try {
      const res = await fetch(`/api/admin/rates?type=${rateType}&index=${index}`, {
        method: "DELETE",
      })
      if (res.ok) loadRates()
    } catch (err) {
      console.error("Failed to delete rate:", err)
    }
  }

  // Get column keys from first entry
  const columns = rates.length > 0 ? Object.keys(rates[0]) : []

  const formatCellValue = (key: string, value: any) => {
    if (value === null || value === undefined) return "—"
    if (typeof value === "number") {
      if (key.toLowerCase().includes("range") || key.toLowerCase().includes("rate") || key.toLowerCase().includes("amount") || key.toLowerCase().includes("price") || key.toLowerCase().includes("value") || key.toLowerCase().includes("minimum")) {
        return value.toLocaleString()
      }
    }
    if (typeof value === "boolean") return value ? "Yes" : "No"
    return String(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-secondary">Rate Tables</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={rateType}
            onChange={(e) => { setRateType(e.target.value); setEditIndex(null) }}
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm"
          >
            {rateTypes.map((rt) => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
          <Button size="sm" onClick={() => loadRates()} variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Showing {rates.length} entries for <strong>{rateTypes.find(r => r.value === rateType)?.label}</strong>. 
        Click the edit icon to modify a row.
      </p>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading rates...</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-3 font-semibold text-gray-600 text-xs">#</th>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-3 font-semibold text-gray-600 text-xs whitespace-nowrap">
                    {col.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </th>
                ))}
                <th className="px-3 py-3 font-semibold text-gray-600 text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.slice(0, 100).map((entry, index) => (
                <tr key={index} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-2 text-gray-400 font-mono text-xs">{index}</td>
                  {editIndex === index ? (
                    columns.map((col) => (
                      <td key={col} className="px-3 py-2">
                        <input
                          type={typeof entry[col] === "number" ? "number" : "text"}
                          value={editData[col] ?? entry[col] ?? ""}
                          onChange={(e) => setEditData({ ...editData, [col]: typeof entry[col] === "number" ? parseFloat(e.target.value) || 0 : e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </td>
                    ))
                  ) : (
                    columns.map((col) => (
                      <td key={col} className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                        {formatCellValue(col, entry[col])}
                      </td>
                    ))
                  )}
                  <td className="px-3 py-2 text-right">
                    {editIndex === index ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSave(index, editData)}
                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </button>
                        <button
                          onClick={() => setEditIndex(null)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditIndex(index); setEditData({ ...entry }) }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rates.length > 100 && (
            <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
              Showing first 100 of {rates.length} entries. Use the API for bulk operations.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Dashboard ────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<"fees" | "rates">("fees")

  // Check authentication on mount
  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/login")
        } else {
          setAuthenticated(true)
        }
      })
      .catch(() => router.push("/admin/login"))
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <span className="font-bold text-secondary">PCT Admin</span>
                <span className="text-xs text-gray-400 ml-2">Rate Calculator Management</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("fees")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "fees"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Additional Fees
            </button>
            <button
              onClick={() => setActiveTab("rates")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "rates"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              Rate Tables
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "fees" ? <FeesTab /> : <RatesTab />}
      </main>
    </div>
  )
}
