import { useTranslation } from 'react-i18next'

interface CellInfoGridProps {
  /** Name of the role for the selected cell. */
  roleName: string | null | undefined
  /** Name of the task for the selected cell. */
  taskName: string | null | undefined
}

/**
 * Two-row info grid showing the role and task names for the currently selected cell.
 *
 * @param props - Role and task names.
 * @returns The rendered info grid.
 */
export function CellInfoGrid({ roleName, taskName }: CellInfoGridProps) {
  const { t } = useTranslation()
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      <span className="text-muted-foreground font-medium">
        {t('pages.roleManagement.editCellRoleLabel')}
      </span>
      <span className="font-semibold">{roleName ?? '—'}</span>
      <span className="text-muted-foreground font-medium">
        {t('pages.roleManagement.editCellTaskLabel')}
      </span>
      <span>{taskName ?? '—'}</span>
    </div>
  )
}
