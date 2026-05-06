import type { Metadata } from "next"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContactButton } from "@/components/ContactButton"
import {
  Smartphone,
  Map,
  BellRing,
  FileSearch,
  Camera,
  FileImage,
  Share2,
  Calculator,
  Phone,
  Mail,
  CheckCircle2,
  Download,
  Apple,
  PlayCircle,
  ExternalLink,
  Globe,
  TrendingUp,
  Layers,
} from "lucide-react"

export const metadata: Metadata = {
  title: "PCT Property Pro Mobile App | Pacific Coast Title",
  description:
    "PCT Property Pro is a smart real estate prospecting and lead-generation app with Walking Farm®, Farm Alerts, and on-demand property reports across 3,000+ U.S. counties. Download for iOS, Android, or web.",
}

const APP_STORE_URL    = "https://apps.apple.com/us/app/smartdirect-mobile/id1054969088"
const GOOGLE_PLAY_URL  = "https://play.google.com/store/apps/details?id=com.smartdirect.smartdirect"
const WEB_VERSION_URL  = "https://smartdirectre.com/pctpropertypro"
const SMART_DIRECT_URL = "https://smartdirectre.com/pctpropertypro"

/** Three flagship pillars from smartdirectre.com/pctpropertypro */
const PILLARS = [
  {
    icon: FileSearch,
    title: "Property Reports",
    tagline: "Know everything you need to know.",
    body:
      "Get comprehensive details — homeowner info, sales history, property details, sales comps, foreclosures, plat maps, tax records, and more.",
  },
  {
    icon: Map,
    title: "Walking Farm®",
    tagline: "Smart neighborhood prospecting.",
    body:
      "Select an area to farm and instantly gauge sales activity, generate and track leads, and power up your sales process.",
  },
  {
    icon: BellRing,
    title: "Farm Alerts",
    tagline: "Make your farming dynamic.",
    body:
      "Define farm areas and get alerts the moment property records change inside them. Being in-the-know has never been easier.",
  },
]

/** The "everything else inside the app" grid. */
const TOOLS = [
  { icon: Map,        title: "Map-based farming",       body: "Powerful Walking Farm® map tool for any neighborhood." },
  { icon: FileSearch, title: "Powerful property search", body: "Find properties by owner, address, APN, or location." },
  { icon: Camera,     title: "Search by Camera View",   body: "Point your phone at a property and pull up its record." },
  { icon: FileImage,  title: "Document images",         body: "Retrieve NOD, NTS, and REO document images on demand." },
  { icon: Share2,     title: "Share via email",         body: "Send polished property reports straight to your client." },
  { icon: Layers,     title: "Sync across devices",     body: "Saved files and reports follow you between phone, tablet, and web." },
  { icon: Calculator, title: "Payment & price tools",   body: "Built-in payment and price calculators for fast quotes." },
  { icon: TrendingUp, title: "Sales activity insight",  body: "See what's selling, where, and how fast inside your farm." },
]

const STEPS = [
  {
    title: "Download the app",
    body: (
      <>
        Get it from the{" "}
        <a href={APP_STORE_URL} className="text-[#f26b2b] hover:underline" target="_blank" rel="noopener noreferrer">
          iOS App Store
        </a>
        ,{" "}
        <a href={GOOGLE_PLAY_URL} className="text-[#f26b2b] hover:underline" target="_blank" rel="noopener noreferrer">
          Google Play Store
        </a>
        , or use the{" "}
        <a href={WEB_VERSION_URL} className="text-[#f26b2b] hover:underline" target="_blank" rel="noopener noreferrer">
          Web Version
        </a>
        . You can also visit{" "}
        <a href={SMART_DIRECT_URL} className="text-[#f26b2b] hover:underline" target="_blank" rel="noopener noreferrer">
          smartdirectre.com/pctpropertypro
        </a>
        .
      </>
    ),
  },
  { title: "Allow location and notification permissions", body: "Lets the app surface nearby parcels and push Farm Alerts as records change." },
  { title: "Enter your referral code", body: "Your PCT representative will give you a referral code unique to you." },
  { title: "Accept Terms and Conditions", body: "Quick read of the standard data and privacy terms." },
  { title: "Complete registration", body: "Your name, email, license info, and any additional contact details." },
  { title: "Log in with your PCT247 credentials", body: "Same username and password you already use for TitlePro 247." },
  { title: "Open the PCT Property Pro tile", body: "Tap the PCT Property Pro icon on the SmartDirect® dashboard to launch it." },
]

