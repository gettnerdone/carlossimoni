import type { NextApiRequest, NextApiResponse } from 'next'
import { checkPassword, sessionCookie } from '@/lib/admin-auth'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const limit = rateLimit(`admin-login:${clientIp(req)}`, 10, 15 * 60 * 1000)
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSec))
    return res.status(429).json({ error: 'Too many attempts. Try again later.' })
  }

  const { password } = req.body || {}
  if (typeof password !== 'string' || !checkPassword(password)) {
    return res.status(401).json({ error: 'Wrong password' })
  }

  res.setHeader('Set-Cookie', sessionCookie())
  return res.status(200).json({ ok: true })
}
