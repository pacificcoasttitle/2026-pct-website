"use client"

import { useRef, useState, FormEvent } from 'react'
import { loginDestination } from '@/lib/auth/login-destination'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Lock, User, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Suspense } from 'react'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const from         = searchParams.get('from')
  const busy = useRef(false)
  const [opening, setOpening] = useState(false)

  const [username,     setUsername]     = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy.current) return
    busy.current = true
    setLoading(true)
    setError('')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    let navigating = false
    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }

      navigating = true
      setOpening(true)
      router.replace(loginDestination(from, loginDestination(data.destination || null)))
    } catch {
      setError('Network error — please try again.')
    } finally {
      clearTimeout(timeout)
      if (!navigating) { setLoading(false); busy.current = false }
    }
  }

  return (
    <main className="min-h-dvh flex flex-col lg:flex-row bg-[#F3F4F6]">
      {/* ───── Brand panel (hidden on small screens) ───── */}
      <div className="relative flex lg:w-[54%] flex-col justify-between overflow-hidden bg-[#10213A]">
        {/* Navy gradient overlay for legibility + brand tone */}
        <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 15% 85%, #246271 0%, transparent 55%), radial-gradient(ellipse at 100% 0%, #334767 0%, transparent 55%)' }} />

        {/* Top: logo */}
        <div className="relative z-10 p-10">
          <Image
            src="/logo2.png"
            alt="Pacific Coast Title"
            width={190}
            height={48}
            priority
            className="h-auto w-56"
          />
        </div>

        {/* Bottom: tagline */}
        <div className="relative z-10 px-10 pb-12 lg:py-24 lg:px-14 max-w-xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#FF8A4C]">The PCT team workspace</p>
          <h2 className="text-white text-4xl sm:text-5xl xl:text-6xl font-semibold leading-[1.12] tracking-tight">
            Good people.<br />Great work.<br /><span className="text-[#A9DDDF]">One place.</span>
          </h2>
          <p className="text-white/70 text-base mt-3 leading-relaxed">
            Bring your people, campaigns, and next steps together.
          </p>
          <div className="mt-10 hidden sm:flex gap-3 text-sm text-white">
            {['People', 'Marketing', 'Planning'].map(label => <span key={label} className="rounded-xl bg-white/10 px-5 py-4">{label}</span>)}
          </div>
        </div>
      </div>

      {/* ───── Form panel ───── */}
      <div className="flex w-full lg:w-[46%] items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-10 shadow-[0_24px_80px_-35px_rgba(16,33,58,0.25)]">
          {/* Heading */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f26b2b]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f26b2b]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Team access
            </span>
            <h1 className="mt-4 text-2xl font-bold text-[#03374f] tracking-tight">
              Welcome back.
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Sign in to your team workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="username"
                  name="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={loading}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Your username"
                  className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26b2b]/30 focus:border-[#f26b2b] focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  disabled={loading}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f26b2b]/30 focus:border-[#f26b2b] focus:bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#03374f] focus:outline-none focus:text-[#03374f] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="flex items-center gap-2.5 bg-red-50 rounded-xl px-4 py-3 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#03374f] hover:bg-[#03374f]/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span role="status">{opening ? 'Opening workspace…' : 'Signing in…'}</span></>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-10">
            Need access? Contact your PCT administrator.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div role="status" className="min-h-dvh flex items-center justify-center bg-[#10213A] text-white">Loading sign-in…</div>}>
      <LoginForm />
    </Suspense>
  )
}
