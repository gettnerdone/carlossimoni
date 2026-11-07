// The outreach drip sequence: day 1, day ~3-4, day 7, day 14, then monthly.
//
// Each entry is the minimum number of days that must have passed since the
// PREVIOUS send before this step is eligible. Anchoring off the previous
// send (not a fixed calendar offset from day 0) means a missed cron run or
// a delayed send never causes two touches to land close together, and
// nothing gets permanently skipped -- it just goes out a bit later.
//
// Index 0 (step 1, the first-ever email) has no previous send to gap off,
// so its interval is unused -- see isStepDue below.
export const STEP_INTERVALS_DAYS = [0, 3, 7, 14, 30, 30, 30, 30, 30, 30]

// After this many sends with no reply/conversion, stop automatically.
// Indefinite monthly emails to someone who's never engaged just burns
// domain reputation for shrinking odds -- a human can always pick the lead
// back up manually after this.
export const MAX_OUTREACH_STEPS = STEP_INTERVALS_DAYS.length

export interface CadenceLead {
  outreach_step: number
  last_outreach_sent_at: string | Date | null
}

// Whether `lead` is due for its NEXT send right now.
export function isStepDue(lead: CadenceLead, now: Date = new Date()): boolean {
  if (lead.outreach_step >= MAX_OUTREACH_STEPS) return false
  if (lead.outreach_step === 0) return true // first touch, no gap to satisfy
  if (!lead.last_outreach_sent_at) return true // shouldn't happen past step 0, but don't get stuck
  const requiredDays = STEP_INTERVALS_DAYS[lead.outreach_step]
  const elapsedMs = now.getTime() - new Date(lead.last_outreach_sent_at).getTime()
  return elapsedMs >= requiredDays * 24 * 60 * 60 * 1000
}

// 1-indexed step number this send will be, for subject lines / logging.
export function nextStepNumber(lead: CadenceLead): number {
  return lead.outreach_step + 1
}
