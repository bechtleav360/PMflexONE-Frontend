import { useMemo } from 'react'
import { createPortal } from 'react-dom'

import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'

import type { Board as BoardType, ProjectWorkItem } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { useAssignWorkItemToColumn } from '../../hooks/useAssignWorkItemToColumn'
import { useReorderBoardColumns } from '../../hooks/useReorderBoardColumns'
import { useCreateColumnDialogStore } from '../../store/boardDialogStores'
import { useBoardFilterStore } from '../../store/useBoardFilterStore'
import { BoardCard } from '../BoardCard'
import { BoardColumnsRow } from './BoardColumnsRow'
import { createBoardAnnouncements, sortColumns } from './boardUtils'
import { useBoardDragHandlers } from './useBoardDragHandlers'

interface BoardProps {
  board: BoardType
  scopeType: ScopeType
  onSelect?: (workItemId: string) => void
  onAddTask?: (columnId: string) => void
}

/**
 * Renders a drag-and-drop kanban board with sortable columns and an unassigned backlog.
 * @param root0 - Component props.
 * @param root0.board - The board entity to render.
 * @param root0.scopeType - The scope entity type — passed to the assign mutation.
 * @param root0.onSelect - Called when the user clicks a card to open the detail panel.
 * @param root0.onAddTask - Called with the column ID when the user clicks "Add a task".
 * @returns The DnD context wrapping columns and an unassigned items section.
 */
export function Board({ board, scopeType, onSelect, onAddTask }: BoardProps) {
  const { t } = useTranslation()
  const openCreateColumn = useCreateColumnDialogStore((s) => s.openModal)
  const { mutate: reorderColumns } = useReorderBoardColumns(board.id)
  const { mutateAsync: assignFromPool } = useAssignWorkItemToColumn(
    board.id,
    scopeType,
    board.scope?.id ?? '',
  )
  const { priorities, assigneeId, labelId } = useBoardFilterStore()
  const filter = useMemo(
    () => ({ priorities, assigneeId, labelId }),
    [priorities, assigneeId, labelId],
  )

  const allWorkItems: ProjectWorkItem[] = board.columns.flatMap((c) => c.workItems ?? [])
  const sortedColumns = sortColumns(board.columns)

  const {
    activeDragColumnId,
    collisionDetection,
    handleNativeDrop,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeWorkItem,
    dragOverId,
    sensors,
    clearDrag,
  } = useBoardDragHandlers({ board, sortedColumns, allWorkItems, assignFromPool, reorderColumns })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDrag}
      accessibility={{ announcements: createBoardAnnouncements(t) }}
    >
      <div className="flex min-h-0 flex-1">
        <BoardColumnsRow
          columns={sortedColumns}
          boardId={board.id}
          filter={filter}
          dragOverId={dragOverId}
          activeDragColumnId={activeDragColumnId}
          onSelect={onSelect}
          onAddColumn={() => openCreateColumn({ boardId: board.id })}
          onNativeDrop={handleNativeDrop}
          onAddTask={onAddTask}
          scopeType={scopeType}
        />
      </div>
      {createPortal(
        <DragOverlay>
          {activeWorkItem ? (
            <div className="opacity-50">
              <BoardCard
                workItem={activeWorkItem}
                scopeType={scopeType}
              />
            </div>
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  )
}
