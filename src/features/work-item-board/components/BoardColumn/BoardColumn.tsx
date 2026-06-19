import { useEffect, useRef, useState } from 'react'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import type { BoardColumn as BoardColumnType } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { useUpdateBoardColumnInline } from '../../hooks/useUpdateBoardColumnInline'
import { BoardCard } from '../BoardCard'
import { ColumnFooter } from './ColumnFooter'
import { ColumnHeader } from './ColumnHeader'

/**
 * Manages inline column name editing state and keyboard commit/cancel behaviour.
 * @param column - The board column whose name is being edited.
 * @param mutateAsync - Async mutation function that persists the updated column name.
 * @returns Refs, state, and handlers for the inline name edit UI.
 */
function useColumnNameEdit(
  column: BoardColumnType,
  mutateAsync: (args: { id: string; input: { name: string; version: number } }) => Promise<unknown>,
) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(column.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.select()
  }, [isEditing])

  function handleNameClick() {
    setEditValue(column.name)
    setIsEditing(true)
  }

  async function handleSave() {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== column.name) {
      try {
        await mutateAsync({ id: column.id, input: { name: trimmed, version: column.version } })
      } catch {
        /* hook handles toast */
      }
    }
    setIsEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleSave()
    }
    if (e.key === 'Escape') {
      setEditValue(column.name)
      setIsEditing(false)
    }
  }

  return {
    isEditing,
    editValue,
    setEditValue,
    inputRef,
    handleNameClick,
    handleSave,
    handleKeyDown,
  }
}

/**
 * Handles native HTML5 drag-over and drop events for file or card drops onto a column.
 * @param columnId - The ID of the column receiving the drop.
 * @param onNativeDrop - Optional callback invoked when a work item is dropped onto this column.
 * @returns Drag event handlers and hover state flags for the column.
 */
function useNativeDrop(
  columnId: string,
  onNativeDrop?: (workItemId: string, version: number, columnId: string) => void,
) {
  const [isNativeDragOver, setIsNativeDragOver] = useState(false)
  // Highlights the column during pool→board dnd-kit drag (pointer-events reach the column
  // because the DragOverlay has pointer-events:none). A pressed button (buttons===1) while
  // entering the column signals the user is mid-drag and hovering here.
  const [isPoolDragOver, setIsPoolDragOver] = useState(false)

  function handleDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('text/work-item-id')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setIsNativeDragOver(true)
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsNativeDragOver(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    setIsNativeDragOver(false)
    const workItemId = e.dataTransfer.getData('text/work-item-id')
    const version = parseInt(e.dataTransfer.getData('text/work-item-version'), 10)
    if (workItemId && !isNaN(version)) {
      onNativeDrop?.(workItemId, version, columnId)
    }
  }

  function handlePointerEnter(e: React.PointerEvent) {
    if (e.buttons === 1) setIsPoolDragOver(true)
  }

  function handlePointerLeave() {
    setIsPoolDragOver(false)
  }
  function handlePointerUp() {
    setIsPoolDragOver(false)
  }

  return {
    isNativeDragOver,
    isPoolDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerUp,
  }
}

interface BoardColumnProps {
  column: BoardColumnType
  boardId: string
  dragOverId?: string | null
  isCardDragOver?: boolean
  onSelect?: (workItemId: string) => void
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
  onNativeDrop?: (workItemId: string, version: number, columnId: string) => void
  onAddTask?: () => void
  scopeType?: ScopeType
}

/**
 * Droppable column in the work-item board, containing sortable work-item cards.
 * @param root0 - Component props.
 * @param root0.column - The board column to render.
 * @param root0.boardId - ID of the parent board.
 * @param root0.dragOverId - ID of the item currently being dragged over.
 * @param root0.isCardDragOver - Whether a card is currently dragged over this column.
 * @param root0.onSelect - Called when the user clicks a card to open the detail panel.
 * @param root0.dragHandleProps - Props forwarded to the column drag handle.
 * @param root0.isDragging - Whether this column is currently being dragged.
 * @param root0.onNativeDrop - Called when a work item is dropped via native HTML5 drag.
 * @param root0.onAddTask - Called when the user clicks the "Add a task" button.
 * @param root0.scopeType - The scope entity type, forwarded to each board card.
 * @returns The column element.
 */
export function BoardColumn({
  column,
  boardId,
  dragOverId,
  isCardDragOver = false,
  onSelect,
  dragHandleProps,
  isDragging,
  onNativeDrop,
  onAddTask,
  scopeType,
}: BoardColumnProps) {
  const { t } = useTranslation()
  const { mutateAsync, isPending } = useUpdateBoardColumnInline(boardId)
  const {
    isEditing,
    editValue,
    setEditValue,
    inputRef,
    handleNameClick,
    handleSave,
    handleKeyDown,
  } = useColumnNameEdit(column, mutateAsync)
  const {
    isNativeDragOver,
    isPoolDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerUp,
  } = useNativeDrop(column.id, onNativeDrop)

  const items = (column.workItems ?? [])
    .filter((wi) => !wi.archived)
    .sort((a, b) => {
      const sa = a.position ?? Number.MAX_SAFE_INTEGER
      const sb = b.position ?? Number.MAX_SAFE_INTEGER
      return sa !== sb ? sa - sb : a.createdAt.localeCompare(b.createdAt)
    })

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- HTML5 pointer-only drop target; keyboard D&D handled by dnd-kit's KeyboardSensor at card level
    <div
      role="group"
      data-column-id={column.id}
      aria-label={t('features.workItem.board.columnGroup', { name: column.name })}
      className={`border-border bg-background flex max-w-75 min-w-60 flex-col rounded-md border transition-all duration-150 ${isCardDragOver || isNativeDragOver || isPoolDragOver ? 'ring-primary bg-primary/10 scale-[1.02] ring-2' : ''} ${isDragging ? 'opacity-40' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
    >
      <ColumnHeader
        column={column}
        isEditing={isEditing}
        editValue={editValue}
        inputRef={inputRef}
        isPending={isPending}
        itemCount={items.length}
        dragHandleProps={dragHandleProps}
        setEditValue={setEditValue}
        onSave={handleSave}
        onKeyDown={handleKeyDown}
        onNameClick={handleNameClick}
      />

      <SortableContext
        items={items.map((wi) => wi.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          role="group"
          className="flex max-h-[calc(100vh-14rem)] flex-col gap-2 overflow-y-auto p-2"
          aria-label={t('features.workItem.board.columnDropZone', { name: column.name })}
        >
          {items.map((wi) => (
            <BoardCard
              key={wi.id}
              workItem={wi}
              isDropTarget={dragOverId === wi.id}
              onSelect={onSelect}
              currentBoardId={boardId}
              scopeType={scopeType}
            />
          ))}
        </div>
      </SortableContext>

      <ColumnFooter onAddTask={onAddTask} />
    </div>
  )
}
