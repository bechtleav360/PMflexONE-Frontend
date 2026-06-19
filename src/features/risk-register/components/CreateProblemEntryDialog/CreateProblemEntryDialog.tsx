import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useCreateProblemEntryDialogStore } from '../../store/useCreateProblemEntryDialogStore'
import type { ScopeType } from '../../types/scopeType'
import { CreateProblemEntryForm } from './CreateProblemEntryForm'

/**
 * Dialog that wraps the problem (issue) entry creation form.
 * Reads open state from the create-problem-entry dialog store.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the create form inside.
 */
export function CreateProblemEntryDialog({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const { isOpen, close } = useCreateProblemEntryDialogStore()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{t('pages.problemManagement.createProblemEntry.title')}</DialogTitle>
          <DialogDescription>
            {t('pages.problemManagement.createProblemEntry.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CreateProblemEntryForm
            scopeType={scopeType}
            scopeId={scopeId}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
