import { useTranslation } from 'react-i18next'

import { Button, showError, showSuccess } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useRiskEntry } from '../../hooks/useRiskEntry'
import { useUpdateRiskEntry } from '../../hooks/useUpdateRiskEntry'
import { useEditRiskEntryDialogStore } from '../../store/useEditRiskEntryDialogStore'
import type { RiskEntry } from '../../types/riskEntry.types'
import type { ScopeType } from '../../types/scopeType'
import type { RiskEntryFormValues } from '../../utils/riskEntrySchema'
import { EditEntryDialogShell } from '../EditEntryDialogShell'
import { RiskLinksSection } from '../RiskLinksSection/RiskLinksSection'
import { EditRiskEntryForm } from './EditRiskEntryForm'

/**
 * Dialog that wraps the risk/opportunity edit form.
 * Reads the target entry ID from the edit-risk-entry dialog store and fetches the entry.
 *
 * @param props - Component props.
 * @param props.scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param props.scopeId - The ID of the scoped entity.
 * @returns The rendered dialog with the edit form inside.
 */
export function EditRiskEntryDialog({
  scopeType,
  scopeId,
}: {
  scopeType: ScopeType
  scopeId: string
}) {
  const { t } = useTranslation()
  const { isOpen, entryId, close } = useEditRiskEntryDialogStore()
  const { data: entry, isPending: isLoading, isError } = useRiskEntry(entryId)
  const { mutateAsync, isPending } = useUpdateRiskEntry(scopeType, scopeId)

  function buildHandleSubmit(currentEntry: RiskEntry) {
    return async (values: RiskEntryFormValues) => {
      try {
        await mutateAsync({
          id: currentEntry.id,
          input: {
            version: currentEntry.version,
            name: values.name,
            pestelCategory: values.pestelCategory,
            description: values.description || undefined,
            status: values.status,
            identificationDate: values.identificationDate,
            probability: values.probability ?? undefined,
            impact: values.impact ?? undefined,
            ownerId: values.ownerId || undefined,
            reporterId: values.reporterId || undefined,
          },
        })
        close()
        showSuccess(t('pages.riskManagement.editRiskEntry.toast.success'))
      } catch (error) {
        showError(
          getGraphQLErrorMessage(error, t('pages.riskManagement.editRiskEntry.toast.error')),
        )
      }
    }
  }

  return (
    <EditEntryDialogShell
      isOpen={isOpen}
      onClose={close}
      title={t('pages.riskManagement.editRiskEntry.title')}
      description={t('pages.riskManagement.editRiskEntry.description')}
      loadingText={t('pages.riskManagement.editRiskEntry.loading')}
      loadErrorText={t('pages.riskManagement.editRiskEntry.loadError')}
      isPending={isLoading}
      isError={isError}
      ready={!isLoading && !isError && entry != null}
      size="xl"
      footer={
        entry != null && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={isPending}
            >
              {t('pages.riskManagement.editRiskEntry.cancel')}
            </Button>
            <Button
              type="submit"
              form="edit-risk-entry-form"
              disabled={isPending}
            >
              {t('pages.riskManagement.editRiskEntry.submit')}
            </Button>
          </>
        )
      }
    >
      {entry != null && (
        <>
          <EditRiskEntryForm
            entry={entry}
            onSubmit={buildHandleSubmit(entry)}
            isPending={isPending}
          />
          <RiskLinksSection
            riskEntryId={entry.id}
            linkedIssues={(entry.linkedIssues ?? []).map((e) => e.item)}
            scopeType={scopeType}
            scopeId={scopeId}
          />
        </>
      )}
    </EditEntryDialogShell>
  )
}
