import { useTranslation } from 'react-i18next'

import type { RequirementListItem } from '../../types/requirement.types'
import { REQUIREMENT_PRIORITY_LABELS } from '../../utils/enumConstants'
import { RequirementScopeBadge } from '../RequirementScopeBadge'
import { RequirementStatusBadge } from '../RequirementStatusBadge'
import { RequirementTreeRowActions } from './RequirementTreeRowActions'

/** Props for {@link RequirementTreeRow}. */
interface RequirementTreeRowProps {
  /** The requirement item to render. */
  req: RequirementListItem
  /** Called with the requirement ID to open the view/detail dialog. */
  onView: (id: string) => void
  /** Called with the requirement ID when the user selects Edit. */
  onEdit: (id: string) => void
  /** Called with the requirement ID to create a new child requirement. */
  onAddChild: (id: string) => void
  /** Called with the requirement ID to create a sibling at the same level. */
  onAddSibling: (id: string) => void
  /** Called with the requirement ID when the user selects Delete. */
  onDelete: (id: string) => void
}

/**
 * Renders the content of a single requirement row inside a `TreeViewNode`.
 *
 * Does not handle expand/collapse or drag — those are owned by `TreeViewNode`.
 * Renders requirement name, scope badge, status badge, priority, and a kebab actions menu.
 *
 * @param props - Component props.
 * @returns The rendered requirement tree row content.
 */
export function RequirementTreeRow({
  req,
  onView,
  onEdit,
  onAddChild,
  onAddSibling,
  onDelete,
}: RequirementTreeRowProps) {
  const { t } = useTranslation()

  return (
    <div className="group flex flex-1 items-center gap-2 overflow-hidden">
      <span className="flex-1 truncate text-sm font-medium">{req.name}</span>

      <RequirementScopeBadge scope={req.requirementScope} />
      <RequirementStatusBadge status={req.status} />

      <span className="text-muted-foreground shrink-0 text-xs">
        {t(REQUIREMENT_PRIORITY_LABELS[req.priority])}
      </span>

      <RequirementTreeRowActions
        requirementId={req.id}
        onView={onView}
        onEdit={onEdit}
        onAddChild={onAddChild}
        onAddSibling={onAddSibling}
        onDelete={onDelete}
      />
    </div>
  )
}
