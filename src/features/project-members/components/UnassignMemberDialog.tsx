import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'

import { useUnassignMember } from '../hooks/useUnassignMember'
import { useProjectMembersStore } from '../store/projectMembersStore'

interface UnassignMemberDialogProps {
  projectId: string
}

/**
 * Confirmation dialog for removing a member assignment from a scope object.
 * Opens when the store's pendingUnassign is set and resets on close or confirm.
 *
 * @param root0 - Component props.
 * @returns The rendered unassign-member dialog element.
 */
export function UnassignMemberDialog({ projectId }: UnassignMemberDialogProps) {
  const { t } = useTranslation()
  const { pendingUnassign, closeAll } = useProjectMembersStore()
  const { mutateAsync: unassign, isPending } = useUnassignMember(projectId)

  async function handleConfirm() {
    if (!pendingUnassign) return
    await unassign(pendingUnassign.assignmentId)
    closeAll()
  }

  return (
    <Dialog
      open={pendingUnassign !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeAll()
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="unassign-member-description"
      >
        <DialogHeader>
          <DialogTitle>{t('pages.projectMembers.unassignTitle')}</DialogTitle>
          <DialogDescription id="unassign-member-description">
            {t('pages.projectMembers.unassignConfirm', {
              name: pendingUnassign?.displayName ?? '',
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
            onClick={() => void handleConfirm()}
            disabled={isPending}
            aria-disabled={isPending}
          >
            {t('pages.projectMembers.unassignButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
