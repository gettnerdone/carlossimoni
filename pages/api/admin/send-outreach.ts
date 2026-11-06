import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'
import { unsubscribeToken } from '@/lib/email-unsubscribe'
import { writeLog } from '@/lib/log'

// Sends the initial outreach email to Vulcan7-sourced leads that haven't
// been emailed yet.
//
// SAFETY: this is dry-run by default. A real send requires the request
// body to explicitly set { confirm: true } -- there is no query-string
// shortcut for it, on purpose, so a bookmarked/retried GET or a careless
// curl can't accidentally blast real people. Dry-run sends ZERO email to
// any lead; instead it sends exactly one summary email to ADMIN_EMAIL_TO
// listing who it would have gone out to, so you can review before ever
// flipping confirm: true.
const BATCH_LIMIT = 25

// FROM/footer: TESTING ONLY. This must point at carlossimoni.com + Carlos's
// own Resend account before any real send to real leads -- see the
// decision recorded in docs/carlos-crm-schema.sql's header. Never let this
// go to production still pointed at cmadraft.
const FROM = process.env.OUTREACH_FROM_EMAIL || 'Carlos Simoni <carlos.simoni@cmadraft.com>'
const REPLY_TO = process.env.OUTREACH_FROM_EMAIL ? undefined : 'carlos.simoni@cmadraft.com'
const MAILING_ADDRESS = process.env.OUTREACH_MAILING_ADDRESS || '[BUSINESS MAILING ADDRESS]'
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://carlossimoni.com').replace(/\/$/, '')

interface EligibleLead {
  id: number
  name: string
  email: string
  city: string | null
  state: string | null
}

function buildOutreachHtml(leadName: string, leadId: number): string {
  const unsubUrl = `${APP_URL}/api/unsubscribe?token=${unsubscribeToken(leadId)}`
  // Placeholder copy -- TODO replace with the real outreach message before
  // any real send. Keeping it short and clearly an ad per CAN-SPAM.
  return `<!DOCTYPE html>
<html><body style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1e293b;max-width:560px;margin:0 auto;padding:20px 16px">
  <p>Hi ${leadName},</p>
  <p>This is an advertisement from Carlos Simoni about real estate services in your area.</p>
  <p>[TODO: real outreach message]</p>
  <p>— Carlos Simoni</p>
  <div style="margin-top:28px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8">
    ${MAILING_ADDRESS}<br />
    <a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline">Unsubscribe</a> from these emails
  </div>
</body></html>`
}

async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, html }),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(`Resend error: ${JSON.stringify(err)}`)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const confirmed = req.body?.confirm === true

  const eligible = await query<EligibleLead>(
    `SELECT id, name, email, city, state FROM carlos_crm.leads
     WHERE stage = 'not_contacted'
       AND email IS NOT NULL
       AND email_opt_out = false
       AND first_outreach_sent_at IS NULL
     ORDER BY vulcan7_date_added DESC NULLS LAST
     LIMIT $1`,
    [BATCH_LIMIT],
  )
  const leads = eligible.rows

  if (!confirmed) {
    // DRY RUN. Zero emails to leads. One summary email to the admin.
    const adminTo = process.env.ADMIN_EMAIL_TO
    if (adminTo && leads.length > 0) {
      const listHtml = leads
        .map((l) => `<li>${l.name} — ${l.email} (${l.city || '?'}, ${l.state || '?'})</li>`)
        .join('')
      try {
        await sendViaResend(
          adminTo,
          `[DRY RUN] Outreach would have gone to ${leads.length} lead(s)`,
          `<p>Dry run only — no email was sent to any lead. This is who <strong>would</strong> have received the outreach email:</p><ul>${listHtml}</ul>`,
        )
      } catch (err: any) {
        console.error('Dry-run summary email failed:', err)
        // Still return the JSON list below even if the summary email itself failed to send.
      }
    }
    await writeLog('outreach_send', 'info', `Dry run: ${leads.length} lead(s) would have been emailed`, {
      dryRun: true,
      wouldSendTo: leads.map((l) => l.id),
    })
    return res.status(200).json({
      dryRun: true,
      wouldSendCount: leads.length,
      wouldSendTo: leads.map((l) => ({ id: l.id, name: l.name, email: l.email, city: l.city, state: l.state })),
    })
  }

  // REAL SEND.
  let sent = 0
  const errors: string[] = []
  for (const lead of leads) {
    try {
      const html = buildOutreachHtml(lead.name, lead.id)
      await sendViaResend(lead.email, 'A message from Carlos Simoni', html)
      await query(
        `UPDATE carlos_crm.leads
         SET first_outreach_sent_at = now(), stage = CASE WHEN stage = 'not_contacted' THEN 'contacted' ELSE stage END,
             last_touched_at = now(), updated_at = now()
         WHERE id = $1`,
        [lead.id],
      )
      await query(
        `INSERT INTO carlos_crm.lead_activities (lead_id, type, direction, body, created_by_admin_id)
         VALUES ($1, 'email_sent', 'outbound', 'Initial outreach email', 'carlos')`,
        [lead.id],
      )
      sent++
    } catch (err: any) {
      errors.push(`${lead.email}: ${err?.message || err}`)
    }
  }

  await writeLog(
    'outreach_send',
    errors.length > 0 ? 'warn' : 'info',
    `Sent ${sent} outreach email(s), ${errors.length} error(s)`,
    { dryRun: false, sent, errors },
  )
  return res.status(200).json({ dryRun: false, sent, errors })
}
