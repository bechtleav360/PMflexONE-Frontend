import { clsx, type ClassValue } from 'clsx'
import { ClientError } from 'graphql-request'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names, resolving conflicts via tailwind-merge.
 * @param inputs - Class values (strings, conditionals, arrays) accepted by clsx.
 * @returns A single merged class string with conflicting Tailwind utilities resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an ISO-8601 date string using the browser locale.
 *
 * @param isoDate - An ISO-8601 date/datetime string (e.g. "2024-03-15T10:30:00Z").
 * @param locale - BCP 47 language tag (e.g. "en", "de"). Defaults to `navigator.language`.
 * @returns A locale-formatted date string (e.g. "15 Mar 2024" / "15.03.2024").
 */
export function formatDate(isoDate: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale ?? navigator.language, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(isoDate))
}

/**
 * Formats a person's full name from first and last name fields.
 * Returns `fallback` when the person is nullish.
 *
 * @param person - Object with `firstName` and `lastName` strings, or null/undefined.
 * @param fallback - Value returned when `person` is absent (default `'Unknown'`).
 * @returns The formatted full name, e.g. `"Jane Doe"`.
 */
export function formatPersonName(
  person: { firstName: string; lastName: string } | null | undefined,
  fallback = 'Unknown',
): string {
  if (!person) return fallback
  return `${person.firstName} ${person.lastName}`
}

/**
 * Extracts the first error message from a GraphQL ClientError response.
 * Falls back to `fallback` when the error is not a ClientError or carries no message.
 *
 * @param error - The caught error value, typically from a failed mutation or query.
 * @param fallback - Message returned when `error` is not a GraphQL ClientError.
 * @returns The first GraphQL error message, or `fallback` if none is available.
 */
export function getGraphQLErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ClientError) {
    return error.response.errors?.[0]?.message ?? fallback
  }
  return fallback
}
