import * as React from 'react'

import { localStorageTableColumnOrderPersistenceAdapter } from './tableColumnOrderPersistence'
import type {
  TableColumn,
  TableColumnOrderPersistenceConfig,
  TableColumnReorderPlacement,
} from './TableTypes'
import { moveTableColumn, normalizeTableColumnOrder, reorderTableColumns } from './tableUtils'

interface UseTableColumnOrderParams<T> {
  columns: TableColumn<T>[]
  enableColumnReordering?: boolean
  columnOrder?: string[]
  defaultColumnOrder?: string[]
  onColumnOrderChange?: (columnOrder: string[]) => void
  columnOrderPersistence?: TableColumnOrderPersistenceConfig
}

interface UseTableColumnOrderResult<T> {
  orderedColumns: TableColumn<T>[]
  columnOrder: string[]
  isColumnReorderingEnabled: boolean
  handleColumnReorder: (
    sourceColumnId: string,
    targetColumnId: string,
    placement: TableColumnReorderPlacement,
  ) => void
}

interface UseTableColumnOrderSynchronizationParams<T> {
  columns: TableColumn<T>[]
  defaultColumnOrder?: string[]
  isControlled: boolean
  hasPersistence: boolean
  persistenceKey?: string
  persistenceAdapter: TableColumnOrderPersistenceConfig['adapter'] extends infer Adapter
    ? Adapter extends undefined
      ? typeof localStorageTableColumnOrderPersistenceAdapter
      : NonNullable<Adapter>
    : never
  setInternalColumnOrder: React.Dispatch<React.SetStateAction<string[]>>
}

function getInitialColumnOrder<T>({
  columns,
  defaultColumnOrder,
  isControlled,
  controlledColumnOrder,
  hasPersistence,
  persistenceKey,
  persistenceAdapter,
}: {
  columns: TableColumn<T>[]
  defaultColumnOrder?: string[]
  isControlled: boolean
  controlledColumnOrder?: string[]
  hasPersistence: boolean
  persistenceKey?: string
  persistenceAdapter: TableColumnOrderPersistenceConfig['adapter'] extends infer Adapter
    ? Adapter extends undefined
      ? typeof localStorageTableColumnOrderPersistenceAdapter
      : NonNullable<Adapter>
    : never
}) {
  if (isControlled) {
    return normalizeTableColumnOrder(columns, controlledColumnOrder)
  }

  if (hasPersistence && persistenceKey) {
    return normalizeTableColumnOrder(
      columns,
      persistenceAdapter.load(persistenceKey) ?? defaultColumnOrder,
    )
  }

  return normalizeTableColumnOrder(columns, defaultColumnOrder)
}

function useTableColumnOrderSynchronization<T>({
  columns,
  defaultColumnOrder,
  isControlled,
  hasPersistence,
  persistenceKey,
  persistenceAdapter,
  setInternalColumnOrder,
}: UseTableColumnOrderSynchronizationParams<T>) {
  const columnIdsSignature = React.useMemo(
    () => columns.map((column) => column.id).join('|'),
    [columns],
  )
  const previousColumnIdsSignatureRef = React.useRef(columnIdsSignature)
  const previousPersistenceKeyRef = React.useRef(persistenceKey)
  const previousPersistenceAdapterRef = React.useRef(persistenceAdapter)

  React.useEffect(() => {
    if (isControlled) {
      previousColumnIdsSignatureRef.current = columnIdsSignature
      previousPersistenceKeyRef.current = persistenceKey
      previousPersistenceAdapterRef.current = persistenceAdapter
      return
    }

    if (
      hasPersistence &&
      persistenceKey &&
      (previousPersistenceKeyRef.current !== persistenceKey ||
        previousPersistenceAdapterRef.current !== persistenceAdapter)
    ) {
      previousPersistenceKeyRef.current = persistenceKey
      previousPersistenceAdapterRef.current = persistenceAdapter
      setInternalColumnOrder(
        normalizeTableColumnOrder(
          columns,
          persistenceAdapter.load(persistenceKey) ?? defaultColumnOrder,
        ),
      )
      return
    }

    if (previousColumnIdsSignatureRef.current !== columnIdsSignature) {
      previousColumnIdsSignatureRef.current = columnIdsSignature
      setInternalColumnOrder((currentColumnOrder) =>
        normalizeTableColumnOrder(columns, currentColumnOrder),
      )
    }
  }, [
    columnIdsSignature,
    columns,
    defaultColumnOrder,
    hasPersistence,
    isControlled,
    persistenceAdapter,
    persistenceKey,
    setInternalColumnOrder,
  ])
}

