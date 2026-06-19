import { memo, type ReactNode } from 'react'

import { Eye, ListPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge, ContextMenuItem, ContextMenuSeparator, TreeViewNode } from '@/shared/components'

import { useDeliverablesUiStore } from '../../store/deliverablesUiStore'
import type { DeliverableTreeNode as DeliverableTreeNodeType } from '../../types/deliverable.types'
import { DeliverableTreeNodeActions } from './DeliverableTreeNodeActions'

/**
 * Wraps the first case-insensitive match of `query` in `text` with a styled
 * `<mark>` element using the app's primary colour at reduced opacity.
 * Returns `text` unchanged when `query` is empty or not found.
 *
 * @param text - The full string to search within.
 * @param query - The search string to highlight.
 * @returns A `ReactNode` with the match highlighted, or the original string.
 */
function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase())
  if (idx === -1) return text
  const q = query.trim()
  return (
    <>
      {idx > 0 && text.slice(0, idx)}
      <mark className="bg-primary/20 rounded-[2px] px-px not-italic">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  )
}

interface DeliverableTreeNodeProps {
  /** The deliverable node to render. */
  node: DeliverableTreeNodeType
  /** 1-based nesting level for ARIA and visual indentation. */
  level: number
  /** 1-based position within parent for `aria-posinset`. */
  posInSet: number
  /** Total siblings at this level for `aria-setsize`. */
  setSize: number
  /** Whether the current user has write access. */
  canWrite: boolean
  /** Whether drag-and-drop is enabled for this node. Defaults to `canWrite`. */
  canDrag?: boolean
  /** When set, wraps the first match in name/businessId with a highlight mark. */
  highlightQuery?: string
  /** Whether a drag operation is currently in progress in the tree. */
  isDragActive?: boolean
  /** Whether this node is a valid drop destination for the active drag. */
  isValidDropTarget?: boolean
  /** Called when the user presses Alt+Arrow Up on this node. */
  onMoveUp: (id: string) => void
  /** Called when the user presses Alt+Arrow Down on this node. */
  onMoveDown: (id: string) => void
}

/**
 * Single row in the deliverable tree.
 *
 * Wraps the generic `TreeViewNode` and provides deliverable-specific content:
 * businessId badge, clickable name, owner, hover-visible action buttons
 * (`DeliverableTreeNodeActions`), and a right-click context menu.
 *
 * @param props - Component props.
 * @param props.node - The deliverable data for this row.
 * @param props.level - 1-based nesting depth for ARIA and indentation.
 * @param props.posInSet - 1-based position within siblings for `aria-posinset`.
 * @param props.setSize - Total siblings count for `aria-setsize`.
 * @param props.canWrite - Whether write actions are rendered.
 * @param props.onMoveUp - Called when the user keyboard-moves this node up.
 * @param props.onMoveDown - Called when the user keyboard-moves this node down.
 * @returns The rendered tree row with actions and context menu.
 */
// eslint-disable-next-line max-lines-per-function -- renders drag handle, indent, expand chevron, highlight, and context menu in one cohesive row; further extraction would fragment tightly-coupled ARIA attributes
export const DeliverableTreeNode = memo(function DeliverableTreeNode({
  node,
  level,
  posInSet,
  setSize,
  canWrite,
  canDrag,
  highlightQuery = '',
  isDragActive,
  isValidDropTarget,
  onMoveUp,
  onMoveDown,
}: DeliverableTreeNodeProps) {
  const { t, i18n } = useTranslation()

  // Narrow selector to boolean — avoids re-rendering every node when any other node expands
  const isExpanded = useDeliverablesUiStore((s) => s.expandedIds.has(node.id))
  const toggleExpand = useDeliverablesUiStore((s) => s.toggleExpand)
  const openCreateModal = useDeliverablesUiStore((s) => s.openCreateModal)
  const openEditModal = useDeliverablesUiStore((s) => s.openEditModal)
  const openReadModal = useDeliverablesUiStore((s) => s.openReadModal)
  const openDeleteDialog = useDeliverablesUiStore((s) => s.openDeleteDialog)
  const hasChildren = node.childNodes.length > 0
  const siblingParentId = node.parent?.node.id

  const ownerNode = node.owner?.node ?? null
  const ownerName = ownerNode ? `${ownerNode.firstName} ${ownerNode.lastName}`.trim() : null
  const ownerInactive = ownerNode ? !ownerNode.userId : false

  return (
    <TreeViewNode
      nodeId={node.id}
      level={level}
      posInSet={posInSet}
      setSize={setSize}
      hasChildren={hasChildren}
      isExpanded={isExpanded}
      onToggleExpand={() => toggleExpand(node.id)}
      canDrag={canDrag ?? canWrite}
      dragHandleLabel={t('features.deliverablesManagement.accessibility.dragHandle', {
        name: node.name,
      })}
      expandLabel={t('features.deliverablesManagement.accessibility.expandNode', {
        name: node.name,
      })}
      collapseLabel={t('features.deliverablesManagement.accessibility.collapseNode', {
        name: node.name,
      })}
      onMoveUp={() => onMoveUp(node.id)}
      onMoveDown={() => onMoveDown(node.id)}
      isDragActive={isDragActive}
      isValidDropTarget={isValidDropTarget}
      renderRow={() => (
        <>
          {node.businessId && (
            <Badge
              variant="secondary"
              className="shrink-0 font-mono text-xs"
            >
              {highlightText(node.businessId, highlightQuery)}
            </Badge>
          )}

          <button
            type="button"
            onClick={() => openReadModal(node.id)}
            className="hover:text-primary min-w-0 flex-1 truncate text-left text-sm"
          >
            {highlightText(node.name, highlightQuery)}
          </button>

          {ownerName && (
            <span className="flex shrink-0 items-center gap-1">
              <span className="text-muted-foreground text-xs">{ownerName}</span>
              {ownerInactive && (
                <Badge
                  variant="warning"
                  className="text-xs"
                >
                  {t('features.deliverablesManagement.accessibility.inactiveOwnerSuffix')}
                </Badge>
              )}
            </span>
          )}

          <span className="text-muted-foreground shrink-0 text-xs">
            {new Date(node.createdAt).toLocaleDateString(i18n.language)}
          </span>

          <DeliverableTreeNodeActions
            nodeId={node.id}
            nodeVersion={node.version}
            parentId={siblingParentId}
            canWrite={canWrite}
          />
        </>
      )}
      renderContextMenu={() => (
        <>
          <ContextMenuItem onSelect={() => openReadModal(node.id)}>
            <Eye
              className="mr-2 size-4"
              aria-hidden="true"
            />
            {t('features.deliverablesManagement.actions.view')}
          </ContextMenuItem>
          {canWrite && (
            <>
              <ContextMenuItem onSelect={() => openEditModal(node.id)}>
                <Pencil
                  className="mr-2 size-4"
                  aria-hidden="true"
                />
                {t('features.deliverablesManagement.actions.edit')}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => openCreateModal(node.id)}>
                <Plus
                  className="mr-2 size-4"
                  aria-hidden="true"
                />
                {t('features.deliverablesManagement.actions.createChild')}
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => openCreateModal(siblingParentId)}>
                <ListPlus
                  className="mr-2 size-4"
                  aria-hidden="true"
                />
                {t('features.deliverablesManagement.actions.createSibling')}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onSelect={() => openDeleteDialog(node.id, node.version)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2
                  className="mr-2 size-4"
                  aria-hidden="true"
                />
                {t('features.deliverablesManagement.actions.delete')}
              </ContextMenuItem>
            </>
          )}
        </>
      )}
    />
  )
})
