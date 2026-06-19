import { useState } from 'react'

import { Loader2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, showError } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useAssumptions } from '../../hooks/useAssumptions'
import { useDeleteAssumption } from '../../hooks/useDeleteAssumption'
import { useCreateAssumptionDialogStore } from '../../store/useCreateAssumptionDialogStore'
import { useEditAssumptionDialogStore } from '../../store/useEditAssumptionDialogStore'
import type { AssumptionListItem } from '../../types/assumption.types'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog/ConfirmDeleteDialog'
import { CreateAssumptionDialog } from '../CreateAssumptionDialog'
import { EditAssumptionDialog } from '../EditAssumptionDialog'
import { AssumptionRow } from './AssumptionRow'

/** Props for {@link AssumptionManagement}. */
interface AssumptionManagementProps {
  /** ID of the project scope. */
  scopeId: string
  /** Called with the risk entry ID when the user navigates to an existing linked risk. */
  onOpenRiskEntry?: (id: string) => void
}

/**
 * Full assumption management view: flat list with add, edit, and delete actions.
 *
 * Renders all project assumptions in a flat list (assumptions have no hierarchy).
 * Uses a confirmation dialog before deletion.
 *
 * @param props - Component props.
 * @param props.scopeId - The ID of the project.
 * @param props.onOpenRiskEntry - Called with the risk entry ID when the user navigates to a linked risk.
 * @returns The rendered assumption management panel.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- management component; line count driven by CRUD handler definitions and JSX structure
export function AssumptionManagement({ scopeId, onOpenRiskEntry }: AssumptionManagementProps) {
  const { t } = useTranslation()
  const { data: assumptions = [], isLoading, isError } = useAssumptions('Project', scopeId)
  const { mutateAsync: deleteAssumption, isPending: isDeleting } = useDeleteAssumption(
    'Project',
    scopeId,
  )

  const openCreateDialog = useCreateAssumptionDialogStore((s) => s.open)
  const openEditDialog = useEditAssumptionDialogStore((s) => s.open)

  const [pendingDelete, setPendingDelete] = useState<{ id: string; version: number } | null>(null)

  function handleView(assumption: AssumptionListItem) {
    openEditDialog(assumption.id, 'view')
  }

  function handleEdit(assumption: AssumptionListItem) {
    openEditDialog(assumption.id, 'edit')
  }

  function handleDeleteRequest(assumption: AssumptionListItem) {
    setPendingDelete({ id: assumption.id, version: assumption.version })
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return
    try {
      await deleteAssumption(pendingDelete)
      setPendingDelete(null)
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.assumptions.toast.deleteError')),
      )
      setPendingDelete(null)
    }
  }

  function handleDeleteCancel() {
    setPendingDelete(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreateDialog}>
          <Plus
            className="mr-1.5 h-4 w-4"
            aria-hidden="true"
          />
          {t('features.planningObjects.assumptions.addAssumption')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2
            className="text-muted-foreground h-6 w-6 animate-spin"
            aria-hidden="true"
          />
        </div>
      )}

      {isError && !isLoading && (
        <p
          className="text-destructive py-8 text-center text-sm"
          role="alert"
        >
          {t('common.loading')}
        </p>
      )}

      {!isLoading && !isError && assumptions.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('features.planningObjects.assumptions.emptyState')}
        </p>
      )}

      {!isLoading && !isError && assumptions.length > 0 && (
        <ul
          className="flex flex-col gap-2"
          aria-label={t('features.planningObjects.assumptions.title')}
        >
          {assumptions.map((assumption) => (
            <AssumptionRow
              key={assumption.id}
              assumption={assumption}
              isExpanded={false}
              onView={handleView}
              onEdit={handleEdit}
              onAddNew={openCreateDialog}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </ul>
      )}

      <CreateAssumptionDialog scopeId={scopeId} />
      <EditAssumptionDialog
        scopeId={scopeId}
        onOpenRiskEntry={onOpenRiskEntry}
      />

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        isPending={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  )
}
