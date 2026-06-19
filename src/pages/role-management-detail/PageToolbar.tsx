import { Plus, Rows3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

interface PageToolbarProps {
  /** Whether the matrix is read-only. */
  isReadOnly: boolean
  /** Whether bulk selection mode is active. */
  isBulkMode: boolean
  /** Called when the user toggles bulk mode. */
  onToggleBulkMode: () => void
  /** Called when the user clicks "Add role". */
  onAddRole: () => void
}

/**
 * Toolbar row above the RASCI template matrix.
 * Shows a hint text, bulk-mode toggle, and add-role button.
 *
 * @param props - Toolbar configuration.
 * @returns The rendered toolbar.
 */
export function PageToolbar({
  isReadOnly,
  isBulkMode,
  onToggleBulkMode,
  onAddRole,
}: PageToolbarProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <p className="text-muted-foreground text-xs">
          {isReadOnly
            ? t('pages.roleManagement.readOnlyHint', 'Diese Matrix ist schreibgeschützt.')
            : t(
                'pages.roleManagement.cellEditHint',
                'Click a cell to edit. Hold ⌘/Ctrl and click to select multiple cells for bulk editing.',
              )}
        </p>
        {!isReadOnly && (
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
        )}
      </div>
      {!isReadOnly && (
        <Button
          type="button"
          onClick={onAddRole}
        >
          <Plus
            className="mr-1 h-4 w-4"
            aria-hidden="true"
          />
          {t('pages.roleManagement.addRole')}
        </Button>
      )}
    </div>
  )
}
