import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

interface LeadPayload {
  name?: string
  email?: string
  phone?: string
  timeline?: string
  movingFrom?: string
  message?: string
  source?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body as LeadPayload
  const name = (body.name || '').trim()
  const email = (body.email || '').trim()

  if (!name || !email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid name and email.' })
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'carlossimonihomes@gmail.com'
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'
  const apiKey = process.env.RESEND_API_KEY

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    body.phone ? `Phone: ${body.phone}` : null,
    body.timeline ? `Timeline: ${body.timeline}` : null,
    body.movingFrom ? `Moving from: ${body.movingFrom}` : null,
    body.message ? `Message: ${body.message}` : null,
    body.source ? `Source: ${body.source}` : null,
  ].filter(Boolean)

  if (!apiKey) {
    // No Resend key configured (local dev, or not deployed yet) — log
    // instead of failing, so the form is fully testable without secrets.
    console.log('[contact] RESEND_API_KEY not set — logging lead instead of emailing:\n' + lines.join('\n'))
    return res.status(200).json({ ok: true, delivered: false })
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: `Carlos Simoni Website <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `New website lead: ${name}${body.source ? ` (${body.source})` : ''}`,
      text: lines.join('\n'),
    })
    if (error) throw new Error(error.message)
    return res.status(200).json({ ok: true, delivered: true })
  } catch (err) {
    console.error('[contact] failed to send lead email:', err)
    return res.status(502).json({ error: 'Could not send right now — please call or text instead.' })
  }
}
