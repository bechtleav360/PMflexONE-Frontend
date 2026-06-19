import { useTranslation } from 'react-i18next'

import { LinksPanel } from '@/shared/components'

import { useIssueEntry } from '../../hooks/useIssueEntry'
import { useUnlinkIssueFromProblem } from '../../hooks/useUnlinkIssueFromProblem'
import { useUnlinkRiskFromIssue } from '../../hooks/useUnlinkRiskFromIssue'
import { useEditIssueEntryDialogStore } from '../../store/useEditIssueEntryDialogStore'
import type { ScopeType } from '../../types/scopeType'
import { EditEntryDialogShell } from '../EditEntryDialogShell'
import { EditIssueEntryForm } from './EditIssueEntryForm'

/**
 * Dialog that wraps the issue entry edit form.
 * Reads the target entry ID from the edit-issue-entry dialog store and fetches the entry.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the edit form inside.
 */
export function EditIssueEntryDialog({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const { isOpen, entryId, close } = useEditIssueEntryDialogStore()
  const { data: entry, isPending, isError } = useIssueEntry(entryId)
  const { mutate: unlinkRisk, isPending: isUnlinkingRisk } = useUnlinkRiskFromIssue()
  const { mutate: unlinkProblem, isPending: isUnlinkingProblem } = useUnlinkIssueFromProblem()

  return (
    <EditEntryDialogShell
      isOpen={isOpen}
      onClose={close}
      title={t('pages.issueManagement.editIssueEntry.title')}
      description={t('pages.issueManagement.editIssueEntry.description')}
      loadingText={t('pages.issueManagement.editIssueEntry.loading')}
      loadErrorText={t('pages.issueManagement.editIssueEntry.loadError')}
      isPending={isPending}
      isError={isError}
      ready={!isPending && !isError && entry != null}
      size="xl"
    >
      {entry != null && (
        <>
          <EditIssueEntryForm
            entry={entry}
            scopeType={scopeType}
            scopeId={scopeId}
          />
          <LinksPanel
            sections={[
              {
                title: t('shared.linksPanel.linkedRisks'),
                items: (entry.linkedRisks ?? []).map((e) => e.item),
                onRemove: (riskEntryId) => unlinkRisk({ riskEntryId, issueEntryId: entry.id }),
                isRemoving: isUnlinkingRisk,
              },
              {
                title: t('shared.linksPanel.linkedProblems'),
                items: (entry.linkedProblems ?? []).map((e) => e.item),
                onRemove: (problemEntryId) =>
                  unlinkProblem({ issueEntryId: entry.id, problemEntryId }),
                isRemoving: isUnlinkingProblem,
              },
            ]}
          />
        </>
      )}
    </EditEntryDialogShell>
  )
}
