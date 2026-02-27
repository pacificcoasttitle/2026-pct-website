"use client"

import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ContactButton } from "@/components/ContactButton"

export function Footer() {
  const services = [
    { label: "Residential Title",  href: "/services/title" },
    { label: "Commercial Title",   href: "/services/commercial" },
    { label: "1031 Exchanges",     href: "/services/1031-exchange" },
    { label: "Escrow Services",    href: "/services/escrow" },
    { label: "Nationwide Coverage",href: "/nationwide" },
    { label: "View All Services",  href: "/services/title" },
  ]

  const resources = [
    { label: "Calculators",       href: "/#tools" },
    { label: "Forms & Documents", href: "/resources/forms" },
    { label: "Educational Center",href: "/resources" },
    { label: "FAQs",              href: "/fincen/faq" },
    { label: "Contact Us",        href: "/contact" },
  ]

  const company = [
    { label: "About Us",   href: "/about" },
    { label: "Our Team",   href: "/about" },
    { label: "Careers",    href: "/careers" },
    { label: "Locations",  href: "/locations" },
  ]

  const fincenLinks = [
    { label: "FinCEN Overview",        href: "/fincen" },
    { label: "Is It Reportable?",      href: "/fincen/is-it-reportable" },
    { label: "Agent Guidance",         href: "/fincen/agents" },
    { label: "Entity & Trust Buyers",  href: "/fincen/entity-trust-buyers" },
    { label: "Trustee Sales",          href: "/fincen/trustee-sales" },
    { label: "FAQ",                    href: "/fincen/faq" },
  ]

  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">

          {/* About Column — Logo + social */}
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo2.png"
                alt="Pacific Coast Title Company"
                width={180}
                height={54}
                className="h-12 w-auto"
                unoptimized
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              AI-Powered Title Excellence.<br />
              Serving California since 2006.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook,  href: "https://www.facebook.com/pacificcoasttitle" },
                { Icon: Twitter,   href: "https://twitter.com/pacificcoasttitle" },
                { Icon: Linkedin,  href: "https://www.linkedin.com/company/pacific-coast-title" },
                { Icon: Instagram, href: "https://www.instagram.com/pacificcoasttitle" },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:text-primary hover:bg-white/20 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s.href + s.label}>
                  <Link href={s.href} className="text-white/70 hover:text-primary transition-colors text-sm">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              {resources.map((r) => (
                <li key={r.href + r.label}>
                  <Link href={r.href} className="text-white/70 hover:text-primary transition-colors text-sm">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* FinCEN Column */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              FinCEN
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-normal normal-case tracking-normal">New</span>
            </h3>
            <ul className="space-y-3">
              {fincenLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Connect</h3>
            <div className="space-y-4">
              {/* Customer Service (866) */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href="tel:+18667241050"
                    className="text-white hover:text-primary transition-colors font-semibold"
                  >
                    (866) 724-1050
                  </a>
                  <p className="text-white/60 text-xs">Customer Service · Mon–Fri 8am–6pm PST</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info@pct.com"
                  className="text-white/70 hover:text-primary transition-colors text-sm"
                >
                  info@pct.com
                </a>
              </div>

              {/* Locations */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <Link href="/contact" className="text-white/70 hover:text-primary transition-colors text-sm">
                  Multiple locations across California
                </Link>
              </div>

              {/* Contact CTA button */}
              <div className="pt-1">
                <ContactButton
                  defaultType="general"
                  title="Contact Our Team"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
                >
                  General Inquiry
                </ContactButton>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>© {new Date().getFullYear()} Pacific Coast Title Company. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
