import type { NextApiRequest } from 'next'
import crypto from 'crypto'

// Deliberately NOT a full account system (no Clerk, no signup) -- this is
// one internal admin area for Carlos/Noah only, gated by a single shared
// password (ADMIN_PASSWORD) set server-side. Good enough while this is one
// person clicking two buttons; revisit if the admin area grows.

const COOKIE_NAME = 'carlos_admin'

function expectedToken(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD is not set')
  return crypto.createHash('sha256').update(secret).digest('hex')
}

export function checkPassword(password: string): boolean {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret || typeof password !== 'string') return false
  const a = Buffer.from(password)
  const b = Buffer.from(secret)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function sessionCookie(): string {
  const token = expectedToken()
  const maxAge = 60 * 60 * 24 * 30 // 30 days
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`
}

export function isAdminRequest(req: NextApiRequest): boolean {
  const cookie = req.cookies?.[COOKIE_NAME]
  if (!cookie || !process.env.ADMIN_PASSWORD) return false
  try {
    return cookie === expectedToken()
  } catch {
    return false
  }
}

// Vercel Cron has no admin cookie -- it authenticates by sending this
// header instead (set CRON_SECRET in the Vercel project's env vars; Vercel
// adds the header automatically for scheduled invocations).
export function isCronRequest(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET
  const header = req.headers.authorization
  if (!secret || !header) return false
  const a = Buffer.from(header)
  const b = Buffer.from(`Bearer ${secret}`)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
