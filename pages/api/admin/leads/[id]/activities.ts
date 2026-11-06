import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '@/lib/admin-auth'
import { query } from '@/lib/db'
import {
  ACTIVITY_TYPES,
  OUTCOMES,
  OUTCOMES_WITHOUT_NEXT_ACTION,
  OUTCOME_STAGE,
  STAGE_ORDER_FOR_FORWARD,
  isCallType,
  type ActivityType,
  type Outcome,
  type NextActionKind,
} from '@/lib/crm-activity'

// One lead's history and logging, ported from cmadraft's
// pages/api/admin/crm/leads/[id]/activities.ts (components/crm/LogActivity.tsx
// is the UI half, ported to pages/admin/leads/[id].tsx).
//
// GET  -> { activities (newest first), nextAction (open task, if any), lead (calling-relevant fields) }
// POST -> logs one entry: { type, outcome?, body?, nextAction?: { action, dueAt, note } }
//   * saves the entry
//   * closes the lead's open next-action task (linked to this entry) and, if given, creates the new one
//   * outbound call -> last_call_at = now (the once-per-24-hours rule reads it)
//   * outcome "do not call" -> dnc = true (reason 'vulcan7_import' kept if already set, else 'asked')
//   * moves stage forward when the outcome says so, "not interested" -> lost,
//     and not_contacted -> contacted on any call/email/visit
//   NEXT ACTION required for calls/emails/visits, except after "not interested"/"do not call"
//   or when the lead is already Listed/Lost.

