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

import { useDeEscalateEntry } from '../../hooks/useDeEscalateEntry'
import { useDeEscalateEntryDialogStore } from '../../store/useDeEscalateEntryDialogStore'
import type { EscalationReasonFormValues } from '../../utils/escalationSchemas'
import { EscalationReasonForm } from '../EscalationReasonForm'

const FORM_ID = 'de-escalate-entry-form'

/**
 * Dialog for returning (de-escalating) an escalated entry to the source level.
 * Controlled by `useDeEscalateEntryDialogStore`.
 * Requires a mandatory justification text.
 * Submits `useDeEscalateEntry` mutation and closes on success.
 * Focus returns to the trigger element on close (handled by Radix Dialog).
 *
 * @returns The de-escalate-entry dialog, or null when the store is closed.
 */
export function DeEscalateEntryDialog() {
  const { t } = useTranslation()
  const { isOpen, escalatedEntryId, version, close, onSuccess } = useDeEscalateEntryDialogStore()
  const { mutate, isPending } = useDeEscalateEntry()

  function handleSubmit(values: EscalationReasonFormValues) {
    if (!escalatedEntryId || version == null) return
    mutate(
      { id: escalatedEntryId, version, reason: values.reason },
      {
        onSuccess: () => {
          close()
          onSuccess?.()
        },
      },
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t('features.escalatedEntries.dialogs.deEscalate.title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <EscalationReasonForm
            formId={FORM_ID}
            onSubmit={handleSubmit}
            isDisabled={isPending}
            translationPrefix="features.escalatedEntries.dialogs.deEscalate"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={close}
            disabled={isPending}
          >
            {t('features.escalatedEntries.dialogs.deEscalate.cancel')}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isPending}
          >
            {t('features.escalatedEntries.dialogs.deEscalate.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
