import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  showError,
  showSuccess,
} from '@/shared/components'

import { useCreateProblemFromIssue } from '../../hooks/useCreateProblemFromIssue'
import { useCreateProblemFromIssueDialogStore } from '../../store/useCreateProblemFromIssueDialogStore'
import type { ScopeType } from '../../types/scopeType'

/**
 * Confirmation dialog for the "Create problem from issue" escalation action.
 *
 * Reads the source issue name and version from the store, renders a confirmation
 * message, and on confirm calls the `createProblemFromIssue` mutation with the
 * required `version` parameter. The source issue will be set to Resolved (irreversible).
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered confirmation dialog.
 */
export function CreateProblemFromIssueDialog({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const { isOpen, sourceIssueId, sourceIssueName, sourceIssueVersion, close } =
    useCreateProblemFromIssueDialogStore()
  const { mutateAsync, isPending } = useCreateProblemFromIssue(scopeType, scopeId)

  async function handleConfirm() {
    if (!sourceIssueId || sourceIssueVersion === null) return
    try {
      await mutateAsync({ issueEntryId: sourceIssueId, version: sourceIssueVersion })
      close()
      showSuccess(t('pages.issueManagement.createProblemFromIssue.toast.success'))
    } catch {
      showError(t('pages.issueManagement.createProblemFromIssue.toast.error'))
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('pages.issueManagement.createProblemFromIssue.title')}</DialogTitle>
          <DialogDescription>
            {t('pages.issueManagement.createProblemFromIssue.description', {
              name: sourceIssueName ?? '',
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={isPending}
          >
            {t('pages.issueManagement.createProblemFromIssue.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isPending}
          >
            {t('pages.issueManagement.createProblemFromIssue.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
