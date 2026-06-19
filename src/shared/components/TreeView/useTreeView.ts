import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import { getFlatVisibleRows } from './treeRows'
import type { FlatRow, TreeNodeBase } from './treeRows'

interface UseTreeViewInput {
  nodes: TreeNodeBase[]
  expandedIds: Set<string>
  activeDragId?: string | null
  activeDragValidIds?: string[]
  isLoading?: boolean
}

interface UseTreeViewResult {
  mountRef: RefObject<HTMLDivElement | null>
  listRef: RefObject<HTMLDivElement | null>
  scrollEl: HTMLElement | null
  scrollMargin: number
  sensors: ReturnType<typeof useSensors>
  flatRows: FlatRow[]
  sortableIds: string[]
}

/**
 * Internal state hook for `TreeView`.
 *
 * Encapsulates scroll-container discovery, scroll-margin measurement, sensor
 * setup, and flattened/sortable row derivation — keeping `TreeView` under the
 * `max-lines-per-function` threshold.
 *
 * @param props - Hook inputs (see `UseTreeViewInput`).
 * @returns Refs, scroll state, sensors, and derived row data.
 */
export function useTreeView({
  nodes,
  expandedIds,
  activeDragId,
  activeDragValidIds,
  isLoading,
}: UseTreeViewInput): UseTreeViewResult {
  // Ref on the root div — used as the starting point for scroll ancestor discovery.
  const mountRef = useRef<HTMLDivElement>(null)
  // Ref on the role="tree" container inside VirtualBody — used to measure scrollMargin.
  const listRef = useRef<HTMLDivElement>(null)

  // Outer scroll container discovered by walking up the DOM.
  // null on first render; set synchronously in useLayoutEffect before browser paints.
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)
  // Distance (px) from the top of scrollEl to the top of the tree list.
  // Accounts for any content above the list (breadcrumb, page header, toolbar).
  // Used as the virtualizer's scrollMargin so visible-row calculation is correct.
  const [scrollMargin, setScrollMargin] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const flatRows = useMemo(() => getFlatVisibleRows(nodes, expandedIds), [nodes, expandedIds])

  // When a drag is active and valid targets are provided, restrict the SortableContext
  // to only those IDs so non-siblings never shift or register as drop targets.
  // IMPORTANT: filter flatRows (visual order) — do NOT use activeDragValidIds directly,
  // whose order follows server/flat order which may differ from visual order.
  // activeIndex/overIndex from useSortable are positional within this array, so wrong
  // order produces an inverted indicator direction.
  const sortableIds = useMemo(() => {
    if (activeDragId && activeDragValidIds) {
      const validSet = new Set(activeDragValidIds)
      return flatRows.filter((r) => validSet.has(r.id)).map((r) => r.id)
    }
    return flatRows.map((r) => r.id)
  }, [activeDragId, activeDragValidIds, flatRows])

  // Reset body cursor on unmount — guard against the component disappearing mid-drag
  useEffect(
    () => () => {
      document.body.style.cursor = ''
    },
    [],
  )

  // Walk up the DOM to find the nearest scrollable ancestor.
  // useLayoutEffect fires synchronously before paint → VirtualBody mounts with
  // a real scrollEl in the same browser frame, avoiding any visible flash.
  // Falls back to document.scrollingElement when no explicit overflow ancestor
  // exists (e.g. layouts that rely on the default page scroll).
  //
  // setState is called synchronously here intentionally: this is a one-time
  // DOM measurement (empty deps) that must resolve before the browser paints so
  // VirtualBody receives a non-null scrollEl on its first mount. It triggers
  // exactly one additional render per tree mount — not a cascading loop.
  useLayoutEffect(() => {
    let el: HTMLElement | null = mountRef.current?.parentElement ?? null
    while (el) {
      const { overflowY } = window.getComputedStyle(el)
      if (overflowY === 'scroll' || overflowY === 'auto') {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM traversal must run inside useLayoutEffect to read computed styles after paint; the setState is guarded by a return so it fires at most once per mount
        setScrollEl(el)
        return
      }
      el = el.parentElement
    }
    // Fallback: use the document-level scroll container
    const docScrollEl = document.scrollingElement
    if (docScrollEl instanceof HTMLElement) {
      setScrollEl(docScrollEl)
    }
  }, [])

  // Once scrollEl is known AND VirtualBody has mounted (listRef is populated),
  // compute how far the list sits from the scroll container's origin.
  // This fires after the re-render that mounts VirtualBody, so listRef.current is set.
  //
  // `isLoading` and `nodes.length` are included so the margin is recalculated when
  // VirtualBody mounts for the first time after a loading → data transition: scrollEl
  // may already be set (from the initial mount effect) while VirtualBody is not yet in
  // the DOM, so [scrollEl] alone would leave scrollMargin at 0 permanently.
  useLayoutEffect(() => {
    if (!scrollEl || !listRef.current) return
    const listRect = listRef.current.getBoundingClientRect()
    const scrollRect = scrollEl.getBoundingClientRect()
    setScrollMargin(listRect.top - scrollRect.top + scrollEl.scrollTop)
  }, [scrollEl, isLoading, nodes.length])

  return { mountRef, listRef, scrollEl, scrollMargin, sensors, flatRows, sortableIds }
}
