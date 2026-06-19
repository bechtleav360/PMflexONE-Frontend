import { Plus, Rows3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

interface RasciMatrixToolbarProps {
  /** Whether the current user can edit cell values. */
  canEdit: boolean
  /** Whether the current user can add custom roles. */
  canAddRole: boolean
  /** Whether bulk selection mode is currently active. */
  isBulkMode: boolean
  /** Called when the user toggles bulk mode. */
  onToggleBulkMode: () => void
  /** Called when the user clicks "Add role". */
  onAddRole: () => void
}

/**
 * Toolbar row shown above the RASCI matrix table.
 * Shows an edit hint and bulk-mode toggle for editors, and an add-role button for admins.
 *
 * @param props - Toolbar configuration.
 * @returns The rendered matrix toolbar.
 */
export function RasciMatrixToolbar({
  canEdit,
  canAddRole,
  isBulkMode,
  onToggleBulkMode,
  onAddRole,
}: RasciMatrixToolbarProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-4">
      {canEdit && (
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-xs">
            {t(
              'pages.roleManagement.cellEditHint',
              'Click a cell to edit. Hold ⌘/Ctrl and click to select multiple cells for bulk editing.',
            )}
          </p>
          <Button
            type="button"
            size="sm"
            variant={isBulkMode ? 'default' : 'outline'}
            aria-pressed={isBulkMode}
            onClick={onToggleBulkMode}
          >
            <Rows3
              className="mr-1 h-4 w-4"
              aria-hidden="true"
            />
            {t('pages.roleManagement.bulkModeToggle', 'Multi-select')}
          </Button>
        </div>
      )}
      {canAddRole && (
        <Button
          type="button"
          className="ml-auto"
          onClick={onAddRole}
        >
          <Plus
            className="mr-1 h-4 w-4"
            aria-hidden="true"
          />
          {t('pages.rasciMatrix.addRole')}
        </Button>
      )}
    </div>
  )
}
