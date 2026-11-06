import { Pool, type QueryResultRow } from 'pg'

// Points at the SAME Postgres instance cmadraft uses (DATABASE_URL copied
// from cmadraft/.env.local's POSTGRES_URL) but every query here is scoped
// to the carlos_crm schema (see docs/carlos-crm-schema.sql) -- this file
// never touches cmadraft's public/dev schemas.
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export function query<T extends QueryResultRow = any>(sql: string, params: any[] = []) {
  return pool.query<T>(sql, params)
}
