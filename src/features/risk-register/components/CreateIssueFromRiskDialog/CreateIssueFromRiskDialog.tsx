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

import { useCreateIssueFromRisk } from '../../hooks/useCreateIssueFromRisk'
import { useCreateIssueFromRiskDialogStore } from '../../store/useCreateIssueFromRiskDialogStore'
import type { ScopeType } from '../../types/scopeType'

/**
 * Confirmation dialog for the "Create issue from risk" escalation action.
 *
 * Reads the source risk name and version from the store, renders a confirmation
 * message, and on confirm calls the `createIssueFromRisk` mutation with the
 * required `version` parameter for optimistic concurrency.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered confirmation dialog.
 */
export function CreateIssueFromRiskDialog({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const { isOpen, sourceRiskId, sourceRiskName, sourceRiskVersion, close } =
    useCreateIssueFromRiskDialogStore()
  const { mutateAsync, isPending } = useCreateIssueFromRisk(scopeType, scopeId)

  async function handleConfirm() {
    if (!sourceRiskId || sourceRiskVersion === null) return
    try {
      await mutateAsync({ riskEntryId: sourceRiskId, version: sourceRiskVersion })
      close()
      showSuccess(t('pages.riskManagement.createIssueFromRisk.toast.success'))
    } catch {
      showError(t('pages.riskManagement.createIssueFromRisk.toast.error'))
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
          <DialogTitle>{t('pages.riskManagement.createIssueFromRisk.title')}</DialogTitle>
          <DialogDescription>
            {t('pages.riskManagement.createIssueFromRisk.description', {
              name: sourceRiskName ?? '',
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
            {t('pages.riskManagement.createIssueFromRisk.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isPending}
          >
            {t('pages.riskManagement.createIssueFromRisk.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
