import { useTranslation } from 'react-i18next'

import {
  getDefaultEmptyDescription,
  getDefaultEmptyTitle,
  getSafeLoadingRowCount,
} from './tableContentUtils'
import type { TableColumn, TableColumnReorderPlacement, TableProps } from './TableTypes'
import { useTableColumnOrder } from './useTableColumnOrder'
import { useTableColumnResize } from './useTableColumnResize'
import { useTableSelectionState, type TableSelectionStateResult } from './useTableSelectionState'
import { useTableWindow } from './useTableWindow'

interface UseTableContentStateResult<T> {
  className?: string
  containerClassName?: string
  tableClassName?: string
  headerRowClassName?: string
  rowClassName?: string
  cellClassName?: string
  containerRef: React.RefObject<HTMLDivElement | null>
  containerStyle?: React.CSSProperties
  isColumnResizing: boolean
  isVirtualized: boolean
  handleScroll?: React.UIEventHandler<HTMLDivElement>
  orderedColumns: TableProps<T>['columns']
  columnWidths: Record<string, number>
  sort?: TableProps<T>['sort']
  onSortChange?: TableProps<T>['onSortChange']
  selection: TableSelectionStateResult<T>
  isColumnReorderingEnabled: boolean
  isColumnResizingEnabled: boolean
  handleColumnReorder: (
    sourceColumnId: string,
    targetColumnId: string,
    placement: TableColumnReorderPlacement,
  ) => void
  handleColumnResizePointerDown: (
    column: TableColumn<T>,
    event: React.PointerEvent<HTMLButtonElement>,
  ) => void
  handleColumnResizeKeyDown: (
    column: TableColumn<T>,
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => void
  resizingColumnId: string | null
  stickyHeader: boolean
  stickyHeaderOffset: number
  rows: TableProps<T>['rows']
  getRowKey: TableProps<T>['getRowKey']
  loading: boolean
  loadingRowsCount: number
  safeColumnSpan: number
  emptyTitle: string
  emptyDescription: string
  visibleRows: T[]
  virtualStartIndex: number
  topSpacerHeight: number
  bottomSpacerHeight: number
  pagination: TableProps<T>['pagination']
}

function buildTableContentStateResult<T>({
  props,
  selectionState,
  columnState,
  windowState,
  loadingState,
}: {
  props: TableProps<T>
  selectionState: TableSelectionStateResult<T>
  columnState: {
    isColumnResizing: boolean
    orderedColumns: TableProps<T>['columns']
    columnWidths: Record<string, number>
    sort?: TableProps<T>['sort']
    onSortChange?: TableProps<T>['onSortChange']
    isColumnReorderingEnabled: boolean
    isColumnResizingEnabled: boolean
    handleColumnReorder: (
      sourceColumnId: string,
      targetColumnId: string,
      placement: TableColumnReorderPlacement,
    ) => void
    handleColumnResizePointerDown: (
      column: TableColumn<T>,
      event: React.PointerEvent<HTMLButtonElement>,
    ) => void
    handleColumnResizeKeyDown: (
      column: TableColumn<T>,
      event: React.KeyboardEvent<HTMLButtonElement>,
    ) => void
    resizingColumnId: string | null
  }
  windowState: {
    containerRef: React.RefObject<HTMLDivElement | null>
    containerStyle?: React.CSSProperties
    isVirtualized: boolean
    handleScroll?: React.UIEventHandler<HTMLDivElement>
    visibleRows: T[]
    virtualStartIndex: number
    topSpacerHeight: number
    bottomSpacerHeight: number
  }
  loadingState: {
    safeLoadingRowCount: number
    safeColumnSpan: number
    emptyTitle: string
    emptyDescription: string
  }
}): UseTableContentStateResult<T> {
  return {
    className: props.className,
    containerClassName: props.containerClassName,
    tableClassName: props.tableClassName,
    headerRowClassName: props.headerRowClassName,
    rowClassName: props.rowClassName,
    cellClassName: props.cellClassName,
    containerRef: windowState.containerRef,
    containerStyle: windowState.containerStyle,
    isColumnResizing: columnState.isColumnResizing,
    isVirtualized: windowState.isVirtualized,
    handleScroll: windowState.handleScroll,
    orderedColumns: columnState.orderedColumns,
    columnWidths: columnState.columnWidths,
    sort: columnState.sort,
    onSortChange: columnState.onSortChange,
    selection: selectionState,
    isColumnReorderingEnabled: columnState.isColumnReorderingEnabled,
    isColumnResizingEnabled: columnState.isColumnResizingEnabled,
    handleColumnReorder: columnState.handleColumnReorder,
    handleColumnResizePointerDown: columnState.handleColumnResizePointerDown,
    handleColumnResizeKeyDown: columnState.handleColumnResizeKeyDown,
    resizingColumnId: columnState.resizingColumnId,
    stickyHeader: props.stickyHeader ?? false,
    stickyHeaderOffset: props.stickyHeaderOffset ?? 0,
    rows: props.rows,
    getRowKey: props.getRowKey,
    loading: props.loading ?? false,
    loadingRowsCount: loadingState.safeLoadingRowCount,
    safeColumnSpan: loadingState.safeColumnSpan,
    emptyTitle: loadingState.emptyTitle,
    emptyDescription: loadingState.emptyDescription,
    visibleRows: windowState.visibleRows,
    virtualStartIndex: windowState.virtualStartIndex,
    topSpacerHeight: windowState.topSpacerHeight,
    bottomSpacerHeight: windowState.bottomSpacerHeight,
    pagination: props.pagination,
  }
}

function getSafeColumnSpan(selectionEnabled: boolean, columnsLength: number) {
  return Math.max(columnsLength + (selectionEnabled ? 1 : 0), 1)
}

function useTableContentDerivedState<T>({
  rows,
  getRowKey,
  selection,
  virtualization,
  loading,
  loadingRowsCount,
  pageSize,
  orderedColumnsLength,
}: {
  rows: T[]
  getRowKey: TableProps<T>['getRowKey']
  selection: TableProps<T>['selection']
  virtualization: TableProps<T>['virtualization']
  loading: boolean
  loadingRowsCount?: number
  pageSize?: number
  orderedColumnsLength: number
}) {
  const selectionState = useTableSelectionState({ rows, getRowKey, selection })
  const {
    containerRef,
    handleScroll,
    visibleRows,
    virtualStartIndex,
    topSpacerHeight,
    bottomSpacerHeight,
    isVirtualized,
    containerStyle,
  } = useTableWindow({ rows, virtualization, loading })

  return {
    selectionState,
    containerRef,
    handleScroll,
    visibleRows,
    virtualStartIndex,
    topSpacerHeight,
    bottomSpacerHeight,
    isVirtualized,
    containerStyle,
    safeLoadingRowCount: getSafeLoadingRowCount(loadingRowsCount, pageSize),
    safeColumnSpan: getSafeColumnSpan(selectionState.isSelectionEnabled, orderedColumnsLength),
  }
}

/**
 * Computes the shared table state and render inputs.
 *
 * @template T - Row shape rendered by the table.
 * @param props - Table props.
 * @returns The computed table state.
 */
export function useTableContentState<T>(props: TableProps<T>): UseTableContentStateResult<T> {
  const {
    columns,
    rows,
    getRowKey,
    sort,
    onSortChange,
    selection,
    enableColumnReordering,
    columnOrder,
    defaultColumnOrder,
    onColumnOrderChange,
    columnOrderPersistence,
    enableColumnResizing,
    pagination,
    virtualization,
    loadingRowsCount,
    emptyTitle,
    emptyDescription,
  } = props
  const { t } = useTranslation()
  const { orderedColumns, handleColumnReorder, isColumnReorderingEnabled } = useTableColumnOrder({
    columns,
    enableColumnReordering,
    columnOrder,
    defaultColumnOrder,
    onColumnOrderChange,
    columnOrderPersistence,
  })
  const {
    columnWidths,
    isColumnResizing,
    resizingColumnId,
    handleColumnResizePointerDown,
    handleColumnResizeKeyDown,
    isColumnResizingEnabled,
  } = useTableColumnResize({
    columns: orderedColumns,
    enableColumnResizing,
  })
  const {
    selectionState,
    containerRef,
    handleScroll,
    visibleRows,
    virtualStartIndex,
    topSpacerHeight,
    bottomSpacerHeight,
    isVirtualized,
    containerStyle,
    safeLoadingRowCount,
    safeColumnSpan,
  } = useTableContentDerivedState({
    rows,
    getRowKey,
    selection,
    virtualization,
    loading: props.loading ?? false,
    loadingRowsCount,
    pageSize: pagination?.pageSize,
    orderedColumnsLength: orderedColumns.length,
  })
  return buildTableContentStateResult({
    props,
    selectionState,
    columnState: {
      isColumnResizing,
      orderedColumns,
      columnWidths,
      sort,
      onSortChange,
      isColumnReorderingEnabled,
      isColumnResizingEnabled,
      handleColumnReorder,
      handleColumnResizePointerDown,
      handleColumnResizeKeyDown,
      resizingColumnId,
    },
    windowState: {
      containerRef,
      containerStyle,
      isVirtualized,
      handleScroll: isVirtualized ? handleScroll : undefined,
      visibleRows,
      virtualStartIndex,
      topSpacerHeight,
      bottomSpacerHeight,
    },
    loadingState: {
      safeLoadingRowCount,
      safeColumnSpan,
      emptyTitle: getDefaultEmptyTitle(t, emptyTitle),
      emptyDescription: getDefaultEmptyDescription(t, emptyDescription),
    },
  })
}
