import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const id = parseInt(String(req.query.id), 10)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid task id' })

  const { done, dueAt } = req.body || {}

  if (done === true) {
    await query(`UPDATE carlos_crm.lead_tasks SET done_at = now() WHERE id = $1`, [id])
    return res.status(200).json({ ok: true })
  }

  if (typeof dueAt === 'string') {
    const d = new Date(dueAt)
    if (Number.isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid due date' })
    await query(`UPDATE carlos_crm.lead_tasks SET due_at = $1 WHERE id = $2`, [d.toISOString(), id])
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: 'Nothing to update' })
}
