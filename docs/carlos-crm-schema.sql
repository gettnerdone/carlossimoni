-- carlos_crm schema — Carlos's own-leads CRM (2026-11-05, rev. 3)
--
-- DRAFT FOR REVIEW. Not run by Claude — run by hand in DBeaver with the
-- admin DB role, against cmadraft's existing Postgres instance (the same
-- one `public.leads` / `public.lead_activities` already live in). This is
-- a NEW schema in that same instance, not a new database and not touching
-- any cmadraft table.
--
-- Why a new schema instead of reusing cmadraft's public.leads: these are a
-- different kind of lead entirely. cmadraft's CRM calls Florida REALTORS
-- to sell them CMADraft software (office/broker/agent hierarchy, MLS
-- production ranking, builder/national-brokerage tags). This CRM is for
-- Carlos to work HOMEOWNER/seller leads pulled from Vulcan7 — no office
-- hierarchy, no MLS production data, different pipeline stages ("listed"
-- instead of "won"). Reusing cmadraft's table would mean bolting on a pile
-- of nullable realtor-only columns that never apply here. A separate
-- schema keeps both clean and both migrate independently later (this one
-- moves to its own database once carlossimoni.com has its own Postgres;
-- cmadraft's doesn't move at all).
--
-- Mirrors cmadraft's compliance pattern on purpose (see cmadraft's
-- docs/crm-schema-phase1.sql and docs/DNC_POLICY.md) because the same
-- rules apply here, if not more so: these are residential phone numbers
-- and personal emails, not business lines — calling-hours, 24-hour
-- call-frequency limit, and Do-Not-Call registry scrubbing all apply.
-- Email follows CAN-SPAM the same as cmadraft's does (opt-out, physical
-- address in the footer, truthful from/subject).
--
-- Rev 2: only the last few days of Vulcan7 contacts are ever synced (see
-- pages/api/admin/vulcan7-sync.ts), and every one of those gets a full
-- per-contact detail fetch (address, DNC, every phone, every email) --
-- there's no more "grid-only, detail-later" split. That adds lead_phones /
-- lead_emails, since a contact can have more than one of each.
--
-- Rev 3: adds carlos_crm.logs, a single generic append-only log table for
-- the whole app (sync runs, outreach sends, anything else later) instead
-- of a one-off table per feature.
--
-- Every table here currently has zero rows, so this rewrites the whole
-- schema from scratch (DROP + CREATE) instead of ALTERing rev 1 in place.
-- If that's no longer true when you run this, stop and ask first.
--
-- Since this drops and recreates every table, re-run carlos-crm-grants.sql
-- afterward too -- grants are tied to the table object and are lost when
-- it's dropped, even for a table (like logs) that existed before.

CREATE SCHEMA IF NOT EXISTS carlos_crm;

BEGIN;

DROP TABLE IF EXISTS carlos_crm.lead_tasks CASCADE;
DROP TABLE IF EXISTS carlos_crm.lead_activities CASCADE;
DROP TABLE IF EXISTS carlos_crm.lead_phones CASCADE;
DROP TABLE IF EXISTS carlos_crm.lead_emails CASCADE;
DROP TABLE IF EXISTS carlos_crm.leads CASCADE;
DROP TABLE IF EXISTS carlos_crm.logs CASCADE;

-- ── leads ──────────────────────────────────────────────────────────────
CREATE TABLE carlos_crm.leads (
  id                  BIGSERIAL PRIMARY KEY,

  name                TEXT NOT NULL,
  -- Primary/display email+phone (first found). Full lists live in
  -- lead_emails / lead_phones below -- these columns exist so outreach
  -- sending and simple list views don't need a join.
  email               TEXT,
  phone               TEXT,
  address             TEXT,
  city                TEXT,
  state               TEXT,
  zip                 TEXT,

  -- From Vulcan7: the property's list/estimated price, type, and Vulcan7's
  -- own "date added" for that contact (distinct from created_at below,
  -- which is when WE first pulled it in).
  property_price      NUMERIC,
  property_type       TEXT,
  vulcan7_date_added  TIMESTAMPTZ,

  stage               TEXT NOT NULL DEFAULT 'not_contacted'
    CHECK (stage IN ('not_contacted', 'contacted', 'interested',
                      'appointment_booked', 'listed', 'lost')),
  owner_admin_id      TEXT,  -- Carlos today; nullable pool for later

  -- 'vulcan7' rows are tagged with source_ref = Vulcan7's own contact id
  -- (the digits in Vulcan7's row-contact-info-<id> / data-itemid), so the
  -- daily sync can upsert on (source, source_ref) instead of creating
  -- duplicates every run.
  source              TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('vulcan7', 'manual')),
  source_ref          TEXT,

  time_zone           TEXT NOT NULL DEFAULT 'America/New_York',  -- Panhandle = America/Chicago

  -- Lead-level DNC: true if ANY of this lead's phones is DNC (see
  -- lead_phones.is_dnc for which one). Only ever set true by a sync,
  -- never cleared back to false by one -- it's a compliance signal.
  dnc                 BOOLEAN NOT NULL DEFAULT false,
  dnc_reason          TEXT,  -- 'vulcan7_import' | 'asked' | 'national_registry' | 'florida_registry' | other
  dnc_at              TIMESTAMPTZ,
  dnc_scrubbed_at     TIMESTAMPTZ,

  email_opt_out       BOOLEAN NOT NULL DEFAULT false,
  email_opt_out_at    TIMESTAMPTZ,

  last_call_at        TIMESTAMPTZ,       -- once-per-24-hours rule
  first_outreach_sent_at TIMESTAMPTZ,    -- dedupe: don't re-send the initial Resend outreach email

  last_touched_at     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_carlos_leads_source_ref
  ON carlos_crm.leads (source, source_ref);
