"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const services = [
    "Residential Title",
    "Commercial Title",
    "1031 Exchanges",
    "Escrow Services",
    "Nationwide Coverage",
    "View All Services",
  ]

  const resources = ["Calculators", "Forms & Documents", "Educational Center", "Blog", "FAQs", "Contact Us"]

  const company = ["About Us", "Our Team", "Careers", "Press", "Partners", "Locations"]

  const fincenLinks = [
    { label: "FinCEN Overview", href: "/fincen" },
    { label: "Is It Reportable?", href: "/fincen/is-it-reportable" },
    { label: "Agent Guidance", href: "/fincen/agents" },
    { label: "Entity & Trust Buyers", href: "/fincen/entity-trust-buyers" },
    { label: "Trustee Sales", href: "/fincen/trustee-sales" },
    { label: "FAQ", href: "/fincen/faq" },
  ]

  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* About Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">PCT</span>
              </div>
              <div>
                <div className="font-bold text-lg text-white">Pacific Coast Title</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">AI-Powered Title Excellence</p>
            <div className="flex gap-3">
              <Button size="icon" variant="ghost" className="text-white/70 hover:text-primary hover:bg-white/10">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-white/70 hover:text-primary hover:bg-white/10">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-white/70 hover:text-primary hover:bg-white/10">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-white/70 hover:text-primary hover:bg-white/10">
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link href="#" className="text-white/70 hover:text-primary transition-colors text-sm">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <li key={index}>
                  <Link href="#" className="text-white/70 hover:text-primary transition-colors text-sm">
                    {resource}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* FinCEN Column */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              FinCEN
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-normal">New</span>
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
            <h3 className="font-bold text-white text-lg mb-4">Connect</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <a
                    href="tel:7145166700"
                    className="text-white hover:text-primary transition-colors font-semibold text-lg"
                  >
                    (714) 516-6700
                  </a>
                  <p className="text-white/70 text-xs">Mon-Fri 8am-6pm PST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info@pct.com"
                  className="text-white/70 hover:text-primary transition-colors text-sm"
                >
                  info@pct.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-white/70 text-sm">Multiple locations across California</p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>© 2026 Pacific Coast Title Company. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
