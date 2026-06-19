import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'

interface BulkSelectionToolbarProps {
  /** Number of currently selected cells. */
  count: number
  /** Called when the user clicks "Set value…". */
  onEdit: () => void
  /** Called when the user clicks "Cancel". */
  onClear: () => void
}

/**
 * Fixed floating toolbar shown when the user has bulk-selected one or more cells.
 * Renders at the bottom-centre of the viewport above all other content.
 *
 * @param props - Toolbar configuration.
 * @returns The rendered bulk selection toolbar.
 */
export function BulkSelectionToolbar({ count, onEdit, onClear }: BulkSelectionToolbarProps) {
  const { t } = useTranslation()
  return (
    <div className="border-border bg-background fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-2.5 shadow-lg">
      <span className="text-muted-foreground text-sm">
        {t('pages.roleManagement.bulkSelectionCount', {
          count,
          defaultValue: '{{count}} cell(s) selected',
        })}
      </span>
      <Button
        type="button"
        size="sm"
        onClick={onEdit}
      >
        {t('pages.roleManagement.bulkEditButton', 'Set value…')}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onClear}
      >
        {t('common.cancel', 'Cancel')}
      </Button>
    </div>
  )
}
