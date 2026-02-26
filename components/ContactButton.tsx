"use client"

import { useState } from "react"
import { ContactModal, type ContactType } from "./ContactModal"

interface ContactButtonProps {
  children: React.ReactNode
  defaultType?: ContactType
  title?: string
  className?: string
  /** Optional icon to render before children */
  icon?: React.ReactNode
}

/**
 * Drop-in replacement for any <Link href="/contact"> or <a href="mailto:...">
 * that should open the contact modal instead.
 */
export function ContactButton({
  children,
  defaultType = "general",
  title,
  className = "",
  icon,
}: ContactButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {icon && icon}
        {children}
      </button>
      <ContactModal
        open={open}
        onClose={() => setOpen(false)}
        defaultType={defaultType}
        title={title}
      />
    </>
  )
}
