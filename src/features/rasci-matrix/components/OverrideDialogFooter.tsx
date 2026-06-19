import { useTranslation } from 'react-i18next'

import type { PermissionKey } from '@/entities/role'
import { Button, DialogFooter, RasciValueBadge } from '@/shared/components'

interface SelectedCellInfo {
  isOverridden: boolean
  templateValue: string | null
}

interface OverrideDialogFooterProps {
  /** Whether any async operation is in progress. */
  isPending: boolean
  /** Selected cell data needed to show the reset button. */
  selectedCell: SelectedCellInfo | null
  /** Called when the user confirms the override. */
  onSave: () => void
  /** Called when the user clicks cancel. */
  onCancel: () => void
  /** Called when the user resets the cell to its template value. */
  onReset: () => void
}

/**
 * Footer for the override value dialog.
 * Conditionally shows a "Reset cell" button when the cell has been overridden.
 *
 * @param props - Footer configuration.
 * @returns The rendered dialog footer.
 */
export function OverrideDialogFooter({
  isPending,
  selectedCell,
  onSave,
  onCancel,
  onReset,
}: OverrideDialogFooterProps) {
  const { t } = useTranslation()
  return (
    <DialogFooter className="flex-col gap-2 sm:flex-row">
      {selectedCell?.isOverridden === true && (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isPending}
          data-testid="reset-cell-btn"
          className="flex items-center gap-2"
        >
          {selectedCell.templateValue != null
            ? t('pages.rasciMatrix.resetCellTo')
            : t('pages.rasciMatrix.resetCell')}
          {selectedCell.templateValue != null && (
            <RasciValueBadge value={selectedCell.templateValue as PermissionKey} />
          )}
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isPending}
      >
        {t('common.cancel', 'Cancel')}
      </Button>
      <Button
        type="button"
        onClick={onSave}
        disabled={isPending}
        aria-disabled={isPending}
      >
        {t('common.save', 'Save')}
      </Button>
    </DialogFooter>
  )
}
