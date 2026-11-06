-- Grants the app's Postgres role access to the carlos_crm schema.
--
-- Run this in DBeaver, as an admin/superuser, AFTER carlos-crm-schema.sql.
-- Creating a schema does not automatically grant existing roles access to
-- it -- that's why "Run daily sync" failed with
-- "permission denied for schema carlos_crm" even though cmadraft's public
-- schema already worked fine for this same role.
--
-- DATABASE_URL's username is cmadraft_user, same instance as cmadraft's
-- POSTGRES_URL.

GRANT USAGE ON SCHEMA carlos_crm TO cmadraft_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA carlos_crm TO cmadraft_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA carlos_crm TO cmadraft_user;

-- So future tables/sequences in this schema (if you add more later)
-- don't need this re-run.
ALTER DEFAULT PRIVILEGES IN SCHEMA carlos_crm
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cmadraft_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA carlos_crm
  GRANT USAGE, SELECT ON SEQUENCES TO cmadraft_user;
