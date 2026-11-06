import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'

const LIMIT = 50

interface LogRow {
  id: number
  source: string
  level: string
  message: string
  detail: unknown
  created_at: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const result = await query<LogRow>(
    `SELECT id, source, level, message, detail, created_at FROM carlos_crm.logs ORDER BY created_at DESC LIMIT $1`,
    [LIMIT],
  )
  return res.status(200).json({ logs: result.rows })
}
