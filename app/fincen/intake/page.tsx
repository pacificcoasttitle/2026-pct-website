"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Building2,
  User,
  Users,
  ClipboardList,
  FileCheck,
  Phone,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────

interface SellerData {
  sellerType: string
  name: string
  trusteeName: string
  street: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
}

interface FormData {
  // Step 1
  officerName: string
  officerEmail: string
  officerPhone: string
  branchOffice: string
  escrowNumber: string
  propertyStreet: string
  propertyCity: string
  propertyState: string
  propertyZip: string
  propertyCounty: string
  propertyType: string
  closingDate: string
  purchasePrice: string
  // Step 2
  buyerType: string
  // Individual
  buyerFirstName: string
  buyerMiddleName: string
  buyerLastName: string
  buyerDob: string
  buyerStreet: string
  buyerCity: string
  buyerState: string
  buyerZip: string
  buyerPhone: string
  buyerEmail: string
  // Entity
  entityName: string
  entityLegalType: string
  entityFormationState: string
  entityEin: string
  entityStreet: string
  entityCity: string
  entityState: string
  entityZip: string
  entityContactName: string
  entityContactPhone: string
  entityContactEmail: string
  beneficialOwnersKnown: string
  beneficialOwnerCount: string
  beneficialOwnerNames: string
  // Trust
  trustName: string
  trustType: string
  trusteeName: string
  trusteePhone: string
  trusteeEmail: string
  trustStreet: string
  trustCity: string
  trustState: string
  trustZip: string
  settlorName: string
  trustEin: string
  // Step 3
  sellers: SellerData[]
  // Step 4 — Review & Submit
  certified: boolean
}

const INITIAL: FormData = {
  officerName: "", officerEmail: "", officerPhone: "",
  branchOffice: "", escrowNumber: "",
  propertyStreet: "", propertyCity: "", propertyState: "CA",
  propertyZip: "", propertyCounty: "", propertyType: "", closingDate: "", purchasePrice: "",
  buyerType: "",
  buyerFirstName: "", buyerMiddleName: "", buyerLastName: "", buyerDob: "",
  buyerStreet: "", buyerCity: "", buyerState: "CA", buyerZip: "",
  buyerPhone: "", buyerEmail: "",
  entityName: "", entityLegalType: "", entityFormationState: "", entityEin: "",
  entityStreet: "", entityCity: "", entityState: "CA", entityZip: "",
  entityContactName: "", entityContactPhone: "", entityContactEmail: "",
  beneficialOwnersKnown: "", beneficialOwnerCount: "", beneficialOwnerNames: "",
  trustName: "", trustType: "", trusteeName: "", trusteePhone: "", trusteeEmail: "",
  trustStreet: "", trustCity: "", trustState: "CA", trustZip: "",
  settlorName: "", trustEin: "",
  sellers: [{ sellerType: "individual", name: "", trusteeName: "", street: "", city: "", state: "CA", zip: "", phone: "", email: "" }],
  certified: false,
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
  "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
  "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
]

const STEPS = [
  { label: "Transaction", icon: Building2 },
  { label: "Buyer",       icon: User },
  { label: "Seller(s)",  icon: Users },
  { label: "Review",     icon: ClipboardList },
]

// ── Proptype URL param → display name ────────────────────────────────────────
// Normalizes incoming value: lowercase, collapse spaces/hyphens to underscores
function normalizeProptype(raw: string): string {
  return raw.toLowerCase().trim().replace(/[\s\-\/]+/g, "_").replace(/_+/g, "_")
}

const PROPTYPE_MAP: Record<string, string> = {
  // Single family variants (LOS systems send many flavors)
  single_family:                  "Single Family",
  single_family_residential:      "Single Family",
  sfr:                            "Single Family",
  single_family_home:             "Single Family",
  detached:                       "Single Family",
  // Condo / townhome
  condo:                          "Condo / Townhome",
  condo_townhome:                 "Condo / Townhome",
  condominium:                    "Condo / Townhome",
  townhouse:                      "Condo / Townhome",
  townhome:                       "Condo / Townhome",
  attached:                       "Condo / Townhome",
  pud:                            "Condo / Townhome",
  // 2–4 unit
  "2_4_unit":                     "2–4 Unit",
  two_to_four_unit:               "2–4 Unit",
  multi_family:                   "2–4 Unit",
  multifamily:                    "2–4 Unit",
  duplex:                         "2–4 Unit",
  triplex:                        "2–4 Unit",
  fourplex:                       "2–4 Unit",
  "2_unit":                       "2–4 Unit",
  "3_unit":                       "2–4 Unit",
  "4_unit":                       "2–4 Unit",
  // Co-op
  coop:                           "Co-op",
  co_op:                          "Co-op",
  cooperative:                    "Co-op",
  // Vacant land
  vacant_land:                    "Vacant Land (Residential)",
  land:                           "Vacant Land (Residential)",
  lot:                            "Vacant Land (Residential)",
  vacant_lot:                     "Vacant Land (Residential)",
  // Other
  other:                          "Other",
}

