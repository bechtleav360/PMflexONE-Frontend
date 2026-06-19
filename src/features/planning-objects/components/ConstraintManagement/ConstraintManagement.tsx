import { useState } from 'react'

import { Loader2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, showError } from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useConstraints } from '../../hooks/useConstraints'
import { useDeleteConstraint } from '../../hooks/useDeleteConstraint'
import { useCreateConstraintDialogStore } from '../../store/useCreateConstraintDialogStore'
import { useEditConstraintDialogStore } from '../../store/useEditConstraintDialogStore'
import type { ConstraintListItem } from '../../types/constraint.types'
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog/ConfirmDeleteDialog'
import { CreateConstraintDialog } from '../CreateConstraintDialog'
import { EditConstraintDialog } from '../EditConstraintDialog'
import { ConstraintRow } from './ConstraintRow'

/** Props for {@link ConstraintManagement}. */
interface ConstraintManagementProps {
  /** ID of the project scope. */
  scopeId: string
}

/**
 * Full constraint management view: flat list with add, edit, and delete actions.
 *
 * Renders all project constraints in a flat list. Uses a confirmation dialog
 * before deleting (no cascade dialog — constraints have no hierarchy).
 *
 * @param props - Component props.
 * @param props.scopeId - The ID of the project.
 * @returns The rendered constraint management panel.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- management component; line count driven by CRUD handler definitions and JSX structure
export function ConstraintManagement({ scopeId }: ConstraintManagementProps) {
  const { t } = useTranslation()
  const { data: constraints = [], isLoading, isError } = useConstraints('Project', scopeId)
  const { mutateAsync: deleteConstraint, isPending: isDeleting } = useDeleteConstraint(
    'Project',
    scopeId,
  )

  const openCreateDialog = useCreateConstraintDialogStore((s) => s.open)
  const openEditDialog = useEditConstraintDialogStore((s) => s.open)

  const [pendingDelete, setPendingDelete] = useState<{ id: string; version: number } | null>(null)

  function handleView(constraint: ConstraintListItem) {
    openEditDialog(constraint.id, 'view')
  }

  function handleEdit(constraint: ConstraintListItem) {
    openEditDialog(constraint.id, 'edit')
  }

  function handleDeleteRequest(constraint: ConstraintListItem) {
    setPendingDelete({ id: constraint.id, version: constraint.version })
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return
    try {
      await deleteConstraint(pendingDelete)
      setPendingDelete(null)
    } catch (error) {
      showError(
        getGraphQLErrorMessage(error, t('features.planningObjects.constraints.toast.deleteError')),
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
          {t('features.planningObjects.constraints.addConstraint')}
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

      {!isLoading && !isError && constraints.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t('features.planningObjects.constraints.emptyState')}
        </p>
      )}

      {!isLoading && !isError && constraints.length > 0 && (
        <ul
          className="flex flex-col gap-2"
          aria-label={t('features.planningObjects.constraints.title')}
        >
          {constraints.map((constraint) => (
            <ConstraintRow
              key={constraint.id}
              constraint={constraint}
              isExpanded={false}
              onView={handleView}
              onEdit={handleEdit}
              onAddNew={openCreateDialog}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </ul>
      )}

      <CreateConstraintDialog scopeId={scopeId} />
      <EditConstraintDialog
        scopeId={scopeId}
        constraints={constraints}
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
