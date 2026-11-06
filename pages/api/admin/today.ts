import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

// The actual work queue: open next-action tasks due today or overdue,
// joined to the lead they're for. Not the leads list -- Carlos works this
// page top to bottom instead of browsing all leads looking for who's due.

interface TodayRow {
  task_id: number
  action: string
  due_at: string
  note: string | null
  lead_id: number
  name: string
  phone: string | null
  dnc: boolean
  stage: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const result = await query<TodayRow>(
    `SELECT t.id AS task_id, t.action, t.due_at, t.note,
            l.id AS lead_id, l.name, l.phone, l.dnc, l.stage
     FROM carlos_crm.lead_tasks t
     JOIN carlos_crm.leads l ON l.id = t.lead_id
     WHERE t.done_at IS NULL
       AND t.due_at < date_trunc('day', now()) + interval '1 day'
     ORDER BY t.due_at ASC`,
  )

  return res.status(200).json({ tasks: result.rows })
}
