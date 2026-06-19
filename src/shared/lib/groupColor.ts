/**
 * Derives inline style objects for role group headers and role column cells
 * from a hex color string. Falls back gracefully when no color is provided.
 *
 * Design contract:
 *  - header (group row):  dark background = `color`, white text — high contrast (WCAG AA)
 *  - cell (role column):  light tint = `color` at ~12% opacity, black text — readable on light bg
 *
 * The caller is responsible for also passing a fallback CSS palette class when
 * `color` is null/undefined.
 *
 * Note: raw hex values in backgroundColor are intentional here. These colors are
 * user-defined data from the backend and cannot be expressed as design tokens.
 * This is an explicit exception to the token-only rule.
 */

/**
 * Returns true if `hex` is a valid 3- or 6-digit hex color string (with leading #).
 *
 * @param hex - The string to validate.
 * @returns True when `hex` matches the 3- or 6-digit hex pattern.
 */
function isValidHex(hex: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)
}

/**
 * Normalises a 3-digit hex to 6-digit.
 *
 * @param hex - A validated hex color string (3 or 6 digits with leading #).
 * @returns A 6-digit hex color string.
 */
function normalise(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  return hex
}

/**
 * Returns inline React styles for the group **header** row cell
 * (dark background, white text) when `color` is a valid hex string.
 * Returns `undefined` when `color` is absent so the caller can apply a CSS class fallback.
 *
 * @param color - A hex color string from backend data, or null/undefined.
 * @returns A React CSSProperties object with backgroundColor and color, or undefined.
 */
export function groupHeaderStyle(
  color: string | null | undefined,
): React.CSSProperties | undefined {
  if (!color || !isValidHex(color)) return undefined
  return { backgroundColor: color, color: 'var(--primary-foreground)' }
}

/**
 * Returns inline React styles for a **role column** cell
 * (light tint background, dark text) when `color` is a valid hex string.
 * Tint = `color` at 15% opacity blended on white → appends `26` (hex for ~15%) as alpha.
 * Returns `undefined` when `color` is absent so the caller can apply a CSS class fallback.
 *
 * @param color - A hex color string from backend data, or null/undefined.
 * @returns A React CSSProperties object with a tinted backgroundColor and foreground color, or undefined.
 */
export function groupCellStyle(color: string | null | undefined): React.CSSProperties | undefined {
  if (!color || !isValidHex(color)) return undefined
  const full = normalise(color)
  return { backgroundColor: `${full}26`, color: 'var(--foreground)' }
}

/**
 * Returns both header and cell styles, or `undefined` for each when color is absent.
 * Convenience wrapper for components that need both styles.
 *
 * @param color - A hex color string from backend data, or null/undefined.
 * @returns Object with `header` and `cell` CSSProperties, each undefined when color is absent.
 */
export function groupColorStyles(color: string | null | undefined): {
  header: React.CSSProperties | undefined
  cell: React.CSSProperties | undefined
} {
  return {
    header: groupHeaderStyle(color),
    cell: groupCellStyle(color),
  }
}