export default function MobileAppPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="transparent" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#03374f] text-white pt-24 md:pt-28">
        {/* Topographic / geo map background */}
        <GeoMapBackground />

        {/* Navy gradient overlay so the text stays readable on top */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#03374f]/85 via-[#03374f]/75 to-[#062a3b]/90 pointer-events-none" />

        {/* Soft brand glow accents */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#f26b2b] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile + Web App
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-4">
                PCT Property Pro
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-3 leading-snug">
                Smart real estate prospecting & lead generation.
              </p>
              <p className="text-base md:text-lg text-white/70 mb-8 max-w-xl">
                Get instant access to the data you need to find your next property — from the comfort of your phone, tablet, or browser.
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
                <a
                  href={WEB_VERSION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-white rounded-xl px-5 py-3 shadow-lg"
                >
                  <Globe className="w-7 h-7" />
                  <span className="text-left leading-tight">
                    <span className="block text-[10px] uppercase tracking-wider opacity-80">Or use the</span>
                    <span className="block text-base font-semibold">Web Version</span>
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

      {/* ── Stat strip ──────────────────────────────────────── */}
      <section className="bg-[#f26b2b] text-white py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center max-w-4xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold">Millions</div>
              <p className="text-sm text-white/90 mt-1">of real estate title records at your fingertips</p>
            </div>
            <div className="sm:border-x border-white/30">
              <div className="text-3xl md:text-4xl font-bold">3,000+</div>
              <p className="text-sm text-white/90 mt-1">U.S. counties covered</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold">97%</div>
              <p className="text-sm text-white/90 mt-1">of the United States</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three pillars ───────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <p className="text-[#f26b2b] font-semibold text-sm uppercase tracking-wider mb-3">Don&apos;t just search</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#03374f] leading-tight">
              <span className="text-[#f26b2b]">FIND</span> your properties with{" "}
              <br className="hidden md:block" />
              Walking Farm® and Farm Alerts.
            </h2>
            <p className="text-gray-600 mt-5 text-lg">
              A powerful and easy-to-use real estate farming toolkit, built for the agents who don&apos;t wait for the deal to come to them.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {PILLARS.map(({ icon: Icon, title, tagline, body }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 hover:border-[#f26b2b]/40 hover:shadow-xl hover:-translate-y-1 transition-all p-7 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#03374f] to-[#062a3b] flex items-center justify-center mb-5 group-hover:from-[#f26b2b] group-hover:to-[#d85c1f] transition-all shadow-md">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#03374f] mb-1">{title}</h3>
                <p className="text-sm font-semibold text-[#f26b2b] mb-3">{tagline}</p>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool grid (everything else) ─────────────────────── */}
      <section className="py-16 md:py-20 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#03374f] mb-3">Everything you need in one app</h2>
            <p className="text-gray-600">A complete real estate prospecting toolkit — designed for the field.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {TOOLS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 hover:border-[#f26b2b]/30 hover:shadow-md transition-all p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f26b2b]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#f26b2b]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#03374f] text-sm mb-1">{title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8 max-w-2xl mx-auto">
            All features may not be available for all users in all areas. Contact your Pacific Coast Title sales representative for details.
          </p>
        </div>
      </section>

      {/* ── Setup steps ──────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
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
                More info at smartdirectre.com/pctpropertypro
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final download CTA ───────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#03374f] text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get more leads — now.</h2>
          <p className="text-lg text-white/80 mb-8">
            Your next deal is hiding in the data. Download PCT Property Pro and start working smarter today.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
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
            <a
              href={WEB_VERSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-white rounded-xl px-5 py-3 shadow-lg"
            >
              <Globe className="w-7 h-7" />
              <span className="text-left leading-tight">
                <span className="block text-[10px] uppercase tracking-wider opacity-80">Or use the</span>
                <span className="block text-base font-semibold">Web Version</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Referral / contact CTA ───────────────────────────── */}
      <section className="py-14 md:py-20 bg-gradient-to-br from-[#f26b2b] via-[#f26b2b] to-[#d85c1f] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Don&apos;t have a referral code?</h2>
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
            <ContactButton
              defaultType="general"
              title="Request a PCT Property Pro referral code"
              className="inline-flex items-center justify-center gap-2 bg-[#03374f] hover:bg-[#022a3b] transition-colors text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
              icon={<Mail className="w-4 h-4" />}
            >
              Email Us for a Referral Code
            </ContactButton>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

/**
 * Topographic / contour-line map background for the hero.
 * Pure SVG, no external assets. Sized to cover and pinned behind the
 * gradient overlay. Scales cleanly on every breakpoint.
 */
function GeoMapBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          {/* Faint dot grid (latitude/longitude feel) */}
          <pattern id="geo-dots" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="rgba(255,255,255,0.10)" />
          </pattern>

          {/* Soft radial fade so contours lighten toward the edges */}
          <radialGradient id="geo-fade" cx="55%" cy="40%" r="80%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.35)" />
            <stop offset="60%"  stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </radialGradient>
        </defs>

        {/* Lat/long dot grid */}
        <rect width="1600" height="900" fill="url(#geo-dots)" />

        {/* Concentric topographic-style contour rings */}
        <g
          fill="none"
          stroke="url(#geo-fade)"
          strokeWidth="1"
          strokeLinecap="round"
        >
          {/* "Hill 1" — upper right */}
          <ellipse cx="1180" cy="280" rx="260" ry="170" />
          <ellipse cx="1180" cy="280" rx="200" ry="130" />
          <ellipse cx="1180" cy="280" rx="140" ry="92"  />
          <ellipse cx="1180" cy="280" rx="80"  ry="55"  />

          {/* "Hill 2" — lower left */}
          <ellipse cx="320"  cy="640" rx="320" ry="200" />
          <ellipse cx="320"  cy="640" rx="240" ry="150" />
          <ellipse cx="320"  cy="640" rx="160" ry="100" />
          <ellipse cx="320"  cy="640" rx="80"  ry="55"  />

          {/* Wandering "ridge" line across the middle */}
          <path d="M -50 480 C 200 380, 420 580, 680 460 S 1100 360, 1320 520 S 1700 460, 1800 500" />
          <path d="M -50 520 C 220 420, 440 620, 700 500 S 1120 400, 1340 560 S 1700 500, 1800 540" />
          <path d="M -50 560 C 240 460, 460 660, 720 540 S 1140 440, 1360 600 S 1700 540, 1800 580" />
        </g>

        {/* A few road / boundary lines */}
        <g
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        >
          <path d="M 0 300 L 1600 220" />
          <path d="M 0 720 L 1600 660" />
          <path d="M 800 0 L 720 900" />
          <path d="M 1280 0 L 1180 900" />
        </g>

        {/* Map pins — orange accent dots for personality */}
        <g>
          {[
            { cx: 1180, cy: 280 },
            { cx: 320,  cy: 640 },
            { cx: 980,  cy: 540 },
            { cx: 560,  cy: 220 },
            { cx: 1420, cy: 720 },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={p.cx} cy={p.cy} r="14" fill="rgba(242,107,43,0.20)" />
              <circle cx={p.cx} cy={p.cy} r="5"  fill="rgba(242,107,43,0.85)" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

/** Stylised phone mockup showing a Walking Farm® map view. */
function PhoneMockup() {
  return (
    <div className="relative w-[270px] h-[560px] rounded-[44px] bg-black shadow-2xl ring-4 ring-white/10 overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30" />

      {/* Screen */}
      <div className="absolute inset-2 rounded-[36px] bg-white overflow-hidden">
        {/* Status bar */}
        <div className="h-9 flex items-end justify-between px-6 pb-1.5 text-gray-600 text-[10px] font-semibold bg-white">
          <span>9:41</span>
          <span>•••</span>
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 bg-white border-b border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-[#f26b2b] font-bold">Walking Farm®</p>
          <h3 className="text-[#03374f] font-bold text-base mt-0.5">Mission Viejo · 92692</h3>
        </div>

        {/* Faux map */}
        <div className="relative h-[280px] bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-100 overflow-hidden">
          {/* Roads */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-1/3 left-0 right-0 h-1 bg-white" />
            <div className="absolute top-2/3 left-0 right-0 h-1 bg-white" />
            <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-white" />
            <div className="absolute top-0 bottom-0 left-2/3 w-1 bg-white" />
            <div className="absolute top-1/4 left-1/2 right-0 h-px bg-white/70" />
          </div>
          {/* Pins */}
          <Pin top="22%" left="18%" color="#f26b2b" />
          <Pin top="48%" left="40%" color="#03374f" pulse />
          <Pin top="36%" left="68%" color="#f26b2b" />
          <Pin top="62%" left="22%" color="#03374f" />
          <Pin top="72%" left="58%" color="#f26b2b" />
          <Pin top="30%" left="84%" color="#03374f" />

          {/* Farm overlay */}
          <div className="absolute top-[30%] left-[10%] w-[55%] h-[45%] border-2 border-[#f26b2b] bg-[#f26b2b]/10 rounded-2xl" />
          <div className="absolute top-[24%] left-[10%] bg-[#f26b2b] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            My Farm
          </div>
        </div>

        {/* Stats card */}
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Active" value="124" />
            <Stat label="Sold 30d" value="9" />
            <Stat label="Alerts" value="3" accent />
          </div>
        </div>

        {/* Live alert */}
        <div className="absolute bottom-3 left-3 right-3 bg-[#03374f] text-white rounded-2xl p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <BellRing className="w-3.5 h-3.5 text-[#f26b2b]" />
            <span className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">Farm Alert</span>
            <span className="ml-auto text-[10px] text-white/60">just now</span>
          </div>
          <p className="text-[11px] leading-tight">New listing at 24812 Cresta Way — 4 bd / 3 ba</p>
        </div>
      </div>
    </div>
  )
}

function Pin({ top, left, color, pulse = false }: { top: string; left: string; color: string; pulse?: boolean }) {
  return (
    <div className="absolute" style={{ top, left }}>
      {pulse && (
        <span
          className="absolute inset-0 -m-1 rounded-full animate-ping opacity-60"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative block w-3 h-3 rounded-full ring-2 ring-white shadow"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-base font-bold ${accent ? "text-[#f26b2b]" : "text-[#03374f]"}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-gray-400">{label}</div>
    </div>
  )
}
