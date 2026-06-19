import { useTranslation } from 'react-i18next'

import type { RoleGroup } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useDeleteRoleGroup } from '../hooks/useDeleteRoleGroup'
import { useRoleManagementStore } from '../store/roleManagementStore'

interface DeleteGovernanceGroupDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** The group to delete; null when not selected. */
  group: RoleGroup | null
}

/**
 * Confirmation dialog for deleting a role group.
 * Shows the group name in the body text.
 * Calls `useDeleteRoleGroup` on confirmation.
 *
 * @param props - Dialog configuration.
 * @returns The rendered delete confirmation dialog.
 */
export function DeleteGovernanceGroupDialog({ open, group }: DeleteGovernanceGroupDialogProps) {
  const { t } = useTranslation()
  const { closeAll } = useRoleManagementStore()
  const { mutateAsync, isPending } = useDeleteRoleGroup()

  async function handleConfirm() {
    if (group === null) return
    await mutateAsync(group.id)
    closeAll()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeAll()
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="delete-group-description"
      >
        <DialogHeader>
          <DialogTitle>{t('pages.roleManagement.deleteGroup')}</DialogTitle>
          <DialogDescription id="delete-group-description">
            {t('pages.roleManagement.deleteGroupConfirm', {
              name: group?.name ?? '',
            })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeAll}
            disabled={isPending}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            aria-disabled={isPending}
            data-testid="delete-confirm-btn"
          >
            {t('common.delete', 'Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
