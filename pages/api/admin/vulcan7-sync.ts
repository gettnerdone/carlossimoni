import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest, isCronRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'
import { writeLog } from '@/lib/log'
import {
  login,
  fetchAllContactsHtml,
  parseContacts,
  fetchContactDetailHtml,
  parseContactDetail,
  parsePrice,
} from '@/lib/vulcan7-client'

// Pulls Vulcan7 contacts added in the last RECENT_DAYS days and upserts
// them into carlos_crm.leads (+ lead_phones / lead_emails).
//
// Vulcan7's own grid endpoint ignores pagination for an unfiltered search
// and returns the ENTIRE contact database (59k+ rows) in one response --
// but we only care about recent leads, so after parsing we immediately
// throw away everything older than RECENT_DAYS. That recent set is small
// (normally a handful of contacts), so unlike an earlier version of this
// file, there's no need to batch Postgres writes or skip/cap per-contact
// detail fetches -- EVERY recent contact gets a full detail-page fetch
// (street address, zip, DNC, every phone number, every email), not just
// the first phone/email the grid row happens to show.
//
// SAFETY_MAX_CONTACTS exists only as a sanity net in case date parsing
// ever misbehaves and "recent" ends up matching far more than expected --
// it should never actually be hit in normal operation.
const RECENT_DAYS = 3
const SAFETY_MAX_CONTACTS = 500

