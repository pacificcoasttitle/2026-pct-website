"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Phone,
  Mail,
  MapPin,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Award,
  Shield,
  Star,
  ExternalLink,
  Bell,
} from "lucide-react"
import type { TeamMember } from "@/data/team"

// ── vCard generator ─────────────────────────────────────────────────────────

function buildVCard(m: TeamMember): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${m.name}`,
    "ORG:Pacific Coast Title Company",
    `TITLE:${m.title}`,
    `TEL;TYPE=WORK,VOICE:${m.phone}`,
    m.cell ? `TEL;TYPE=CELL,VOICE:${m.cell}` : "",
    `EMAIL;TYPE=WORK,INTERNET:${m.email}`,
    m.office ? `ADR;TYPE=WORK:;;${m.office};;;CA;US` : "",
    m.photo ? `PHOTO;VALUE=URL:https://www.pct.com${m.photo}` : "",
    m.linkedin ? `URL;TYPE=LinkedIn:${m.linkedin}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n")
  return lines
}

// ── Mailchimp JSONP submit ───────────────────────────────────────────────────
// Mailchimp's public subscribe API supports JSONP — no server-side proxy needed.

type McResult = { result: "success" | "error"; msg: string }

function subscribeMailchimp(
  mc: NonNullable<TeamMember["mailchimp"]>,
  fields: { email: string; firstName: string; company: string; phone: string }
): Promise<McResult> {
  return new Promise((resolve, reject) => {
    const cbName = `_mcCb_${Date.now()}`

    const params = new URLSearchParams()
    params.set("u", mc.u)
    params.set("id", mc.audienceId)
    params.set("f_id", mc.formId)
    params.set("EMAIL", fields.email)
    params.set("FNAME", fields.firstName)
    params.set("LNAME", fields.company)   // Mailchimp maps Company → LNAME
    params.set("PHONE", fields.phone)
    if (mc.tags) params.set("tags", mc.tags)
    params.set(`b_${mc.u}_${mc.audienceId}`, "") // honeypot — must be empty
    params.set("c", cbName)

    const w = window as Record<string, unknown>

    w[cbName] = (data: McResult) => {
      delete w[cbName]
      script.remove()
      resolve(data)
    }

    const script = document.createElement("script")
    script.src = `https://pct.${mc.server}.list-manage.com/subscribe/post-json?${params.toString()}`
    script.onerror = () => {
      delete w[cbName]
      reject(new Error("Network error"))
    }
    document.head.appendChild(script)

    // Timeout fallback
    setTimeout(() => {
      if (w[cbName]) {
        delete w[cbName]
        script.remove()
        reject(new Error("Request timed out"))
      }
    }, 15_000)
  })
}

// ── Main component ──────────────────────────────────────────────────────────

