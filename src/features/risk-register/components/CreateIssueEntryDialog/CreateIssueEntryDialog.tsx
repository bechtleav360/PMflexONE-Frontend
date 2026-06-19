import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useCreateIssueEntryDialogStore } from '../../store/useCreateIssueEntryDialogStore'
import type { ScopeType } from '../../types/scopeType'
import { CreateIssueEntryForm } from './CreateIssueEntryForm'

/**
 * Dialog that wraps the issue entry creation form.
 * Open/close state is managed by the create-issue-entry dialog store.
 *
 * @param root0 - Props for the dialog.
 * @param root0.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param root0.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the creation form inside.
 */
export function CreateIssueEntryDialog({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const { isOpen, close } = useCreateIssueEntryDialogStore()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>{t('pages.issueManagement.createIssueEntry.title')}</DialogTitle>
          <DialogDescription>
            {t('pages.issueManagement.createIssueEntry.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CreateIssueEntryForm
            scopeType={scopeType}
            scopeId={scopeId}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
