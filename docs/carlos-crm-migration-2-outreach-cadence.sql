-- carlos_crm migration 2 — outreach cadence columns (2026-11-06)
--
-- DRAFT FOR REVIEW. Not run by Claude — run by hand in DBeaver with the
-- admin DB role. Unlike carlos-crm-schema.sql (rev 3), this is additive:
-- carlos_crm.leads already has live rows (325+ synced from Vulcan7), so
-- this ALTERs the existing table instead of dropping it.
--
-- Adds the two columns the outreach cadence (pages/api/admin/send-outreach.ts
-- + lib/outreach-cadence.ts) needs to track where each lead is in the
-- day-1 / day-3-4 / day-7 / day-14 / monthly sequence:
--   outreach_step          -- how many cadence emails sent so far (0 = none yet)
--   last_outreach_sent_at  -- when the most recent one went out; the next
--                             step's eligibility is "enough days since this"
--
-- Deliberately separate from the existing first_outreach_sent_at (kept,
-- unchanged, still set on the first send) and last_touched_at (kept,
-- unchanged -- that one also moves on calls/notes, so it can't double as
-- the email-cadence anchor without breaking the gap math).

BEGIN;

ALTER TABLE carlos_crm.leads
  ADD COLUMN IF NOT EXISTS outreach_step INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_outreach_sent_at TIMESTAMPTZ;

-- Backfill: anyone who already got the one-off initial send (under the old
-- non-cadence sender) should read as "step 1 sent" so the cadence engine
-- doesn't immediately re-send them a day-1 email.
UPDATE carlos_crm.leads
SET outreach_step = 1, last_outreach_sent_at = first_outreach_sent_at
WHERE first_outreach_sent_at IS NOT NULL AND outreach_step = 0;

COMMIT;

-- ── Check afterwards (read-only) ──────────────────────────────────────
-- SELECT outreach_step, count(*) FROM carlos_crm.leads GROUP BY 1 ORDER BY 1;
