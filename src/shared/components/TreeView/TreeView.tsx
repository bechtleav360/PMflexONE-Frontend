import { useMemo, type ReactNode } from 'react'

import { closestCenter, DndContext, DragOverlay, type DragEndEvent } from '@dnd-kit/core'
import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription, Button, Card, CardContent, Skeleton } from '@/shared/components'

import type { TreeNodeBase } from './treeRows'
import { useTreeView } from './useTreeView'
import { VirtualBody } from './VirtualBody'

export type { TreeNodeBase } from './treeRows'

/**
 * Props for the `TreeView` component.
 *
 * @property nodes - Top-level nodes to render.
 * @property isLoading - Whether a loading skeleton should be shown instead of the tree.
 * @property isError - Whether an error alert should be shown instead of the tree.
 * @property errorMessage - Message displayed inside the error alert.
 * @property emptyState - Rendered when `nodes` is empty and not loading/error.
 * @property toolbar - Optional toolbar rendered above the tree (to the right of expand/collapse).
 * @property ariaLabel - ARIA label for the `role="tree"` container.
 * @property expandedIds - Set of expanded node IDs — drives which rows are visible.
 * @property onExpandAll - Called with all node IDs when "Expand All" is clicked.
 * @property onCollapseAll - Called when "Collapse All" is clicked.
 * @property expandAllLabel - Label for the "Expand All" button.
 * @property collapseAllLabel - Label for the "Collapse All" button.
 * @property activeDragId - ID of the node currently being dragged, or null.
 * @property activeDragValidIds - When a drag is active, the IDs that may participate in
 *   the sort (typically the siblings of the dragged item). Non-members keep their position.
 *   When omitted all visible nodes are sortable (default behaviour).
 * @property onSetActiveDragId - Called when `activeDragId` should change.
 * @property onDragEnd - Forwarded to `DndContext.onDragEnd`.
 * @property renderRow - Renders one visible row given its node and flat position metadata.
 * @property renderDragOverlay - Content rendered inside `DragOverlay` while a drag is active.
 */
