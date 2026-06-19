import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import type { ScopeType } from '@/shared/types/scopeType'

import { ActivePoolBody } from './ActivePoolBody'
import { ActivePoolHeader } from './ActivePoolHeader'
import { PoolArchiveConfirmDialog } from './PoolArchiveConfirmDialog'
import { type PriorityFilterSet } from './PriorityFilterBar'
import { useActivePoolDnd } from './useActivePoolDnd'
import { useActivePoolItems } from './useActivePoolItems'
import { useArchivePoolItem } from './useArchivePoolItem'

/** Props for the ActivePool widget. */
interface ActivePoolProps {
  /** The scope entity type. */
  scopeType: ScopeType
  /** The ID of the scope entity. */
  scopeId: string
  /** IDs of work items already assigned to a board column — excluded from the pool list. */
  assignedWorkItemIds?: ReadonlySet<string>
  /** The currently active board ID — passed to pool rows for the QuickMove popover. */
  currentBoardId?: string
  /** Called when the user clicks a task row to open the detail panel. */
  onSelect?: (workItemId: string) => void
  /** Called when the user clicks "Create task" — opens the panel in create mode. */
  onCreateTask?: () => void
}

/**
 * Lists unassigned work items for the given scope with create/edit/archive actions.
 * Supports collapse/expand, priority filtering, drag-to-column via HTML5 native drag,
 * and intra-pool reordering via dnd-kit sortable (grab the GripVertical handle).
 * @param props - Component props.
 * @returns The rendered active pool widget.
 */
export function ActivePool({
  scopeType,
  scopeId,
  assignedWorkItemIds,
  currentBoardId = '',
  onSelect,
  onCreateTask,
}: ActivePoolProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)
  const [priorityFilters, setPriorityFilters] = useState<PriorityFilterSet>(new Set())
  const { pendingArchive, setPendingArchive, handleArchiveConfirmed } = useArchivePoolItem()

  const { isLoading, poolItems, visibleItems, setOrderedIds } = useActivePoolItems(
    scopeType,
    scopeId,
    assignedWorkItemIds,
    priorityFilters,
  )

  const {
    sensors,
    activePoolItem,
    isBoardCardDragOver,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleNativeDragOver,
    handleNativeDragLeave,
    handleNativeDrop,
  } = useActivePoolDnd({ scopeType, scopeId, currentBoardId, visibleItems, setOrderedIds })

  const countLabel = !isLoading
    ? priorityFilters.size > 0
      ? `${visibleItems.length} / ${poolItems.length}`
      : poolItems.length
    : undefined

  return (
    <>
      <PoolArchiveConfirmDialog
        pendingArchive={pendingArchive}
        onOpenChange={(open) => {
          if (!open) setPendingArchive(null)
        }}
        onConfirm={() => {
          void handleArchiveConfirmed()
        }}
      />
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- drag-drop drop target; HTML5 drag API requires these handlers on the container, no keyboard equivalent needed here */}
      <section
        aria-label={t('pages.taskManagement.activePool', 'Active Tasks')}
        onDragOver={handleNativeDragOver}
        onDragLeave={handleNativeDragLeave}
        onDrop={handleNativeDrop}
        className={
          isBoardCardDragOver
            ? 'ring-primary rounded-md ring-2 ring-offset-1 transition-all'
            : undefined
        }
      >
        <ActivePoolHeader
          isExpanded={isExpanded}
          countLabel={countLabel}
          onToggleExpand={() => setIsExpanded((v) => !v)}
          onCreateTask={onCreateTask}
        />
        <ActivePoolBody
          isLoading={isLoading}
          isExpanded={isExpanded}
          poolItems={poolItems}
          visibleItems={visibleItems}
          priorityFilters={priorityFilters}
          onFilterChange={setPriorityFilters}
          activePoolItem={activePoolItem}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          onSelect={onSelect}
          onArchive={setPendingArchive}
          currentBoardId={currentBoardId}
          scopeType={scopeType}
        />
      </section>
    </>
  )
}
