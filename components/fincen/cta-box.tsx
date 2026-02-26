"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MiniDisclaimer } from "./mini-disclaimer"
import { ContactButton } from "@/components/ContactButton"
import type { ContactType } from "@/components/ContactModal"

interface CTAButton {
  label: string
  href?: string
  variant?: "primary" | "outline"
  /** If set, clicking opens the contact modal instead of navigating */
  modal?: ContactType
}

interface CTABoxProps {
  heading: string
  body: string
  buttons: CTAButton[]
}

export function CTABox({ heading, body, buttons }: CTABoxProps) {
  return (
    <div className="mt-16">
      <div className="bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{heading}</h2>
        <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">{body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {buttons.map((btn, i) => {
            // Modal button
            if (btn.modal) {
              return (
                <ContactButton
                  key={i}
                  defaultType={btn.modal}
                  title={btn.label}
                  className={
                    btn.variant === "outline"
                      ? "inline-flex items-center justify-center gap-2 border-2 border-white text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white hover:text-secondary transition-colors"
                      : "inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  }
                >
                  {btn.label}
                  <ArrowRight className="w-4 h-4" />
                </ContactButton>
              )
            }

            // Regular link button
            if (!btn.href) return null
            return btn.variant === "outline" ? (
              <Link
                key={i}
                href={btn.href}
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white hover:text-secondary transition-colors"
              >
                {btn.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                key={i}
                href={btn.href}
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                {btn.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )
          })}
        </div>
      </div>
      <MiniDisclaimer />
    </div>
  )
}