export interface TreeViewProps {
  nodes: TreeNodeBase[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  emptyState?: ReactNode
  toolbar?: ReactNode
  ariaLabel: string
  expandedIds: Set<string>
  /** Called with all node IDs when "Expand All" is clicked. */
  onExpandAll?: (allNodeIds: string[]) => void
  /** Called when "Collapse All" is clicked. */
  onCollapseAll?: () => void
  /** Label for the "Expand All" button. */
  expandAllLabel?: string
  /** Label for the "Collapse All" button. */
  collapseAllLabel?: string
  activeDragId?: string | null
  activeDragValidIds?: string[]
  onSetActiveDragId?: (id: string | null) => void
  onDragEnd?: (event: DragEndEvent) => void
  renderRow: (node: TreeNodeBase, level: number, posInSet: number, setSize: number) => ReactNode
  renderDragOverlay?: (nodeId: string) => ReactNode
}

// ─── TreeView ────────────────────────────────────────────────────────────────

/** Middle-dot used as visual separator between expand/collapse toolbar actions. */
const TOOLBAR_SEPARATOR = '·'

/**
 * Recursively collects all node IDs and parent node IDs from a tree.
 *
 * @param nodes - Nodes to traverse.
 * @param allIds - Accumulator for every node ID in the tree.
 * @param parentIds - Accumulator for IDs of nodes that have children.
 */
function collectNodeIds(nodes: TreeNodeBase[], allIds: string[], parentIds: Set<string>): void {
  for (const node of nodes) {
    allIds.push(node.id)
    if (node.childNodes.length > 0) {
      parentIds.add(node.id)
      collectNodeIds(node.childNodes, allIds, parentIds)
    }
  }
}

/**
 * Generic drag-and-drop virtualised tree container.
 *
 * Owns the `DndContext`, `SortableContext`, and `useVirtualizer` for the entire
 * tree. All visible nodes are flattened into an ordered list via
 * {@link getFlatVisibleRows} and rendered through a TanStack Virtual window so
 * that only the rows currently in view are mounted — making performance
 * independent of tree size.
 *
 * The virtualizer uses the nearest scrollable ancestor (discovered via
 * `useLayoutEffect` DOM traversal) as its scroll container. This keeps the
 * standard page-level scroll UX — no inner scrollbar is added to the tree.
 * `scrollMargin` is computed from the list's offset within the scroll container
 * so the virtualizer correctly determines which rows are in the viewport even
 * when content (header, toolbar) sits above the tree.
 *
 * Loading / error / empty states are rendered instead of the tree when active.
 * All domain-specific rendering is delegated to `renderRow` and
 * `renderDragOverlay` render props so the component can be reused across features.
 *
 * @param props - Component props (see `TreeViewProps` for all fields).
 * @returns The rendered tree with DnD context, toolbar, and loading/error states.
 * @see TreeViewNode for the individual row component.
 */
// eslint-disable-next-line complexity, max-lines-per-function -- owns DndContext, SortableContext, virtualizer setup, scroll-container discovery, and loading/error/empty state branches; all share the same virtualizer ref and cannot be composed without excessive prop-threading
export function TreeView({
  nodes,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyState,
  toolbar,
  ariaLabel,
  expandedIds,
  onExpandAll,
  onCollapseAll,
  expandAllLabel,
  collapseAllLabel,
  activeDragId,
  activeDragValidIds,
  onSetActiveDragId,
  onDragEnd,
  renderRow,
  renderDragOverlay,
}: TreeViewProps) {
  const { mountRef, listRef, scrollEl, scrollMargin, sensors, flatRows, sortableIds } = useTreeView(
    { nodes, expandedIds, activeDragId, activeDragValidIds, isLoading },
  )

  // Compute allNodeIds and parentNodeIds for expand/collapse logic only when
  // the caller provides at least one of the handlers — avoids unnecessary traversal.
  const { allNodeIds, parentNodeIds } = useMemo(() => {
    if (!onExpandAll && !onCollapseAll) return { allNodeIds: [], parentNodeIds: new Set<string>() }
    const ids: string[] = []
    const parents = new Set<string>()
    collectNodeIds(nodes, ids, parents)
    return { allNodeIds: ids, parentNodeIds: parents }
  }, [nodes, onExpandAll, onCollapseAll])

  const hasExpandable = useMemo(
    () => [...parentNodeIds].some((id) => !expandedIds.has(id)),
    [parentNodeIds, expandedIds],
  )
  const hasCollapsible = expandedIds.size > 0

  const showExpandCollapse =
    (onExpandAll ?? onCollapseAll) != null && (hasExpandable || hasCollapsible)

  // mountRef must always be on the outermost div — even during loading/error —
  // so the useLayoutEffect scroll-ancestor traversal runs from a real element
  // on first mount (avoids null traversal when isLoading=true on first render,
  // which would leave scrollEl=null permanently since the effect has empty deps).
  return (
    <div
      ref={mountRef}
      className="flex flex-col gap-3"
    >
      {(showExpandCollapse || toolbar) && (
        <div className="flex items-center gap-2">
          {showExpandCollapse && (
            <div className="flex items-center gap-1">
              {hasExpandable && onExpandAll && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs"
                  onClick={() => onExpandAll(allNodeIds)}
                >
                  {expandAllLabel}
                </Button>
              )}
              {hasExpandable && hasCollapsible && (
                <span
                  className="text-muted-foreground text-xs"
                  aria-hidden="true"
                >
                  {TOOLBAR_SEPARATOR}
                </span>
              )}
              {hasCollapsible && onCollapseAll && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground text-xs"
                  onClick={onCollapseAll}
                >
                  {collapseAllLabel}
                </Button>
              )}
            </div>
          )}
          {toolbar}
        </div>
      )}
      <Card>
        <CardContent>
          {isLoading && (
            <div
              className="flex flex-col gap-2"
              aria-busy="true"
              aria-label={ariaLabel}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-9 w-full rounded-md"
                />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !isError && nodes.length === 0 && emptyState}

          {/* VirtualBody only mounts once scrollEl is resolved so useVirtualizer's
          internal _didMount attaches scroll listeners to a real element. */}
          {!isLoading && !isError && nodes.length > 0 && scrollEl && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(e) => {
                onSetActiveDragId?.(String(e.active.id))
                document.body.style.cursor = 'not-allowed'
              }}
              onDragEnd={(e) => {
                document.body.style.cursor = ''
                onDragEnd?.(e)
                // Ensure activeDragId is cleared even when handleDragEnd returns early
                // (same-position drop, invalid target, etc.) — the mutation's onMutate
                // handles the normal case; this is the fallback for no-op drops.
                onSetActiveDragId?.(null)
              }}
              onDragCancel={() => {
                document.body.style.cursor = ''
                onSetActiveDragId?.(null)
              }}
            >
              <VirtualBody
                scrollEl={scrollEl}
                scrollMargin={scrollMargin}
                flatRows={flatRows}
                sortableIds={sortableIds}
                ariaLabel={ariaLabel}
                renderRow={renderRow}
                listRef={listRef}
              />

              {/* Overlay follows the pointer; the original item turns invisible.
              No verticalListSortingStrategy so items don't shift — avoids the
              off-by-N collision issue for expanded nodes with children. */}
              <DragOverlay dropAnimation={null}>
                {activeDragId && renderDragOverlay ? renderDragOverlay(activeDragId) : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
