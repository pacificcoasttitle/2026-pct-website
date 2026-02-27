import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TessaProvider } from "@/contexts/TessaContext"
import { TessaChatWidget } from "@/components/tessa/TessaChatWidget"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Pacific Coast Title Company | AI-Powered Title & Escrow Services",
  description:
    "California's first AI-powered title company. Experience unprecedented efficiency with TESSA AI, smart document processing, and 72 hours saved per transaction.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <TessaProvider>
          {children}
          <TessaChatWidget />
        </TessaProvider>
        <Analytics />
      </body>
    </html>
  )
}
