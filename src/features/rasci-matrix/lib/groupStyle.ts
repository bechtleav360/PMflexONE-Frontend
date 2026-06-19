import type { RoleGroup } from '@/entities/role'
import { groupColorStyles } from '@/shared/lib/groupColor'

const GROUP_CLASS_COUNT = 6

function groupPalette(index: number) {
  const i = index % GROUP_CLASS_COUNT
  return { header: `rasci-group-header-${i}`, cell: `rasci-group-cell-${i}` }
}

/**
 * Resolves the header and cell CSS class/style for a role group.
 * Prefers inline style from a custom group colour; falls back to the palette CSS class.
 *
 * @param group - The role group, or null/undefined for ungrouped roles.
 * @param paletteIdx - Zero-based palette index used to derive the fallback CSS class.
 * @returns Object with `headerStyle`, `cellStyle`, `headerClass`, and `cellClass`.
 */
export function resolveGroupStyle(group: RoleGroup | null | undefined, paletteIdx: number) {
  const { header, cell } = groupColorStyles(group?.color)
  const palette = groupPalette(paletteIdx)
  return {
    headerStyle: header,
    cellStyle: cell,
    headerClass: header ? '' : palette.header,
    cellClass: cell ? '' : palette.cell,
  }
}
