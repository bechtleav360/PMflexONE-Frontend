/**
 * Derives up to 3-character initials from a person's first and last name.
 * Takes the first character of firstName and up to 2 characters of lastName.
 *
 * @param firstName - The person's first name, or null.
 * @param lastName - The person's last name, or null.
 * @returns Uppercase initials string.
 */
export function generateInitials(firstName: string | null, lastName: string | null): string {
  const f = (firstName ?? '').trim().charAt(0)
  const l = (lastName ?? '').trim().substring(0, 2)
  return (f + l).toUpperCase()
}
