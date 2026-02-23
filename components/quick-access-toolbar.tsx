"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calculator, Home, FileText, Wrench, Sparkles, ChevronUp } from "lucide-react"
import { useTessa } from "@/contexts/TessaContext"

const tools = [
  {
    icon: Calculator,
    label: "Rate Calc",
    href: "/#tools",
    external: false,
  },
  {
    icon: Home,
    label: "Prop 19",
    href: "https://pct.com/prop-19-calculator.html",
    external: true,
  },
  {
    icon: FileText,
    label: "Forms",
    href: "/resources/blank-forms",
    external: false,
  },
  {
    icon: Wrench,
    label: "Toolbox",
    href: "https://www.pcttitletoolbox.com/",
    external: true,
  },
  {
    icon: Sparkles,
    label: "TESSA",
    href: "#",
    external: false,
    isTessa: true,
  },
]

export function QuickAccessToolbar() {
  const [isVisible, setIsVisible] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { openChat } = useTessa()

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 400)
      setIsCollapsed(scrollY > 800)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
        isCollapsed ? "opacity-90" : "opacity-100"
      }`}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          const content = (
            <div
              className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-primary/5 ${
                tool.isTessa ? "bg-primary/10 hover:bg-primary/20" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  tool.isTessa
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary whitespace-nowrap">
                  {tool.label}
                </span>
              )}
            </div>
          )

          if (tool.external) {
            return (
              <a key={tool.label} href={tool.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            )
          }

          if (tool.isTessa) {
            return (
              <button
                key={tool.label}
                onClick={openChat}
              >
                {content}
              </button>
            )
          }

          return (
            <Link key={tool.label} href={tool.href}>
              {content}
            </Link>
          )
        })}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center"
        >
          <ChevronUp
            className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </div>
  )
}
