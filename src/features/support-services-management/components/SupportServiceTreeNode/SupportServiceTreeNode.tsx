import { memo, type ReactNode } from 'react'

import { ListPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ContextMenuItem, ContextMenuSeparator, TreeViewNode } from '@/shared/components'

import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'
import type { SupportServiceTreeNode as SupportServiceTreeNodeType } from '../../types/supportService.types'
import { SupportServiceTreeNodeActions } from './SupportServiceTreeNodeActions'
import { triggerCreateChild } from './triggerCreateChild'

/**
 * Wraps the first case-insensitive match of `query` in `text` with a styled
 * `<mark>` element using the app's primary colour at reduced opacity.
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

interface SupportServiceTreeNodeProps {
  /** The support service node to render. */
  node: SupportServiceTreeNodeType
  /** 1-based nesting level for ARIA and visual indentation. */
  level: number
  /** 1-based position within parent for `aria-posinset`. */
  posInSet: number
  /** Total siblings at this level for `aria-setsize`. */
  setSize: number
  /** Whether the current user has write access. */
  canWrite: boolean
  /** Whether drag-and-drop is enabled for this node. */
  canDrag?: boolean
  /** When set, wraps the first match in name with a highlight mark. */
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
 * Single row in the support service tree.
 *
 * Wraps the generic `TreeViewNode` and provides support-service-specific content:
 * clickable name (opens edit dialog), estimatedEffort badge, assignee name,
 * hover-visible action buttons, and a right-click context menu.
 *
 * @param props - Component props.
 * @returns The rendered tree row with actions and context menu.
 */
// eslint-disable-next-line max-lines-per-function -- context menu, hover actions, and row content all reference the same node state; splitting would require prop-threading through multiple render props
export const SupportServiceTreeNode = memo(function SupportServiceTreeNode({
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
}: SupportServiceTreeNodeProps) {
  const { t } = useTranslation()

  const isExpanded = useSupportServicesUiStore((s) => s.expandedIds.has(node.id))
  const toggleExpand = useSupportServicesUiStore((s) => s.toggleExpand)
  const openDeleteDialog = useSupportServicesUiStore((s) => s.openDeleteDialog)
  const openFirstChildWarning = useSupportServicesUiStore((s) => s.openFirstChildWarning)
  const openFormDialog = useSupportServicesUiStore((s) => s.openFormDialog)

  const hasChildren = node.childNodes.length > 0
  const siblingParentId = node.parent?.node.id

  const assigneeName = node.assignee?.node.name ?? null

  function handleCreateChild() {
    triggerCreateChild(
      node.id,
      node.name,
      node.estimatedEffort,
      hasChildren,
      openFirstChildWarning,
      openFormDialog,
    )
  }

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
      dragHandleLabel={t('features.supportServicesManagement.accessibility.dragHandle', {
        name: node.name,
      })}
      expandLabel={t('features.supportServicesManagement.accessibility.expandNode', {
        name: node.name,
      })}
      collapseLabel={t('features.supportServicesManagement.accessibility.collapseNode', {
        name: node.name,
      })}
      onMoveUp={() => onMoveUp(node.id)}
      onMoveDown={() => onMoveDown(node.id)}
      isDragActive={isDragActive}
      isValidDropTarget={isValidDropTarget}
      renderRow={() => (
        <>
          <button
            type="button"
            onClick={() => openFormDialog(node.id)}
            className="hover:text-primary min-w-0 flex-1 truncate text-left text-sm"
          >
            {highlightText(node.name, highlightQuery)}
          </button>

          {assigneeName && (
            <span className="text-muted-foreground shrink-0 text-xs">{assigneeName}</span>
          )}

          {node.estimatedEffort !== null && (
            <span className="text-muted-foreground shrink-0 text-xs">
              {node.estimatedEffort} {t('common.unitPt')}
            </span>
          )}

          <SupportServiceTreeNodeActions
            nodeId={node.id}
            nodeVersion={node.version}
            nodeName={node.name}
            parentId={siblingParentId}
            hasChildren={hasChildren}
            estimatedEffort={node.estimatedEffort}
            canWrite={canWrite}
          />
        </>
      )}
      renderContextMenu={
        canWrite
          ? () => (
              <>
                <ContextMenuItem onSelect={() => openFormDialog(node.id)}>
                  <Pencil
                    className="mr-2 size-4"
                    aria-hidden="true"
                  />
                  {t('features.supportServicesManagement.actions.edit')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onSelect={handleCreateChild}>
                  <Plus
                    className="mr-2 size-4"
                    aria-hidden="true"
                  />
                  {t('features.supportServicesManagement.actions.createChild')}
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => openFormDialog(undefined, siblingParentId ?? null)}
                >
                  <ListPlus
                    className="mr-2 size-4"
                    aria-hidden="true"
                  />
                  {t('features.supportServicesManagement.actions.createSibling')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onSelect={() => openDeleteDialog(node.id, node.version, hasChildren)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2
                    className="mr-2 size-4"
                    aria-hidden="true"
                  />
                  {t('features.supportServicesManagement.actions.delete')}
                </ContextMenuItem>
              </>
            )
          : undefined
      }
    />
  )
})
