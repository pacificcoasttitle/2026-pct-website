"use client"

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Lock, User, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Suspense } from 'react'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const from         = searchParams.get('from') ?? '/admin'

  const [username,     setUsername]     = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }

      router.replace(from)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ───── Brand panel (hidden on small screens) ───── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden">
        <Image
          src="/beautiful-modern-california-home-exterior-with-blu.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        {/* Navy gradient overlay for legibility + brand tone */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#03374f] via-[#03374f]/85 to-[#03374f]/55" />

        {/* Top: logo */}
        <div className="relative z-10 p-10">
          <Image
            src="/logo2.png"
            alt="Pacific Coast Title"
            width={190}
            height={48}
            className="opacity-95"
          />
        </div>

        {/* Bottom: tagline */}
        <div className="relative z-10 p-10 max-w-lg">
          <h2 className="text-white text-3xl font-bold leading-tight tracking-tight">
            Title &amp; escrow, handled with care.
          </h2>
          <p className="text-white/70 text-base mt-3 leading-relaxed">
            Your team workspace for managing campaigns, staff, and client
            tools across California.
          </p>
        </div>
      </div>

      {/* ───── Form panel ───── */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          {/* Logo — shown only on mobile (brand panel hidden there) */}
          <div className="flex justify-center mb-10 lg:hidden">
            <Image
              src="/logo2-dark.png"
              alt="Pacific Coast Title"
              width={180}
              height={45}
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f26b2b]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#f26b2b]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Team Admin
            </span>
            <h1 className="mt-4 text-2xl font-bold text-[#03374f] tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Sign in to manage your team.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  placeholder="admin"
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
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
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
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-10">
            © {new Date().getFullYear()} Pacific Coast Title Company
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
