import { useCallback, useMemo } from 'react'
import type { Key } from 'react'

import { useTranslation } from 'react-i18next'

import type { TableSelectionMode, TableSelectionState } from './TableTypes'

interface UseTableSelectionStateOptions<T> {
  rows: T[]
  getRowKey: (row: T, index: number) => Key
  selection?: TableSelectionState<T>
}

/**
 * Derived row-selection state for the shared table.
 *
 * @template T - Row shape rendered by the table.
 * @property selectionMode - Active selection mode.
 * @property isSelectionEnabled - Whether the selection column should render.
 * @property isSelectionInteractive - Whether selection changes can be emitted.
 * @property selectedRowKeys - Normalized controlled selection keys.
 * @property selectedRowKeySet - Normalized controlled selection keys as a set.
 * @property selectableRowKeys - Keys for rows that may be selected.
 * @property selectableRowKeySet - Keys for rows that may be selected as a set.
 * @property allSelectableRowsSelected - Whether all selectable rows are selected.
 * @property someSelectableRowsSelected - Whether some selectable rows are selected.
 * @property selectAllLabel - Localized label for the select-all control.
 * @property selectRowLabel - Localized label for an individual selection control.
 * @property isRowSelectable - Determines whether a row can be selected.
 * @property isRowSelected - Determines whether a row is currently selected.
 * @property getRowSelectionLabel - Returns the localized label for a row selection control.
 * @property handleRowSelectionChange - Updates the selection for a single row.
 * @property handleSelectAllChange - Updates the selection for all selectable rows.
 */
export interface TableSelectionStateResult<T> {
  selectionMode: TableSelectionMode
  isSelectionEnabled: boolean
  isSelectionInteractive: boolean
  selectedRowKeys: Key[]
  selectedRowKeySet: Set<Key>
  selectableRowKeys: Key[]
  selectableRowKeySet: Set<Key>
  allSelectableRowsSelected: boolean
  someSelectableRowsSelected: boolean
  selectAllLabel: string
  selectRowLabel: string
  isRowSelectable: (row: T, index: number) => boolean
  isRowSelected: (row: T, index: number) => boolean
  getRowSelectionLabel: (row: T, index: number) => string
  handleRowSelectionChange: (row: T, index: number, checked: boolean) => void
  handleSelectAllChange: (checked: boolean) => void
}

function getNormalizedSelectedRowKeys(selectionMode: TableSelectionMode, selectedRowKeys: Key[]) {
  if (selectionMode === 'single') {
    return selectedRowKeys.slice(0, 1)
  }

  return selectedRowKeys
}

function getSelectableRowKeys<T>(
  rows: T[],
  getRowKey: (row: T, index: number) => Key,
  isRowSelectable: (row: T, index: number) => boolean,
) {
  return rows.reduce<Key[]>((accumulator, row, index) => {
    if (!isRowSelectable(row, index)) {
      return accumulator
    }

    accumulator.push(getRowKey(row, index))

    return accumulator
  }, [])
}

function createRowSelectionChangeHandler<T>({
  getRowKey,
  isRowSelectable,
  isSelectionInteractive,
  normalizedSelectedRowKeys,
  emitSelectedRowKeysChange,
  selectionMode,
}: {
  getRowKey: (row: T, index: number) => Key
  isRowSelectable: (row: T, index: number) => boolean
  isSelectionInteractive: boolean
  normalizedSelectedRowKeys: Key[]
  emitSelectedRowKeysChange: (selectedRowKeys: Key[]) => void
  selectionMode: TableSelectionMode
}) {
  return (row: T, index: number, checked: boolean) => {
    if (!isSelectionInteractive || !isRowSelectable(row, index)) {
      return
    }

    const rowKey = getRowKey(row, index)

    if (selectionMode === 'single') {
      emitSelectedRowKeysChange(checked ? [rowKey] : [])
      return
    }

    if (checked) {
      emitSelectedRowKeysChange(
        normalizedSelectedRowKeys.includes(rowKey)
          ? normalizedSelectedRowKeys
          : [...normalizedSelectedRowKeys, rowKey],
      )
      return
    }

    emitSelectedRowKeysChange(
      normalizedSelectedRowKeys.filter((selectedRowKey) => selectedRowKey !== rowKey),
    )
  }
}

