'use client'

import Link from 'next/link'
import { Calculator, Wrench, FileText, ShieldCheck, MapPin, ClipboardList } from 'lucide-react'

const quickLinks = [
  {
    title: 'Know Your Costs',
    href: '#tools',
    icon: Calculator,
    internal: true,
  },
  {
    title: 'Agent Toolbox',
    href: 'https://www.pcttitletoolbox.com/',
    icon: Wrench,
  },
  {
    title: 'Property Info',
    href: '/resources/title-flyers',
    icon: FileText,
    internal: true,
  },
  {
    title: 'Get Forms',
    href: '/resources/forms',
    icon: ClipboardList,
    internal: true,
  },
  {
    title: 'Protect Your Equity',
    href: 'https://www.equityprotect.com/title/pacificcoast',
    icon: ShieldCheck,
  },
  {
    title: 'Find Help Nearby',
    href: '/locations',
    icon: MapPin,
    internal: true,
  },
]

export function QuickLinks() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-sm text-gray-500 italic mb-2">Get What You Need</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary">
            WHAT CAN WE DO FOR YOU?
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-4" />
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {quickLinks.map((link) => {
            const Icon = link.icon
            const isInternal = link.internal
            
            const content = (
              <div className="bg-primary hover:bg-primary/90 text-white font-semibold py-5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-sm sm:text-base uppercase tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5">
                <Icon className="w-5 h-5" />
                {link.title}
              </div>
            )

            if (isInternal) {
              return (
                <Link key={link.title} href={link.href}>
                  {content}
                </Link>
              )
            }

            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
