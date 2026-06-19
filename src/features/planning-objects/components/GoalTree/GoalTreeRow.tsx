import type { GoalListItem } from '../../types/goal.types'
import { GoalProgressBar } from '../GoalProgressBar'
import { GoalTreeRowActions } from './GoalTreeRowActions'

/** Props for {@link GoalTreeRow}. */
interface GoalTreeRowProps {
  /** The goal item to render. */
  goal: GoalListItem
  /** Called with the goal ID to open the view/detail dialog. */
  onView?: (id: string) => void
  /** Called with the goal ID when the user selects Edit. */
  onEdit?: (id: string) => void
  /** Called with the goal ID to create a new child goal under this node. */
  onAddChild?: (id: string) => void
  /** Called with the goal ID to create a sibling at the same level. */
  onAddSibling?: (id: string) => void
  /** Called with the goal ID when the user selects Delete. */
  onDelete?: (id: string) => void
}

/**
 * Renders the content of a single goal row inside a `TreeViewNode`.
 *
 * Does not handle expand/collapse or drag — those are owned by `TreeViewNode`.
 * Renders goal name, progress bar, and a kebab actions menu.
 *
 * @param props - Component props.
 * @returns The rendered goal tree row content.
 */
export function GoalTreeRow({
  goal,
  onView,
  onEdit,
  onAddChild,
  onAddSibling,
  onDelete,
}: GoalTreeRowProps) {
  return (
    <div className="group flex flex-1 items-center gap-2 overflow-hidden">
      <span className="flex-1 truncate text-sm font-medium">{goal.name}</span>

      <div className="w-32 shrink-0">
        <GoalProgressBar value={goal.progress} />
      </div>

      <GoalTreeRowActions
        goalId={goal.id}
        onView={onView}
        onEdit={onEdit}
        onAddChild={onAddChild}
        onAddSibling={onAddSibling}
        onDelete={onDelete}
      />
    </div>
  )
}