function useTableColumnOrderPersistence({
  hasPersistence,
  isControlled,
  normalizedColumnOrder,
  persistenceAdapter,
  persistenceKey,
}: {
  hasPersistence: boolean
  isControlled: boolean
  normalizedColumnOrder: string[]
  persistenceAdapter: TableColumnOrderPersistenceConfig['adapter'] extends infer Adapter
    ? Adapter extends undefined
      ? typeof localStorageTableColumnOrderPersistenceAdapter
      : NonNullable<Adapter>
    : never
  persistenceKey?: string
}) {
  const persistedColumnOrderSignature = React.useMemo(
    () => JSON.stringify(normalizedColumnOrder),
    [normalizedColumnOrder],
  )
  const previousPersistedColumnOrderSignatureRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!hasPersistence || !persistenceKey || isControlled) {
      previousPersistedColumnOrderSignatureRef.current = null
      return
    }

    if (previousPersistedColumnOrderSignatureRef.current === persistedColumnOrderSignature) {
      return
    }

    previousPersistedColumnOrderSignatureRef.current = persistedColumnOrderSignature
    persistenceAdapter.save(persistenceKey, normalizedColumnOrder)
  }, [
    hasPersistence,
    isControlled,
    normalizedColumnOrder,
    persistedColumnOrderSignature,
    persistenceAdapter,
    persistenceKey,
  ])
}

/**
 * Coordinates table column ordering for both controlled and uncontrolled usage.
 *
 * @template T - Row shape rendered by the table.
 * @param params - Column order configuration.
 * @returns The ordered columns and a reorder handler.
 */
export function useTableColumnOrder<T>(
  params: UseTableColumnOrderParams<T>,
): UseTableColumnOrderResult<T> {
  const {
    columns,
    enableColumnReordering = false,
    columnOrder,
    defaultColumnOrder,
    onColumnOrderChange,
    columnOrderPersistence,
  } = params
  const isControlled = columnOrder !== undefined
  const persistenceKey = columnOrderPersistence?.key
  const persistenceAdapter =
    columnOrderPersistence?.adapter ?? localStorageTableColumnOrderPersistenceAdapter
  const hasPersistence = !isControlled && Boolean(persistenceKey)
  const [internalColumnOrder, setInternalColumnOrder] = React.useState(() =>
    getInitialColumnOrder({
      columns,
      defaultColumnOrder,
      isControlled,
      controlledColumnOrder: columnOrder,
      hasPersistence,
      persistenceKey,
      persistenceAdapter,
    }),
  )

  useTableColumnOrderSynchronization({
    columns,
    defaultColumnOrder,
    isControlled,
    hasPersistence,
    persistenceKey,
    persistenceAdapter,
    setInternalColumnOrder,
  })

  const normalizedColumnOrder = React.useMemo(() => {
    if (isControlled) {
      return normalizeTableColumnOrder(columns, columnOrder)
    }

    return normalizeTableColumnOrder(columns, internalColumnOrder)
  }, [columns, columnOrder, internalColumnOrder, isControlled])

  useTableColumnOrderPersistence({
    hasPersistence,
    isControlled,
    normalizedColumnOrder,
    persistenceAdapter,
    persistenceKey,
  })

  const orderedColumns = React.useMemo(
    () => reorderTableColumns(columns, normalizedColumnOrder),
    [columns, normalizedColumnOrder],
  )

  const updateColumnOrder = React.useCallback(
    (nextColumnOrder: string[]) => {
      const normalizedNextColumnOrder = normalizeTableColumnOrder(columns, nextColumnOrder)
      if (!isControlled) {
        setInternalColumnOrder(normalizedNextColumnOrder)
      }

      onColumnOrderChange?.(normalizedNextColumnOrder)
    },
    [columns, isControlled, onColumnOrderChange],
  )

  const handleColumnReorder = React.useCallback<
    UseTableColumnOrderResult<T>['handleColumnReorder']
  >(
    (sourceColumnId, targetColumnId, placement) => {
      if (!enableColumnReordering) {
        return
      }

      const nextColumnOrder = moveTableColumn(
        normalizedColumnOrder,
        sourceColumnId,
        targetColumnId,
        placement,
      )

      if (nextColumnOrder !== normalizedColumnOrder) {
        updateColumnOrder(nextColumnOrder)
      }
    },
    [enableColumnReordering, normalizedColumnOrder, updateColumnOrder],
  )

  return {
    orderedColumns,
    columnOrder: normalizedColumnOrder,
    isColumnReorderingEnabled: enableColumnReordering,
    handleColumnReorder,
  }
}
