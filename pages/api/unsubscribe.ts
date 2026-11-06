import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyUnsubscribeToken } from '@/lib/email-unsubscribe'
import { query } from '@/lib/db'

// Public, unauthenticated by design -- CAN-SPAM requires a working,
// no-login opt-out link in every commercial email. Protected from abuse by
// the signed token (verifyUnsubscribeToken), not by auth.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = String(req.query.token || '')
  const leadId = verifyUnsubscribeToken(token)

  if (!leadId) {
    res.status(400).send('This unsubscribe link is invalid or expired.')
    return
  }

  await query(
    `UPDATE carlos_crm.leads SET email_opt_out = true, email_opt_out_at = now() WHERE id = $1`,
    [leadId],
  )

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(`<!DOCTYPE html>
<html><body style="font-family: sans-serif; max-width: 480px; margin: 80px auto; text-align: center;">
<h2>You're unsubscribed</h2>
<p>You won't receive any more emails from us.</p>
</body></html>`)
}
