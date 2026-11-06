// One-click CAN-SPAM unsubscribe, ported from cmadraft's
// lib/email-unsubscribe.ts (same approach: stateless HMAC token, no extra
// DB lookup needed to verify it, RESEND_API_KEY as pepper since it's
// already a server-only secret used by the same sending system).
import crypto from 'crypto'

function secret(): string {
  return process.env.RESEND_API_KEY || process.env.ADMIN_PASSWORD || 'carlossimoni-unsubscribe-fallback'
}

function sign(leadId: number): string {
  return crypto.createHmac('sha256', secret()).update(String(leadId)).digest('base64url').slice(0, 16)
}

export function unsubscribeToken(leadId: number): string {
  return `${leadId}.${sign(leadId)}`
}

export function verifyUnsubscribeToken(token: string): number | null {
  const [idStr, sig] = (token || '').split('.')
  const leadId = Number(idStr)
  if (!idStr || !sig || !Number.isInteger(leadId) || leadId <= 0) return null
  const expected = sign(leadId)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  return leadId
}