export function TeamMemberPage({ member }: { member: TeamMember }) {
  // Form state
  const [subEmail, setSubEmail] = useState("")
  const [subFirstName, setSubFirstName] = useState("")
  const [subCompany, setSubCompany] = useState("")
  const [subPhone, setSubPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const formRef = useRef<HTMLDivElement>(null)
  const firstName = member.name.split(" ")[0]
  const mc = member.mailchimp

  const subscribeHeading =
    mc?.subscribeHeading ?? `${firstName}'s Updates`
  const subscribeSubHeading =
    mc?.subscribeSubHeading ??
    `Subscribe to receive market trends, rate changes, and title tips from ${firstName}.`

  // ── vCard download ────────────────────────────────────────────────────────
  const handleSaveContact = () => {
    const vcf = buildVCard(member)
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${member.slug}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mc) return
    setIsSubmitting(true)
    setStatus("idle")
    setErrorMsg("")
    try {
      const result = await subscribeMailchimp(mc, {
        email: subEmail,
        firstName: subFirstName,
        company: subCompany,
        phone: subPhone,
      })
      if (result.result === "success") {
        setStatus("success")
        setSubEmail("")
        setSubFirstName("")
        setSubCompany("")
        setSubPhone("")
      } else {
        setStatus("error")
        // Mailchimp returns HTML in the message sometimes — strip tags
        setErrorMsg(result.msg.replace(/<[^>]+>/g, " ").trim())
      }
    } catch (err) {
      setStatus("error")
      setErrorMsg(
        err instanceof Error ? err.message : "Unable to subscribe. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT PANEL — Agent Profile
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="lg:w-[420px] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto flex-shrink-0 bg-[#03374f] text-white flex flex-col">
        {/* PCT Logo */}
        <div className="px-8 pt-8 pb-5 border-b border-white/10 flex-shrink-0">
          <Link href="/" className="inline-block">
            <Image
              src="/logo2.png"
              alt="Pacific Coast Title"
              width={160}
              height={40}
              className="brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Profile */}
        <div className="flex-1 px-8 py-8 flex flex-col gap-6">
          {/* Photo */}
          <div className="flex justify-center">
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-[#f26b2b] shadow-2xl ring-4 ring-[#f26b2b]/20">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#f26b2b]/30 to-[#f26b2b]/10 flex items-center justify-center">
                  <span className="text-5xl font-bold text-[#f26b2b]">
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Name & Title */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white leading-tight">
              {member.name}
            </h1>
            <p className="text-[#f26b2b] font-semibold">{member.title}</p>
            <p className="text-white/50 text-sm">Pacific Coast Title Company</p>
          </div>

          {/* Contact Details */}
          <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/10">
            <a
              href={`tel:${member.phone.replace(/\D/g, "")}`}
              className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors group"
            >
              <span className="w-8 h-8 rounded-lg bg-[#f26b2b]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#f26b2b]/25 transition-colors">
                <Phone className="w-4 h-4 text-[#f26b2b]" />
              </span>
              <span>{member.phone}</span>
            </a>

            {member.cell && (
              <a
                href={`tel:${member.cell.replace(/\D/g, "")}`}
                className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-[#f26b2b]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#f26b2b]/25 transition-colors">
                  <Phone className="w-4 h-4 text-[#f26b2b]" />
                </span>
                <span>
                  {member.cell}{" "}
                  <span className="text-white/30 text-xs">· Cell</span>
                </span>
              </a>
            )}

            <a
              href={`mailto:${member.email}`}
              className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors group"
            >
              <span className="w-8 h-8 rounded-lg bg-[#f26b2b]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#f26b2b]/25 transition-colors">
                <Mail className="w-4 h-4 text-[#f26b2b]" />
              </span>
              <span className="truncate">{member.email}</span>
            </a>

            {member.office && (
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white/30" />
                </span>
                <span>{member.office}</span>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <a
              href={`tel:${member.phone.replace(/\D/g, "")}`}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#f26b2b] hover:bg-[#e05d1e] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[#f26b2b]/30 hover:shadow-xl"
            >
              <Phone className="w-4 h-4" />
              Call {firstName}
            </a>

            {/* Mobile-only: scroll to subscribe form */}
            <button
              type="button"
              onClick={() =>
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="lg:hidden w-full flex items-center justify-center gap-2.5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all border border-white/15"
            >
              <Bell className="w-4 h-4" />
              Subscribe to Updates
            </button>

            <button
              type="button"
              onClick={handleSaveContact}
              className="w-full flex items-center justify-center gap-2.5 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/70 hover:text-white font-medium rounded-xl transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Save Contact (.vcf)
            </button>

            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/70 hover:text-white font-medium rounded-xl transition-all text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                LinkedIn Profile
              </a>
            )}
          </div>

          {/* Bio */}
          {member.bio && (
            <div className="pt-2 border-t border-white/10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2.5">
                About {firstName}
              </h3>
              <p className="text-sm text-white/65 leading-relaxed">{member.bio}</p>
            </div>
          )}

          {/* Specialties */}
          {member.specialties && member.specialties.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {member.specialties.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-white/8 border border-white/10 text-white/65 px-3 py-1.5 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {member.languages && member.languages.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
                Languages
              </h3>
              <p className="text-sm text-white/65">
                {member.languages.join(" · ")}
              </p>
            </div>
          )}

          {/* License */}
          {member.licenseNumber && (
            <p className="text-[11px] text-white/25 pt-2 border-t border-white/8">
              {member.licenseNumber}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/10 flex-shrink-0">
          <p className="text-[11px] text-white/25 text-center">
            © {new Date().getFullYear()} Pacific Coast Title Company
          </p>
          <p className="text-[11px] text-white/20 text-center mt-1">
            <a href="tel:+18667241050" className="hover:text-white/40 transition-colors">
              (866) 724-1050
            </a>
            {" · "}
            <Link href="/" className="hover:text-white/40 transition-colors">
              pct.com
            </Link>
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT PANEL — Subscribe Form
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 bg-[#f8f6f3] flex items-start justify-center px-6 py-12 lg:px-14 lg:py-16">
        <div ref={formRef} className="w-full max-w-lg scroll-mt-8">

          {/* Heading */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#f26b2b]/10 text-[#f26b2b] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5" />
              Stay Informed
            </div>
            <h2 className="text-3xl font-bold text-[#03374f] leading-tight">
              {subscribeHeading}
            </h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              {subscribeSubHeading}
            </p>
          </div>

          {/* ── Success State ── */}
          {status === "success" ? (
            <div className="text-center py-14 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-8">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[#03374f]">
                You&apos;re Subscribed!
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Thanks for subscribing. You&apos;ll start receiving {firstName}&apos;s
                updates in your inbox soon.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-[#03374f] text-white rounded-xl font-medium text-sm hover:bg-[#03374f]/90 transition-colors"
              >
                Subscribe Another Email
              </button>
            </div>
          ) : (
            /* ── Mailchimp-styled Subscribe Form ── */
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5"
            >
              {/* Email — required */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-[#f26b2b]">*</span>
                </label>
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all text-sm"
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={subFirstName}
                  onChange={(e) => setSubFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all text-sm"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Company / Brokerage
                </label>
                <input
                  type="text"
                  value={subCompany}
                  onChange={(e) => setSubCompany(e.target.value)}
                  placeholder="ABC Realty"
                  className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
                  placeholder="(714) 555-0100"
                  className="w-full h-12 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all text-sm"
                />
              </div>

              {/* Error */}
              {status === "error" && errorMsg && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !mc}
                className="w-full h-12 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-[#f26b2b]/25 hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing…
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Subscribe
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-400">
                No spam. Unsubscribe at any time.
              </p>
            </form>
          )}

          {/* ── Trust Badges ── */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: <Shield className="w-5 h-5" />, label: "Licensed & Bonded" },
              { icon: <Star className="w-5 h-5" />, label: "Top-Rated Service" },
              { icon: <Award className="w-5 h-5" />, label: "Since 1973" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 bg-white rounded-xl border border-gray-100 p-4 text-center"
              >
                <span className="text-[#f26b2b]">{item.icon}</span>
                <span className="text-xs text-gray-500 font-medium leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-[#03374f] transition-colors"
            >
              ← Pacific Coast Title Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