const UPSERT_LEAD_SQL = `
  INSERT INTO carlos_crm.leads
      (name, email, phone, address, city, state, zip,
       property_price, property_type, vulcan7_date_added,
       dnc, dnc_reason, dnc_at,
       source, source_ref)
  VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
       $11, CASE WHEN $11 THEN 'vulcan7_import' END, CASE WHEN $11 THEN now() END,
       'vulcan7', $12)
  ON CONFLICT (source, source_ref) DO UPDATE SET
      name = EXCLUDED.name,
      email = COALESCE(EXCLUDED.email, carlos_crm.leads.email),
      phone = COALESCE(EXCLUDED.phone, carlos_crm.leads.phone),
      address = COALESCE(EXCLUDED.address, carlos_crm.leads.address),
      city = COALESCE(EXCLUDED.city, carlos_crm.leads.city),
      state = COALESCE(EXCLUDED.state, carlos_crm.leads.state),
      zip = COALESCE(EXCLUDED.zip, carlos_crm.leads.zip),
      property_price = COALESCE(EXCLUDED.property_price, carlos_crm.leads.property_price),
      property_type = COALESCE(EXCLUDED.property_type, carlos_crm.leads.property_type),
      vulcan7_date_added = COALESCE(EXCLUDED.vulcan7_date_added, carlos_crm.leads.vulcan7_date_added),
      -- DNC only ever turns ON, never off -- compliance signal, not something a re-sync should clear.
      dnc = carlos_crm.leads.dnc OR EXCLUDED.dnc,
      dnc_reason = COALESCE(carlos_crm.leads.dnc_reason, EXCLUDED.dnc_reason),
      dnc_at = COALESCE(carlos_crm.leads.dnc_at, EXCLUDED.dnc_at),
      updated_at = now()
  RETURNING id, (xmax = 0) AS inserted
`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // The manual "Run daily sync" button POSTs here with the admin cookie.
  // Vercel Cron GETs this same path on a schedule (see vercel.json) and
  // authenticates with CRON_SECRET instead, since it has no cookie.
  const cron = isCronRequest(req)
  if (req.method !== 'POST' && !(cron && req.method === 'GET')) return res.status(405).end()
  if (!cron && !isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const username = process.env.VULCAN7_USERNAME
  const password = process.env.VULCAN7_PASSWORD
  if (!username || !password) {
    return res.status(500).json({ error: 'VULCAN7_USERNAME / VULCAN7_PASSWORD not configured' })
  }
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' })
  }

  try {
    const session = await login(username, password)
    const html = await fetchAllContactsHtml(session)
    const allContacts = parseContacts(html)

    const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000
    const recent = allContacts
      .filter((c) => c.dateAddedIso && new Date(c.dateAddedIso).getTime() >= cutoff)
      .slice(0, SAFETY_MAX_CONTACTS)

    let inserted = 0
    let updated = 0
    let totalPhones = 0
    let totalEmails = 0
    const detailErrors: string[] = []

    for (const c of recent) {
      let detail: Awaited<ReturnType<typeof parseContactDetail>> | null = null
      try {
        const detailHtml = await fetchContactDetailHtml(session, c.contactId)
        detail = parseContactDetail(detailHtml, c.contactId)
      } catch (err: any) {
        detailErrors.push(`${c.contactId}: ${err?.message || err}`)
      }

      const primaryEmail = detail?.emails[0] ?? c.email
      const primaryPhone = detail?.phones[0]?.phone ?? c.phone

      const result = await query<{ id: number; inserted: boolean }>(UPSERT_LEAD_SQL, [
        c.name,
        primaryEmail,
        primaryPhone,
        detail?.street ?? null,
        detail?.city ?? c.city,
        detail?.state ?? c.state,
        detail?.zip ?? null,
        parsePrice(detail?.listPrice ?? c.price),
        detail?.propertyType ?? c.propertyType,
        c.dateAddedIso,
        detail?.dnc ?? false,
        c.contactId,
      ])
      const leadId = result.rows[0].id
      if (result.rows[0].inserted) inserted++
      else updated++

      if (detail) {
        // Replace, don't merge: the detail page is the current source of
        // truth for this contact's phones/emails, so stale rows (an old
        // number Vulcan7 no longer lists) shouldn't linger.
        await query(`DELETE FROM carlos_crm.lead_phones WHERE lead_id = $1`, [leadId])
        if (detail.phones.length > 0) {
          const values: string[] = []
          const params: any[] = []
          detail.phones.forEach((p, i) => {
            const base = i * 4
            values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`)
            params.push(leadId, p.phone, p.label, p.dnc)
          })
          await query(
            `INSERT INTO carlos_crm.lead_phones (lead_id, phone, label, is_dnc) VALUES ${values.join(', ')} ON CONFLICT (lead_id, phone) DO NOTHING`,
            params,
          )
          totalPhones += detail.phones.length
        }

        await query(`DELETE FROM carlos_crm.lead_emails WHERE lead_id = $1`, [leadId])
        if (detail.emails.length > 0) {
          const values: string[] = []
          const params: any[] = []
          detail.emails.forEach((email, i) => {
            const base = i * 3
            values.push(`($${base + 1}, $${base + 2}, $${base + 3})`)
            params.push(leadId, email, i === 0)
          })
          await query(
            `INSERT INTO carlos_crm.lead_emails (lead_id, email, is_primary) VALUES ${values.join(', ')} ON CONFLICT (lead_id, email) DO NOTHING`,
            params,
          )
          totalEmails += detail.emails.length
        }
      }
    }

    const summary = {
      totalParsedFromGrid: allContacts.length,
      consideredRecent: recent.length,
      inserted,
      updated,
      totalPhones,
      totalEmails,
      detailErrors,
      hitSafetyCap: recent.length >= SAFETY_MAX_CONTACTS,
    }
    await writeLog(
      'vulcan7_sync',
      detailErrors.length > 0 ? 'warn' : 'info',
      `Synced ${recent.length} recent contact(s): ${inserted} new, ${updated} updated`,
      summary,
    )
    return res.status(200).json(summary)
  } catch (err: any) {
    console.error('vulcan7-sync error:', err)
    await writeLog('vulcan7_sync', 'error', err?.message || 'Sync failed', { stack: err?.stack })
    return res.status(500).json({ error: err?.message || 'Sync failed' })
  }
}
