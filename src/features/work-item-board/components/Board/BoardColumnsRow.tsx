import { horizontalListSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BoardColumn } from '@/entities/work-item'
import { Button } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { MAX_COLUMNS } from './boardUtils'
import { SortableBoardColumn } from './SortableBoardColumn'

/** Props for the BoardColumnsRow component. */
export interface BoardColumnsRowProps {
  columns: BoardColumn[]
  boardId: string
  filter: { priorities?: ReadonlySet<string>; labelId?: string | null }
  dragOverId: string | null
  activeDragColumnId: string | null
  onSelect?: (workItemId: string) => void
  onAddColumn: () => void
  onNativeDrop?: (workItemId: string, version: number, columnId: string) => void
  onAddTask?: (columnId: string) => void
  scopeType?: ScopeType
}

/**
 * Renders the horizontal strip of sortable board columns and the "Add another column" button.
 * @param root0 - Component props.
 * @param root0.columns - Ordered list of board columns to render.
 * @param root0.boardId - ID of the parent board.
 * @param root0.filter - Active priority/label filter applied to each column's cards.
 * @param root0.dragOverId - ID of the item currently being dragged over.
 * @param root0.activeDragColumnId - ID of the column currently being dragged.
 * @param root0.onSelect - Called when the user clicks a card.
 * @param root0.onAddColumn - Called when the user clicks "Add another column".
 * @param root0.onNativeDrop - Called when a work item is dropped via native HTML5 drag.
 * @param root0.onAddTask - Called with the column ID when the user clicks "Add a task".
 * @param root0.scopeType - The scope entity type, forwarded to each sortable column.
 * @returns The columns row element inside a horizontal SortableContext.
 */
export function BoardColumnsRow({
  columns,
  boardId,
  filter,
  dragOverId,
  activeDragColumnId,
  onSelect,
  onAddColumn,
  onNativeDrop,
  onAddTask,
  scopeType,
}: BoardColumnsRowProps) {
  const { t } = useTranslation()
  return (
    <SortableContext
      items={columns.map((c) => c.id)}
      strategy={horizontalListSortingStrategy}
    >
      <div className="flex items-start gap-4 pb-4">
        {columns.map((col) => (
          <SortableBoardColumn
            key={col.id}
            column={col}
            boardId={boardId}
            filter={filter}
            dragOverId={dragOverId}
            activeDragColumnId={activeDragColumnId}
            onSelect={onSelect}
            onNativeDrop={onNativeDrop}
            onAddTask={onAddTask}
            scopeType={scopeType}
          />
        ))}
        {columns.length < MAX_COLUMNS && (
          <div className="shrink-0 self-start">
            <Button
              variant="outline"
              className="text-muted-foreground hover:text-foreground h-10 w-56 justify-start gap-2 rounded-xl border-dashed"
              onClick={onAddColumn}
            >
              <Plus className="h-4 w-4" />
              {t('features.workItem.board.addAnotherColumn', 'Add another column')}
            </Button>
          </div>
        )}
      </div>
    </SortableContext>
  )
}
