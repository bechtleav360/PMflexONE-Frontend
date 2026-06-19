import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Archive, GripVertical, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'
import { QuickMovePopover } from '@/features/work-item-board'
import { Button } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { PriorityIcon } from './PriorityIcon'

/** Props for a single pool row. */
export interface PoolRowProps {
  wi: ProjectWorkItem
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onArchive: (wi: ProjectWorkItem) => void
  currentBoardId?: string
  scopeType?: ScopeType
}

/**
 * A single sortable row in the ActivePool list.
 * @param root0 - Component props.
 * @param root0.wi - The work item to render.
 * @param root0.onSelect - Called when the row is clicked to open the detail panel.
 * @param root0.onEdit - Called when the Edit button is clicked.
 * @param root0.onArchive - Called when the Archive button is clicked.
 * @param root0.currentBoardId - ID of the currently active board; forwarded to the quick-move popover.
 * @param root0.scopeType - The scope entity type, forwarded to the quick-move popover.
 * @returns A list item row with drag-handle sort, select, edit, and archive actions.
 */
export function PoolRow({
  wi,
  onSelect,
  onEdit,
  onArchive,
  currentBoardId = '',
  scopeType = 'Project' as ScopeType,
}: PoolRowProps) {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: wi.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group bg-card hover:ring-primary flex items-center justify-between rounded-md border px-4 py-3 transition-shadow hover:ring-2"
    >
      {/* Grip handle — activates dnd-kit intra-pool sorting only */}
      <span
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className="text-muted-foreground mr-1 shrink-0 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label={t('pages.taskManagement.dragToReorder', 'Drag to reorder')}
      >
        <GripVertical
          className="pointer-events-none h-4 w-4"
          aria-hidden="true"
        />
      </span>

      {/* Content area — native draggable for pool-to-column drops; name is an accessible button */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- native HTML5 drag wrapper; keyboard access provided by QuickMovePopover inside */}
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/work-item-id', wi.id)
          e.dataTransfer.setData('text/work-item-version', String(wi.version))
          e.dataTransfer.effectAllowed = 'move'
        }}
        className="flex min-w-0 flex-1 flex-col gap-0.5 select-none"
      >
        <button
          type="button"
          onClick={() => onSelect?.(wi.id)}
          aria-label={t('pages.taskManagement.openDetail', {
            name: wi.name,
            defaultValue: 'Open {{name}}',
          })}
          className="focus-visible:ring-ring cursor-pointer truncate rounded text-left text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {wi.name}
        </button>
        <QuickMovePopover
          workItem={wi}
          currentBoardId={currentBoardId}
          direction="left"
          scopeType={scopeType}
        />
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-2">
        <PriorityIcon wi={wi} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit?.(wi.id)}
          aria-label={t('pages.taskManagement.editTask', { name: wi.name })}
        >
          <Pencil className="h-4 w-4" />
          {t('pages.taskManagement.edit', 'Edit')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onArchive(wi)}
          aria-label={t('pages.taskManagement.archiveTask', { name: wi.name })}
        >
          <Archive className="h-4 w-4" />
          {t('pages.taskManagement.archive_action', 'Archive')}
        </Button>
      </div>
    </li>
  )
}
