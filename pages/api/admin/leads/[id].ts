import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const id = parseInt(String(req.query.id), 10)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid lead id' })

  if (req.method === 'GET') {
    const lead = await query(`SELECT * FROM carlos_crm.leads WHERE id = $1`, [id])
    if (lead.rows.length === 0) return res.status(404).json({ error: 'Lead not found' })

    const [phones, emails] = await Promise.all([
      query(`SELECT phone, label, is_primary, is_dnc FROM carlos_crm.lead_phones WHERE lead_id = $1 ORDER BY is_primary DESC, id`, [id]),
      query(`SELECT email, is_primary FROM carlos_crm.lead_emails WHERE lead_id = $1 ORDER BY is_primary DESC, id`, [id]),
    ])

    return res.status(200).json({ lead: lead.rows[0], phones: phones.rows, emails: emails.rows })
  }

  // Manual quick-toggle for compliance flags -- mirrors cmadraft's "Mark do
  // not call" / "They opted out of email" / Undo buttons. Everything else
  // about a lead (stage, DNC-from-outcome) is driven by logging an activity,
  // not edited directly here -- see pages/api/admin/leads/[id]/activities.ts.
  if (req.method === 'PATCH') {
    const { dnc, email_opt_out } = req.body || {}
    if (typeof dnc !== 'boolean' && typeof email_opt_out !== 'boolean') {
      return res.status(400).json({ error: 'Nothing to update' })
    }
    await query(
      `UPDATE carlos_crm.leads SET
         dnc = COALESCE($1, dnc),
         dnc_reason = CASE WHEN $1 = true AND dnc_reason IS NULL THEN 'asked' WHEN $1 = false THEN NULL ELSE dnc_reason END,
         dnc_at = CASE WHEN $1 = true AND dnc_at IS NULL THEN now() WHEN $1 = false THEN NULL ELSE dnc_at END,
         email_opt_out = COALESCE($2, email_opt_out),
         email_opt_out_at = CASE WHEN $2 = true THEN now() WHEN $2 = false THEN NULL ELSE email_opt_out_at END,
         updated_at = now()
       WHERE id = $3`,
      [typeof dnc === 'boolean' ? dnc : null, typeof email_opt_out === 'boolean' ? email_opt_out : null, id],
    )
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
