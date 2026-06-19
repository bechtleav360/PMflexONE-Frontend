import { useTranslation } from 'react-i18next'

import { Button, DialogFooter } from '@/shared/components'

/** Props for {@link BusinessCaseDialogFooter}. */
export interface BusinessCaseDialogFooterProps {
  formId: string
  isAccepted: boolean
  isSubmitted: boolean
  isSavePending: boolean
  isSubmitting: boolean
  onClose: () => void
  onMarkComplete: () => void
}

/**
 * Footer action buttons for the Business Case dialog.
 * Renders Cancel, Save/Save as Draft, and (when not submitted) Mark as Complete.
 *
 * @param props - Footer props.
 * @param props.formId - The form element id to submit via the save button.
 * @param props.isAccepted - When true shows "Save" instead of "Save as Draft".
 * @param props.isSubmitted - When true the Mark as Complete button is hidden.
 * @param props.isSavePending - Disables the save button while the mutation is in flight.
 * @param props.isSubmitting - Disables the Mark as Complete button while the mutation is in flight.
 * @param props.onClose - Callback to close the dialog.
 * @param props.onMarkComplete - Callback triggered by the Mark as Complete button.
 * @returns The dialog footer with action buttons.
 */
export function BusinessCaseDialogFooter({
  formId,
  isAccepted,
  isSubmitted,
  isSavePending,
  isSubmitting,
  onClose,
  onMarkComplete,
}: BusinessCaseDialogFooterProps) {
  const { t } = useTranslation()
  return (
    <DialogFooter className="shrink-0">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
      >
        {t('pages.businessCase.form.cancelButton')}
      </Button>
      <Button
        form={formId}
        type="submit"
        variant={isAccepted ? 'default' : 'outline'}
        disabled={isSavePending}
        aria-disabled={isSavePending}
      >
        {isAccepted
          ? t('pages.businessCase.form.saveButton')
          : t('pages.businessCase.form.saveDraftButton')}
      </Button>
      {!isSubmitted && (
        <Button
          type="button"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          onClick={onMarkComplete}
        >
          {t('pages.businessCase.form.markCompleteButton')}
        </Button>
      )}
    </DialogFooter>
  )
}
