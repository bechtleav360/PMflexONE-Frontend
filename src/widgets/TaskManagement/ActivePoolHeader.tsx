import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

interface ActivePoolHeaderProps {
  isExpanded: boolean
  countLabel: number | string | undefined
  onToggleExpand: () => void
  onCreateTask?: () => void
}

/**
 * Renders the collapse/expand toggle and "Create task" button for the ActivePool widget.
 * @param props - Header props.
 * @returns The header row element.
 */
export function ActivePoolHeader({
  isExpanded,
  countLabel,
  onToggleExpand,
  onCreateTask,
}: ActivePoolHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-muted-foreground flex items-center"
          onClick={onToggleExpand}
          aria-expanded={isExpanded ? 'true' : 'false'}
          aria-label={
            isExpanded
              ? t('pages.taskManagement.collapseActiveTasks', 'Collapse Active Tasks')
              : t('pages.taskManagement.expandActiveTasks', 'Expand Active Tasks')
          }
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <h2 className="text-lg font-semibold">
          {t('pages.taskManagement.activePool', 'Active Tasks')}
          {countLabel !== undefined && (
            <span className="bg-muted text-muted-foreground ml-2 rounded-full px-2 py-0.5 text-sm font-normal">
              {countLabel}
            </span>
          )}
        </h2>
      </div>
      <Button
        size="sm"
        onClick={onCreateTask}
        aria-label={t('pages.taskManagement.createTask', 'Create task')}
      >
        {t('pages.taskManagement.createTask', 'Create task')}
      </Button>
    </div>
  )
}
