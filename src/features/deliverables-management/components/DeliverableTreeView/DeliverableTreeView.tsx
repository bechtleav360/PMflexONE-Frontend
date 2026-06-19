import { useCallback, useEffect, useMemo, useState } from 'react'

import type { DragEndEvent } from '@dnd-kit/core'
import { Plus, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ButtonIcon, Input, TreeView, type TreeNodeBase } from '@/shared/components'

import { useDeliverableTree } from '../../hooks/useDeliverables'
import { useDeliverablesUiStore } from '../../store/deliverablesUiStore'
import type {
  Deliverable,
  DeliverableTreeNode as DeliverableTreeNodeType,
} from '../../types/deliverable.types'
import { buildDeliverableTree } from '../../utils/buildDeliverableTree'
import { DeliverableTreeNode } from '../DeliverableTreeNode'

/**
 * Walks up the ancestor chain for each matched ID using the pre-built parent map,
 * returning the union of matched IDs and all their ancestors.
 *
 * @param matchedIds - IDs of nodes that directly match the search query.
 * @param parentMap - Map from node ID to its parent ID (or `null` for roots).
 * @returns Set containing matched IDs plus every ancestor ID.
 */
function collectWithAncestors(
  matchedIds: Set<string>,
  parentMap: Map<string, string | null>,
): Set<string> {
  const includeIds = new Set<string>(matchedIds)
  for (const id of matchedIds) {
    let current: string | null | undefined = parentMap.get(id)
    while (current != null) {
      includeIds.add(current)
      current = parentMap.get(current)
    }
  }
  return includeIds
}

/**
 * Filters the flat deliverable list to nodes matching `query` (name or businessId)
 * plus all their ancestors, then rebuilds the tree from that subset.
 *
 * Uses a parent map for O(n) ancestor traversal instead of repeated `flat.find()` calls.
 * Returns the full tree unchanged when `query` is empty.
 *
 * @param flat - Full flat deliverable list.
 * @param query - Case-insensitive search string.
 * @returns Filtered tree nodes and the set of all included IDs (matches + ancestors).
 */
function filterDeliverableTree(
  flat: Deliverable[],
  query: string,
): { filteredTree: DeliverableTreeNodeType[]; includeIds: Set<string> } {
  const q = query.trim().toLowerCase()
  if (!q) return { filteredTree: buildDeliverableTree(flat), includeIds: new Set() }

  // O(n) parent map — avoids O(n) flat.find() per ancestor walk
  const parentMap = new Map<string, string | null>()
  for (const d of flat) {
    parentMap.set(d.id, d.parent?.node.id ?? null)
  }

  const matchedIds = new Set<string>()
  for (const d of flat) {
    if (d.name.toLowerCase().includes(q) || d.businessId?.toLowerCase().includes(q)) {
      matchedIds.add(d.id)
    }
  }

  const includeIds = collectWithAncestors(matchedIds, parentMap)
  const filteredFlat = flat.filter((d) => includeIds.has(d.id))
  return { filteredTree: buildDeliverableTree(filteredFlat), includeIds }
}

interface DeliverableTreeViewProps {
  /** Project ID used to fetch and scope the deliverable tree. */
  projectId: string
  /** Whether write actions (create, reorder) are rendered. */
  canWrite: boolean
  /** Called when the user presses Alt+Arrow Up on a node. */
  onMoveUp: (id: string) => void
  /** Called when the user presses Alt+Arrow Down on a node. */
  onMoveDown: (id: string) => void
  /** Forwarded to the `DndContext` drag-end handler. */
  onDragEnd: (event: DragEndEvent) => void
  /**
   * Message to announce via `aria-live="polite"` to screen readers.
   * Set when a keyboard move is invalid (boundary hit). `null` = silent.
   */
  moveAnnouncement: string | null
}

/**
 * Full-tree view for deliverables.
 *
 * Wraps the generic `TreeView` from shared components and provides
 * deliverable-specific: toolbar (expand/collapse all, create button),
 * node rendering via `DeliverableTreeNode`, and a drag overlay.
 *
 * Uses `DragOverlay` so the overlay follows the pointer and the dragged item
 * becomes invisible in place — this avoids the snap-back glitch that occurs
 * when `useSortable`'s CSS transform is removed before the optimistic update
 * re-positions the item. `verticalListSortingStrategy` is intentionally omitted:
 * it shifts items by 1 slot regardless of actual rendered height, which causes
 * incorrect `over.id` resolution for expanded nodes with children.
 *
 * @param props - Component props.
 * @param props.projectId - Project ID for data fetching.
 * @param props.canWrite - Whether the toolbar create button is rendered.
 * @param props.onMoveUp - Keyboard-move-up handler forwarded to each node.
 * @param props.onMoveDown - Keyboard-move-down handler forwarded to each node.
 * @param props.onDragEnd - DnD drag-end handler (from `useDeliverableReorder`).
 * @param props.moveAnnouncement - SR live-region text for invalid keyboard moves.
 * @returns The rendered deliverable tree view with toolbar and drag support.
 */
