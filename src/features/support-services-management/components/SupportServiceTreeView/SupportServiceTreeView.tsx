import { useCallback, useEffect, useMemo, useState } from 'react'

import type { DragEndEvent } from '@dnd-kit/core'
import { Plus, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, ButtonIcon, Input, TreeView, type TreeNodeBase } from '@/shared/components'

import { useSupportServiceTree } from '../../hooks/useSupportServices'
import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'
import type {
  SupportService,
  SupportServiceTreeNode as SupportServiceTreeNodeType,
} from '../../types/supportService.types'
import { buildSupportServiceTree } from '../../utils/buildSupportServiceTree'
import { SupportServiceTreeNode } from '../SupportServiceTreeNode'

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
 * Filters the flat support service list to nodes matching `query` by name
 * plus all their ancestors, then rebuilds the tree from that subset.
 *
 * @param flat - Full flat support service list.
 * @param query - Case-insensitive search string.
 * @returns Filtered tree nodes and the set of all included IDs (matches + ancestors).
 */
function filterSupportServiceTree(
  flat: SupportService[],
  query: string,
): { filteredTree: SupportServiceTreeNodeType[]; includeIds: Set<string> } {
  const q = query.trim().toLowerCase()
  if (!q) return { filteredTree: buildSupportServiceTree(flat), includeIds: new Set() }

  const parentMap = new Map<string, string | null>()
  for (const s of flat) {
    parentMap.set(s.id, s.parent?.node.id ?? null)
  }

  const matchedIds = new Set<string>()
  for (const s of flat) {
    if (s.name.toLowerCase().includes(q)) {
      matchedIds.add(s.id)
    }
  }

  const includeIds = collectWithAncestors(matchedIds, parentMap)
  const filteredFlat = flat.filter((s) => includeIds.has(s.id))
  return { filteredTree: buildSupportServiceTree(filteredFlat), includeIds }
}

interface SupportServiceTreeViewProps {
  /** Project ID used to fetch and scope the support service tree. */
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
 * Full-tree view for support services.
 *
 * Wraps the generic `TreeView` from shared components and provides
 * support-service-specific toolbar, node rendering, search, and drag overlay.
 *
 * @param props - Component props.
 * @returns The rendered support service tree view.
 */
// eslint-disable-next-line max-lines-per-function -- search debounce, expand/collapse state, drag overlay, and toolbar are all tightly coupled to the same render scope
export function SupportServiceTreeView({
  projectId,
  canWrite,
  onMoveUp,
  onMoveDown,
  onDragEnd,
  moveAnnouncement,
}: SupportServiceTreeViewProps) {
  const { t } = useTranslation()
  const { data, isPending, isError } = useSupportServiceTree(projectId)

  const expandAll = useSupportServicesUiStore((s) => s.expandAll)
  const collapseAll = useSupportServicesUiStore((s) => s.collapseAll)
  const openFormDialog = useSupportServicesUiStore((s) => s.openFormDialog)
  const expandedIds = useSupportServicesUiStore((s) => s.expandedIds)
  const activeDragId = useSupportServicesUiStore((s) => s.activeDragId)
  const setActiveDragId = useSupportServicesUiStore((s) => s.setActiveDragId)

  const flat = useMemo(() => data?.flat ?? [], [data?.flat])
  const tree = useMemo(() => data?.tree ?? [], [data?.tree])

  const handleSetActiveDragId = useCallback((id: string | null) => {
    setActiveDragId(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setActiveDragId is a stable Zustand action; omitted to keep intent explicit
  }, [])

  // Siblings of the currently dragged item — the only nodes that participate in SortableContext
  const activeSiblingIds = useMemo(() => {
    if (!activeDragId) return null
    const activeItem = flat.find((s) => s.id === activeDragId)
    if (!activeItem) return null
    const activeParentId = activeItem.parent?.node.id ?? null
    return new Set(
      flat.filter((s) => (s.parent?.node.id ?? null) === activeParentId).map((s) => s.id),
    )
  }, [activeDragId, flat])

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const hasInput = searchQuery.length > 0
  const isSearching = debouncedQuery.trim().length > 0

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 200)
    return () => clearTimeout(id)
  }, [searchQuery])

  const { filteredTree, includeIds } = useMemo(() => {
    if (!debouncedQuery.trim()) return { filteredTree: tree, includeIds: new Set<string>() }
    return filterSupportServiceTree(flat, debouncedQuery)
  }, [flat, tree, debouncedQuery])

  useEffect(() => {
    if (!isSearching || includeIds.size === 0) return
    expandAll([...includeIds])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- expandAll is a stable Zustand action; omitted to keep intent explicit
  }, [isSearching, includeIds])

  return (
    <>
      {/* SR live region */}
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
        errorMessage={t('features.supportServicesManagement.error.loadFailed')}
        ariaLabel={t('features.supportServicesManagement.accessibility.treeLabel')}
        expandedIds={expandedIds}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        expandAllLabel={t('features.supportServicesManagement.actions.expandAll')}
        collapseAllLabel={t('features.supportServicesManagement.actions.collapseAll')}
        activeDragId={activeDragId}
        activeDragValidIds={activeSiblingIds ? [...activeSiblingIds] : undefined}
        onSetActiveDragId={handleSetActiveDragId}
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
                placeholder={t('features.supportServicesManagement.search.placeholder')}
                aria-label={t('features.supportServicesManagement.search.placeholder')}
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
                onClick={() => openFormDialog()}
              >
                <ButtonIcon icon={Plus} />
                {t('features.supportServicesManagement.actions.create')}
              </Button>
            )}
          </div>
        }
        emptyState={
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm">
              {isSearching
                ? t('features.supportServicesManagement.search.noResults')
                : t('features.supportServicesManagement.empty.title')}
            </p>
            {canWrite && !isSearching && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openFormDialog()}
              >
                <ButtonIcon icon={Plus} />
                {t('features.supportServicesManagement.actions.create')}
              </Button>
            )}
          </div>
        }
        renderRow={(node, level, posInSet, setSize) => (
          <SupportServiceTreeNode
            key={node.id}
            node={node as SupportServiceTreeNodeType}
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
          const activeNode = flat.find((s) => s.id === nodeId)
          if (!activeNode) return null
          return (
            <div className="bg-background border-border flex cursor-grabbing items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm shadow-lg">
              <span className="font-medium">{activeNode.name}</span>
            </div>
          )
        }}
      />
    </>
  )
}