function createSelectAllChangeHandler({
  isSelectionInteractive,
  normalizedSelectedRowKeys,
  selectableRowKeys,
  selectedRowKeySet,
  emitSelectedRowKeysChange,
  selectionMode,
}: {
  isSelectionInteractive: boolean
  normalizedSelectedRowKeys: Key[]
  selectableRowKeys: Key[]
  selectedRowKeySet: Set<Key>
  emitSelectedRowKeysChange: (selectedRowKeys: Key[]) => void
  selectionMode: TableSelectionMode
}) {
  return (checked: boolean) => {
    if (!isSelectionInteractive || selectionMode !== 'multiple') {
      return
    }

    if (checked) {
      const nextSelectedRowKeys = [
        ...normalizedSelectedRowKeys,
        ...selectableRowKeys.filter((rowKey) => !selectedRowKeySet.has(rowKey)),
      ]

      emitSelectedRowKeysChange(nextSelectedRowKeys)
      return
    }

    emitSelectedRowKeysChange(
      normalizedSelectedRowKeys.filter(
        (selectedRowKey) => !selectableRowKeys.includes(selectedRowKey),
      ),
    )
  }
}

/**
 * Computes the controlled row-selection state for the shared table.
 *
 * @template T - Row shape rendered by the table.
 * @param options - Selection inputs.
 * @returns The derived selection helpers and labels.
 */
export function useTableSelectionState<T>(
  options: UseTableSelectionStateOptions<T>,
): TableSelectionStateResult<T> {
  const { rows, getRowKey, selection } = options
  const { t } = useTranslation()
  const isRowSelectableOverride = selection?.isRowSelectable
  const getRowSelectionLabelOverride = selection?.getRowSelectionLabel
  const onSelectedRowKeysChange = selection?.onSelectedRowKeysChange
  const selectionMode = selection?.mode ?? 'none'
  const isSelectionEnabled = selectionMode !== 'none'
  const isSelectionInteractive = isSelectionEnabled && Boolean(onSelectedRowKeysChange)
  const normalizedSelectedRowKeys = useMemo(() => {
    const selectedRowKeys = selection?.selectedRowKeys ?? []

    return getNormalizedSelectedRowKeys(selectionMode, selectedRowKeys)
  }, [selection?.selectedRowKeys, selectionMode])
  const selectedRowKeySet = useMemo(
    () => new Set(normalizedSelectedRowKeys),
    [normalizedSelectedRowKeys],
  )
  const isRowSelectable = useCallback(
    (row: T, index: number) => isRowSelectableOverride?.(row, index) ?? true,
    [isRowSelectableOverride],
  )
  const selectableRowKeys = useMemo(
    () => getSelectableRowKeys(rows, getRowKey, isRowSelectable),
    [getRowKey, isRowSelectable, rows],
  )
  const selectableRowKeySet = useMemo(() => new Set(selectableRowKeys), [selectableRowKeys])
  const allSelectableRowsSelected =
    selectableRowKeys.length > 0 &&
    selectableRowKeys.every((rowKey) => selectedRowKeySet.has(rowKey))
  const someSelectableRowsSelected =
    selectableRowKeys.some((rowKey) => selectedRowKeySet.has(rowKey)) && !allSelectableRowsSelected
  const emitSelectedRowKeysChange = (nextSelectedRowKeys: Key[]) => {
    onSelectedRowKeysChange?.(nextSelectedRowKeys)
  }
  const getRowSelectionLabel = (row: T, index: number) =>
    getRowSelectionLabelOverride?.(row, index) ?? t('shared.table.selectRow')
  const isRowSelected = (row: T, index: number) => selectedRowKeySet.has(getRowKey(row, index))
  const handleRowSelectionChange = createRowSelectionChangeHandler({
    getRowKey,
    isRowSelectable,
    isSelectionInteractive,
    normalizedSelectedRowKeys,
    emitSelectedRowKeysChange,
    selectionMode,
  })
  const handleSelectAllChange = createSelectAllChangeHandler({
    isSelectionInteractive,
    normalizedSelectedRowKeys,
    selectableRowKeys,
    selectedRowKeySet,
    emitSelectedRowKeysChange,
    selectionMode,
  })

  return {
    selectionMode,
    isSelectionEnabled,
    isSelectionInteractive,
    selectedRowKeys: normalizedSelectedRowKeys,
    selectedRowKeySet,
    selectableRowKeys,
    selectableRowKeySet,
    allSelectableRowsSelected,
    someSelectableRowsSelected,
    selectAllLabel: t('shared.table.selectAllRows'),
    selectRowLabel: t('shared.table.selectRow'),
    isRowSelectable,
    isRowSelected,
    getRowSelectionLabel,
    handleRowSelectionChange,
    handleSelectAllChange,
  }
}
