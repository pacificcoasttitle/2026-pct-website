import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agent Resource Center | Pacific Coast Title",
  description:
    "Access calculators, forms, tools, and educational resources to help you close deals faster. Everything real estate professionals need in one place.",
  openGraph: {
    title: "Agent Resource Center | Pacific Coast Title",
    description:
      "Access calculators, forms, tools, and educational resources to help you close deals faster.",
    type: "website",
  },
}

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
