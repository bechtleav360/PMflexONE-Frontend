import { type ReactNode, type RefObject } from 'react'

import { SortableContext } from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'

import type { FlatRow, TreeNodeBase } from './treeRows'

// ─── VirtualBody ─────────────────────────────────────────────────────────────

/**
 * Props for the `VirtualBody` component.
 * Separated from `TreeView` so the virtualizer mounts only after the outer
 * scroll element is known — ensuring scroll listeners attach to a real element.
 */
interface VirtualBodyProps {
  scrollEl: HTMLElement
  scrollMargin: number
  flatRows: FlatRow[]
  sortableIds: string[]
  ariaLabel: string
  renderRow: (node: TreeNodeBase, level: number, posInSet: number, setSize: number) => ReactNode
  listRef: RefObject<HTMLDivElement | null>
}

/**
 * Renders the virtualised tree rows.
 *
 * Intentionally a separate component so `useVirtualizer` is only called after
 * `scrollEl` is resolved — the virtualizer's internal `_didMount` attaches
 * scroll listeners at mount time, so the element must be non-null on first mount.
 *
 * @param props - Component props (see `VirtualBodyProps`).
 * @returns The `role="tree"` container with only the visible rows in the DOM.
 */
export function VirtualBody({
  scrollEl,
  scrollMargin,
  flatRows,
  sortableIds,
  ariaLabel,
  renderRow,
  listRef,
}: VirtualBodyProps) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns non-memoizable functions; React Compiler skips this component automatically
  const virtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => scrollEl,
    // Row height: py-1 (4+4px) + size-6 kebab content (24px) = 32px.
    estimateSize: () => 32,
    overscan: 8,
    scrollMargin,
  })

  return (
    <SortableContext items={sortableIds}>
      {/* position:relative + explicit total height lets the outer scroll
          container know the full scrollable extent of the tree. Only the
          rows currently in view are mounted as position:absolute children. */}
      <div
        ref={listRef}
        role="tree"
        aria-label={ariaLabel}
        // getTotalSize() already excludes scrollMargin (= total item height only).
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const row = flatRows[virtualItem.index]
          return (
            <div
              key={row.id}
              role="presentation"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                // virtualItem.start is in scroll-container coordinates (includes scrollMargin).
                // Subtract scrollMargin to get position relative to this container's top.
                transform: `translateY(${virtualItem.start - scrollMargin}px)`,
              }}
            >
              {renderRow(row.node, row.level, row.posInSet, row.setSize)}
            </div>
          )
        })}
      </div>
    </SortableContext>
  )
}