CREATE INDEX idx_carlos_leads_stage       ON carlos_crm.leads (stage);
CREATE INDEX idx_carlos_leads_owner        ON carlos_crm.leads (owner_admin_id);
CREATE INDEX idx_carlos_leads_state         ON carlos_crm.leads (state);
CREATE INDEX idx_carlos_leads_last_call_at  ON carlos_crm.leads (last_call_at);
CREATE INDEX idx_carlos_leads_vulcan7_date  ON carlos_crm.leads (vulcan7_date_added DESC);

-- ── lead_phones ────────────────────────────────────────────────────────
CREATE TABLE carlos_crm.lead_phones (
  id          BIGSERIAL PRIMARY KEY,
  lead_id     BIGINT NOT NULL REFERENCES carlos_crm.leads(id) ON DELETE CASCADE,
  phone       TEXT NOT NULL,
  label       TEXT,     -- 'Mobile' | 'Home' | 'Work' | 'Other' | 'Cell' | NULL
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  -- Per-number DNC flag as Vulcan7 reports it. Same never-cleared rule as
  -- leads.dnc above.
  is_dnc      BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lead_id, phone)
);

CREATE INDEX idx_carlos_lead_phones_lead_id ON carlos_crm.lead_phones (lead_id);

-- ── lead_emails ────────────────────────────────────────────────────────
CREATE TABLE carlos_crm.lead_emails (
  id          BIGSERIAL PRIMARY KEY,
  lead_id     BIGINT NOT NULL REFERENCES carlos_crm.leads(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lead_id, email)
);

CREATE INDEX idx_carlos_lead_emails_lead_id ON carlos_crm.lead_emails (lead_id);

-- ── lead_activities ────────────────────────────────────────────────────
CREATE TABLE carlos_crm.lead_activities (
  id                  BIGSERIAL PRIMARY KEY,
  lead_id             BIGINT NOT NULL REFERENCES carlos_crm.leads(id) ON DELETE CASCADE,
  type                TEXT NOT NULL CHECK (type IN
    ('call', 'inbound_call', 'email_sent', 'email_received', 'visit', 'note', 'stage_change')),
  direction           TEXT CHECK (direction IS NULL OR direction IN ('outbound', 'inbound')),
  engaged             BOOLEAN,   -- talked / replied = true; no answer / no reply = false
  outcome             TEXT CHECK (outcome IS NULL OR outcome IN
    ('no_answer', 'voicemail', 'wrong_number', 'callback', 'interested',
     'appointment_booked', 'not_interested', 'do_not_call')),
  duration_sec        INTEGER,
  body                TEXT,
  from_stage          TEXT,
  to_stage             TEXT,
  created_by_admin_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carlos_lead_activities_lead_id
  ON carlos_crm.lead_activities (lead_id, created_at DESC);
CREATE INDEX idx_carlos_lead_activities_admin
  ON carlos_crm.lead_activities (created_by_admin_id, created_at DESC);

-- ── lead_tasks (NEXT ACTION / reminders) ──────────────────────────────
CREATE TABLE carlos_crm.lead_tasks (
  id                        BIGSERIAL PRIMARY KEY,
  lead_id                   BIGINT NOT NULL REFERENCES carlos_crm.leads(id) ON DELETE CASCADE,
  owner_admin_id            TEXT,
  action                    TEXT NOT NULL CHECK (action IN ('call', 'email', 'visit', 'other')),
  due_at                    TIMESTAMPTZ NOT NULL,
  note                      TEXT,
  done_at                   TIMESTAMPTZ,
  created_from_activity_id  BIGINT REFERENCES carlos_crm.lead_activities(id) ON DELETE SET NULL,
  done_by_activity_id       BIGINT REFERENCES carlos_crm.lead_activities(id) ON DELETE SET NULL,
  created_by_admin_id       TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carlos_lead_tasks_owner_open
  ON carlos_crm.lead_tasks (owner_admin_id, due_at) WHERE done_at IS NULL;
CREATE INDEX idx_carlos_lead_tasks_lead_open
  ON carlos_crm.lead_tasks (lead_id, due_at) WHERE done_at IS NULL;
CREATE INDEX idx_carlos_lead_tasks_lead
  ON carlos_crm.lead_tasks (lead_id, created_at DESC);

-- ── logs ───────────────────────────────────────────────────────────────
-- One generic, append-only log table for the whole app -- not a table per
-- feature. Anything that needs a persistent record of what it did (the
-- Vulcan7 sync, an outreach send, a future admin action) writes a row
-- here with its own `source` name and whatever it wants in `detail`,
-- instead of us adding a new single-purpose table every time something
-- new needs logging.
CREATE TABLE carlos_crm.logs (
  id          BIGSERIAL PRIMARY KEY,
  source      TEXT NOT NULL,   -- e.g. 'vulcan7_sync', 'outreach_send' -- free text, not a fixed list
  level       TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
  message     TEXT NOT NULL,
  detail      JSONB,           -- free-form: counts, error lists, ids touched, whatever that source wants to keep
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carlos_logs_source_created ON carlos_crm.logs (source, created_at DESC);

COMMIT;

-- ── Check afterwards (read-only) ──────────────────────────────────────
-- SELECT column_name FROM information_schema.columns WHERE table_schema = 'carlos_crm' AND table_name = 'leads' ORDER BY ordinal_position;
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'carlos_crm' ORDER BY 1;
