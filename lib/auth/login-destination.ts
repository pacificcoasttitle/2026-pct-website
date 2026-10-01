/** Only accept same-origin admin workspace destinations after sign-in. */
export function loginDestination(from: string | null, fallback = '/admin/team'): string {
  if (!from || from === '/admin/team') return fallback
  try {
    const decoded = decodeURIComponent(from)
    if (/[\\\u0000-\u0020]/.test(decoded) || !decoded.startsWith('/admin/team/')) return fallback
    const url = new URL(from, 'https://pct.invalid')
    if (url.origin !== 'https://pct.invalid' || !url.pathname.startsWith('/admin/team/')) return fallback
    return url.pathname + url.search + url.hash
  } catch { return fallback }
}
