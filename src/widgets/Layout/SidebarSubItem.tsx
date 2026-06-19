import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { cn } from '@/shared/lib/utils'

import type { NavSubItem } from './types'

interface SidebarSubItemProps {
  sub: NavSubItem
}

/**
 * Renders a second-level sidebar item indented under a parent accordion.
 * @param props - Component props.
 * @param props.sub - The child navigation item to render.
 * @returns A list item containing the navigation link.
 */
export function SidebarSubItem({ sub }: SidebarSubItemProps) {
  const { t } = useTranslation()

  return (
    <li>
      <NavLink
        to={sub.to}
        end={false}
        className={({ isActive }) =>
          cn(
            'flex min-h-[40px] items-center gap-2.5 rounded-r-lg py-2 pr-3 pl-8 text-sm transition-colors',
            isActive
              ? 'text-sidebar-foreground bg-white/10 font-medium'
              : 'text-sidebar-foreground-muted hover:text-sidebar-foreground hover:bg-white/[7%]',
          )
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={cn(
                'w-0.5 flex-shrink-0 self-stretch rounded-sm',
                isActive ? 'bg-accent-active' : 'bg-white/20',
              )}
            />
            <span className="truncate">{t(sub.labelKey)}</span>
          </>
        )}
      </NavLink>
    </li>
  )
}
