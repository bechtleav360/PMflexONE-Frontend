import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useDeletePlanningRole } from '../../hooks/useDeletePlanningRole'

interface DeletePlanningRoleDialogProps {
  /** Project ID — used to scope cache invalidation. */
  projectId: string
  /** Whether the dialog is open. */
  open: boolean
  /** ID of the planning role to delete, or null when not yet set. */
  planningRoleId: string | null
  /** Display name of the planning role (shown in the dialog). */
  planningRoleName: string
  /** Optimistic-lock version of the planning role, or null when not yet set. */
  version: number | null
  /**
   * Number of support services/work packages this role is currently assigned to.
   * When greater than 0, a warning variant is shown.
   */
  assignedCount: number
  /** Called when the dialog should be closed without deleting. */
  onClose: () => void
  /** Called after the planning role has been successfully deleted. */
  onDeleted: () => void
}

/**
 * Confirmation dialog for deleting a planning role.
 *
 * Shows a simple confirmation when `assignedCount === 0`, or a warning with the
 * count of affected assignments when `assignedCount > 0`.
 *
 * @param props - Component props.
 * @returns The rendered delete confirmation dialog.
 */
export function DeletePlanningRoleDialog({
  projectId,
  open,
  planningRoleId,
  planningRoleName,
  version,
  assignedCount,
  onClose,
  onDeleted,
}: DeletePlanningRoleDialogProps) {
  const { t } = useTranslation()
  const deleteMutation = useDeletePlanningRole(projectId)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!planningRoleId || version === null) return
    setError(null)
    try {
      await deleteMutation.mutateAsync({ id: planningRoleId, version })
      onDeleted()
    } catch {
      setError(t('features.planningRolesManagement.toast.deleteFailed'))
    }
  }

  const hasAssignments = assignedCount > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t('features.planningRolesManagement.delete.title')}</DialogTitle>
          <DialogDescription>
            {hasAssignments
              ? t('features.planningRolesManagement.delete.withAssignments', {
                  count: assignedCount,
                })
              : t('features.planningRolesManagement.delete.description')}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {planningRoleName && <p className="text-sm font-medium">{planningRoleName}</p>}

          {error && <p className="text-destructive text-sm">{error}</p>}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            {t('features.planningRolesManagement.actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={deleteMutation.isPending}
          >
            {hasAssignments
              ? t('features.planningRolesManagement.delete.confirmLabel')
              : t('features.planningRolesManagement.actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
