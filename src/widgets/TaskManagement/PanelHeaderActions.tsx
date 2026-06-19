import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { WorkItem } from '@/entities/work-item'
import { Button } from '@/shared/components'

import type { DetailPanelMode } from './TaskDetailPanel'

interface PanelHeaderActionsProps {
  workItem: WorkItem
  internalMode: DetailPanelMode
  onEdit: () => void
  onArchiveClick: () => void
  onDeleteClick: () => void
}

/**
 * Header action buttons (Edit / Archive / Delete) shown in view mode only.
 * @param root0 - Component props.
 * @param root0.workItem - The current work item.
 * @param root0.internalMode - Current panel mode; renders nothing unless 'view'.
 * @param root0.onEdit - Called when the Edit button is clicked.
 * @param root0.onArchiveClick - Called when the Archive/Restore button is clicked.
 * @param root0.onDeleteClick - Called when the Delete button is clicked.
 * @returns Action buttons or null when not in view mode.
 */
export function PanelHeaderActions({
  workItem,
  internalMode,
  onEdit,
  onArchiveClick,
  onDeleteClick,
}: PanelHeaderActionsProps) {
  const { t } = useTranslation()
  if (internalMode !== 'view') return null
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
        {t('common.edit', 'Edit')}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onArchiveClick}
      >
        {workItem.archived
          ? t('pages.taskManagement.unarchive', 'Restore')
          : t('pages.taskManagement.archive_action', 'Archive')}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={onDeleteClick}
      >
        <Trash2 className="h-4 w-4" />
        {t('pages.taskManagement.delete_action', 'Delete')}
      </Button>
    </div>
  )
}
