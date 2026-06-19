/**
 * Formats a `Date` object as an ISO date string (`YYYY-MM-DD`).
 *
 * @param date - The date to format, or `null`/`undefined` for an empty field.
 * @returns An ISO date string, or an empty string when `date` is falsy.
 */
export function toIsoDateString(date: Date | null | undefined): string {
  if (!date) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
