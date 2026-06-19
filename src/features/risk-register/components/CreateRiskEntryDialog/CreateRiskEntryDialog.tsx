import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useCreateRiskEntryDialogStore } from '../../store/useCreateRiskEntryDialogStore'
import type { ScopeType } from '../../types/scopeType'
import { CreateRiskEntryForm } from './CreateRiskEntryForm'

/**
 * Dialog that wraps the risk/opportunity creation form.
 * Open/close state is managed by the create-risk-entry dialog store.
 *
 * @param root0 - Props for the dialog.
 * @param root0.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param root0.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the creation form inside.
 */
export function CreateRiskEntryDialog({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const { isOpen, close } = useCreateRiskEntryDialogStore()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{t('pages.riskRegister.createRiskEntry.title')}</DialogTitle>
          <DialogDescription>
            {t('pages.riskRegister.createRiskEntry.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CreateRiskEntryForm
            scopeType={scopeType}
            scopeId={scopeId}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
