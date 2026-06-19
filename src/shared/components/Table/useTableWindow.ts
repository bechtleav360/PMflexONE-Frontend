import * as React from 'react'

import type { TableVirtualizationState } from './TableTypes'
import { getVirtualizedTableWindow } from './tableUtils'

interface UseTableWindowParams<T> {
  rows: T[]
  virtualization?: TableVirtualizationState
  loading: boolean
}

interface UseTableWindowResult<T> {
  containerRef: React.RefObject<HTMLDivElement | null>
  handleScroll: React.UIEventHandler<HTMLDivElement>
  visibleRows: T[]
  virtualStartIndex: number
  topSpacerHeight: number
  bottomSpacerHeight: number
  isVirtualized: boolean
  containerStyle?: React.CSSProperties
}

interface TableVirtualizationConfig {
  enabled: boolean
  height?: number
  rowHeight: number
  overscan: number
}

function getVirtualizationConfig(
  virtualization?: TableVirtualizationState,
): TableVirtualizationConfig {
  return {
    enabled: virtualization?.enabled ?? false,
    height: virtualization?.height,
    rowHeight: virtualization?.rowHeight ?? 56,
    overscan: virtualization?.overscan ?? 4,
  }
}

/**
 * Coordinates the virtualized table viewport state.
 *
 * @template T - Row shape rendered by the table.
 * @param params - Virtualization inputs.
 * @param params.rows - Full row list.
 * @param params.virtualization - Optional virtualization configuration.
 * @param params.loading - Whether the table is currently loading.
 * @returns The scroll container ref and derived virtualization window.
 */
export function useTableWindow<T>({
  rows,
  virtualization,
  loading,
}: UseTableWindowParams<T>): UseTableWindowResult<T> {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)

  const {
    enabled: isVirtualized,
    height,
    rowHeight,
    overscan,
  } = getVirtualizationConfig(virtualization)
  const containerStyle = isVirtualized ? { height } : undefined

  const handleScroll = React.useCallback<React.UIEventHandler<HTMLDivElement>>(() => {
    setScrollTop(containerRef.current?.scrollTop ?? 0)
  }, [])

  if (!isVirtualized || loading) {
    return {
      containerRef,
      handleScroll,
      visibleRows: rows,
      virtualStartIndex: 0,
      topSpacerHeight: 0,
      bottomSpacerHeight: 0,
      isVirtualized,
      containerStyle,
    }
  }

  const { visibleRows, virtualStartIndex, topSpacerHeight, bottomSpacerHeight } =
    getVirtualizedTableWindow({
      rows,
      scrollTop,
      rowHeight,
      overscan,
      viewportHeight: virtualization?.height ?? 0,
    })

  return {
    containerRef,
    handleScroll,
    visibleRows,
    virtualStartIndex,
    topSpacerHeight,
    bottomSpacerHeight,
    isVirtualized,
    containerStyle,
  }
}
