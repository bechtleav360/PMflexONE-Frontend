import type * as React from 'react'

import type { TableColumn } from './TableTypes'
import { getTableColumnInitialWidth, TABLE_COLUMN_RESIZE_STEP } from './tableUtils'

interface CreateResizePointerHandlerParams<T> {
  enabled: boolean
  columnWidthsRef: React.RefObject<Record<string, number>>
  setColumnWidth: (column: TableColumn<T>, width: number) => void
  setResizingColumnId: React.Dispatch<React.SetStateAction<string | null>>
}

interface CreateResizeKeyHandlerParams<T> {
  enabled: boolean
  columnWidthsRef: React.RefObject<Record<string, number>>
  setColumnWidth: (column: TableColumn<T>, width: number) => void
}

/**
 * Creates the pointer-driven resize handler used by the shared table.
 *
 * @template T - Row shape rendered by the table.
 * @param params - Resize handler dependencies.
 * @returns A pointer-down handler.
 */
export function createTableColumnResizePointerDownHandler<T>(
  params: CreateResizePointerHandlerParams<T>,
) {
  const { enabled, columnWidthsRef, setColumnWidth, setResizingColumnId } = params

  return (column: TableColumn<T>, event: React.PointerEvent<HTMLButtonElement>) => {
    if (!enabled || column.resizable === false) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const startWidth = columnWidthsRef.current[column.id] ?? getTableColumnInitialWidth(column)
    const startX = event.clientX
    const pointerId = event.pointerId
    const resizeTarget = event.currentTarget

    const cleanup = () => {
      setResizingColumnId(null)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    const handlePointerMove = (pointerMoveEvent: PointerEvent) => {
      if (pointerMoveEvent.pointerId !== pointerId) {
        return
      }

      setColumnWidth(column, startWidth + (pointerMoveEvent.clientX - startX))
    }

    const handlePointerUp = (pointerUpEvent: PointerEvent) => {
      if (pointerUpEvent.pointerId !== pointerId) {
        return
      }

      cleanup()
    }

    resizeTarget.setPointerCapture(pointerId)
    setResizingColumnId(column.id)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }
}

/**
 * Creates the keyboard-driven resize handler used by the shared table.
 *
 * @template T - Row shape rendered by the table.
 * @param params - Resize handler dependencies.
 * @returns A keyboard handler.
 */
export function createTableColumnResizeKeyDownHandler<T>(params: CreateResizeKeyHandlerParams<T>) {
  const { enabled, columnWidthsRef, setColumnWidth } = params

  return (column: TableColumn<T>, event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!enabled || column.resizable === false) {
      return
    }

    const currentWidth = columnWidthsRef.current[column.id] ?? getTableColumnInitialWidth(column)

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setColumnWidth(column, currentWidth - TABLE_COLUMN_RESIZE_STEP)
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setColumnWidth(column, currentWidth + TABLE_COLUMN_RESIZE_STEP)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setColumnWidth(column, column.minWidth ?? getTableColumnInitialWidth(column))
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      if (column.maxWidth !== undefined) {
        setColumnWidth(column, column.maxWidth)
      }
    }
  }
}
