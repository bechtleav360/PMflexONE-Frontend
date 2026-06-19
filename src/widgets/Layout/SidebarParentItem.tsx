import { useState } from 'react'

import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import { ActiveBar } from './ActiveBar'
import { SidebarSubItem } from './SidebarSubItem'
import type { NavItem } from './types'

interface SidebarParentItemProps {
  item: NavItem
  collapsed: boolean
}

/**
 * Renders a collapsible parent sidebar item with an accordion of child links.
 * The accordion auto-opens when any child route is active and stays open when the
 * user manually opens it; it cannot be collapsed while on an active child route.
 * @param props - Component props.
 * @param props.item - The parent navigation item (must have `children`).
 * @param props.collapsed - Whether the sidebar is in icon-only mode.
 * @returns A list item containing the accordion trigger and child list.
 */
export function SidebarParentItem({ item, collapsed }: SidebarParentItemProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const anyChildActive = item.children!.some(
    (ch) => location.pathname === ch.to || location.pathname.startsWith(ch.to + '/'),
  )
  // manualIsOpen tracks the user's explicit toggle. The effective open state is the union:
  // anyChildActive keeps the accordion open when on a child route without needing an effect.
  const [manualIsOpen, setManualIsOpen] = useState(false)
  const isOpen = anyChildActive || manualIsOpen

  if (collapsed) {
    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* In collapsed mode the children list is hidden; button is a visual anchor only */}
            <button
              aria-label={t(item.labelKey)}
              className="text-sidebar-foreground flex min-h-[42px] w-full items-center justify-center rounded-r-lg px-3 transition-colors hover:bg-white/[7%]"
            >
              <item.icon className="h-5 w-5 shrink-0 opacity-90" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>
        </Tooltip>
      </li>
    )
  }

  return (
    <li>
      <button
        onClick={() => setManualIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          'text-sidebar-foreground relative flex min-h-[42px] w-full items-center gap-3 rounded-r-lg py-2.5 pr-3 pl-3 text-sm transition-colors',
          anyChildActive ? 'bg-white/10 font-medium' : 'hover:bg-white/[7%]',
        )}
      >
        {anyChildActive && <ActiveBar />}
        <item.icon className={cn('h-5 w-5 shrink-0', !anyChildActive && 'opacity-90')} />
        <span className="flex-1 truncate text-left">{t(item.labelKey)}</span>
        <ChevronRight
          className={cn(
            'h-4 w-4 shrink-0 opacity-60 transition-transform duration-200',
            isOpen && 'rotate-90',
          )}
        />
      </button>
      {isOpen && (
        <ul className="flex flex-col gap-0.5 pt-0.5">
          {item.children!.map((sub) => (
            <SidebarSubItem
              key={sub.to}
              sub={sub}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
