import {
  Calculator,
  FileText,
  Wrench,
  DollarSign,
  GraduationCap,
  Calendar,
  Download,
  ExternalLink,
  BookOpen,
  Video,
  type LucideIcon,
} from "lucide-react"

export interface Resource {
  title: string
  description: string
  href: string
  isExternal: boolean
  icon?: LucideIcon
  downloadable?: boolean
}

export interface ResourceCategory {
  id: string
  title: string
  description: string
  icon: LucideIcon
  items: Resource[]
}

// Pinned tools - most frequently accessed by agents
export const pinnedTools: Resource[] = [
  {
    title: "Rate Calculator",
    description: "Get instant title & escrow quotes",
    href: "https://www.pct.com/calculator/",
    isExternal: true,
    icon: Calculator,
  },
  {
    title: "Prop 19 Calculator",
    description: "Calculate property tax savings",
    href: "https://pct.com/prop-19-calculator.html",
    isExternal: true,
    icon: Calculator,
  },
  {
    title: "Blank Forms",
    description: "Downloadable transaction forms",
    href: "/resources/blank-forms",
    isExternal: false,
    icon: FileText,
  },
  {
    title: "PCT Title Toolbox",
    description: "Comprehensive agent toolkit",
    href: "https://www.pcttitletoolbox.com/",
    isExternal: true,
    icon: Wrench,
  },
  {
    title: "TitlePro 247",
    description: "Online title ordering portal",
    href: "https://www.pct247.com/",
    isExternal: true,
    icon: ExternalLink,
  },
]

// All resource categories
export const resourceCategories: ResourceCategory[] = [
  {
    id: "calculators",
    title: "Calculators",
    description: "Estimate costs and savings instantly",
    icon: Calculator,
    items: [
      {
        title: "Rate Calculator",
        description: "Get instant title & escrow fee estimates",
        href: "https://www.pct.com/calculator/",
        isExternal: true,
      },
      {
        title: "Prop 19 Calculator",
        description: "Calculate property tax transfer benefits",
        href: "https://pct.com/prop-19-calculator.html",
        isExternal: true,
      },
      {
        title: "Lender Rate Portal",
        description: "Dedicated portal for lender partners",
        href: "https://www.pct.com/calculator/index.php?welcome/signup",
        isExternal: true,
      },
    ],
  },
  {
    id: "forms",
    title: "Forms & Documents",
    description: "Downloadable forms and client materials",
    icon: FileText,
    items: [
      {
        title: "Blank Forms Library",
        description: "Transaction and escrow forms",
        href: "/resources/blank-forms",
        isExternal: false,
      },
      {
        title: "Educational Booklets",
        description: "Client handouts and guides",
        href: "/resources/educational-materials",
        isExternal: false,
      },
      {
        title: "Informational Flyers",
        description: "Marketing materials for agents",
        href: "/resources/educational-materials",
        isExternal: false,
      },
      {
        title: "SB2 Forms",
        description: "Required SB2 recording forms",
        href: "/sb2-forms",
        isExternal: false,
      },
    ],
  },
  {
    id: "tools",
    title: "Digital Tools & Portals",
    description: "Online tools to streamline your workflow",
    icon: Wrench,
    items: [
      {
        title: "PCT Title Toolbox",
        description: "Comprehensive agent resource hub",
        href: "https://www.pcttitletoolbox.com/",
        isExternal: true,
      },
      {
        title: "TitlePro 247",
        description: "24/7 online title ordering system",
        href: "https://www.pct247.com/",
        isExternal: true,
      },
      {
        title: "Pacific Coast Agent Portal",
        description: "Agent-exclusive tools and resources",
        href: "https://www.pacificcoastagent.com/",
        isExternal: true,
      },
      {
        title: "Instant Profile",
        description: "Quick property profile lookup",
        href: "https://www.pct.com/calculator/",
        isExternal: true,
      },
    ],
  },
  {
    id: "fees",
    title: "Fees & Taxes Reference",
    description: "Recording fees, transfer taxes, and rate info",
    icon: DollarSign,
    items: [
      {
        title: "Rate Book",
        description: "Complete title and escrow rate information",
        href: "https://www.pct.com/calculator/",
        isExternal: true,
        downloadable: true,
      },
      {
        title: "Recording Fees by County",
        description: "County-by-county recording fee schedule",
        href: "https://www.pcttitletoolbox.com/",
        isExternal: true,
      },
      {
        title: "City Transfer Tax Guide",
        description: "Local transfer tax rates and exemptions",
        href: "https://www.pcttitletoolbox.com/",
        isExternal: true,
      },
      {
        title: "Supplemental Tax Information",
        description: "Guide to California supplemental property taxes",
        href: "https://www.pcttitletoolbox.com/",
        isExternal: true,
      },
    ],
  },
  {
    id: "education",
    title: "Education & Training",
    description: "Learn about title insurance and escrow",
    icon: GraduationCap,
    items: [
      {
        title: "What is Title Insurance",
        description: "Understanding title insurance basics",
        href: "/title-services/what-is-title-insurance",
        isExternal: false,
      },
      {
        title: "What is Escrow",
        description: "The escrow process explained",
        href: "/title-services/what-is-escrow",
        isExternal: false,
      },
      {
        title: "Life of a Title Search",
        description: "How title searches are conducted",
        href: "/title-services/life-of-title-search",
        isExternal: false,
      },
      {
        title: "Life of Escrow",
        description: "Step-by-step escrow timeline",
        href: "/title-services/life-of-escrow",
        isExternal: false,
      },
      {
        title: "Benefits of Title Insurance",
        description: "Why title insurance matters",
        href: "/title-services/benefits-title-insurance",
        isExternal: false,
      },
      {
        title: "Top 10 Title Problems",
        description: "Common title issues to watch for",
        href: "/title-services/top-10-title-problems",
        isExternal: false,
      },
      {
        title: "Common Title Terms Glossary",
        description: "Industry terminology explained",
        href: "https://www.pcttitletoolbox.com/",
        isExternal: true,
      },
    ],
  },
  {
    id: "calendars",
    title: "Important Calendars",
    description: "Key dates, holidays, and deadlines",
    icon: Calendar,
    items: [
      {
        title: "2026 Recorders Holiday Calendar",
        description: "County recorder office closures",
        href: "https://www.pcttitletoolbox.com/",
        isExternal: true,
        downloadable: true,
      },
      {
        title: "2026 Rescission Calendar",
        description: "Rescission period calculations",
        href: "https://www.pcttitletoolbox.com/",
        isExternal: true,
        downloadable: true,
      },
    ],
  },
]

// Quick links for the toolbar
export const quickAccessLinks = [
  {
    label: "Rate Calculator",
    href: "https://www.pct.com/calculator/",
    isExternal: true,
  },
  {
    label: "Prop 19 Calculator",
    href: "https://pct.com/prop-19-calculator.html",
    isExternal: true,
  },
  {
    label: "Blank Forms",
    href: "/resources/blank-forms",
    isExternal: false,
  },
  {
    label: "PCT Toolbox",
    href: "https://www.pcttitletoolbox.com/",
    isExternal: true,
  },
]
