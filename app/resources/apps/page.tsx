import type { Metadata } from "next"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Apps & Downloads | Pacific Coast Title",
  description: "Download Pacific Coast Agent ONE, PCT Property Pro and Title Toolbox. Find Apple, Android and web links, plus help getting started.",
}

const apps = [
  {
    name: "Pacific Coast Agent ONE",
    category: "Run the numbers",
    description: "Bring more clarity to the conversation with buyer estimates, seller net sheets and closing-cost calculations.",
    features: ["Buyer estimates", "Seller net sheets"],
    apple: "https://apps.apple.com/us/app/pacificcoastagent-one/id434589544",
    android: "https://play.google.com/store/apps/details?id=palmagent.PacificCoastAgent.Two",
    web: "https://www.pacificcoastagent.com/",
    webLabel: "Visit Agent ONE",
    note: "Look for PacificCoastAgent ONE in your app store. Some features may require a subscription.",
  },
  {
    name: "PCT Property Pro",
    category: "Know the property",
    description: "Take property research with you. Explore ownership, property details and comparable sales while you're out in the field.",
    features: ["Property details", "Comparable sales"],
    apple: "https://apps.apple.com/us/app/smartdirect-mobile/id1516910124",
    android: "https://play.google.com/store/apps/details?id=com.redshedtechnology.smartdirect",
    web: "https://smartdirectre.com/pctpropertypro",
    webLabel: "Setup & app details",
    note: "Listed as SmartDirect Mobile. Ask your PCT representative for the referral code to get started.",
  },
  {
    name: "PCT Title Toolbox",
    category: "Build your next farm",
    description: "Turn property information into a more informed prospecting plan with ownership research, neighborhood farms and lists.",
    features: ["Farming tools", "Ownership research"],
    apple: "https://apps.apple.com/us/app/titletoolbox/id1376789572",
    android: "https://play.google.com/store/apps/details?id=com.benutech.titletoolbox",
    web: "https://www.pcttitletoolbox.com/",
    webLabel: "Open the web portal",
    note: "Look for TitleToolBox. A sponsoring title company account is required; contact your PCT representative for access.",
  },
]

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"

export default function AppsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="transparent" />
      <section className="relative overflow-hidden bg-secondary pt-32 pb-16 text-white md:pt-40 md:pb-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="container relative mx-auto px-4">
          <Link href="/resources" className={`mb-8 inline-block text-sm text-white/80 hover:text-white ${focus}`}>&larr; Agent Resource Center</Link>
          <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div>
              <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#ffad80]">Your agent toolkit</p>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">More insight.<br />Less guesswork.<br /><span className="text-[#ffad80]">Get the apps.</span></h1>
            </div>
            <p className="max-w-lg text-lg leading-relaxed text-white/80 md:text-xl">From your next client conversation to your next farm, keep your Pacific Coast Title tools close at hand.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="downloads-heading" className="bg-muted py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <h2 id="downloads-heading" className="text-2xl font-bold text-secondary">Three tools. One place to start.</h2>
            <p className="text-sm text-slate-600">Choose your app, then your device.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {apps.map((app, index) => (
              <article key={app.name} className="flex flex-col rounded-2xl bg-white p-7 shadow-sm md:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-secondary">0{index + 1}</span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{app.category}</p>
                </div>
                <h3 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-secondary lg:min-h-20">{app.name}</h3>
                <p className="mb-5 leading-relaxed text-slate-600 lg:min-h-32">{app.description}</p>
                <div className="mb-7 flex flex-wrap gap-2">{app.features.map(feature => <span key={feature} className="rounded-md bg-muted px-3 py-1 text-xs font-semibold text-secondary">{feature}</span>)}</div>
                <div className="mt-auto grid gap-3">
                  {[
                    { href: app.apple, device: "iPhone & iPad", store: "App Store" },
                    { href: app.android, device: "Android", store: "Google Play" },
                  ].map(link => (
                    <a key={link.store} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`Download ${app.name} on ${link.store} (opens in a new tab)`} className={`flex items-center justify-between rounded-xl bg-secondary px-5 py-3 text-white transition-colors hover:bg-secondary/90 ${focus}`}>
                      <span><span className="block text-xs text-white/80">{link.device}</span><span className="text-lg font-semibold">{link.store}</span></span><span aria-hidden="true" className="text-xl">&nearr;</span>
                    </a>
                  ))}
                  <a href={app.web} target="_blank" rel="noopener noreferrer" className={`flex justify-between rounded-md py-3 text-sm font-semibold text-secondary hover:underline ${focus}`}>{app.webLabel}<span aria-hidden="true">&nearr;</span></a>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-600 lg:min-h-20">{app.note}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col justify-between gap-6 rounded-2xl bg-secondary/5 p-8 md:flex-row md:items-center">
            <div><h2 className="mb-2 text-2xl font-bold text-secondary">A little help getting started?</h2><p className="max-w-2xl text-slate-600">Your PCT representative can help with account access, referral codes and choosing the right tool for your business.</p></div>
            <Link href="/contact" className={`shrink-0 self-start rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-secondary transition-colors hover:bg-primary/85 md:self-auto ${focus}`}>Connect with PCT &rarr;</Link>
          </div>
          <p className="mt-6 text-xs text-slate-600">Features and access vary by account. App downloads open the provider&apos;s store listing in a new tab.</p>
        </div>
      </section>
      <Footer />
    </main>
  )
}
