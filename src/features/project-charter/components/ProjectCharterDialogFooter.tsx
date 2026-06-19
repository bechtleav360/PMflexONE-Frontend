import { useTranslation } from 'react-i18next'

import { Button, DialogFooter } from '@/shared/components'

/** Props for {@link ProjectCharterDialogFooter}. */
export interface ProjectCharterDialogFooterProps {
  formId: string
  isAccepted: boolean
  isSavePending: boolean
  isSubmitPending: boolean
  onClose: () => void
  onSubmit: () => void
}

/**
 * Footer action buttons for the Project Charter dialog.
 * Renders Cancel, Save as Draft/Save, and (when not accepted) Submit.
 *
 * @param props - Footer props.
 * @param props.formId - The form element id to submit via the save button.
 * @param props.isAccepted - When true shows "Save" instead of "Save as Draft" and hides Submit.
 * @param props.isSavePending - Disables the save button while the mutation is in flight.
 * @param props.isSubmitPending - Disables the submit button while the mutation is in flight.
 * @param props.onClose - Callback to close the dialog.
 * @param props.onSubmit - Callback triggered by the Submit button.
 * @returns The dialog footer with action buttons.
 */
export function ProjectCharterDialogFooter({
  formId,
  isAccepted,
  isSavePending,
  isSubmitPending,
  onClose,
  onSubmit,
}: ProjectCharterDialogFooterProps) {
  const { t } = useTranslation()
  return (
    <DialogFooter className="shrink-0">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
      >
        {t('pages.projectCharter.form.cancelButton')}
      </Button>
      <Button
        form={formId}
        type="submit"
        variant={isAccepted ? 'default' : 'outline'}
        disabled={isSavePending}
        aria-disabled={isSavePending}
      >
        {isAccepted
          ? t('pages.projectCharter.form.saveButton')
          : t('pages.projectCharter.form.saveDraftButton')}
      </Button>
      {!isAccepted && (
        <Button
          type="button"
          disabled={isSubmitPending}
          aria-disabled={isSubmitPending}
          onClick={onSubmit}
        >
          {t('pages.projectCharter.form.submitButton')}
        </Button>
      )}
    </DialogFooter>
  )
}
