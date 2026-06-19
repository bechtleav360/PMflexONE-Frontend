import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/Button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/Dialog'

import { useCreateEscalatedEntry } from '../../hooks/useCreateEscalatedEntry'
import { useEscalateEntryDialogStore } from '../../store/useEscalateEntryDialogStore'
import type { EscalationReasonFormValues } from '../../utils/escalationSchemas'
import { EscalationReasonForm } from '../EscalationReasonForm'

const FORM_ID = 'escalate-entry-form'

/**
 * Dialog for escalating a source register entry to its parent scope.
 * Controlled by `useEscalateEntryDialogStore`.
 * Submits `useCreateEscalatedEntry` mutation and closes on success.
 * Focus returns to the trigger element on close (handled by Radix Dialog).
 *
 * @returns The escalate-entry dialog, or null when the store is closed.
 */
export function EscalateEntryDialog() {
  const { t } = useTranslation()
  const { isOpen, sourceEntryId, sourceEntryType, close } = useEscalateEntryDialogStore()
  const { mutate, isPending } = useCreateEscalatedEntry()

  function handleSubmit(values: EscalationReasonFormValues) {
    if (!sourceEntryId || !sourceEntryType) return
    mutate(
      {
        sourceEntryId,
        sourceEntryType,
        reason: values.reason,
      },
      { onSuccess: close },
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t('features.escalatedEntries.dialogs.escalate.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <EscalationReasonForm
            formId={FORM_ID}
            onSubmit={handleSubmit}
            isDisabled={isPending}
            translationPrefix="features.escalatedEntries.dialogs.escalate"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={close}
            disabled={isPending}
          >
            {t('features.escalatedEntries.dialogs.escalate.cancel')}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isPending}
          >
            {t('features.escalatedEntries.dialogs.escalate.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
