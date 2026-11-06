import { query } from '@/lib/db'

// Generic, append-only log for the whole app -- see carlos_crm.logs in
// docs/carlos-crm-schema.sql. Anything that wants a persistent record of
// what it did calls this instead of getting its own table.
export async function writeLog(
  source: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  detail?: unknown,
): Promise<void> {
  try {
    await query(
      `INSERT INTO carlos_crm.logs (source, level, message, detail) VALUES ($1, $2, $3, $4)`,
      [source, level, message, detail ? JSON.stringify(detail) : null],
    )
  } catch (err) {
    // Logging must never be the reason a real operation fails.
    console.error(`writeLog failed (source=${source}):`, err)
  }
}
