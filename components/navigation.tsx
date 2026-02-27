"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Calculator, ChevronDown } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

interface NavigationProps {
  /** 
   * "transparent" - White text on transparent bg (for dark hero backgrounds like homepage)
   * "light" - Dark text on transparent bg (for light/white hero backgrounds)
   */
  variant?: "transparent" | "light"
}

export function Navigation({ variant = "transparent" }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  
  // Determine if we should use dark text
  // - Always dark when scrolled (white bg)
  // - Dark when variant is "light" (white/light hero background)
  // - White only when not scrolled AND variant is "transparent" (dark hero)
  const useDarkText = isScrolled || variant === "light"

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
      href: "/services/title",
      dropdown: [
        { label: "Residential Title", href: "/services/title" },
        { label: "Commercial Title", href: "/services/commercial" },
        { label: "Escrow Services", href: "/services/escrow" },
        { label: "1031 Exchange", href: "/services/1031-exchange" },
        { label: "Lender Solutions", href: "/services/lender-solutions" },
        { label: "Credit Unions", href: "/services/credit-unions" },
        { label: "TSG Division", href: "/services/tsg" },
        { label: "Nationwide Services", href: "/nationwide" },
      ],
    },
    {
      label: "Resources",
      href: "/resources",
      dropdown: [
        { label: "Agent Resource Center", href: "/resources" },
        { label: "Rate Calculator", href: "/resources/rate-book" },
        { label: "Prop 19 Calculator", href: "/resources/prop-19-calculator" },
        { label: "Utilities Directory", href: "/utilities" },
        { label: "Blank Forms", href: "/resources/forms" },
        { label: "Learning Center", href: "/learn" },
      ],
    },
    {
      label: "About",
      href: "/about",
      dropdown: [
        { label: "About PCT", href: "/about" },
        { label: "How We Protect You", href: "/about/how-we-protect-you" },
        { label: "Our Role in Title", href: "/about/our-role" },
        { label: "Why Pacific Coast Title", href: "/about/why-pacific-coast-title" },
        { label: "Careers", href: "/careers" },
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
      ],
    },
    {
      label: "FinCEN",
      href: "/fincen",
      dropdown: [
        { label: "FinCEN Overview", href: "/fincen" },
        { label: "RRE Rule Explained", href: "/fincen/rre-rule" },
        { label: "Is It Reportable?", href: "/fincen/is-it-reportable" },
        { label: "Agent Guidance", href: "/fincen/agents" },
        { label: "Entity & Trust Buyers", href: "/fincen/entity-trust-buyers" },
        { label: "Trustee Sales", href: "/fincen/trustee-sales" },
        { label: "FAQ", href: "/fincen/faq" },
        { label: "Resources & Glossary", href: "/fincen/resources" },
      ],
    },
    {
      label: "Contact",
      href: "/contact",
      dropdown: [
        { label: "Contact Us", href: "/contact" },
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
                src={useDarkText 
                  ? "/logo2-dark.png"
                  : "/logo2.png"
                }
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
                    className={`flex items-center gap-1 transition-colors font-medium py-6 ${
                      useDarkText 
                        ? 'text-secondary hover:text-primary' 
                        : 'text-white hover:text-white/80'
                    }`}
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
              <Link href="/#tools">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md">
                  <Calculator className="w-4 h-4 mr-2" />
                  Get Quote
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className={`md:hidden p-2 ${useDarkText ? 'text-secondary' : 'text-white'}`}
            >
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
              <Link href="/#tools" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white">
                  <Calculator className="w-4 h-4 mr-2" />
                  Get Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navigation
