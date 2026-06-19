/**
 * Converts an empty string to `undefined`; otherwise coerces the value to a Number.
 *
 * @param v - The raw string value from a form input.
 * @returns `undefined` for empty strings, or the numeric equivalent of `v`.
 */
export const numericField = (v: string) => (v === '' ? undefined : Number(v))
