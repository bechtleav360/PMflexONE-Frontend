import { GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BoardColumn as BoardColumnType } from '@/entities/work-item'
import { WorkItemStatusBadge } from '@/entities/work-item'

/** Props for the ColumnHeader component. */
export interface ColumnHeaderProps {
  column: BoardColumnType
  isEditing: boolean
  editValue: string
  inputRef: React.RefObject<HTMLInputElement | null>
  isPending: boolean
  itemCount: number
  dragHandleProps?: Record<string, unknown>
  setEditValue: (v: string) => void
  onSave: () => Promise<void>
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onNameClick: () => void
}

/**
 * Header row of a board column showing drag handle, editable name, status badge, and item count.
 * @param root0 - Component props.
 * @param root0.column - The column being rendered.
 * @param root0.isEditing - Whether the name field is in edit mode.
 * @param root0.editValue - Current value of the name input.
 * @param root0.inputRef - Ref forwarded to the name input element.
 * @param root0.isPending - Whether a name-update mutation is in flight.
 * @param root0.itemCount - Number of work items in the column.
 * @param root0.dragHandleProps - Props forwarded to the column drag-handle span.
 * @param root0.setEditValue - Updates the name input value.
 * @param root0.onSave - Commits the inline name edit.
 * @param root0.onKeyDown - Handles Enter/Escape in the name input.
 * @param root0.onNameClick - Activates inline editing when the name is clicked.
 * @returns The column header element.
 */
export function ColumnHeader({
  column,
  isEditing,
  editValue,
  inputRef,
  isPending,
  itemCount,
  dragHandleProps,
  setEditValue,
  onSave,
  onKeyDown,
  onNameClick,
}: ColumnHeaderProps) {
  const { t } = useTranslation()
  return (
    <div className="bg-muted flex shrink-0 items-center justify-between rounded-t-md px-3 py-2">
      {dragHandleProps && (
        <span
          {...(dragHandleProps as React.HTMLAttributes<HTMLSpanElement>)}
          className="text-muted-foreground hover:text-foreground mr-1 shrink-0 cursor-grab active:cursor-grabbing"
          aria-label={t('features.workItem.board.dragColumn', 'Drag to reorder column')}
        >
          <GripVertical className="h-4 w-4" />
        </span>
      )}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => void onSave()}
          onKeyDown={onKeyDown}
          disabled={isPending}
          className="border-primary bg-background focus:ring-primary min-w-0 flex-1 rounded border px-1 py-0.5 text-sm font-semibold outline-none focus:ring-1"
          aria-label={t('features.workItem.board.editColumnNameInline', 'Edit column name')}
        />
      ) : (
        <button
          type="button"
          className="hover:text-primary cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold transition-colors"
          onClick={onNameClick}
          title={t('features.workItem.board.clickToRenameColumn', 'Click to rename')}
        >
          {column.name}
        </button>
      )}
      <div className="ml-2 flex shrink-0 items-center gap-2">
        <WorkItemStatusBadge status={column.workItemStatus} />
        <span
          className="text-muted-foreground text-xs"
          aria-label={t('features.workItem.board.columnItemCount', { count: itemCount })}
        >
          {itemCount}
        </span>
      </div>
    </div>
  )
}
