import type { NextApiRequest, NextApiResponse } from 'next'
import { Webhook } from 'svix'
import { query } from '@/lib/db'
import { writeLog } from '@/lib/log'

// Resend's bounce/complaint webhook. Signed with Svix (see
// https://resend.com/docs/dashboard/webhooks/event-types) -- set
// RESEND_WEBHOOK_SECRET to the signing secret shown when you create the
// webhook in the Resend dashboard, once carlossimoni.com has its own
// Resend account. Until that secret is set this route 500s on every call,
// which is fine: there's no webhook pointed at it yet either.
//
// A spam complaint or hard bounce against someone we emailed should stop
// ALL future outreach to them immediately -- this is the automated half
// of "what happens if people complain" (the other half is the manual
// unsubscribe link, see lib/email-unsubscribe.ts / pages/api/unsubscribe.ts).
// Continuing to email someone who already marked a message as spam is
// exactly what tanks a new sending domain's reputation.

export const config = { api: { bodyParser: false } }

function readRawBody(req: NextApiRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

interface ResendEvent {
  type: string
  data: {
    to?: string[]
    email_id?: string
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ error: 'RESEND_WEBHOOK_SECRET not configured' })

  const rawBody = await readRawBody(req)

  let event: ResendEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(rawBody, {
      'svix-id': String(req.headers['svix-id'] || ''),
      'svix-timestamp': String(req.headers['svix-timestamp'] || ''),
      'svix-signature': String(req.headers['svix-signature'] || ''),
    }) as unknown as ResendEvent
  } catch (err: any) {
    console.error('Resend webhook signature verification failed:', err?.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const OPT_OUT_EVENTS = new Set(['email.complained', 'email.bounced'])
  if (!OPT_OUT_EVENTS.has(event.type)) {
    // Delivered/opened/clicked etc. -- nothing to do, just acknowledge.
    return res.status(200).json({ ok: true, ignored: event.type })
  }

  const toEmails = (event.data.to || []).map((e) => e.toLowerCase())
  if (toEmails.length === 0) return res.status(200).json({ ok: true, noRecipient: true })

  const result = await query<{ id: number }>(
    `UPDATE carlos_crm.leads
     SET email_opt_out = true, email_opt_out_at = now(), updated_at = now()
     WHERE lower(email) = ANY($1) AND email_opt_out = false
     RETURNING id`,
    [toEmails],
  )

  for (const row of result.rows) {
    await query(
      `INSERT INTO carlos_crm.lead_activities (lead_id, type, direction, body, created_by_admin_id)
       VALUES ($1, 'note', NULL, $2, 'system')`,
      [row.id, `Email opted out automatically (Resend reported ${event.type})`],
    )
  }

  await writeLog(
    'resend_webhook',
    event.type === 'email.complained' ? 'warn' : 'info',
    `${event.type}: opted out ${result.rows.length} lead(s)`,
    { type: event.type, to: toEmails, leadIds: result.rows.map((r) => r.id) },
  )

  return res.status(200).json({ ok: true, optedOut: result.rows.length })
}
