import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest, isCronRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'
import { unsubscribeToken } from '@/lib/email-unsubscribe'
import { writeLog } from '@/lib/log'
import { isStepDue, nextStepNumber, MAX_OUTREACH_STEPS, type CadenceLead } from '@/lib/outreach-cadence'

// Sends whichever cadence email a lead is currently due for: day 1, day
// ~3-4, day 7, day 14, then monthly -- see lib/outreach-cadence.ts for the
// gap logic. One run handles brand-new leads (step 0 -> 1) and existing
// leads' follow-ups (step N -> N+1) together, since both are just "is this
// lead due right now."
//
// SAFETY: dry-run by default. A real send requires the request body to
// explicitly set { confirm: true } -- no query-string shortcut, so a
// bookmarked/retried GET or careless curl can't accidentally blast real
// people. Dry-run sends ZERO email to any lead; instead it sends one
// summary email to ADMIN_EMAIL_TO listing who it would have gone to.
//
// A scheduled (Vercel Cron) call authenticates via CRON_SECRET instead of
// the admin cookie (see isCronRequest) -- but even then, it only sends for
// real if OUTREACH_AUTO_SEND=true is explicitly set. That's a second,
// separate switch from CRON_SECRET on purpose: CRON_SECRET already exists
// for the Vulcan7 sync job, and reusing it here would mean flipping on
// this job's cron trigger (e.g. once Resend/the domain are ready) would
// silently start emailing real leads with no extra confirmation step.
const BATCH_LIMIT = 50

// FROM/footer: TESTING ONLY. This must point at carlossimoni.com + Carlos's
// own Resend account before any real send to real leads -- see the
// decision recorded in docs/carlos-crm-schema.sql's header. Never let this
// go to production still pointed at cmadraft.
const FROM = process.env.OUTREACH_FROM_EMAIL || 'Carlos Simoni <carlos.simoni@cmadraft.com>'
const REPLY_TO = process.env.OUTREACH_FROM_EMAIL ? undefined : 'carlos.simoni@cmadraft.com'
const MAILING_ADDRESS = process.env.OUTREACH_MAILING_ADDRESS || '[BUSINESS MAILING ADDRESS]'
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://carlossimoni.com').replace(/\/$/, '')

interface EligibleLead extends CadenceLead {
  id: number
  name: string
  email: string
  city: string | null
  state: string | null
}

// Placeholder copy per step -- TODO replace with real outreach messages
// before any real send. Keeping it short and clearly an ad per CAN-SPAM.
const STEP_SUBJECTS: Record<number, string> = {
  1: 'A message from Carlos Simoni',
  2: 'Following up — Carlos Simoni',
  3: 'Still here if you need anything — Carlos Simoni',
  4: 'One more note from Carlos Simoni',
}
function subjectForStep(step: number): string {
  return STEP_SUBJECTS[step] || 'A note from Carlos Simoni'
}

function buildOutreachHtml(leadName: string, leadId: number, step: number): string {
  const unsubUrl = `${APP_URL}/api/unsubscribe?token=${unsubscribeToken(leadId)}`
  return `<!DOCTYPE html>
<html><body style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1e293b;max-width:560px;margin:0 auto;padding:20px 16px">
  <p>Hi ${leadName},</p>
  <p>This is an advertisement from Carlos Simoni about real estate services in your area.</p>
  <p>[TODO: real outreach message for touch #${step}]</p>
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
  const cron = isCronRequest(req)
  if (req.method !== 'POST' && !(cron && req.method === 'GET')) return res.status(405).end()
  if (!cron && !isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  // Cron hits this daily once wired up in vercel.json, but only actually
  // sends for real once this is explicitly turned on -- see the big
  // comment above. Until then a cron call here is a harmless no-op.
  if (cron && process.env.OUTREACH_AUTO_SEND !== 'true') {
    await writeLog('outreach_send', 'info', 'Automated send skipped (OUTREACH_AUTO_SEND not enabled)', {})
    return res.status(200).json({ skipped: true, reason: 'OUTREACH_AUTO_SEND not enabled' })
  }

  const confirmed = cron || req.body?.confirm === true

  const candidates = await query<EligibleLead>(
    `SELECT id, name, email, city, state, outreach_step, last_outreach_sent_at
     FROM carlos_crm.leads
     WHERE email IS NOT NULL
       AND email_opt_out = false
       AND stage IN ('not_contacted', 'contacted')
       AND outreach_step < $1
     ORDER BY vulcan7_date_added ASC NULLS LAST
     LIMIT $2`,
    [MAX_OUTREACH_STEPS, BATCH_LIMIT],
  )
  const leads = candidates.rows.filter((l) => isStepDue(l))

  if (!confirmed) {
    // DRY RUN. Zero emails to leads. One summary email to the admin.
    const adminTo = process.env.ADMIN_EMAIL_TO
    if (adminTo && leads.length > 0) {
      const listHtml = leads
        .map((l) => `<li>${l.name} — ${l.email} (${l.city || '?'}, ${l.state || '?'}) — touch #${nextStepNumber(l)}</li>`)
        .join('')
      try {
        await sendViaResend(
          adminTo,
          `[DRY RUN] Outreach would have gone to ${leads.length} lead(s)`,
          `<p>Dry run only — no email was sent to any lead. This is who <strong>would</strong> have received an outreach email:</p><ul>${listHtml}</ul>`,
        )
      } catch (err: any) {
        console.error('Dry-run summary email failed:', err)
      }
    }
    await writeLog('outreach_send', 'info', `Dry run: ${leads.length} lead(s) would have been emailed`, {
      dryRun: true,
      wouldSendTo: leads.map((l) => ({ id: l.id, step: nextStepNumber(l) })),
    })
    return res.status(200).json({
      dryRun: true,
      wouldSendCount: leads.length,
      wouldSendTo: leads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        city: l.city,
        state: l.state,
        step: nextStepNumber(l),
      })),
    })
  }

  // REAL SEND.
  let sent = 0
  const errors: string[] = []
  for (const lead of leads) {
    const step = nextStepNumber(lead)
    try {
      const html = buildOutreachHtml(lead.name, lead.id, step)
      await sendViaResend(lead.email, subjectForStep(step), html)
      await query(
        `UPDATE carlos_crm.leads
         SET outreach_step = outreach_step + 1,
             last_outreach_sent_at = now(),
             first_outreach_sent_at = COALESCE(first_outreach_sent_at, now()),
             stage = CASE WHEN stage = 'not_contacted' THEN 'contacted' ELSE stage END,
             last_touched_at = now(), updated_at = now()
         WHERE id = $1`,
        [lead.id],
      )
      await query(
        `INSERT INTO carlos_crm.lead_activities (lead_id, type, direction, body, created_by_admin_id)
         VALUES ($1, 'email_sent', 'outbound', $2, 'carlos')`,
        [lead.id, `Outreach email, touch #${step}`],
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
    { dryRun: false, sent, errors, triggeredBy: cron ? 'cron' : 'admin' },
  )
  return res.status(200).json({ dryRun: false, sent, errors })
}
