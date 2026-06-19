import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'
import { WorkItemStatusBadge } from '@/entities/work-item'
import { DialogHeader, DialogTitle } from '@/shared/components'

import { PanelHeaderActions } from './PanelHeaderActions'
import type { DetailPanelMode } from './taskDetailPanelTypes'

interface PanelDialogHeaderProps {
  /** Title text to display. */
  title: string
  /** The work item being viewed or edited, if any. */
  workItem?: ProjectWorkItem
  /** The current internal panel mode. */
  internalMode: DetailPanelMode
  /** Called when the user clicks the edit action. */
  onEdit: () => void
  /** Called when the user clicks the archive action. */
  onArchiveClick: () => void
  /** Called when the user clicks the delete action. */
  onDeleteClick: () => void
}

/**
 * Dialog header for the task detail panel, including title, status badge, and header actions.
 * @param props - Component props.
 * @returns The rendered dialog header.
 */
export function PanelDialogHeader({
  title,
  workItem,
  internalMode,
  onEdit,
  onArchiveClick,
  onDeleteClick,
}: PanelDialogHeaderProps) {
  const { t } = useTranslation()

  return (
    <DialogHeader className="shrink-0 border-b px-6 py-4">
      <div className="flex flex-col gap-1.5 pr-6">
        <DialogTitle className="truncate text-base leading-tight font-semibold">
          {title}
        </DialogTitle>
        {workItem && internalMode !== 'create' && (
          <div className="flex items-center justify-between gap-2">
            {workItem.boardColumn ? (
              <WorkItemStatusBadge status={workItem.status} />
            ) : (
              <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold">
                {t('pages.taskManagement.activeTaskBadge', 'Active Task')}
              </span>
            )}
            <PanelHeaderActions
              workItem={workItem}
              internalMode={internalMode}
              onEdit={onEdit}
              onArchiveClick={onArchiveClick}
              onDeleteClick={onDeleteClick}
            />
          </div>
        )}
      </div>
    </DialogHeader>
  )
}
