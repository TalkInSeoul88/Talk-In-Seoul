import { WEEK_SHEET_BYTES } from './week-sheet-bytes.js'

/** Ids the This Week page may request. Bytes are not in public/. */
export const WEEK_SHEETS = Object.fromEntries(
  Object.entries(WEEK_SHEET_BYTES).map(([id, sheet]) => [id, sheet.name]),
)

export async function readWeekSheet(id) {
  const sheet = WEEK_SHEET_BYTES[String(id || '')]
  if (!sheet) return null
  return { name: sheet.name, bytes: Buffer.from(sheet.base64, 'base64') }
}
