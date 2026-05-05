import type { Metadata } from "next"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  Smartphone,
  MapPin,
  ClipboardList,
  Bell,
  Phone,
  CheckCircle2,
  Download,
  Apple,
  PlayCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "PCT Property Pro Mobile App | Pacific Coast Title",
  description:
    "PCT Property Pro puts property data, order tracking, and your PCT rep in your pocket. Powered by SmartDirect® Mobile. Download for iOS or Android.",
}

const APP_STORE_URL  = "https://apps.apple.com/us/app/smartdirect-mobile/id1054969088"
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.smartdirect.smartdirect"
const SMART_DIRECT_URL = "https://smartdirectre.com/pctpropertypro"

const FEATURES = [
  {
    icon: MapPin,
    title: "Property data on the go",
    body: "Look up ownership, sales history, and parcel detail from anywhere in California.",
  },
  {
    icon: ClipboardList,
    title: "Track orders in real time",
    body: "See live status updates on your open title and escrow files without calling in.",
  },
  {
    icon: Phone,
    title: "Connect with your PCT rep",
    body: "One-tap call, text, or email to your dedicated representative.",
  },
  {
    icon: Bell,
    title: "Instant notifications",
    body: "Get alerts the moment a milestone hits — opened, in review, recorded, closed.",
  },
]

const STEPS = [
  {
    title: "Download SmartDirect® Mobile",
    body: (
      <>
        Get it from the{" "}
        <a href={APP_STORE_URL} className="text-[#f26b2b] hover:underline" target="_blank" rel="noopener noreferrer">
          App Store
        </a>{" "}
        or{" "}
        <a href={GOOGLE_PLAY_URL} className="text-[#f26b2b] hover:underline" target="_blank" rel="noopener noreferrer">
          Google Play
        </a>
        , or visit{" "}
        <a href={SMART_DIRECT_URL} className="text-[#f26b2b] hover:underline" target="_blank" rel="noopener noreferrer">
          smartdirectre.com/pctpropertypro
        </a>
        .
      </>
    ),
  },
  { title: "Allow location and notification permissions", body: "Required so the app can pull nearby parcels and push order updates." },
  { title: "Enter your referral code", body: "Your PCT representative will provide a referral code unique to you." },
  { title: "Accept Terms and Conditions", body: "Standard data and privacy terms — review and accept to continue." },
  { title: "Complete registration", body: "Add your name, email, license info, and any additional contact details." },
  { title: "Log in with your PCT247 credentials", body: "Use the same username and password you already use for TitlePro 247." },
  { title: "Open the PCT Property Pro app icon", body: "From the SmartDirect® dashboard, tap the PCT Property Pro tile to launch it." },
]

export default function MobileAppPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#03374f] via-[#03374f] to-[#062a3b] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#f26b2b] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile App
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">PCT Property Pro</h1>
              <p className="text-lg md:text-xl text-white/80 mb-3">Everything you need, wherever you are.</p>
              <p className="text-sm text-white/60 mb-8">
                Powered by <span className="font-semibold text-white/80">SmartDirect® Mobile</span>
              </p>

              {/* App store badges */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-black hover:bg-black/80 transition-colors text-white rounded-xl px-5 py-3 shadow-lg"
                >
                  <Apple className="w-7 h-7" />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] uppercase tracking-wider opacity-80">Download on the</span>
                    <span className="block text-base font-semibold">App Store</span>
                  </span>
                </a>
                <a
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-black hover:bg-black/80 transition-colors text-white rounded-xl px-5 py-3 shadow-lg"
                >
                  <PlayCircle className="w-7 h-7" />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] uppercase tracking-wider opacity-80">Get it on</span>
                    <span className="block text-base font-semibold">Google Play</span>
                  </span>
                </a>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="hidden md:flex justify-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#03374f] mb-3">What can you do with it?</h2>
            <p className="text-gray-600">A full title-and-escrow workflow that fits in your pocket.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 hover:border-[#f26b2b]/30 hover:shadow-lg transition-all p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#03374f]/10 to-[#f26b2b]/10 flex items-center justify-center mb-4 group-hover:from-[#f26b2b] group-hover:to-[#f26b2b] transition-all">
                  <Icon className="w-6 h-6 text-[#03374f] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-[#03374f] mb-1.5">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Setup steps ──────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#f26b2b]/10 text-[#f26b2b] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                <Download className="w-3.5 h-3.5" />
                Get started in minutes
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#03374f] mb-3">Setup in 7 simple steps</h2>
              <p className="text-gray-600">Have your referral code from your PCT rep handy — that&apos;s all you need to begin.</p>
            </div>

            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-[#f26b2b]/40 hover:shadow-md transition-all p-5 flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-full bg-[#03374f] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-semibold text-[#03374f] mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-gray-200 flex-shrink-0 mt-1.5 hidden sm:block" />
                </li>
              ))}
            </ol>

            {/* Direct link */}
            <div className="mt-8 text-center">
              <a
                href={SMART_DIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#03374f] font-semibold text-sm hover:text-[#f26b2b] transition-colors"
              >
                Download instructions and resources at smartdirectre.com/pctpropertypro
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA: referral code ───────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#f26b2b] via-[#f26b2b] to-[#d85c1f] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Don&apos;t have a referral code?</h2>
          <p className="text-lg text-white/90 mb-8">
            Contact your PCT representative or call our office and we&apos;ll get you set up in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:7145166700"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#f26b2b] hover:bg-white/95 transition-colors px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <Phone className="w-4 h-4" />
              Call (714) 516-6700
            </a>
            <Link
              href="/team"
              className="inline-flex items-center justify-center gap-2 bg-[#03374f] hover:bg-[#022a3b] transition-colors px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              Find My PCT Rep
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

/** Decorative phone-frame mockup with a stylised PCT Property Pro home screen. */
function PhoneMockup() {
  return (
    <div className="relative w-[260px] h-[540px] rounded-[44px] bg-black shadow-2xl ring-4 ring-white/10 overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20" />
      {/* Screen */}
      <div className="absolute inset-2 rounded-[36px] bg-gradient-to-br from-[#03374f] via-[#062a3b] to-[#021620] overflow-hidden">
        {/* Status bar */}
        <div className="h-9 flex items-end justify-between px-6 pb-1.5 text-white/70 text-[10px] font-semibold">
          <span>9:41</span>
          <span>•••</span>
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4">
          <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">Pacific Coast Title</p>
          <h3 className="text-white font-bold text-lg mt-0.5">Property Pro</h3>
        </div>

        {/* Tile grid */}
        <div className="px-4 grid grid-cols-2 gap-2.5">
          {[
            { icon: MapPin,         label: "Property"  },
            { icon: ClipboardList,  label: "Orders"    },
            { icon: Phone,          label: "My Rep"    },
            { icon: Bell,           label: "Alerts"    },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="aspect-square bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-white/90"
            >
              <Icon className="w-7 h-7 text-[#f26b2b]" />
              <span className="text-[11px] font-semibold">{label}</span>
            </div>
          ))}
        </div>

        {/* Recent activity strip */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Live update</span>
          </div>
          <p className="text-[11px] text-white leading-tight">Order #20425 — Title commitment ready</p>
        </div>
      </div>
    </div>
  )
}
