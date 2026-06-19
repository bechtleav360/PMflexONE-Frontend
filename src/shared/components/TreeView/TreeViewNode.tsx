import { type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

import { useSortable } from '@dnd-kit/sortable'
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react'

import { Button, ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/shared/components'
import { cn } from '@/shared/lib/utils'

/**
 * Props for the `TreeViewNode` component.
 *
 * @property nodeId - Unique ID for this node — used by dnd-kit.
 * @property level - 1-based nesting depth for ARIA and visual indentation.
 * @property posInSet - 1-based position within the sibling group for `aria-posinset`.
 * @property setSize - Total siblings at this level for `aria-setsize`.
 * @property hasChildren - Whether this node has children (controls expand/collapse visibility).
 * @property isExpanded - Whether children are currently visible.
 * @property onToggleExpand - Called when the user clicks the expand/collapse toggle.
 * @property canDrag - Whether drag handle is shown and sorting is enabled.
 * @property dragHandleLabel - ARIA label for the drag handle.
 * @property expandLabel - ARIA label for the expand toggle when collapsed.
 * @property collapseLabel - ARIA label for the expand toggle when expanded.
 * @property onMoveUp - Called when the user presses Alt+ArrowUp while this node is focused.
 * @property onMoveDown - Called when the user presses Alt+ArrowDown while this node is focused.
 * @property isDragActive - Whether a drag operation is currently in progress in the tree.
 * @property isValidDropTarget - Whether this node is a valid drop destination for the active drag.
 *   When `false` and `isDragActive` is `true` the row is dimmed and excluded from drop-zone styling.
 *   Defaults to `true` so nodes are fully interactive when no drag is active.
 * @property renderRow - Content rendered between the expand toggle and the right edge.
 * @property renderContextMenu - Items rendered inside `ContextMenuContent`.
 */
export interface TreeViewNodeProps {
  nodeId: string
  level: number
  posInSet: number
  setSize: number
  hasChildren: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  canDrag?: boolean
  dragHandleLabel: string
  expandLabel: string
  collapseLabel: string
  onMoveUp?: () => void
  onMoveDown?: () => void
  isDragActive?: boolean
  isValidDropTarget?: boolean
  renderRow: () => ReactNode
  renderContextMenu?: () => ReactNode
}

/**
 * Handles keyboard reorder (Alt+Arrow) and expand/collapse (Enter/Space)
 * for a tree row.
 *
 * Hoisted to module level to keep it out of `TreeViewNode`'s cyclomatic
 * complexity count.
 *
 * @param e - The keyboard event.
 * @param onMoveUp - Move-up callback, called on Alt+ArrowUp.
 * @param onMoveDown - Move-down callback, called on Alt+ArrowDown.
 * @param hasChildren - Whether to handle Enter/Space for expand toggle.
 * @param onToggleExpand - Expand/collapse callback.
 */
function handleTreeKeyDown(
  e: KeyboardEvent<HTMLDivElement>,
  onMoveUp: (() => void) | undefined,
  onMoveDown: (() => void) | undefined,
  hasChildren: boolean,
  onToggleExpand: () => void,
): void {
  if (e.altKey && e.key === 'ArrowUp') {
    e.preventDefault()
    onMoveUp?.()
  } else if (e.altKey && e.key === 'ArrowDown') {
    e.preventDefault()
    onMoveDown?.()
  } else if (e.key === 'Enter' || e.key === ' ') {
    // Always prevent default so Space never scrolls while a tree item is focused.
    e.preventDefault()
    if (hasChildren) {
      onToggleExpand()
    }
  }
}

/**
 * Generic sortable tree row.
 *
 * Handles ARIA `treeitem` attributes, visual indentation, the drag handle,
 * the expand/collapse chevron, keyboard reorder (Alt+Arrow), and an optional
 * right-click context menu. All domain-specific content is provided via
 * render props so the component can be reused across features.
 *
 * Relies on `DndContext` + `SortableContext` from the parent `TreeView`.
 *
 * @param props - Component props (see `TreeViewNodeProps`).
 * @returns The rendered sortable tree row with optional children and context menu.
 */
// eslint-disable-next-line complexity, max-lines-per-function -- generic tree row owns ARIA treeitem attrs, indentation, drag handle, expand/collapse, Alt+Arrow keyboard reorder, and context menu; each concern is a single conditional and cannot be extracted without losing the co-located ARIA attribute logic
export function TreeViewNode({
  nodeId,
  level,
  posInSet,
  setSize,
  hasChildren,
  isExpanded,
  onToggleExpand,
  canDrag = false,
  dragHandleLabel,
  expandLabel,
  collapseLabel,
  onMoveUp,
  onMoveDown,
  isDragActive = false,
  isValidDropTarget = true,
  renderRow,
  renderContextMenu,
}: TreeViewNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    isDragging,
    isOver,
    activeIndex,
    overIndex,
  } = useSortable({
    id: nodeId,
    disabled: !canDrag,
  })

  // No position transform — the virtualiser positions items with absolute translateY.
  // dnd-kit's sorting-strategy shifts are computed against the SortableContext subset,
  // not the full flat list, so they produce incorrect offsets in a virtualised tree.
  // DragOverlay (pointer-following ghost) + the drop-indicator line provide all drag
  // visual feedback; item shifting is not needed.
  const dndStyle: CSSProperties = {
    transition: isDragging ? undefined : transition,
  }

  const row = (
    <div
      ref={setNodeRef}
      style={dndStyle}
      role="treeitem"
      aria-selected={false}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-level={level}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      tabIndex={0}
      onKeyDown={(e) => handleTreeKeyDown(e, onMoveUp, onMoveDown, hasChildren, onToggleExpand)}
      className={cn(
        'group flex w-full cursor-default items-center gap-1 rounded-md py-1 pr-1 text-sm',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        // CSS containment: isolates layout/style/paint so browser skips
        // reflow for this row when unrelated rows change.
        '[contain:layout_style_paint]',
        isDragging && 'opacity-0',
      )}
    >
      {/* Indentation */}
      <span
        style={{ width: `${(level - 1) * 20}px`, flexShrink: 0 }}
        aria-hidden="true"
      />

      {/* Drag handle */}
      {canDrag && (
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label={dragHandleLabel}
          className="text-muted-foreground hover:text-foreground shrink-0 cursor-grab p-0.5 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical
            className="size-3.5"
            aria-hidden="true"
          />
        </button>
      )}

      {/* Expand/collapse toggle */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleExpand}
        aria-label={isExpanded ? collapseLabel : expandLabel}
        className={cn('size-5 shrink-0', !hasChildren && 'invisible')}
        tabIndex={-1}
      >
        {isExpanded ? (
          <ChevronDown
            className="size-3.5"
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            className="size-3.5"
            aria-hidden="true"
          />
        )}
      </Button>

      {renderRow()}
    </div>
  )

  // Show drop indicator line when another item is being dragged over this node.
  // Direction: activeIndex > overIndex → dragging up → indicator above; vice versa below.
  // Gate on isValidDropTarget so non-sibling rows never show the indicator.
  const showIndicator = isOver && !isDragging && isValidDropTarget
  const indicatorAbove = showIndicator && activeIndex > overIndex
  const indicatorBelow = showIndicator && activeIndex < overIndex

  const content = renderContextMenu ? (
    <ContextMenu>
      <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
      <ContextMenuContent>{renderContextMenu()}</ContextMenuContent>
    </ContextMenu>
  ) : (
    row
  )

  return (
    <div
      className={cn(
        'relative',
        // Valid drop target during drag: dashed border forms a continuous box around all siblings.
        // Includes the dragged item's ghost slot (opacity-0 row) to keep the border unbroken.
        // First sibling gets top edge + rounded top corners; last sibling gets bottom edge + rounded bottom corners.
        isDragActive && isValidDropTarget && 'border-primary/40 border-r border-l border-dashed',
        isDragActive && isValidDropTarget && posInSet === 1 && 'rounded-t-md border-t',
        isDragActive && isValidDropTarget && posInSet === setSize && 'rounded-b-md border-b',
        // Invalid targets during drag: dimmed and non-interactive.
        isDragActive && !isValidDropTarget && 'opacity-40',
      )}
    >
      {indicatorAbove && (
        <div
          aria-hidden="true"
          className="bg-primary pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 rounded-full"
        />
      )}
      {content}
      {indicatorBelow && (
        <div
          aria-hidden="true"
          className="bg-primary pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 rounded-full"
        />
      )}
    </div>
  )
}
