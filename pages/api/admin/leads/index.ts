import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

const PAGE_SIZE = 50

const STAGES = ['not_contacted', 'contacted', 'interested', 'appointment_booked', 'listed', 'lost'] as const

interface LeadRow {
  id: number
  name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  stage: string
  dnc: boolean
  property_price: number | null
  vulcan7_date_added: string | null
  last_touched_at: string | null
  phone_count: number
  email_count: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const stage = typeof req.query.stage === 'string' && STAGES.includes(req.query.stage as any) ? req.query.stage : null
  const offset = Math.max(0, parseInt(String(req.query.offset ?? '0'), 10) || 0)

  const params: any[] = []
  let where = ''
  if (stage) {
    params.push(stage)
    where = `WHERE l.stage = $${params.length}`
  }
  params.push(PAGE_SIZE, offset)

  const result = await query<LeadRow>(
    `SELECT l.id, l.name, l.email, l.phone, l.city, l.state, l.stage, l.dnc,
            l.property_price, l.vulcan7_date_added, l.last_touched_at,
            (SELECT count(*) FROM carlos_crm.lead_phones p WHERE p.lead_id = l.id) AS phone_count,
            (SELECT count(*) FROM carlos_crm.lead_emails e WHERE e.lead_id = l.id) AS email_count
     FROM carlos_crm.leads l
     ${where}
     ORDER BY l.vulcan7_date_added DESC NULLS LAST, l.id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )

  const counts = await query<{ stage: string; count: string }>(
    `SELECT stage, count(*) FROM carlos_crm.leads GROUP BY stage`,
  )
  const stageCounts: Record<string, number> = {}
  for (const row of counts.rows) stageCounts[row.stage] = parseInt(row.count, 10)

  return res.status(200).json({ leads: result.rows, stageCounts, pageSize: PAGE_SIZE, offset })
}