// ── Shared field components ───────────────────────────────────────────────────

function Field({
  label, required, hint, error, prefilled, children,
}: {
  label: string; required?: boolean; hint?: string; error?: string; prefilled?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="block text-sm font-semibold text-secondary">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {prefilled && (
          <span className="text-xs text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-normal whitespace-nowrap">
            ✓ Pre-filled from order
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, type = "text", disabled,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
    />
  )
}

function SelectInput({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[] | { value: string; label: string }[]; placeholder?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt =>
        typeof opt === "string"
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
  )
}

function AddressFields({
  prefix, values, onChange,
}: {
  prefix: string
  values: { street: string; city: string; state: string; zip: string }
  onChange: (field: string, val: string) => void
}) {
  return (
    <div className="space-y-3">
      <TextInput value={values.street} onChange={v => onChange(`${prefix}Street`, v)} placeholder="Street address" />
      <div className="grid grid-cols-2 gap-3">
        <TextInput value={values.city} onChange={v => onChange(`${prefix}City`, v)} placeholder="City" />
        <SelectInput value={values.state} onChange={v => onChange(`${prefix}State`, v)} options={US_STATES} />
      </div>
      <TextInput value={values.zip} onChange={v => onChange(`${prefix}Zip`, v)} placeholder="ZIP code" />
    </div>
  )
}

function RadioGroup({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
            value === opt.value ? "border-primary bg-primary text-white" : "border-gray-200 bg-white text-gray-700 hover:border-primary/50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Main form component (reads URL params) ────────────────────────────────────

function IntakeFormContent() {
  const params = useSearchParams()
  const [step, setStep] = useState(1)

  // Compute prefilled set once (stable — params don't change on this page)
  const prefilledFields = useState<Set<string>>(() => {
    const pf = new Set<string>()
    const check = (key: string, field: string) => { if (params.get(key)) pf.add(field) }
    check("officer",  "officerName");    check("email",   "officerEmail")
    check("phone",    "officerPhone");   check("branch",  "branchOffice")
    check("escrow",   "escrowNumber");   check("street",  "propertyStreet")
    check("city",     "propertyCity");   check("state",   "propertyState")
    check("zip",      "propertyZip");    check("county",  "propertyCounty")
    check("proptype", "propertyType");   check("closing", "closingDate")
    check("price",    "purchasePrice")
    return pf
  })[0]

  const hasPrefill = prefilledFields.size > 0
  const pf = (field: string) => prefilledFields.has(field)

  const [data, setData] = useState<FormData>(() => {
    const init = { ...INITIAL }
    // Buyer type from checker
    const ENTITY_LEGAL_TYPE: Record<string, string> = {
      llc: "LLC", corporation: "Corporation", partnership: "Partnership", other_entity: "Other",
    }
    const bt = params.get("buyerType")
    if (bt === "entity") { init.buyerType = "llc"; init.entityLegalType = "LLC" }
    else if (bt === "trust") init.buyerType = "trust"
    else if (bt === "individual") init.buyerType = "individual"
    else if (bt && ENTITY_LEGAL_TYPE[bt]) { init.buyerType = bt; init.entityLegalType = ENTITY_LEGAL_TYPE[bt] }
    // Step 1 prefill from email link params
    if (params.get("officer"))  init.officerName    = decodeURIComponent(params.get("officer")!)
    if (params.get("email"))    init.officerEmail   = decodeURIComponent(params.get("email")!)
    if (params.get("phone"))    init.officerPhone   = decodeURIComponent(params.get("phone")!)
    if (params.get("branch"))   init.branchOffice   = decodeURIComponent(params.get("branch")!)
    if (params.get("escrow"))   init.escrowNumber   = decodeURIComponent(params.get("escrow")!)
    if (params.get("street"))   init.propertyStreet = decodeURIComponent(params.get("street")!)
    if (params.get("city"))     init.propertyCity   = decodeURIComponent(params.get("city")!)
    if (params.get("state"))    init.propertyState  = params.get("state")!.toUpperCase()
    if (params.get("zip"))      init.propertyZip    = params.get("zip")!
    if (params.get("county"))   init.propertyCounty = decodeURIComponent(params.get("county")!)
    if (params.get("closing"))  init.closingDate    = params.get("closing")!
    if (params.get("price")) {
      const raw = params.get("price")!
      const n = parseFloat(raw.replace(/[,$]/g, ""))
      if (!isNaN(n) && n > 0) init.purchasePrice = n.toLocaleString("en-US")
    }
    if (params.get("proptype")) {
      const normalized = normalizeProptype(params.get("proptype")!)
      const mapped = PROPTYPE_MAP[normalized]
      // Use mapped value if found, otherwise fall back to raw value so it's not silently lost
      init.propertyType = mapped || params.get("proptype")!.trim()
    }
    return init
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const checkerResult = params.get("result")

  const ENTITY_LEGAL_TYPE_SYNC: Record<string, string> = {
    llc: "LLC", corporation: "Corporation", partnership: "Partnership", other_entity: "Other",
  }

  const set = (field: keyof FormData, value: unknown) => {
    setData(prev => {
      const next = { ...prev, [field]: value }
      // Keep entityLegalType in sync so user never has to answer the same question twice
      if (field === "buyerType" && typeof value === "string" && ENTITY_LEGAL_TYPE_SYNC[value]) {
        next.entityLegalType = ENTITY_LEGAL_TYPE_SYNC[value]
      }
      return next
    })
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
  }

  const setStr = (field: keyof FormData) => (v: string) => set(field, v)

  // ── Validation per step ─────────────────────────────────────────────────────
  function validate(): Record<string, string> {
    const e: Record<string, string> = {}

    if (step === 1) {
      if (!data.officerName.trim())    e.officerName    = "Required"
      if (!data.officerEmail.trim() || !data.officerEmail.includes("@")) e.officerEmail = "Valid email required"
      if (!data.branchOffice)          e.branchOffice   = "Required"
      if (!data.escrowNumber.trim())   e.escrowNumber   = "Required"
      if (!data.propertyStreet.trim()) e.propertyStreet = "Required"
      if (!data.propertyCity.trim())   e.propertyCity   = "Required"
      if (!data.propertyZip.trim() || !/^\d{5}$/.test(data.propertyZip)) e.propertyZip = "5-digit ZIP required"
      if (!data.propertyType)          e.propertyType   = "Required"
      if (!data.closingDate)           e.closingDate    = "Required"
      if (!data.purchasePrice || parseFloat(data.purchasePrice.replace(/[,$]/g, "")) <= 0) e.purchasePrice = "Valid amount required"
    }

    if (step === 2) {
      if (!data.buyerType) { e.buyerType = "Required"; return e }

      if (data.buyerType === "individual") {
        if (!data.buyerFirstName.trim()) e.buyerFirstName = "Required"
        if (!data.buyerLastName.trim())  e.buyerLastName  = "Required"
        if (!data.buyerStreet.trim())    e.buyerStreet    = "Required"
        if (!data.buyerCity.trim())      e.buyerCity      = "Required"
        if (!data.buyerZip.trim())       e.buyerZip       = "Required"
      } else if (data.buyerType === "trust") {
        if (!data.trustName.trim())     e.trustName     = "Required"
        if (!data.trusteeName.trim())   e.trusteeName   = "Required"
        if (!data.trustStreet.trim())   e.trustStreet   = "Required"
        if (!data.trustCity.trim())     e.trustCity     = "Required"
        if (!data.trustZip.trim())      e.trustZip      = "Required"
      } else {
        if (!data.entityName.trim())        e.entityName           = "Required"
        if (!data.entityFormationState)     e.entityFormationState = "Required"
        if (!data.entityContactName.trim()) e.entityContactName = "Required"
        if (!data.entityStreet.trim())      e.entityStreet      = "Required"
        if (!data.entityCity.trim())        e.entityCity        = "Required"
        if (!data.entityZip.trim())         e.entityZip         = "Required"
      }
    }

    if (step === 3) {
      data.sellers.forEach((s, i) => {
        if (!s.name.trim()) e[`seller_${i}_name`] = "Required"
        if (!s.sellerType)  e[`seller_${i}_type`] = "Required"
      })
    }

    if (step === 4) {
      if (!data.certified) e.certified = "You must confirm the information before submitting"
    }

    return e
  }

  function handleNext() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleBack() {
    setErrors({})
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setIsSubmitting(true)
    setSubmitError(null)

    const buyerData = data.buyerType === "individual"
      ? { first_name: data.buyerFirstName, middle_name: data.buyerMiddleName, last_name: data.buyerLastName, date_of_birth: data.buyerDob, address: { street: data.buyerStreet, city: data.buyerCity, state: data.buyerState, zip: data.buyerZip }, phone: data.buyerPhone, email: data.buyerEmail }
      : data.buyerType === "trust"
        ? { trust_name: data.trustName, trust_type: data.trustType, trustee_name: data.trusteeName, trustee_phone: data.trusteePhone, trustee_email: data.trusteeEmail, settlor_name: data.settlorName, trust_ein: data.trustEin, address: { street: data.trustStreet, city: data.trustCity, state: data.trustState, zip: data.trustZip } }
        : { entity_name: data.entityName, entity_type: data.entityLegalType, state_of_formation: data.entityFormationState, ein: data.entityEin, contact_name: data.entityContactName, contact_phone: data.entityContactPhone, contact_email: data.entityContactEmail, beneficial_owners_known: data.beneficialOwnersKnown, beneficial_owner_count: data.beneficialOwnerCount ? parseInt(data.beneficialOwnerCount) : null, beneficial_owner_names: data.beneficialOwnerNames, address: { street: data.entityStreet, city: data.entityCity, state: data.entityState, zip: data.entityZip } }

    const sellersData = data.sellers.map(s => ({
      seller_type: s.sellerType, name: s.name, trustee_name: s.trusteeName,
      address: s.street ? { street: s.street, city: s.city, state: s.state, zip: s.zip } : null,
      phone: s.phone, email: s.email,
    }))

    const payload = {
      checker_result: checkerResult || null,
      checker_answers: {
        residential:   params.get("residential") === "yes",
        non_financed:  params.get("financing") === "cash",
        entity_buyer:  params.get("buyerType") === "entity" || params.get("buyerType") === "trust",
      },
      officer_name:            data.officerName,
      officer_email:           data.officerEmail,
      officer_phone:           data.officerPhone,
      branch_office:           data.branchOffice,
      escrow_number:           data.escrowNumber,
      property_address: {
        street: data.propertyStreet, city: data.propertyCity,
        state: data.propertyState, zip: data.propertyZip, county: data.propertyCounty,
      },
      property_type:           data.propertyType,
      estimated_closing_date:  data.closingDate,
      purchase_price:          parseFloat(data.purchasePrice.replace(/[,$]/g, "")),
      buyer_type:              data.buyerType,
      buyer_data:              buyerData,
      sellers_data:            sellersData,
      certified:               true,
    }

    try {
      const res = await fetch("/api/fincen/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Submission failed")
      setReferenceNumber(json.reference_number)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (referenceNumber) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation variant="light" />
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileCheck className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-secondary mb-3">Submission Received</h1>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl px-8 py-6 mb-6">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Reference Number</p>
              <p className="text-2xl font-bold text-primary font-mono">{referenceNumber}</p>
            </div>
            <p className="text-gray-600 mb-8">
              Your submission has been received by the Pacific Coast Title FinCEN Reporting Desk.
              A confirmation has been sent to <strong>{data.officerEmail}</strong>.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 space-y-3">
              <h3 className="font-bold text-secondary text-sm uppercase tracking-wide mb-4">What Happens Next</h3>
              {[
                "A compliance coordinator will review your submission within 1 business day.",
                "We will contact the buyer and seller directly for any additional information needed.",
                "You will receive updates at your email as the filing progresses.",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-gray-700 text-sm">{s}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a
                href="/fincen/intake"
                className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                Submit Another Transaction
              </a>
              <Link
                href="/"
                className="bg-gray-100 text-secondary px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
              >
                Return to PCT Home
              </Link>
            </div>
            <p className="text-xs text-gray-500">
              Questions? <a href="mailto:fincen@pct.com" className="text-primary">fincen@pct.com</a> · <a href="tel:+18667241050" className="text-primary">(866) 724-1050</a>
            </p>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  // ── Form layout ─────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation variant="light" />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-1">FinCEN Reporting</p>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary">Transaction Intake Form</h1>
          <p className="text-gray-500 text-sm mt-2">
            {hasPrefill
              ? "Your transaction details are already loaded — review each step and submit when ready."
              : checkerResult === "likely_reportable"
              ? "Your transaction was flagged as likely reportable. Please complete all steps below."
              : "Complete all steps to submit your transaction to the PCT FinCEN Reporting Desk."}
          </p>

          {/* Pre-fill transaction summary — visible immediately on arrival */}
          {hasPrefill && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-900 mb-1">Your transaction details are pre-loaded ✓</p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-green-800">
                  {data.escrowNumber && (
                    <span><span className="text-green-600 font-medium">Escrow #</span> {data.escrowNumber}</span>
                  )}
                  {data.propertyStreet && (
                    <span>
                      <span className="text-green-600 font-medium">Property </span>
                      {data.propertyStreet}{data.propertyCity ? `, ${data.propertyCity}` : ""}{data.propertyState ? `, ${data.propertyState}` : ""}
                    </span>
                  )}
                  {data.purchasePrice && (
                    <span><span className="text-green-600 font-medium">Price </span> ${data.purchasePrice}</span>
                  )}
                  {data.officerName && (
                    <span><span className="text-green-600 font-medium">Officer </span> {data.officerName}</span>
                  )}
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Review each step to confirm accuracy, then click <strong>Submit</strong> when done. Nothing is filed until you confirm on the final step.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="container mx-auto px-4 max-w-3xl py-3">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const n = i + 1
              const Icon = s.icon
              const isActive = step === n
              const isDone = step > n
              return (
                <div key={n} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone ? "bg-green-500 text-white" : isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                    }`}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs mt-1 font-medium hidden sm:block ${isActive ? "text-primary" : isDone ? "text-green-600" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${step > n ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

          {/* ── STEP 1: Transaction Details ────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary border-b border-gray-100 pb-4">Step 1 — Transaction Details</h2>

              {/* Step 1 pre-fill reminder */}
              {hasPrefill && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Fields marked <strong className="mx-1">✓ Pre-filled from order</strong> came from your link. Verify they're correct before continuing.
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Escrow Officer Name" required error={errors.officerName} prefilled={pf("officerName")}>
                  <TextInput value={data.officerName} onChange={setStr("officerName")} placeholder="Full name" />
                </Field>
                <Field label="Officer Email" required error={errors.officerEmail} prefilled={pf("officerEmail")}>
                  <TextInput value={data.officerEmail} onChange={setStr("officerEmail")} type="email" placeholder="you@pct.com" />
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Officer Phone" error={errors.officerPhone} prefilled={pf("officerPhone")}>
                  <TextInput value={data.officerPhone} onChange={setStr("officerPhone")} type="tel" placeholder="(714) 000-0000" />
                </Field>
                <Field label="PCT Branch / Office" required error={errors.branchOffice} prefilled={pf("branchOffice")}>
                  <SelectInput
                    value={data.branchOffice}
                    onChange={setStr("branchOffice")}
                    placeholder="Select office..."
                    options={["PCT — Orange (HQ)", "PCT — Glendale", "PCT — Downey", "PCT — Inland Empire", "Other"]}
                  />
                </Field>
              </div>

              <Field label="Escrow / File Number" required error={errors.escrowNumber} prefilled={pf("escrowNumber")}>
                <TextInput value={data.escrowNumber} onChange={setStr("escrowNumber")} placeholder="e.g. ESC-2026-1234" />
              </Field>

              <div className="pt-2">
                <p className="text-sm font-bold text-secondary mb-3">Property Address</p>
                <div className="space-y-3">
                  <Field label="Street Address" required error={errors.propertyStreet} prefilled={pf("propertyStreet")}>
                    <TextInput value={data.propertyStreet} onChange={setStr("propertyStreet")} placeholder="123 Main St" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City" required error={errors.propertyCity} prefilled={pf("propertyCity")}>
                      <TextInput value={data.propertyCity} onChange={setStr("propertyCity")} placeholder="Los Angeles" />
                    </Field>
                    <Field label="State" prefilled={pf("propertyState")}>
                      <SelectInput value={data.propertyState} onChange={setStr("propertyState")} options={US_STATES} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="ZIP Code" required error={errors.propertyZip} prefilled={pf("propertyZip")}>
                      <TextInput value={data.propertyZip} onChange={setStr("propertyZip")} placeholder="90001" />
                    </Field>
                    <Field label="County" prefilled={pf("propertyCounty")}>
                      <TextInput value={data.propertyCounty} onChange={setStr("propertyCounty")} placeholder="Los Angeles" />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Property Type" required error={errors.propertyType} prefilled={pf("propertyType")}>
                  <SelectInput
                    value={data.propertyType} onChange={setStr("propertyType")}
                    placeholder="Select type..."
                    options={["Single Family", "Condo / Townhome", "2–4 Unit", "Co-op", "Vacant Land (Residential)", "Other"]}
                  />
                </Field>
                <Field label="Estimated Closing Date" required error={errors.closingDate} prefilled={pf("closingDate")}>
                  <TextInput value={data.closingDate} onChange={setStr("closingDate")} type="date" />
                </Field>
              </div>

              <Field label="Purchase Price" required error={errors.purchasePrice} prefilled={pf("purchasePrice")}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    value={data.purchasePrice}
                    onChange={e => setStr("purchasePrice")(e.target.value)}
                    placeholder="1,250,000"
                    className="w-full h-11 pl-8 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </Field>
            </div>
          )}

          {/* ── STEP 2: Buyer Information ──────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary border-b border-gray-100 pb-4">Step 2 — Buyer Information</h2>

              <Field label="Buyer Type" required error={errors.buyerType}>
                <SelectInput
                  value={data.buyerType} onChange={setStr("buyerType")}
                  placeholder="Select buyer type..."
                  options={[
                    { value: "individual",    label: "Individual (personal name)" },
                    { value: "llc",           label: "LLC" },
                    { value: "corporation",   label: "Corporation" },
                    { value: "partnership",   label: "Partnership" },
                    { value: "trust",         label: "Trust" },
                    { value: "other_entity",  label: "Other Entity" },
                  ]}
                />
              </Field>

              {/* Individual */}
              {data.buyerType === "individual" && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <Field label="First Name" required error={errors.buyerFirstName}>
                      <TextInput value={data.buyerFirstName} onChange={setStr("buyerFirstName")} placeholder="First" />
                    </Field>
                    <Field label="Middle Name">
                      <TextInput value={data.buyerMiddleName} onChange={setStr("buyerMiddleName")} placeholder="Middle" />
                    </Field>
                    <Field label="Last Name" required error={errors.buyerLastName}>
                      <TextInput value={data.buyerLastName} onChange={setStr("buyerLastName")} placeholder="Last" />
                    </Field>
                  </div>
                  <Field label="Date of Birth">
                    <TextInput value={data.buyerDob} onChange={setStr("buyerDob")} type="date" />
                  </Field>
                  <Field label="Buyer Address" required error={errors.buyerStreet}>
                    <AddressFields
                      prefix="buyer"
                      values={{ street: data.buyerStreet, city: data.buyerCity, state: data.buyerState, zip: data.buyerZip }}
                      onChange={(field, val) => set(field as keyof FormData, val)}
                    />
                  </Field>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Phone">
                      <TextInput value={data.buyerPhone} onChange={setStr("buyerPhone")} type="tel" placeholder="(555) 000-0000" />
                    </Field>
                    <Field label="Email">
                      <TextInput value={data.buyerEmail} onChange={setStr("buyerEmail")} type="email" placeholder="buyer@example.com" />
                    </Field>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    🔒 <strong>ID Verification:</strong> For security, Pacific Coast Title will collect identification information directly from the buyer through secure channels.
                  </div>
                </div>
              )}

              {/* Entity (LLC, Corp, Partnership, Other) */}
              {["llc","corporation","partnership","other_entity"].includes(data.buyerType) && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Entity Legal Name" required error={errors.entityName}>
                      <TextInput value={data.entityName} onChange={setStr("entityName")} placeholder="Sunrise Holdings LLC" />
                    </Field>
                    {/* Entity type is already captured by the Buyer Type dropdown above — show read-only */}
                    <Field label="Entity Type">
                      <div className="h-11 px-4 flex items-center border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 font-medium">
                        {data.entityLegalType || "—"}
                      </div>
                    </Field>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="State of Formation" required error={errors.entityFormationState}>
                      <SelectInput value={data.entityFormationState} onChange={setStr("entityFormationState")} placeholder="Select state..." options={US_STATES} />
                    </Field>
                    <Field label="EIN" hint="If not available, leave blank — PCT will request">
                      <TextInput value={data.entityEin} onChange={setStr("entityEin")} placeholder="XX-XXXXXXX" />
                    </Field>
                  </div>
                  <Field label="Entity Address" required error={errors.entityStreet}>
                    <AddressFields
                      prefix="entity"
                      values={{ street: data.entityStreet, city: data.entityCity, state: data.entityState, zip: data.entityZip }}
                      onChange={(field, val) => set(field as keyof FormData, val)}
                    />
                  </Field>
                  <Field label="Primary Contact Name" required error={errors.entityContactName} hint="Person PCT can reach at the entity">
                    <TextInput value={data.entityContactName} onChange={setStr("entityContactName")} placeholder="Full name" />
                  </Field>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Contact Phone">
                      <TextInput value={data.entityContactPhone} onChange={setStr("entityContactPhone")} type="tel" />
                    </Field>
                    <Field label="Contact Email">
                      <TextInput value={data.entityContactEmail} onChange={setStr("entityContactEmail")} type="email" />
                    </Field>
                  </div>
                  <Field label="Beneficial Owners Known?" required>
                    <RadioGroup
                      value={data.beneficialOwnersKnown}
                      onChange={setStr("beneficialOwnersKnown")}
                      options={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }, { label: "Not Sure", value: "not_sure" }]}
                    />
                  </Field>
                  {data.beneficialOwnersKnown === "yes" && (
                    <>
                      <Field label="Number of Beneficial Owners">
                        <TextInput value={data.beneficialOwnerCount} onChange={setStr("beneficialOwnerCount")} type="number" placeholder="2" />
                      </Field>
                      <Field label="Beneficial Owner Names (if known)" hint="List names with 25%+ ownership or control. PCT will collect full details directly.">
                        <textarea
                          value={data.beneficialOwnerNames}
                          onChange={e => setStr("beneficialOwnerNames")(e.target.value)}
                          placeholder="e.g. John Smith, Jane Doe"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                      </Field>
                    </>
                  )}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    🔒 <strong>Sensitive Data Policy:</strong> Do not include SSNs, passport numbers, or full TINs here. PCT will collect identification directly from parties through secure channels.
                  </div>
                </div>
              )}

              {/* Trust */}
              {data.buyerType === "trust" && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Trust Name" required error={errors.trustName}>
                      <TextInput value={data.trustName} onChange={setStr("trustName")} placeholder="The Smith Family Trust" />
                    </Field>
                    <Field label="Trust Type">
                      <SelectInput
                        value={data.trustType} onChange={setStr("trustType")}
                        placeholder="Select type..."
                        options={["Revocable","Irrevocable","Other"]}
                      />
                    </Field>
                  </div>
                  <Field label="Trustee Name" required error={errors.trusteeName}>
                    <TextInput value={data.trusteeName} onChange={setStr("trusteeName")} placeholder="Full name" />
                  </Field>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Trustee Phone">
                      <TextInput value={data.trusteePhone} onChange={setStr("trusteePhone")} type="tel" />
                    </Field>
                    <Field label="Trustee Email">
                      <TextInput value={data.trusteeEmail} onChange={setStr("trusteeEmail")} type="email" />
                    </Field>
                  </div>
                  <Field label="Trust Address" required error={errors.trustStreet}>
                    <AddressFields
                      prefix="trust"
                      values={{ street: data.trustStreet, city: data.trustCity, state: data.trustState, zip: data.trustZip }}
                      onChange={(field, val) => set(field as keyof FormData, val)}
                    />
                  </Field>
                  <Field label="Settlor / Grantor Name">
                    <TextInput value={data.settlorName} onChange={setStr("settlorName")} placeholder="Full name" />
                  </Field>
                  <Field label="Trust EIN" hint="If not available, leave blank — PCT will request">
                    <TextInput value={data.trustEin} onChange={setStr("trustEin")} placeholder="XX-XXXXXXX" />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Seller Information ─────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary border-b border-gray-100 pb-4">Step 3 — Seller Information</h2>
              <p className="text-sm text-gray-500">Enter information for each seller. For FinCEN purposes, the buyer side is primary — seller info is supplementary.</p>

              {data.sellers.map((seller, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-secondary">Seller {i + 1}</h3>
                    {data.sellers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => set("sellers", data.sellers.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Seller Type" required error={errors[`seller_${i}_type`]}>
                      <SelectInput
                        value={seller.sellerType}
                        onChange={v => {
                          const updated = [...data.sellers]; updated[i] = { ...updated[i], sellerType: v }; set("sellers", updated)
                        }}
                        options={[
                          { value: "individual", label: "Individual" },
                          { value: "entity", label: "Entity (LLC/Corp/etc.)" },
                          { value: "trust", label: "Trust" },
                        ]}
                      />
                    </Field>
                    <Field
                      label={seller.sellerType === "entity" ? "Entity Name" : seller.sellerType === "trust" ? "Trust Name" : "Full Name"}
                      required error={errors[`seller_${i}_name`]}
                    >
                      <TextInput
                        value={seller.name}
                        onChange={v => {
                          const updated = [...data.sellers]; updated[i] = { ...updated[i], name: v }; set("sellers", updated)
                        }}
                        placeholder={seller.sellerType === "individual" ? "First Last" : "Name"}
                      />
                    </Field>
                  </div>

                  {seller.sellerType === "trust" && (
                    <Field label="Trustee Name">
                      <TextInput
                        value={seller.trusteeName}
                        onChange={v => { const u = [...data.sellers]; u[i] = { ...u[i], trusteeName: v }; set("sellers", u) }}
                        placeholder="Trustee full name"
                      />
                    </Field>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Phone">
                      <TextInput value={seller.phone} onChange={v => { const u = [...data.sellers]; u[i] = { ...u[i], phone: v }; set("sellers", u) }} type="tel" />
                    </Field>
                    <Field label="Email">
                      <TextInput value={seller.email} onChange={v => { const u = [...data.sellers]; u[i] = { ...u[i], email: v }; set("sellers", u) }} type="email" />
                    </Field>
                  </div>
                </div>
              ))}

              {data.sellers.length < 4 && (
                <button
                  type="button"
                  onClick={() => set("sellers", [...data.sellers, { sellerType: "individual", name: "", trusteeName: "", street: "", city: "", state: "CA", zip: "", phone: "", email: "" }])}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  + Add Another Seller
                </button>
              )}
              {data.sellers.length >= 4 && (
                <p className="text-xs text-gray-500 italic">For more than 4 sellers, PCT will collect additional details during processing.</p>
              )}
            </div>
          )}

          {/* ── STEP 4: Review & Submit ───────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-secondary border-b border-gray-100 pb-4">Step 4 — Review & Submit</h2>

              {/* Transaction */}
              <ReviewSection title="Transaction" onEdit={() => setStep(1)}>
                <ReviewRow label="Officer" value={`${data.officerName} · ${data.officerEmail}`} />
                <ReviewRow label="Branch" value={data.branchOffice} />
                <ReviewRow label="Escrow #" value={data.escrowNumber} />
                <ReviewRow label="Property" value={`${data.propertyStreet}, ${data.propertyCity}, ${data.propertyState} ${data.propertyZip}`} />
                <ReviewRow label="Type" value={data.propertyType} />
                <ReviewRow label="Closing" value={data.closingDate} />
                <ReviewRow label="Price" value={`$${parseFloat(data.purchasePrice.replace(/[,$]/g,"")).toLocaleString()}`} />
              </ReviewSection>

              {/* Buyer */}
              <ReviewSection title="Buyer" onEdit={() => setStep(2)}>
                <ReviewRow label="Type" value={data.buyerType.toUpperCase()} />
                {data.buyerType === "individual" && (
                  <>
                    <ReviewRow label="Name" value={`${data.buyerFirstName} ${data.buyerMiddleName} ${data.buyerLastName}`.replace(/\s+/g," ").trim()} />
                    <ReviewRow label="Address" value={`${data.buyerStreet}, ${data.buyerCity}, ${data.buyerState} ${data.buyerZip}`} />
                  </>
                )}
                {data.buyerType === "trust" && (
                  <>
                    <ReviewRow label="Trust" value={data.trustName} />
                    <ReviewRow label="Trustee" value={data.trusteeName} />
                  </>
                )}
                {["llc","corporation","partnership","other_entity"].includes(data.buyerType) && (
                  <>
                    <ReviewRow label="Entity" value={data.entityName} />
                    <ReviewRow label="Contact" value={data.entityContactName} />
                    <ReviewRow label="BO Known?" value={data.beneficialOwnersKnown || "—"} />
                  </>
                )}
              </ReviewSection>

              {/* Sellers */}
              <ReviewSection title={`Seller(s) (${data.sellers.length})`} onEdit={() => setStep(3)}>
                {data.sellers.map((s, i) => (
                  <ReviewRow key={i} label={`Seller ${i+1}`} value={`${s.name} (${s.sellerType})`} />
                ))}
              </ReviewSection>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                💼 <strong>Payment & Financing:</strong> A PCT compliance coordinator will collect payment method, financial institution, and AML details directly during the filing process.
              </div>

              {/* Certification */}
              <div className={`border-2 rounded-xl p-5 ${errors.certified ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.certified}
                    onChange={e => set("certified", e.target.checked)}
                    className="mt-1 w-4 h-4 accent-primary flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm the information provided is accurate to the best of my knowledge. I understand this is not a final FinCEN filing — Pacific Coast Title will verify all details and contact parties as needed.
                  </span>
                </label>
                {errors.certified && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.certified}</p>}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link
                href="/fincen/is-it-reportable"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Quick Checker
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><FileCheck className="w-4 h-4" /> Submit to FinCEN Reporting Desk</>
                )}
              </button>
            )}
          </div>

          {/* Call fallback */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Need help? <a href="tel:+18667241050" className="text-primary inline-flex items-center gap-1"><Phone className="w-3 h-3" />(866) 724-1050</a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}

// ── Review helpers ────────────────────────────────────────────────────────────

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 px-5 py-3">
        <h3 className="font-semibold text-secondary text-sm">{title}</h3>
        <button type="button" onClick={onEdit} className="text-xs text-primary hover:underline">Edit</button>
      </div>
      <div className="px-5 py-4 space-y-2">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-gray-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-secondary font-medium">{value || "—"}</span>
    </div>
  )
}

// ── Page export (wrapped in Suspense for useSearchParams) ─────────────────────

export default function IntakePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    }>
      <IntakeFormContent />
    </Suspense>
  )
}
