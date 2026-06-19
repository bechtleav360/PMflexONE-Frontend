import { LogOut } from 'lucide-react'

interface DragToPoolHandleProps {
  workItemId: string
  workItemVersion: number
  label: string
}

/**
 * Native HTML5 drag handle for moving a card to the active task pool.
 * Uses stopPropagation to prevent dnd-kit from intercepting the drag.
 * @param root0 - Component props.
 * @param root0.workItemId - The work item ID to attach to the drag data.
 * @param root0.workItemVersion - The work item version to attach to the drag data.
 * @param root0.label - Accessible label for the handle.
 * @returns The drag handle element.
 */
export function DragToPoolHandle({
  workItemId,
  workItemVersion,
  label: _label,
}: DragToPoolHandleProps) {
  return (
    <span
      draggable
      aria-hidden="true"
      className="text-muted-foreground hover:text-foreground cursor-grab rounded p-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      onPointerDown={(e) => e.stopPropagation()}
      onDragStart={(e) => {
        e.stopPropagation()
        e.dataTransfer.setData('text/work-item-id', workItemId)
        e.dataTransfer.setData('text/work-item-version', String(workItemVersion))
        e.dataTransfer.setData('text/work-item-source', 'board')
        e.dataTransfer.effectAllowed = 'move'
      }}
    >
      <LogOut className="h-3.5 w-3.5" />
    </span>
  )
}
