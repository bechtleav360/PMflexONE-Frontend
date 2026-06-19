import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'

import { BoardCard } from '../BoardCard'

/** Props for the {@link BoardBacklog} component. */
export interface BoardBacklogProps {
  groups: { key: string; items: ProjectWorkItem[] }[]
  allItems: ProjectWorkItem[]
  dragOverId: string | null
  onSelect?: (workItemId: string) => void
}

/**
 * Renders the unassigned backlog section grouped by priority.
 * @param root0 - Component props.
 * @param root0.groups - Priority-grouped work items.
 * @param root0.allItems - Flat list used for sortable context IDs.
 * @param root0.dragOverId - ID of the item currently being dragged over.
 * @param root0.onSelect - Called when the user clicks a card.
 * @returns The backlog section element.
 */
export function BoardBacklog({ groups, allItems, dragOverId, onSelect }: BoardBacklogProps) {
  const { t } = useTranslation()
  return (
    <div className="mt-6">
      <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
        {t('features.workItem.board.unassigned', 'Unassigned (Backlog)')}
      </h3>
      <SortableContext
        items={allItems.map((wi) => wi.id)}
        strategy={verticalListSortingStrategy}
      >
        {groups.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t('features.workItem.board.noUnassigned', 'No unassigned tasks.')}
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {groups.map((group) => (
              <div
                key={group.key}
                className="flex min-w-60 flex-col gap-2"
              >
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {t(`entities.workItem.priority.${group.key}`, group.key)}
                </p>
                {group.items.map((wi) => (
                  <BoardCard
                    key={wi.id}
                    workItem={wi}
                    isDropTarget={dragOverId === wi.id}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </SortableContext>
    </div>
  )
}
