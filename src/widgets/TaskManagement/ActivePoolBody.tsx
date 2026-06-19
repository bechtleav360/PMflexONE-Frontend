import { createPortal } from 'react-dom'

import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'
import type { ScopeType } from '@/shared/types/scopeType'

import { buildPoolAnnouncements } from './poolAnnouncements'
import { PoolDragOverlayItem } from './PoolDragOverlayItem'
import { PoolRow } from './PoolRow'
import { PriorityFilterBar, type PriorityFilterSet } from './PriorityFilterBar'

interface ActivePoolBodyProps {
  isLoading: boolean
  isExpanded: boolean
  poolItems: ProjectWorkItem[]
  visibleItems: ProjectWorkItem[]
  priorityFilters: PriorityFilterSet
  onFilterChange: (filters: PriorityFilterSet) => void
  activePoolItem: ProjectWorkItem | null
  sensors: ReturnType<typeof useSensors>
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => Promise<void>
  onDragCancel: () => void
  onSelect?: (workItemId: string) => void
  onArchive: (item: ProjectWorkItem) => void
  currentBoardId: string
  scopeType?: ScopeType
}

/**
 * Renders the priority filter bar, empty-state text and dnd sortable list for the pool.
 * @param props - Rendering props.
 * @returns Fragment with filter bar, empty state and sortable list, or null when collapsed.
 */
export function ActivePoolBody({
  isLoading,
  isExpanded,
  poolItems,
  visibleItems,
  priorityFilters,
  onFilterChange,
  activePoolItem,
  sensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onSelect,
  onArchive,
  currentBoardId,
  scopeType,
}: ActivePoolBodyProps) {
  const { t } = useTranslation()

  if (!isExpanded) return null

  return (
    <>
      {!isLoading && (
        <PriorityFilterBar
          items={poolItems}
          activeFilters={priorityFilters}
          onFilterChange={onFilterChange}
        />
      )}
      {isLoading && (
        <p className="text-muted-foreground text-sm">{t('common.loading', 'Loading…')}</p>
      )}
      {!isLoading && visibleItems.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {priorityFilters.size > 0
            ? t('pages.taskManagement.noTasksForFilter', 'No tasks match the selected filter.')
            : t('pages.taskManagement.noTasks', 'No tasks found.')}
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        accessibility={{ announcements: buildPoolAnnouncements(visibleItems, t) }}
      >
        <SortableContext
          items={visibleItems.map((wi) => wi.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {visibleItems.map((wi) => (
              <PoolRow
                key={wi.id}
                wi={wi}
                onSelect={onSelect}
                onEdit={onSelect}
                onArchive={onArchive}
                currentBoardId={currentBoardId}
                scopeType={scopeType}
              />
            ))}
          </ul>
        </SortableContext>
        {createPortal(
          <DragOverlay style={{ pointerEvents: 'none' }}>
            {activePoolItem ? <PoolDragOverlayItem name={activePoolItem.name} /> : null}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </>
  )
}
