"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Shield,
  List,
  MessageSquare,
  Mail,
  PenLine,
  Paperclip,
  Newspaper,
  CalendarDays,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react'

/**
 * Sidebar information architecture.
 *
 * Grouped, non-collapsible sections. The first group is intentionally
 * headerless (Overview reads cleaner without a label above a single
 * Dashboard entry). All items remain visible to every admin — there is
 * NO role-gating here; the `role` prop is used only for the display
 * label in the user-card chrome below.
 *
 * Calendar (/admin/team/marketing-recap/calendar) is promoted from
 * cross-link-only to a top-level Marketing entry. Recipients and
 * Upcoming remain cross-linked from the Recap hub — they're
 * configuration surfaces, not daily destinations.
 */
type NavItem = { href: string; label: string; icon: LucideIcon }
type NavGroup = { label: string | null; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { href: '/admin/team',                          label: 'Dashboard',        icon: LayoutDashboard },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/team/employees',                label: 'Sales Reps',       icon: Users },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/team/marketing',                label: 'Email Marketing',  icon: Mail },
      { href: '/admin/team/sms',                      label: 'Text Reps',        icon: MessageSquare },
      { href: '/admin/team/asset-delivery',           label: 'Email Reps',       icon: Paperclip },
      { href: '/admin/team/marketing-recap',          label: 'Marketing Recap',  icon: Newspaper },
      { href: '/admin/team/marketing-recap/calendar', label: 'Calendar',         icon: CalendarDays },
    ],
  },
  {
    label: 'Client Tools',
    items: [
      { href: '/admin/team/assessments',              label: 'Assessments',      icon: ClipboardCheck },
      { href: '/admin/team/farms',                    label: 'Farm Requests',    icon: List },
    ],
  },
  {
    label: 'Internal Tools',
    items: [
      { href: '/admin/team/signatures',               label: 'Signature Center', icon: PenLine },
    ],
  },
]

const ALL_HREFS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href))

function roleLabel(role: string) {
  return role === 'top_level' ? 'Super Admin' : role === 'manager' ? 'Manager' : role
}

export default function AdminSidebar({
  username,
  role,
}: {
  username: string
  role:     string
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open,   setOpen]    = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  async function handleLogout() {
    setLogoutLoading(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  /**
   * Active-state matcher — most-specific match wins.
   *
   * Builds on d02f2ce's trailing-slash-safe prefix check (which fixed
   * the `pathname.startsWith(href)` collision where `/marketing-recap`
   * matched BOTH `/marketing` and `/marketing-recap`). We keep that
   * exact rule, then resolve ties by picking the LONGEST matching href
   * so only the single deepest entry lights up.
   *
   * This fixes the Calendar "stuck together" bug: at
   * `/marketing-recap/calendar`, both Marketing Recap (prefix match)
   * and Calendar (exact match) qualified and both highlighted. Now the
   * longer href (Calendar) wins and Marketing Recap stays inactive.
   *
   * Dashboard keeps its exact-match special case because EVERY admin
   * route starts with `/admin/team/`, so a prefix rule would light it
   * up everywhere.
   */
  function matches(href: string): boolean {
    if (href === '/admin/team') return pathname === '/admin/team'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const activeHref = ALL_HREFS.reduce<string | null>((best, href) => {
    if (!matches(href)) return best
    return best === null || href.length > best.length ? href : best
  }, null)

  const navItems = (
    <nav className="flex flex-col px-3 mt-2">
      {NAV_GROUPS.map((group, gi) => (
        <div
          key={group.label ?? `__group_${gi}`}
          className={gi === 0 ? 'pt-1' : 'pt-5'}
        >
          {group.label && (
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
              {group.label}
            </div>
          )}
          <div className="flex flex-col gap-1">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === activeHref
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#f26b2b] text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10 flex-shrink-0">
        <Link href="/" target="_blank" className="inline-flex items-center gap-2 group">
          <Image src="/logo2.png" alt="PCT" width={130} height={33} className="opacity-85 group-hover:opacity-100 transition" />
          <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white/50 transition" />
        </Link>
        <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#f26b2b]">
          Team Admin
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 py-4 overflow-y-auto">
        {navItems}
      </div>

      {/* User + logout */}
      <div className="px-5 py-5 border-t border-white/10 flex-shrink-0 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f26b2b]/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-[#f26b2b]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{username}</p>
            <p className="text-[11px] text-white/40">{roleLabel(role)}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {logoutLoading ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col w-56 flex-shrink-0 bg-[#03374f] min-h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#03374f] flex items-center justify-between px-4 h-14 border-b border-white/10">
        <Image src="/logo2.png" alt="PCT" width={110} height={28} className="opacity-90" />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-2 text-white/70 hover:text-white transition"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute top-14 left-0 bottom-0 w-64 bg-[#03374f] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Mobile content spacer ── */}
      <div className="lg:hidden h-14 w-full fixed top-0 pointer-events-none" />
    </>
  )
}
