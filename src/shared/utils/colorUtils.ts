/**
 * Converts an ARGB hex string (`#AARRGGBB`) to a CSS `rgba()` string.
 * Used to render user-supplied label colors as inline styles — design tokens
 * cannot be used here because the color value is runtime data from the API.
 * @param argb - An 8-digit ARGB hex string, e.g. `#FF007194`.
 * @returns A CSS `rgba(r,g,b,a)` string, or `rgba(0,0,0,1)` for invalid input.
 */
export function argbToInlineColor(argb: string): string {
  if (/^#[0-9A-Fa-f]{8}$/.test(argb)) {
    const aa = parseInt(argb.slice(1, 3), 16)
    const rr = parseInt(argb.slice(3, 5), 16)
    const gg = parseInt(argb.slice(5, 7), 16)
    const bb = parseInt(argb.slice(7, 9), 16)
    return `rgba(${rr},${gg},${bb},${(aa / 255).toFixed(3)})`
  }
  return 'rgba(0,0,0,1)'
}
