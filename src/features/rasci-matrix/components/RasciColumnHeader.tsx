import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { MatrixRole } from '@/entities/role'
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'

import { useRasciMatrixStore } from '../store/rasciMatrixStore'

interface RasciColumnHeaderProps {
  /** The role for this column. */
  role: MatrixRole
  /** Whether any cells in this column have been overridden from template. */
  hasAnyOverride: boolean
  /** Whether this is a custom role (not in the template). */
  isCustomRole: boolean
  /** Tailwind class for the group palette cell colour (fallback when no inline style). */
  paletteClass: string
  /** Inline style override for the group cell colour (takes precedence over paletteClass). */
  cellStyle?: React.CSSProperties
}

/**
 * Table header cell for a single role column in the RASCI matrix.
 * Shows the role `shortTitle` as primary text and the full `name` as tooltip.
 * Conditionally renders:
 * - A "Reset Column" button when `hasAnyOverride` is true.
 * - A delete button when `isCustomRole` is true.
 *
 * @param props - Column header configuration.
 * @returns The rendered `<th>` element.
 */
export function RasciColumnHeader({
  role,
  hasAnyOverride,
  isCustomRole,
  paletteClass,
  cellStyle,
}: RasciColumnHeaderProps) {
  const { t } = useTranslation()
  const { openResetColumnDialog, openEditObjectRoleDialog, openDeleteObjectRoleDialog } =
    useRasciMatrixStore()

  return (
    <th
      scope="col"
      className={`group border-border border px-1 py-1.5 text-center align-middle${cellStyle ? '' : ` ${paletteClass}`}`}
      style={cellStyle}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={role.name}
            className="block w-full cursor-default border-0 bg-transparent p-0 text-xs font-semibold select-none"
          >
            {role.shortTitle}
          </button>
        </TooltipTrigger>
        <TooltipContent>{role.name}</TooltipContent>
      </Tooltip>
      <div className="mt-1 flex h-[24px] items-center justify-center gap-1">
        {hasAnyOverride && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground h-6 w-6 transition-colors"
            aria-label={t('pages.rasciMatrix.resetColumn')}
            onClick={() => {
              openResetColumnDialog(role.id)
            }}
            data-testid="reset-column-btn"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        {isCustomRole && (
          <>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground h-6 w-6 transition-colors"
              aria-label={t('pages.rasciMatrix.editRole', 'Edit role')}
              onClick={() => {
                openEditObjectRoleDialog(role.id)
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive h-6 w-6 transition-colors"
              aria-label={t('pages.rasciMatrix.deleteRole')}
              onClick={() => {
                openDeleteObjectRoleDialog(role.id)
              }}
              data-testid="delete-role-btn"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </th>
  )
}
