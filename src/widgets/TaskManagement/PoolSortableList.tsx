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

import { buildPoolAnnouncements } from './poolAnnouncements'
import { PoolDragOverlayItem } from './PoolDragOverlayItem'
import { PoolRow } from './PoolRow'

/** Props for the PoolSortableList component. */
export interface PoolSortableListProps {
  visibleItems: ProjectWorkItem[]
  activePoolItem: ProjectWorkItem | null
  sensors: ReturnType<typeof useSensors>
  onDragStart: (e: DragStartEvent) => void
  onDragEnd: (e: DragEndEvent) => void
  onDragCancel: () => void
  onSelect: ((id: string) => void) | undefined
  onArchive: (wi: ProjectWorkItem) => void
  currentBoardId: string
}

/**
 * DndKit-powered sortable list of pool work items with a drag overlay.
 * @param props - See PoolSortableListProps.
 * @returns The DndContext + SortableContext pool list.
 */
export function PoolSortableList({
  visibleItems,
  activePoolItem,
  sensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onSelect,
  onArchive,
  currentBoardId,
}: PoolSortableListProps) {
  const { t } = useTranslation()
  return (
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
  )
}
