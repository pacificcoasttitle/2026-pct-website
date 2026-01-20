"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Calculator, ChevronDown } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigationItems = [
    {
      label: "Services",
      href: "/title-services/residential",
      dropdown: [
        { label: "Residential Title", href: "/title-services/residential" },
        { label: "Commercial Title", href: "/title-services/commercial" },
        { label: "Escrow Services", href: "/services/escrow" },
        { label: "1031 Exchange", href: "/1031-exchange" },
        { label: "Lender Solutions", href: "/services/lender-solutions" },
        { label: "Credit Union Division", href: "/credit-unions" },
        { label: "TSG Division", href: "/tsg-division" },
      ],
    },
    {
      label: "Resources",
      href: "/resources",
      dropdown: [
        { label: "Agent Resource Center", href: "/resources" },
        { label: "Rate Calculator", href: "https://www.pct.com/calculator/", external: true },
        { label: "Prop 19 Calculator", href: "https://pct.com/prop-19-calculator.html", external: true },
        { label: "Blank Forms", href: "/resources/blank-forms" },
        { label: "Educational Materials", href: "/resources/educational-materials" },
        { label: "PCT Toolbox", href: "https://www.pcttitletoolbox.com/", external: true },
      ],
    },
    {
      label: "About",
      href: "/about/our-role",
      dropdown: [
        { label: "Our Role in Title", href: "/about/our-role" },
        { label: "Protecting You", href: "/about/protecting-you" },
        { label: "Why Pacific Coast Title", href: "/about/why-pacific-coast-title" },
        { label: "What is Title Insurance", href: "/title-services/what-is-title-insurance" },
        { label: "What is Escrow", href: "/title-services/what-is-escrow" },
      ],
    },
    {
      label: "Locations",
      href: "/locations",
      dropdown: [
        { label: "All Locations", href: "/locations" },
        { label: "Orange (HQ)", href: "/locations/orange" },
        { label: "Downey", href: "/locations/downey" },
        { label: "Fresno", href: "/locations/fresno" },
        { label: "Glendale", href: "/locations/glendale" },
        { label: "Inland Empire", href: "/locations/inland-empire" },
        { label: "San Diego", href: "/locations/san-diego" },
      ],
    },
    {
      label: "Contact",
      href: "/contact",
      dropdown: [
        { label: "Contact Us", href: "/contact" },
        { label: "Get a Quote", href: "/contact" },
        { label: "Orange (HQ)", href: "/locations/orange" },
      ],
    },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="https://pct.com/assets/media/general/logo2-dark.png"
                alt="Pacific Coast Title Company"
                width={200}
                height={60}
                className="h-11 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navigationItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-secondary hover:text-primary transition-colors font-medium py-6"
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                  </Link>

                  {/* Dropdown Menu - using padding instead of margin for seamless hover */}
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 pt-1">
                      <div className="w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="block px-4 py-2.5 text-sm text-secondary hover:bg-gray-50 hover:text-primary transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-md">
                <Calculator className="w-4 h-4 mr-2" />
                Get Quote
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-secondary">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isScrolled && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${Math.min((window.scrollY / document.documentElement.scrollHeight) * 100, 100)}%`,
              }}
            />
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden pt-20 overflow-y-auto">
          <div className="flex flex-col p-8">
            {navigationItems.map((item) => (
              <div key={item.label} className="mb-6">
                <Link
                  href={item.href}
                  className="text-xl font-semibold text-secondary hover:text-primary transition-colors mb-3 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                <div className="ml-4 space-y-2">
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="block text-base text-gray-600 hover:text-primary transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-6">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white">
                <Calculator className="w-4 h-4 mr-2" />
                Get Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation
