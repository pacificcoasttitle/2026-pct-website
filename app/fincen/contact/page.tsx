"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { KeyTakeaways } from "@/components/fincen/key-takeaways"
import { CTABox } from "@/components/fincen/cta-box"
import { CheckCircle, Mail, Send } from "lucide-react"

const takeaways = [
  "Early outreach helps avoid closing delays",
  "Entity/trust + non-financed + residential is the common trigger",
  "Have buyer vesting + financing details ready",
  "We'll help identify what documents may be needed",
  "Confirm final applicability with escrow/counsel",
]

const steps = [
  { num: 1, text: "We confirm whether the scenario is likely reportable." },
  { num: 2, text: "We outline what information may be required and who needs to provide it." },
  { num: 3, text: "We coordinate timing so the closing stays on track." },
]

const propertyTypes = [
  "1–4 Unit Residential",
  "Condominium/Townhome",
  "Co-op",
  "Vacant Land (intended residential)",
  "Other",
]

const buyerTypes = [
  "Individual (personal name)",
  "LLC",
  "Corporation",
  "Partnership",
  "Trust",
  "Not sure",
]

const financingTypes = [
  "All-cash",
  "Traditional bank/lender financing",
  "Private/hard-money loan",
  "Seller financing",
  "Not sure",
]

const roles = ["Agent", "Buyer", "Investor", "Attorney", "Lender", "Other"]

export default function FinCENContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    propertyType: "",
    buyerType: "",
    financing: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((res) => setTimeout(res, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="Contact PCT's FinCEN Division"
        subtitle="Send us the basics and we'll help you map next steps—fast."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <KeyTakeaways items={takeaways} />

        <div className="grid md:grid-cols-2 gap-12 mb-16">

          {/* Left: What to Send + What Happens Next */}
          <div className="space-y-10">
            {/* What to Send */}
            <section>
              <h2 className="text-xl font-bold text-secondary mb-4">What to Send Us</h2>
              <ul className="space-y-3">
                {[
                  "Property type (1–4 unit / condo / co-op / land)",
                  "Buyer type (individual / entity / trust)",
                  "Financing type (traditional lender / cash / private money / not sure)",
                  "Target closing date",
                  "Any complexity (multiple owners, layered entities, out-of-state parties, trustee sale)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* What Happens Next */}
            <section>
              <h2 className="text-xl font-bold text-secondary mb-4">What Happens Next</h2>
              <div className="space-y-4">
                {steps.map((step) => (
                  <div key={step.num} className="flex items-start gap-4">
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {step.num}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed pt-1">{step.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Prefer email */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <h3 className="font-semibold text-secondary mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Prefer email?
              </h3>
              <a
                href="mailto:escrow@pct.com"
                className="text-primary font-medium hover:underline text-sm"
              >
                escrow@pct.com
              </a>
              <p className="text-xs text-gray-500 mt-1">
                Or contact your local PCT office directly at{" "}
                <a href="/locations" className="text-primary hover:underline">
                  any of our locations
                </a>
                .
              </p>
            </div>
          </div>

          {/* Right: Intake Form */}
          <div>
            <h2 className="text-xl font-bold text-secondary mb-6">FinCEN Intake Form</h2>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">Thanks — we received it!</h3>
                <p className="text-green-700 text-sm">
                  Our team will review your submission and reach out within 1 business day.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", phone: "", email: "", role: "", propertyType: "", buyerType: "", financing: "", message: "" }) }}
                  className="mt-6 text-sm text-primary font-medium hover:underline"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">Name</label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Jane Smith"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="(714) 555-0100"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">I am a</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                  >
                    <option value="">Select your role</option>
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Buyer Type</label>
                  <select
                    name="buyerType"
                    value={formData.buyerType}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                  >
                    <option value="">Select buyer type</option>
                    {buyerTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">Financing Type</label>
                  <select
                    name="financing"
                    value={formData.financing}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
                  >
                    <option value="">Select financing type</option>
                    {financingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Describe the transaction (target close date, complexity, questions...)"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <CTABox
          heading="If You Think It Might Be Reportable, Start Early."
          body="The fastest closings are the ones where ownership and IDs are collected early—not the night before signing."
          buttons={[
            { label: "Check if it's reportable", href: "/fincen/is-it-reportable" },
            { label: "View FAQs", href: "/fincen/faq", variant: "outline" },
          ]}
        />
      </div>

      <Footer />
    </main>
  )
}
