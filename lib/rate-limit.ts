import type { NextApiRequest } from 'next'

// Small in-memory sliding-window rate limiter, copied from cmadraft's
// lib/rate-limit.ts (same reasoning applies here: per-process state, fine
// for this app's scale).
const buckets = new Map<string, number[]>()
let lastSweep = 0

function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, stamps] of buckets) {
    const fresh = stamps.filter(t => now - t < 60 * 60 * 1000)
    if (fresh.length === 0) buckets.delete(key)
    else buckets.set(key, fresh)
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  sweep(now)
  const stamps = (buckets.get(key) || []).filter(t => now - t < windowMs)
  if (stamps.length >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - stamps[0])) / 1000))
    buckets.set(key, stamps)
    return { allowed: false, retryAfterSec }
  }
  stamps.push(now)
  buckets.set(key, stamps)
  return { allowed: true, retryAfterSec: 0 }
}

export function clientIp(req: NextApiRequest): string {
  const xff = req.headers['x-forwarded-for']
  const first = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim()
  return first || req.socket?.remoteAddress || 'unknown'
}
