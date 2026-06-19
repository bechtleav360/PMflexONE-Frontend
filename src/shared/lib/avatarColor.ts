/**
 * Deterministic avatar background + foreground classes derived from a person's name.
 *
 * The palette uses literal Tailwind class strings so the build scanner picks them up.
 * Each entry must appear verbatim here — never build class names dynamically.
 */
const PALETTE = [
  'bg-avatar-palette-0 text-white',
  'bg-avatar-palette-1 text-white',
  'bg-avatar-palette-2 text-white',
  'bg-avatar-palette-3 text-white',
  'bg-avatar-palette-4 text-white',
  'bg-avatar-palette-5 text-white',
  'bg-avatar-palette-6 text-white',
  'bg-avatar-palette-7 text-white',
] as const

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Returns a stable Tailwind bg + text class string for a person's initials avatar.
 *
 * The same firstName + lastName always maps to the same color across the app.
 *
 * @param firstName - Person's first name.
 * @param lastName - Person's last name.
 * @returns A Tailwind class string, e.g. `"bg-blue-600 text-white"`.
 */
export function avatarColorClass(firstName: string, lastName: string): string {
  return PALETTE[hash(`${firstName}${lastName}`) % PALETTE.length]
}