// eslint-disable-next-line max-lines-per-function -- wires DnD handlers, keyboard reorder, toolbar, empty/error states, and SR live-region; each concern is a single conditional branch that cannot be extracted without losing colocation
export function DeliverableTreeView({
  projectId,
  canWrite,
  onMoveUp,
  onMoveDown,
  onDragEnd,
  moveAnnouncement,
}: DeliverableTreeViewProps) {
  const { t } = useTranslation()
  const { data, isPending, isError } = useDeliverableTree(projectId)

  const expandAll = useDeliverablesUiStore((s) => s.expandAll)
  const collapseAll = useDeliverablesUiStore((s) => s.collapseAll)
  const expandedIds = useDeliverablesUiStore((s) => s.expandedIds)
  const openCreateModal = useDeliverablesUiStore((s) => s.openCreateModal)
  const activeDragId = useDeliverablesUiStore((s) => s.activeDragId)
  const setActiveDragId = useDeliverablesUiStore((s) => s.setActiveDragId)

  // Stable references — avoids re-running filterDeliverableTree when data is undefined
  const flat = useMemo(() => data?.flat ?? [], [data?.flat])
  const tree = useMemo(() => data?.tree ?? [], [data?.tree])

  // Indicator direction is determined by activeIndex/overIndex within sortableIds, which
  // is filtered from flatRows (visual order) via activeDragValidIds. This guarantees the
  // correct relative order regardless of whether sibling subtrees are expanded.
  const handleSetActiveDragId = useCallback((id: string | null) => {
    setActiveDragId(id)
    // setActiveDragId is a stable Zustand action
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Siblings of the currently dragged item — the only nodes that may participate in
  // the SortableContext during a drag. Null when no drag is active.
  const activeSiblingIds = useMemo(() => {
    if (!activeDragId) return null
    const activeItem = flat.find((d) => d.id === activeDragId)
    if (!activeItem) return null
    const activeParentId = activeItem.parent?.node.id ?? null
    return new Set(
      flat.filter((d) => (d.parent?.node.id ?? null) === activeParentId).map((d) => d.id),
    )
  }, [activeDragId, flat])

  // searchQuery drives the input immediately; debouncedQuery drives filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  // hasInput shows/hides the clear button instantly on keystroke
  const hasInput = searchQuery.length > 0
  // isSearching gates filtering and DnD disable — lags 200 ms behind input
  const isSearching = debouncedQuery.trim().length > 0

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 200)
    return () => clearTimeout(id)
  }, [searchQuery])

  // Short-circuit to the already-built tree when no query — avoids a redundant
  // buildDeliverableTree(flat) call inside filterDeliverableTree's early return.
  const { filteredTree, includeIds } = useMemo(() => {
    if (!debouncedQuery.trim()) return { filteredTree: tree, includeIds: new Set<string>() }
    return filterDeliverableTree(flat, debouncedQuery)
  }, [flat, tree, debouncedQuery])

  // Auto-expand ancestor nodes when the debounced query produces results
  useEffect(() => {
    if (!isSearching || includeIds.size === 0) return
    expandAll([...includeIds])
    // expandAll is stable (Zustand action); includeIds changes only when flat/debouncedQuery change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, includeIds])

  return (
    <>
      {/* SR live region — announces invalid keyboard move results to assistive technology */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {moveAnnouncement}
      </div>
      <TreeView
        nodes={filteredTree as TreeNodeBase[]}
        isLoading={isPending}
        isError={isError}
        errorMessage={t('features.deliverablesManagement.error.loadFailed')}
        ariaLabel={t('features.deliverablesManagement.accessibility.treeLabel')}
        expandedIds={expandedIds}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        expandAllLabel={t('features.deliverablesManagement.actions.expandAll')}
        collapseAllLabel={t('features.deliverablesManagement.actions.collapseAll')}
        activeDragId={activeDragId}
        activeDragValidIds={activeSiblingIds ? [...activeSiblingIds] : undefined}
        onSetActiveDragId={handleSetActiveDragId}
        // For valid moves: useMoveDeliverable.onMutate clears activeDragId synchronously
        // together with setQueryData so both land in one React render (no snap-back flash).
        // For no-op drops (same position / invalid target): TreeView clears activeDragId
        // via onSetActiveDragId(null) after onDragEnd returns — the mutation never fires.
        onDragEnd={onDragEnd}
        toolbar={
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('features.deliverablesManagement.search.placeholder')}
                className="h-9 w-60 pr-7 pl-8 text-sm"
              />
              {hasInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('common.close')}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-6 -translate-y-1/2"
                >
                  <X
                    className="size-3.5"
                    aria-hidden="true"
                  />
                </Button>
              )}
            </div>

            {canWrite && (
              <Button
                size="sm"
                onClick={() => openCreateModal()}
              >
                <ButtonIcon icon={Plus} />
                {t('features.deliverablesManagement.actions.create')}
              </Button>
            )}
          </div>
        }
        emptyState={
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm">
              {isSearching
                ? t('features.deliverablesManagement.search.noResults')
                : t('features.deliverablesManagement.empty.title')}
            </p>
            {canWrite && !isSearching && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCreateModal()}
              >
                <ButtonIcon icon={Plus} />
                {t('features.deliverablesManagement.actions.create')}
              </Button>
            )}
          </div>
        }
        renderRow={(node, level, posInSet, setSize) => (
          <DeliverableTreeNode
            key={node.id}
            node={node as DeliverableTreeNodeType}
            level={level}
            posInSet={posInSet}
            setSize={setSize}
            canWrite={canWrite}
            canDrag={canWrite && !isSearching}
            highlightQuery={debouncedQuery}
            isDragActive={!!activeDragId}
            isValidDropTarget={!activeDragId || (activeSiblingIds?.has(node.id) ?? false)}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        )}
        renderDragOverlay={(nodeId) => {
          const activeNode = flat.find((d) => d.id === nodeId)
          if (!activeNode) return null
          return (
            <div className="bg-background border-border flex cursor-grabbing items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm shadow-lg">
              {activeNode.businessId && (
                <span className="text-muted-foreground font-mono text-xs">
                  {activeNode.businessId}
                </span>
              )}
              <span className="font-medium">{activeNode.name}</span>
            </div>
          )
        }}
      />
    </>
  )
}