const VALID_TYPES = ACTIVITY_TYPES.map((t) => t.type) as ActivityType[]
const VALID_OUTCOMES = OUTCOMES.map((o) => o.outcome) as Outcome[]
const VALID_ACTIONS: NextActionKind[] = ['call', 'email', 'visit', 'other']
const CREATED_BY = 'carlos' // single shared admin login, no per-user identity yet

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Not signed in' })

  const leadId = parseInt(String(req.query.id), 10)
  if (!Number.isFinite(leadId)) return res.status(400).json({ error: 'Invalid lead id' })

  if (req.method === 'GET') {
    const [acts, task, lead] = await Promise.all([
      query(
        `SELECT id, type, body, direction, engaged, outcome, from_stage, to_stage, created_by_admin_id, created_at
         FROM carlos_crm.lead_activities WHERE lead_id = $1 ORDER BY created_at DESC`,
        [leadId],
      ),
      query(
        `SELECT id, action, due_at, note FROM carlos_crm.lead_tasks
         WHERE lead_id = $1 AND done_at IS NULL ORDER BY due_at LIMIT 1`,
        [leadId],
      ),
      query(
        `SELECT id, stage, dnc, dnc_reason, email_opt_out, last_call_at FROM carlos_crm.leads WHERE id = $1`,
        [leadId],
      ),
    ])
    if (lead.rows.length === 0) return res.status(404).json({ error: 'Lead not found' })
    return res.status(200).json({ activities: acts.rows, nextAction: task.rows[0] ?? null, lead: lead.rows[0] })
  }

  if (req.method === 'POST') {
    const b = req.body || {}
    const type = b.type as ActivityType
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Invalid activity type' })
    const outcome: Outcome | null = b.outcome ? b.outcome : null
    if (outcome && !VALID_OUTCOMES.includes(outcome)) return res.status(400).json({ error: 'Invalid outcome' })
    if (outcome && !isCallType(type)) return res.status(400).json({ error: 'Outcomes are only for calls' })
    if (isCallType(type) && !outcome) return res.status(400).json({ error: 'Pick how the call went' })
    const body = typeof b.body === 'string' && b.body.trim() ? b.body.trim() : null
    if (type === 'note' && !body) return res.status(400).json({ error: 'Write the note first' })

    const leadRow = await query<{ id: number; stage: string }>(`SELECT id, stage FROM carlos_crm.leads WHERE id = $1`, [leadId])
    const lead = leadRow.rows[0]
    if (!lead) return res.status(404).json({ error: 'Lead not found' })

    const engaged: boolean | null = outcome ? OUTCOMES.find((o) => o.outcome === outcome)!.engaged : null
    const direction = ACTIVITY_TYPES.find((t) => t.type === type)!.direction

    let next: { action: NextActionKind; dueAt: string; note: string | null } | null = null
    if (b.nextAction && b.nextAction.dueAt) {
      const action = b.nextAction.action as NextActionKind
      const due = new Date(b.nextAction.dueAt)
      if (!VALID_ACTIONS.includes(action)) return res.status(400).json({ error: 'Invalid next action' })
      if (Number.isNaN(due.getTime())) return res.status(400).json({ error: 'Invalid next-action date/time' })
      next = { action, dueAt: due.toISOString(), note: typeof b.nextAction.note === 'string' && b.nextAction.note.trim() ? b.nextAction.note.trim() : null }
    }
    const closedStage = lead.stage === 'listed' || lead.stage === 'lost'
    const nextRequired = type !== 'note' && !closedStage && !(outcome && OUTCOMES_WITHOUT_NEXT_ACTION.includes(outcome))
    if (nextRequired && !next) return res.status(400).json({ error: 'Set the NEXT ACTION (what and when)' })
    if (outcome === 'do_not_call') next = null

    let newStage: string | null = null
    if (outcome && OUTCOME_STAGE[outcome]) {
      const target = OUTCOME_STAGE[outcome]!
      if (target === 'lost') newStage = lead.stage === 'lost' ? null : 'lost'
      else if (STAGE_ORDER_FOR_FORWARD.indexOf(target) > STAGE_ORDER_FOR_FORWARD.indexOf(lead.stage)) newStage = target
    } else if (lead.stage === 'not_contacted' && type !== 'note') {
      newStage = 'contacted'
    }

    // One statement: insert the entry, close any open next-action task, and
    // (if given) create the new one -- all linked to the same entry.
    const result = await query<{ id: number }>(
      `WITH act AS (
         INSERT INTO carlos_crm.lead_activities (lead_id, type, body, direction, engaged, outcome, created_by_admin_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
       ), closed AS (
         UPDATE carlos_crm.lead_tasks SET done_at = now(), done_by_activity_id = (SELECT id FROM act)
         WHERE lead_id = $1 AND done_at IS NULL RETURNING id
       )
       INSERT INTO carlos_crm.lead_tasks (lead_id, owner_admin_id, action, due_at, note, created_from_activity_id, created_by_admin_id)
       SELECT $1, $7, $8, $9, $10, (SELECT id FROM act), $7 WHERE $11
       RETURNING id`,
      [leadId, type, body, direction, engaged, outcome, CREATED_BY, next?.action ?? 'call', next?.dueAt ?? new Date().toISOString(), next?.note ?? null, !!next],
    )
    void result

    await query(
      `UPDATE carlos_crm.leads SET
         last_touched_at = now(), updated_at = now(),
         last_call_at = CASE WHEN $1 THEN now() ELSE last_call_at END,
         dnc = CASE WHEN $2 THEN true ELSE dnc END,
         dnc_reason = CASE WHEN $2 AND dnc_reason IS NULL THEN 'asked' ELSE dnc_reason END,
         dnc_at = CASE WHEN $2 AND dnc_at IS NULL THEN now() ELSE dnc_at END
       WHERE id = $3`,
      [type === 'call', outcome === 'do_not_call', leadId],
    )

    if (newStage) {
      await query(`UPDATE carlos_crm.leads SET stage = $1 WHERE id = $2`, [newStage, leadId])
      await query(
        `INSERT INTO carlos_crm.lead_activities (lead_id, type, from_stage, to_stage, created_by_admin_id) VALUES ($1, 'stage_change', $2, $3, $4)`,
        [leadId, lead.stage, newStage, CREATED_BY],
      )
    }

    return res.status(200).json({ ok: true, stage: newStage ?? lead.stage })
  }

  return res.status(405).end()
}
