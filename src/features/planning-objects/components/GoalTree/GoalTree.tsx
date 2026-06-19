import { useState } from 'react'

import type { DragEndEvent } from '@dnd-kit/core'
import { ChevronsUpDown, Eye, ListPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  ContextMenuItem,
  ContextMenuSeparator,
  TreeView,
  TreeViewNode,
} from '@/shared/components'
import type { TreeNodeBase } from '@/shared/components'

import type { GoalListItem } from '../../types/goal.types'
import type { TreeItem } from '../../utils'
import { GoalTreeRow } from './GoalTreeRow'

type GoalNode = TreeItem<GoalListItem>

/** Props for {@link GoalTree}. */
interface GoalTreeProps {
  /** Root-level tree nodes to render. */
  nodes: GoalNode[]
  /** Whether data is loading — forwarded to `TreeView`. */
  isLoading?: boolean
  /** Whether data failed to load — forwarded to `TreeView`. */
  isError?: boolean
  /** Called with the goal ID to open the view/detail dialog. */
  onView?: (id: string) => void
  /** Called with the goal ID when the user selects Edit. */
  onEdit: (id: string) => void
  /** Called with the goal ID to create a new child goal under this node. */
  onAddChild?: (id: string) => void
  /** Called with the goal ID to create a sibling at the same level. */
  onAddSibling?: (id: string) => void
  /** Called with the goal ID when the user selects Delete. */
  onDelete: (id: string) => void
  /**
   * Optional drag-end handler. When provided, the tree becomes sortable and
   * each node renders a drag handle.
   * @param activeId - ID of the dragged goal.
   * @param overId - ID of the goal the dragged item was dropped on, or `null`.
   */
  onDragEnd?: (activeId: string, overId: string | null) => void
}

function getAllNodeIds(nodes: GoalNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...getAllNodeIds(n.childNodes)])
}

function findNodeById(nodes: GoalNode[], id: string): GoalNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNodeById(node.childNodes, id)
    if (found) return found
  }
  return null
}

/**
 * Renders the goal hierarchy as an accessible tree view.
 *
 * Owns expand/collapse state and active drag state. Loading and error states
 * are delegated to the inner `TreeView`.
 *
 * @param props - Component props.
 * @returns The rendered goal tree.
 */
// eslint-disable-next-line max-lines-per-function -- tree/link-section component; line count driven by render structure and state handlers
export function GoalTree({
  nodes,
  isLoading,
  isError,
  onView,
  onEdit,
  onAddChild,
  onAddSibling,
  onDelete,
  onDragEnd,
}: GoalTreeProps) {
  const { t } = useTranslation()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const allIds = getAllNodeIds(nodes)
  const parentIds =
    nodes.length > 0
      ? allIds.filter((id) => {
          const node = findNodeById(nodes, id)
          return node ? node.childNodes.length > 0 : false
        })
      : []
  const allExpanded = parentIds.length > 0 && parentIds.every((id) => expandedIds.has(id))

  function handleExpandCollapseAll() {
    if (allExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(allIds))
    }
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <TreeView
      nodes={nodes}
      isLoading={isLoading}
      isError={isError}
      errorMessage={t('features.planningObjects.goals.listLoadError')}
      ariaLabel={t('features.planningObjects.goals.title')}
      expandedIds={expandedIds}
      activeDragId={activeDragId}
      onSetActiveDragId={setActiveDragId}
      onDragEnd={
        onDragEnd
          ? (event: DragEndEvent) => {
              const activeId = String(event.active.id)
              const overId = event.over ? String(event.over.id) : null
              onDragEnd(activeId, overId)
            }
          : undefined
      }
      emptyState={
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('features.planningObjects.goals.emptyState')}
        </p>
      }
      toolbar={
        nodes.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpandCollapseAll}
          >
            <ChevronsUpDown
              className="mr-1.5 h-3.5 w-3.5"
              aria-hidden="true"
            />
            {allExpanded
              ? t('features.planningObjects.goals.collapseAll')
              : t('features.planningObjects.goals.expandAll')}
          </Button>
        ) : undefined
      }
      renderRow={(node: TreeNodeBase, level, posInSet, setSize) => {
        const goalNode = node as GoalNode
        return (
          <TreeViewNode
            nodeId={goalNode.id}
            level={level}
            posInSet={posInSet}
            setSize={setSize}
            hasChildren={goalNode.childNodes.length > 0}
            isExpanded={expandedIds.has(goalNode.id)}
            onToggleExpand={() => toggleExpand(goalNode.id)}
            canDrag={!!onDragEnd}
            dragHandleLabel={t('shared.treeView.dragHandle', { name: goalNode.name })}
            expandLabel={t('shared.treeView.expandNode')}
            collapseLabel={t('shared.treeView.collapseNode')}
            isDragActive={activeDragId !== null}
            renderRow={() => (
              <GoalTreeRow
                goal={goalNode}
                onView={onView}
                onEdit={onEdit}
                onAddChild={onAddChild}
                onAddSibling={onAddSibling}
                onDelete={onDelete}
              />
            )}
            renderContextMenu={() => (
              <>
                {onView && (
                  <ContextMenuItem onSelect={() => onView(goalNode.id)}>
                    <Eye
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.view')}
                  </ContextMenuItem>
                )}
                {onEdit && (
                  <ContextMenuItem onSelect={() => onEdit(goalNode.id)}>
                    <Pencil
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.edit')}
                  </ContextMenuItem>
                )}
                {(onAddChild || onAddSibling) && <ContextMenuSeparator />}
                {onAddChild && (
                  <ContextMenuItem onSelect={() => onAddChild(goalNode.id)}>
                    <Plus
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.addChild')}
                  </ContextMenuItem>
                )}
                {onAddSibling && (
                  <ContextMenuItem onSelect={() => onAddSibling(goalNode.id)}>
                    <ListPlus
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.addSibling')}
                  </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                {onDelete && (
                  <ContextMenuItem
                    onSelect={() => onDelete(goalNode.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.delete')}
                  </ContextMenuItem>
                )}
              </>
            )}
          />
        )
      }}
      renderDragOverlay={
        onDragEnd
          ? (nodeId) => {
              const found = findNodeById(nodes, nodeId)
              return found ? (
                <div className="bg-background border-border flex cursor-grabbing items-center gap-2 rounded-md border px-3 py-1.5 text-sm shadow-lg">
                  <span className="font-medium">{found.name}</span>
                </div>
              ) : null
            }
          : undefined
      }
    />
  )
}
