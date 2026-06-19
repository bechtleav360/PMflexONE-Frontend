import { useTranslation } from 'react-i18next'
import { NavLink, useMatch, useResolvedPath } from 'react-router-dom'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import { ActiveBar } from './ActiveBar'
import type { NavItem } from './types'

interface SidebarLeafItemProps {
  item: NavItem & { to: string }
  collapsed: boolean
}

/**
 * Renders a leaf sidebar navigation item as a styled NavLink.
 * In collapsed mode, only the icon is shown and the label is surfaced via a tooltip.
 * @param props - Component props.
 * @param props.item - The leaf navigation item (must have a `to` route).
 * @param props.collapsed - Whether the sidebar is in icon-only mode.
 * @returns A list item containing the navigation link.
 */
export function SidebarLeafItem({ item, collapsed }: SidebarLeafItemProps) {
  const { t } = useTranslation()
  const resolved = useResolvedPath(item.to)
  const isActive = !!useMatch({ path: resolved.pathname, end: item.to === '/' })

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              aria-label={t(item.labelKey)}
              className={cn(
                'text-sidebar-foreground relative flex min-h-[42px] items-center justify-center rounded-r-lg px-3 transition-colors',
                isActive ? 'bg-white/10' : 'hover:bg-white/[7%]',
              )}
            >
              {isActive && <ActiveBar />}
              <item.icon className={cn('h-5 w-5 shrink-0', !isActive && 'opacity-90')} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
        </Tooltip>
      </li>
    )
  }

  return (
    <li>
      <NavLink
        to={item.to}
        end={item.to === '/'}
        className={cn(
          'text-sidebar-foreground relative flex min-h-[42px] items-center gap-3 rounded-r-lg py-2.5 pr-3 pl-3 text-sm transition-colors',
          isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/[7%]',
        )}
      >
        {isActive && <ActiveBar />}
        <item.icon className={cn('h-5 w-5 shrink-0', !isActive && 'opacity-90')} />
        <span className="truncate">{t(item.labelKey)}</span>
      </NavLink>
    </li>
  )
}
