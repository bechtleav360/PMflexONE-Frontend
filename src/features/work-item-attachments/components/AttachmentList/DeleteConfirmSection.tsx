import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@/shared/components'

type ConfirmTarget = { id: string; version: number; name: string } | null

/** Props for the DeleteConfirmSection component. */
export interface DeleteConfirmSectionProps {
  confirmTarget: ConfirmTarget
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Confirmation dialog for deleting an attachment.
 * @param root0 - Component props.
 * @param root0.confirmTarget - The attachment pending deletion, or null when closed.
 * @param root0.isDeleting - Whether the delete mutation is in flight.
 * @param root0.onOpenChange - Called when the dialog open state changes.
 * @param root0.onConfirm - Called when the user confirms deletion.
 * @returns The confirm dialog element.
 */
export function DeleteConfirmSection({
  confirmTarget,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteConfirmSectionProps) {
  const { t } = useTranslation()
  return (
    <ConfirmDialog
      open={confirmTarget !== null}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false)
      }}
      title={t('features.workItemAttachments.deleteConfirm.title', 'Delete attachment?')}
      description={t(
        'features.workItemAttachments.deleteConfirm.description',
        'This will permanently delete "{{name}}". This action cannot be undone.',
        { name: confirmTarget?.name ?? '' },
      )}
      confirmLabel={t('common.delete', 'Delete')}
      cancelLabel={t('common.cancel', 'Cancel')}
      variant="destructive"
      onConfirm={onConfirm}
      isPending={isDeleting}
    />
  )
}
