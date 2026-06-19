import { SidebarLeafItem } from './SidebarLeafItem'
import { SidebarParentItem } from './SidebarParentItem'
import type { NavItem } from './types'

interface Props {
  item: NavItem
  collapsed: boolean
}

/**
 * Renders a single sidebar navigation item.
 * Dispatches to `SidebarParentItem` for items with children (collapsible accordion)
 * or `SidebarLeafItem` for route links.
 * @param props - Component props.
 * @param props.item - The navigation item to render.
 * @param props.collapsed - Whether the sidebar is in icon-only mode.
 * @returns A list item containing the navigation link or accordion.
 */
export function SidebarItem({ item, collapsed }: Props) {
  if (item.children) {
    return (
      <SidebarParentItem
        item={item}
        collapsed={collapsed}
      />
    )
  }
  return (
    <SidebarLeafItem
      item={{ ...item, to: item.to ?? '/' }}
      collapsed={collapsed}
    />
  )
}
