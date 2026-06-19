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

import type { RequirementListItem } from '../../types/requirement.types'
import type { TreeItem } from '../../utils'
import { RequirementTreeRow } from './RequirementTreeRow'

type RequirementNode = TreeItem<RequirementListItem>

/** Props for {@link RequirementTree}. */
interface RequirementTreeProps {
  /** Root-level tree nodes to render. */
  nodes: RequirementNode[]
  /** Whether data is loading — forwarded to `TreeView`. */
  isLoading?: boolean
  /** Whether data failed to load — forwarded to `TreeView`. */
  isError?: boolean
  /** Called with the requirement ID to open the view/detail dialog. */
  onView: (id: string) => void
  /** Called with the requirement ID when the user selects Edit. */
  onEdit: (id: string) => void
  /** Called with the requirement ID to create a new child requirement. */
  onAddChild: (id: string) => void
  /** Called with the requirement ID to create a sibling at the same level. */
  onAddSibling: (id: string) => void
  /** Called with the requirement ID when the user selects Delete. */
  onDelete: (id: string) => void
  /**
   * Optional drag-end handler. When provided, nodes become drag-sortable.
   * @param activeId - ID of the dragged requirement.
   * @param overId - ID of the requirement dropped on, or `null`.
   */
  onDragEnd?: (activeId: string, overId: string | null) => void
  /** Optional additional CSS class for the wrapper element. */
  className?: string
}

function getAllNodeIds(nodes: RequirementNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...getAllNodeIds(n.childNodes)])
}

function findNodeById(nodes: RequirementNode[], id: string): RequirementNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNodeById(node.childNodes, id)
    if (found) return found
  }
  return null
}

/**
 * Renders the requirement hierarchy as an accessible tree view.
 *
 * Owns expand/collapse state and active drag state. Loading and error states
 * are delegated to the inner `TreeView`.
 *
 * @param props - Component props.
 * @returns The rendered requirement tree.
 */
// eslint-disable-next-line max-lines-per-function -- tree/link-section component; line count driven by render structure and state handlers
export function RequirementTree({
  nodes,
  isLoading,
  isError,
  onView,
  onEdit,
  onAddChild,
  onAddSibling,
  onDelete,
  onDragEnd,
  className,
}: RequirementTreeProps) {
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
    <div className={className}>
      <TreeView
        nodes={nodes}
        isLoading={isLoading}
        isError={isError}
        errorMessage={t('features.planningObjects.requirements.listLoadError')}
        ariaLabel={t('features.planningObjects.requirements.title')}
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
            {t('features.planningObjects.requirements.emptyState')}
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
                ? t('features.planningObjects.requirements.collapseAll')
                : t('features.planningObjects.requirements.expandAll')}
            </Button>
          ) : undefined
        }
        renderRow={(node: TreeNodeBase, level, posInSet, setSize) => {
          const reqNode = node as RequirementNode
          return (
            <TreeViewNode
              nodeId={reqNode.id}
              level={level}
              posInSet={posInSet}
              setSize={setSize}
              hasChildren={reqNode.childNodes.length > 0}
              isExpanded={expandedIds.has(reqNode.id)}
              onToggleExpand={() => toggleExpand(reqNode.id)}
              canDrag={!!onDragEnd}
              dragHandleLabel={t('shared.treeView.dragHandle', { name: reqNode.name })}
              expandLabel={t('shared.treeView.expandNode')}
              collapseLabel={t('shared.treeView.collapseNode')}
              isDragActive={activeDragId !== null}
              renderRow={() => (
                <RequirementTreeRow
                  req={reqNode}
                  onView={onView}
                  onEdit={onEdit}
                  onAddChild={onAddChild}
                  onAddSibling={onAddSibling}
                  onDelete={onDelete}
                />
              )}
              renderContextMenu={() => (
                <>
                  <ContextMenuItem onSelect={() => onView(reqNode.id)}>
                    <Eye
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.view')}
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => onEdit(reqNode.id)}>
                    <Pencil
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.edit')}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onSelect={() => onAddChild(reqNode.id)}>
                    <Plus
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.addChild')}
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => onAddSibling(reqNode.id)}>
                    <ListPlus
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.addSibling')}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onSelect={() => onDelete(reqNode.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2
                      className="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {t('features.planningObjects.common.delete')}
                  </ContextMenuItem>
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
    </div>
  )
}
