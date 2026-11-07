import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

const PAGE_SIZE = 50

const STAGES = ['not_contacted', 'contacted', 'interested', 'appointment_booked', 'listed', 'lost'] as const

const SORT_COLUMNS: Record<string, string> = {
  name: 'l.name',
  city: 'l.city',
  stage: 'l.stage',
  price: 'l.property_price',
  date_added: 'l.vulcan7_date_added',
}

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
  phone_count: number
  email_count: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const stage = typeof req.query.stage === 'string' && STAGES.includes(req.query.stage as any) ? req.query.stage : null
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const sortKey = typeof req.query.sort === 'string' && SORT_COLUMNS[req.query.sort] ? req.query.sort : 'date_added'
  const sortDir = req.query.dir === 'asc' ? 'ASC' : 'DESC'
  const offset = Math.max(0, parseInt(String(req.query.offset ?? '0'), 10) || 0)

  const conditions: string[] = []
  const params: any[] = []
  if (stage) {
    params.push(stage)
    conditions.push(`l.stage = $${params.length}`)
  }
  if (q) {
    params.push(`%${q}%`)
    const p = `$${params.length}`
    conditions.push(`(l.name ILIKE ${p} OR l.city ILIKE ${p} OR l.email ILIKE ${p} OR l.phone ILIKE ${p})`)
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await query<{ count: string }>(
    `SELECT count(*) FROM carlos_crm.leads l ${where}`,
    params,
  )
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10)

  params.push(PAGE_SIZE, offset)
  const result = await query<LeadRow>(
    `SELECT l.id, l.name, l.email, l.phone, l.city, l.state, l.stage, l.dnc,
            l.property_price, l.vulcan7_date_added,
            (SELECT count(*) FROM carlos_crm.lead_phones p WHERE p.lead_id = l.id) AS phone_count,
            (SELECT count(*) FROM carlos_crm.lead_emails e WHERE e.lead_id = l.id) AS email_count
     FROM carlos_crm.leads l
     ${where}
     ORDER BY ${SORT_COLUMNS[sortKey]} ${sortDir} NULLS LAST, l.id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )

  const counts = await query<{ stage: string; count: string }>(
    `SELECT stage, count(*) FROM carlos_crm.leads GROUP BY stage`,
  )
  const stageCounts: Record<string, number> = {}
  for (const row of counts.rows) stageCounts[row.stage] = parseInt(row.count, 10)

  return res.status(200).json({ leads: result.rows, stageCounts, total, pageSize: PAGE_SIZE, offset })
}
