import { Pencil, Tag, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCreateBoardDialogStore, useEditBoardDialogStore } from '@/features/work-item-board'
import { useLabelManagerDialogStore } from '@/features/work-item-labels'
import { Button } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

/** Props for the BoardToolbar component. */
export interface BoardToolbarProps {
  activeBoardId: string | null
  activeBoardName: string | null
  boardsEmpty: boolean
  scopeType: ScopeType
  scopeId: string
  onDeleteBoardClick: () => void
}

/**
 * Toolbar above the task board showing the board name and action buttons.
 * This component renders an `<h1>` element and must remain the only heading-1 on its page.
 * @param root0 - Component props.
 * @param root0.activeBoardId - ID of the currently active board, or null.
 * @param root0.activeBoardName - Name of the currently active board, or null.
 * @param root0.boardsEmpty - Whether no boards exist yet (shows "New Board" button).
 * @param root0.scopeType - The scope entity type for label manager.
 * @param root0.scopeId - The scope entity ID for label manager.
 * @param root0.onDeleteBoardClick - Called when the user clicks "Delete board".
 * @returns The toolbar element.
 */
export function BoardToolbar({
  activeBoardId,
  activeBoardName,
  boardsEmpty,
  scopeType,
  scopeId,
  onDeleteBoardClick,
}: BoardToolbarProps) {
  const { t } = useTranslation()
  const openCreateBoard = useCreateBoardDialogStore((s) => s.openModal)
  const openEditBoard = useEditBoardDialogStore((s) => s.openModal)
  const openLabelManager = useLabelManagerDialogStore((s) => s.openModal)
  const heading = activeBoardName
    ? `${t('widgets.taskManagement.heading', 'Tasks')} — ${activeBoardName}`
    : t('widgets.taskManagement.heading', 'Tasks')

  return (
    <div className="flex shrink-0 items-center justify-between gap-2">
      <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => openLabelManager({ scopeType, scopeId })}
        >
          <Tag className="h-4 w-4" />
          {t('widgets.taskManagement.labels', 'Labels')}
        </Button>
        {activeBoardId && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditBoard({ boardId: activeBoardId })}
              aria-label={t('features.workItem.board.editBoard', 'Edit board')}
            >
              <Pencil className="h-4 w-4" />
              {t('features.workItem.board.editBoard', 'Edit board')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={onDeleteBoardClick}
              aria-label={t('features.workItem.board.deleteBoardAction', 'Delete board')}
            >
              <Trash2 className="h-4 w-4" />
              {t('features.workItem.board.deleteBoardAction', 'Delete board')}
            </Button>
          </>
        )}
        {boardsEmpty && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openCreateBoard()}
          >
            {t('widgets.taskManagement.createBoard', 'New Board')}
          </Button>
        )}
      </div>
    </div>
  )
}
