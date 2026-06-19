import { groupColorStyles } from '@/shared/lib/groupColor'

const GROUP_CLASS_COUNT = 6

function groupPaletteFallback(index: number) {
  const i = index % GROUP_CLASS_COUNT
  return { header: `rasci-group-header-${i}`, cell: `rasci-group-cell-${i}` }
}

/**
 * Resolves header and cell CSS class/style tokens for a role group colour.
 * Prefers inline style from a custom colour; falls back to the palette CSS class at `idx`.
 *
 * @param color - The group's hex colour string, or null/undefined for no custom colour.
 * @param idx - Zero-based palette index used to derive the fallback CSS class.
 * @returns Object with `headerStyle`, `cellStyle`, `headerClass`, and `cellClass`.
 */
export function resolveGroupStyle(color: string | null | undefined, idx: number) {
  const { header: headerStyle, cell: cellStyle } = groupColorStyles(color)
  const fallback = groupPaletteFallback(idx)
  return {
    headerStyle,
    cellStyle,
    headerClass: headerStyle ? '' : fallback.header,
    cellClass: cellStyle ? '' : fallback.cell,
  }
}
