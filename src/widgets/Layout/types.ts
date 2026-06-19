import type { ComponentType, SVGProps } from 'react'

/** Lucide-compatible icon component type. */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

/**
 * A child navigation item rendered under a collapsible parent.
 * @property labelKey - i18n translation key for the display text.
 * @property to - Route path passed to React Router's NavLink.
 */
export interface NavSubItem {
  labelKey: string
  to: string
}

/**
 * A top-level sidebar navigation item.
 * Leaf items have a `to` route. Parent items have `children` and are collapsible.
 * @property labelKey - i18n translation key for the display text.
 * @property icon - Lucide icon component.
 * @property to - Route path (leaf items only).
 * @property children - Second-level items (parent items only).
 */
export interface NavItem {
  labelKey: string
  icon: IconComponent
  to?: string
  children?: NavSubItem[]
}

/**
 * A logical group of nav items with a collapsible header.
 * @property labelKey - i18n key for the group header label.
 * @property items - Top-level nav items in this group.
 */
export interface NavGroup {
  labelKey: string
  items: NavItem[]
}
