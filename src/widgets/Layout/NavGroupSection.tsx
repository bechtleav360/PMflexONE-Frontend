import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/utils'

import { SidebarItem } from './SidebarItem'
import type { NavGroup } from './types'
import { useNavGroupOpen } from './useNavGroupOpen'

interface Props {
  group: NavGroup
  hasActiveItem: boolean
  collapsed: boolean
}

/**
 * Renders a collapsible navigation group with a header trigger and child items.
 * When the sidebar is collapsed, the header is hidden and only item icons are shown.
 * @param props - Component props.
 * @param props.group - The navigation group to render.
 * @param props.hasActiveItem - Whether the group contains the currently active route.
 * @param props.collapsed - Whether the sidebar is in collapsed (icon-only) mode.
 * @returns A collapsible section with a header and list of sidebar items.
 */
export function NavGroupSection({ group, hasActiveItem, collapsed }: Props) {
  const { open, setOpen } = useNavGroupOpen(group.labelKey, hasActiveItem)
  const { t } = useTranslation()

  return (
    <div className="flex flex-col">
      {!collapsed && (
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="text-sidebar-foreground flex w-full items-center justify-between rounded-r-lg px-3 py-2 text-sm font-semibold hover:bg-white/[7%]"
        >
          <span>{t(group.labelKey)}</span>
          <ChevronRight
            aria-hidden="true"
            className={cn(
              'h-4 w-4 opacity-60 transition-transform duration-200',
              open && 'rotate-90',
            )}
          />
        </button>
      )}
      {(open || collapsed) && (
        <ul className="flex flex-col gap-0.5">
          {group.items.map((item) => (
            <SidebarItem
              key={item.to ?? item.labelKey}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
