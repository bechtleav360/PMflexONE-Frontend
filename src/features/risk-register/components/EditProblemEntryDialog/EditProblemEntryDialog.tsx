import { useTranslation } from 'react-i18next'

import { LinksPanel } from '@/shared/components'

import { useProblemEntry } from '../../hooks/useProblemEntry'
import { useUnlinkIssueFromProblem } from '../../hooks/useUnlinkIssueFromProblem'
import { useEditProblemEntryDialogStore } from '../../store/useEditProblemEntryDialogStore'
import type { ScopeType } from '../../types/scopeType'
import { EditEntryDialogShell } from '../EditEntryDialogShell'
import { EditProblemEntryForm } from './EditProblemEntryForm'

/**
 * Dialog that wraps the problem entry edit form.
 * Reads the target entry ID from the edit-problem-entry dialog store and fetches the entry.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the edit form inside.
 */
export function EditProblemEntryDialog({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const { isOpen, entryId, close } = useEditProblemEntryDialogStore()
  const { data: entry, isPending, isError } = useProblemEntry(entryId)
  const { mutate: unlinkIssue, isPending: isUnlinking } = useUnlinkIssueFromProblem()

  return (
    <EditEntryDialogShell
      isOpen={isOpen}
      onClose={close}
      title={t('pages.problemManagement.editProblemEntry.title')}
      description={t('pages.problemManagement.editProblemEntry.description')}
      loadingText={t('pages.problemManagement.editProblemEntry.loading')}
      loadErrorText={t('pages.problemManagement.editProblemEntry.loadError')}
      isPending={isPending}
      isError={isError}
      ready={!isPending && !isError && entry != null}
      size="xl"
    >
      {entry != null && (
        <>
          <EditProblemEntryForm
            entry={entry}
            scopeType={scopeType}
            scopeId={scopeId}
          />
          <LinksPanel
            sections={[
              {
                title: t('shared.linksPanel.linkedIssues'),
                items: (entry.linkedIssues ?? []).map((e) => e.item),
                onRemove: (issueEntryId) => unlinkIssue({ issueEntryId, problemEntryId: entry.id }),
                isRemoving: isUnlinking,
              },
            ]}
          />
        </>
      )}
    </EditEntryDialogShell>
  )
}
