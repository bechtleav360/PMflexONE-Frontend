/**
 * Formats an ISO datetime string into a locale-aware date+time string.
 *
 * Uses `Intl.DateTimeFormat` via `toLocaleString` with `dateStyle: 'medium'`
 * and `timeStyle: 'short'`, rendering the instant in the user's local timezone.
 * Falls back to the raw string on invalid input.
 *
 * @param s - ISO datetime string (e.g. `"2024-05-28T10:23:45.123Z"`).
 * @param locale - BCP 47 locale tag (e.g. `"de"`, `"en"`).
 * @returns Formatted string such as `"28.05.2024, 10:23"` or `"May 28, 2024, 10:23 AM"`.
 */
export function formatDateTime(s: string, locale: string): string {
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * Parses an ISO date or datetime string as a local-midnight `Date`.
 *
 * Accepts both `"YYYY-MM-DD"` and full ISO datetime strings
 * (e.g. `"YYYY-MM-DDTHH:mm:ssZ"`). Both formats are parsed by `new Date()`
 * as UTC, so the UTC date components are extracted and used to construct a
 * local-midnight date — preventing the timezone-shifted display values that
 * result from passing the UTC instant directly to `Intl.DateTimeFormat`.
 *
 * @param s - ISO date or datetime string.
 * @returns A `Date` set to local midnight on the given calendar date.
 */
export function parseLocalDate(s: string): Date {
  const utc = new Date(s)
  if (isNaN(utc.getTime())) {
    throw new Error(`parseLocalDate: invalid date string "${s}"`)
  }
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate())
}

/**
 * Formats a `Date` as a YYYY-MM-DD string using local date parts.
 *
 * `d.toISOString().slice(0, 10)` extracts the UTC date, which causes
 * off-by-one errors in UTC+ timezones (e.g. local midnight 28.05 = UTC 27.05).
 * This function uses `getFullYear()` / `getMonth()` / `getDate()` instead.
 *
 * @param d - The date to format.
 * @returns ISO date string (YYYY-MM-DD) based on local timezone.
 */
export function toLocalISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
