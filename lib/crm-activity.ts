// Calling-CRM logging rules, ported from cmadraft's lib/crm-activity.ts so
// Carlos gets the same fast-click logging flow he already knows, adapted to
// carlos_crm's stage names ('appointment_booked'/'listed' instead of
// 'demo_scheduled'/'won'). Shared by the API
// (pages/api/admin/leads/[id]/activities.ts) and the screen
// (pages/admin/leads/[id].tsx) so validation and suggestions can't drift.

export type ActivityType = 'call' | 'inbound_call' | 'email_sent' | 'email_received' | 'visit' | 'note'
export type Outcome =
  | 'no_answer'
  | 'voicemail'
  | 'wrong_number'
  | 'callback'
  | 'interested'
  | 'appointment_booked'
  | 'not_interested'
  | 'do_not_call'
export type NextActionKind = 'call' | 'email' | 'visit' | 'other'

export const ACTIVITY_TYPES: { type: ActivityType; label: string; direction: 'outbound' | 'inbound' | null }[] = [
  { type: 'call', label: 'Called them', direction: 'outbound' },
  { type: 'inbound_call', label: 'They called', direction: 'inbound' },
  { type: 'email_sent', label: 'Emailed them', direction: 'outbound' },
  { type: 'email_received', label: 'They emailed', direction: 'inbound' },
  { type: 'visit', label: 'Visit / showing', direction: 'outbound' },
  { type: 'note', label: 'Note', direction: null },
]

export const ACTIVITY_LABELS: Record<string, string> = {
  call: 'Called them',
  inbound_call: 'They called',
  email_sent: 'Emailed them',
  email_received: 'They emailed',
  visit: 'Visit / showing',
  note: 'Note',
  stage_change: 'Stage change',
}

export const OUTCOMES: { outcome: Outcome; label: string; engaged: boolean }[] = [
  { outcome: 'no_answer', label: 'No answer', engaged: false },
  { outcome: 'voicemail', label: 'Left voicemail', engaged: false },
  { outcome: 'wrong_number', label: 'Wrong number', engaged: false },
  { outcome: 'callback', label: 'Call back later', engaged: true },
  { outcome: 'interested', label: 'Interested', engaged: true },
  { outcome: 'appointment_booked', label: 'Appointment booked', engaged: true },
  { outcome: 'not_interested', label: 'Not interested', engaged: true },
  { outcome: 'do_not_call', label: 'Do not call', engaged: true },
]
export const OUTCOME_LABELS: Record<string, string> = Object.fromEntries(OUTCOMES.map((o) => [o.outcome, o.label]))

export const NEXT_ACTION_LABELS: Record<NextActionKind, string> = { call: 'Call', email: 'Email', visit: 'Visit', other: 'Other' }

// Outcomes that end the conversation: no NEXT ACTION is required.
export const OUTCOMES_WITHOUT_NEXT_ACTION: Outcome[] = ['not_interested', 'do_not_call']

// Pipeline stage an outcome moves the lead to (only ever forward, except "not interested" -> Lost).
export const OUTCOME_STAGE: Partial<Record<Outcome, string>> = {
  interested: 'interested',
  appointment_booked: 'appointment_booked',
  not_interested: 'lost',
}
export const STAGE_ORDER_FOR_FORWARD = ['not_contacted', 'contacted', 'interested', 'appointment_booked', 'listed']

// Suggested NEXT ACTION (Carlos can change it): what, and how many days out, at 10:00.
export function suggestNextAction(type: ActivityType, outcome: Outcome | null): { action: NextActionKind; days: number } | null {
  if (outcome === 'do_not_call' || outcome === 'not_interested') return null
  if (outcome === 'no_answer') return { action: 'call', days: 2 }
  if (outcome === 'voicemail') return { action: 'call', days: 3 }
  if (outcome === 'wrong_number') return { action: 'other', days: 1 }
  if (outcome === 'callback') return { action: 'call', days: 1 }
  if (outcome === 'interested') return { action: 'call', days: 2 }
  if (outcome === 'appointment_booked') return { action: 'visit', days: 3 }
  if (type === 'email_sent') return { action: 'call', days: 3 }
  if (type === 'email_received') return { action: 'call', days: 1 }
  if (type === 'visit') return { action: 'call', days: 2 }
  if (type === 'note') return null
  return { action: 'call', days: 2 }
}

export function isCallType(type: string) {
  return type === 'call' || type === 'inbound_call'
}

// Once-per-24-hours rule, same as cmadraft's.
export const CALL_GAP_HOURS = 24
export function nextCallAllowedAt(lastCallAt: string | Date | null | undefined): Date | null {
  if (!lastCallAt) return null
  const t = new Date(lastCallAt).getTime() + CALL_GAP_HOURS * 3600_000
  return t > Date.now() ? new Date(t) : null
}
