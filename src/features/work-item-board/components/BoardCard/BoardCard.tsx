import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'
import { LabelBadge } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { CardAssigneePopover } from './CardAssigneePopover'
import { DragToPoolHandle } from './DragToPoolHandle'
import { PrioritySection } from './PrioritySection'
import { QuickMovePopover } from './QuickMovePopover'

interface BoardCardProps {
  workItem: ProjectWorkItem
  isDropTarget?: boolean
  onSelect?: (workItemId: string) => void
  currentBoardId?: string
  scopeType?: ScopeType
}

/**
 * Draggable Jira-style board card. Shows title (up to 3 lines), priority icon, label dots,
 * and an assignee avatar in the bottom-right corner. The avatar is a clickable popover
 * for inline person assignment.
 * @param root0 - Component props.
 * @param root0.workItem - The work item to display on the card.
 * @param root0.isDropTarget - Whether this card is currently a drag-over drop target.
 * @param root0.onSelect - Called when the user clicks the card title to open the detail panel.
 * @param root0.currentBoardId - The active board ID, forwarded to the QuickMove popover.
 * @param root0.scopeType - The scope entity type, forwarded to the QuickMove popover.
 * @returns The board card element.
 */
export function BoardCard({
  workItem,
  isDropTarget = false,
  onSelect,
  currentBoardId = '',
  scopeType,
}: BoardCardProps) {
  const { t } = useTranslation()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: workItem.id,
  })

  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function handleTitleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isDragging) onSelect?.(workItem.id)
  }

  const showDropIndicator = isDropTarget && !isDragging

  return (
    <div className="flex flex-col">
      {showDropIndicator && (
        <div
          className="border-primary bg-primary/20 mb-2 h-14 rounded-md border-2 border-dashed"
          aria-hidden="true"
        />
      )}
      <div
        ref={setNodeRef}
        style={style}
        className="group bg-card hover:ring-primary min-h-20 w-full cursor-grab rounded-md border px-3 pt-3 pb-4 shadow-sm transition-shadow select-none hover:shadow-md hover:ring-2"
        {...attributes}
        {...listeners}
        role="group"
        aria-label={t('features.workItem.board.cardLabel', { name: workItem.name })}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={handleTitleClick}
            className="focus-visible:ring-ring line-clamp-3 min-w-0 flex-1 rounded text-left text-sm leading-snug font-medium wrap-break-word hover:underline focus-visible:ring-2 focus-visible:outline-none"
            title={workItem.name}
          >
            {workItem.name}
          </button>
          <div className="shrink-0">
            <CardAssigneePopover
              workItemId={workItem.id}
              workItemVersion={workItem.version}
              assignee={workItem.assignee}
            />
          </div>
        </div>

        {!!workItem.labels?.length && (
          <div className="mb-2 flex flex-wrap gap-1">
            {workItem.labels.map((label) => (
              <LabelBadge
                key={label.id}
                name={label.name}
                color={label.color}
              />
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <PrioritySection workItem={workItem} />
          </div>
          <div className="flex items-center gap-0.5">
            {/* Pool drag handle — uses native HTML5 drag, stopPropagation prevents dnd-kit activation */}
            <DragToPoolHandle
              workItemId={workItem.id}
              workItemVersion={workItem.version}
              label={t('features.workItem.board.dragToPool', 'Drag to Active Tasks')}
            />
            <QuickMovePopover
              workItem={workItem}
              currentBoardId={currentBoardId}
              scopeType={scopeType}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
