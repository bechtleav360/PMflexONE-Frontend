import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'
import { cn } from '@/shared/lib/utils'

interface Props {
  collapsed: boolean
  onToggle: () => void
}

/**
 * Toggle button at the bottom of the sidebar to collapse or expand it.
 * Shows a double-chevron icon pointing right when collapsed, left when expanded.
 * @param props - Component props.
 * @param props.collapsed - Whether the sidebar is currently collapsed.
 * @param props.onToggle - Callback fired when the button is clicked.
 * @returns A full-width toggle button anchored to the sidebar footer.
 */
export function SidebarCollapseButton({ collapsed, onToggle }: Props) {
  const { t } = useTranslation()

  return (
    <div className="mt-2 shrink-0 px-2.5 pb-2.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            onClick={onToggle}
            className={cn(
              'w-full justify-start gap-2.5 rounded-lg border border-white/10 bg-white/[.06] px-3.5 text-sm text-white hover:bg-white/[.12] hover:text-white',
              collapsed && 'justify-center px-0',
            )}
            aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {collapsed ? (
              <ChevronsRight className="h-5 w-5 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="h-5 w-5 shrink-0" />
                <span>{t('sidebar.collapse')}</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
