/**
 * Derives initials from firstName + lastName.
 *
 * @param first - First name.
 * @param last - Last name.
 * @returns Two-character uppercase initials string.
 */
export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}
