import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { NavGroupSection } from './NavGroupSection'
import { NAVIGATION } from './navigationData'

interface Props {
  collapsed: boolean
}

/**
 * Two-level sidebar navigation. Groups are separated by a subtle divider.
 * When collapsed, only icons are shown; labels appear as tooltips.
 * @param props - Component props.
 * @param props.collapsed - Whether the sidebar is in icon-only mode.
 * @returns The full sidebar navigation tree.
 */
export function SidebarNav({ collapsed }: Props) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <nav
      className="flex flex-col py-3.5"
      aria-label={t('nav.mainNavigation')}
    >
      {NAVIGATION.map((group) => {
        const hasActiveItem = group.items.some((item) =>
          item.to === '/' ? pathname === '/' : !!item.to && pathname.startsWith(item.to),
        )
        return (
          <NavGroupSection
            key={group.labelKey}
            group={group}
            hasActiveItem={hasActiveItem}
            collapsed={collapsed}
          />
        )
      })}
    </nav>
  )
}
