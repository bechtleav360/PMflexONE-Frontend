import type { MatrixRole } from '@/entities/role'
import { Button } from '@/shared/components'

/**
 * Props for the RoleListItem component.
 * @property role - The role to display.
 * @property onEdit - Callback invoked with the role ID when the edit button is clicked.
 * @property onDelete - Callback invoked with the role ID when the delete button is clicked.
 * @property editLabel - Translated label for the edit button.
 * @property deleteLabel - Translated label for the delete button.
 */
export interface RoleListItemProps {
  role: MatrixRole
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  editLabel: string
  deleteLabel: string
}

/**
 * A single role entry in the role list with optional Edit and Delete actions.
 * Edit/Delete are hidden for fixed (system-defined) roles.
 *
 * @param root0 - Component props.
 * @returns The rendered list item element.
 */
export function RoleListItem({
  role,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: RoleListItemProps) {
  const shortTitleDisplay = `(${role.shortTitle})`
  return (
    <li className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-sm">
        {role.name} <span className="text-muted-foreground text-xs">{shortTitleDisplay}</span>
      </span>
      {!role.isFixed && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(role.id)}
          >
            {editLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onDelete(role.id)}
          >
            {deleteLabel}
          </Button>
        </div>
      )}
    </li>
  )
}
