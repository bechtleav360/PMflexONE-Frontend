import { useId, type KeyboardEvent, type PointerEvent } from 'react'

import { cn } from '@/shared/lib/utils'

import type { TableColumn } from './TableTypes'
import { getTableColumnLabel } from './tableUtils'

interface TableHeaderResizeHandleProps<T> {
  column: TableColumn<T>
  isResizing: boolean
  onPointerDown: (column: TableColumn<T>, event: PointerEvent<HTMLButtonElement>) => void
  onKeyDown: (column: TableColumn<T>, event: KeyboardEvent<HTMLButtonElement>) => void
  keyboardHelpText: string
  t: (key: string, options?: { label: string }) => string
}

/**
 * Renders the drag handle used for table column resizing.
 *
 * @template T - Row shape rendered by the table.
 * @param props - Resize handle inputs.
 * @returns The resize handle or null.
 */
export function TableHeaderResizeHandle<T>(props: TableHeaderResizeHandleProps<T>) {
  const { column, isResizing, onPointerDown, onKeyDown, keyboardHelpText, t } = props
  const keyboardHelpTextId = useId()

  if (column.resizable === false) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          'focus-visible:ring-ring absolute top-0 right-0 bottom-0 z-10 inline-flex w-4 cursor-col-resize touch-none items-center justify-center border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
          isResizing ? 'bg-primary/20' : 'hover:bg-primary/10',
        )}
        onPointerDown={(event) => onPointerDown(column, event)}
        onKeyDown={(event) => onKeyDown(column, event)}
        aria-label={t('shared.table.resizeColumn', { label: getTableColumnLabel(column) })}
        aria-describedby={keyboardHelpTextId}
      />
      <span
        id={keyboardHelpTextId}
        className="sr-only"
      >
        {keyboardHelpText}
      </span>
    </>
  )
}
